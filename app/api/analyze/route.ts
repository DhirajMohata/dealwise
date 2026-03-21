import { NextRequest, NextResponse } from "next/server";
import { analyzeContract, type AnalysisInput } from "@/lib/analyzer";
import { enhanceWithAI, getCountryContext, getAIProvider } from "@/lib/ai-enhance";
import { sanitizeInput, checkRateLimit } from "@/lib/security";
import { auth } from "@/auth";
import { deductCredits, CREDIT_COSTS } from "@/lib/credits";
import { getAdminSettings } from "@/lib/admin-settings";

// Track anonymous free analyses by IP (in-memory, resets on restart)
const anonymousUsage = new Map<string, number>();

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to analyze a contract.", docs: "/api-docs" },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Load admin settings for dynamic limits
    const adminSettings = await getAdminSettings();
    const ANONYMOUS_FREE_LIMIT = adminSettings.anonymousFreeLimit;
    const MAX_CONTRACT_LENGTH = adminSettings.maxContractLength;

    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();

    const requiredFields: (keyof AnalysisInput)[] = [
      "contractText",
      "currency",
    ];

    const missing = requiredFields.filter(
      (field) => body[field] === undefined || body[field] === null
    );

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", details: `Required: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // quotedPrice and estimatedHours are now optional — auto-detected from contract text
    // Only validate if provided (reject negative numbers)
    if (body.quotedPrice !== undefined && body.quotedPrice !== null && typeof body.quotedPrice === "number" && body.quotedPrice < 0) {
      return NextResponse.json(
        { error: "Invalid quotedPrice", details: "Must not be negative." },
        { status: 400 }
      );
    }

    if (body.estimatedHours !== undefined && body.estimatedHours !== null && typeof body.estimatedHours === "number" && body.estimatedHours < 0) {
      return NextResponse.json(
        { error: "Invalid estimatedHours", details: "Must not be negative." },
        { status: 400 }
      );
    }

    if (typeof body.contractText !== "string" || body.contractText.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid contractText", details: "Must be non-empty." },
        { status: 400 }
      );
    }

    // Contract text length limit
    if (body.contractText.length > MAX_CONTRACT_LENGTH) {
      return NextResponse.json(
        { error: `Contract text too long. Maximum ${MAX_CONTRACT_LENGTH.toLocaleString()} characters.` },
        { status: 400 }
      );
    }

    // --- Credit check ---
    const session = await auth();
    const hasAIKeyFromBody = body.claudeApiKey || getAIProvider();
    const creditCost = hasAIKeyFromBody ? CREDIT_COSTS.aiAnalyze : CREDIT_COSTS.analyze;
    let creditsRemaining: number | undefined;

    if (session?.user?.email) {
      // Authenticated user: deduct credits
      const result = await deductCredits(session.user.email, creditCost);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Not enough credits.", creditsRemaining: result.remaining },
          { status: 402 }
        );
      }
      creditsRemaining = result.remaining;
    } else {
      // Anonymous user: allow limited free analyses
      const used = anonymousUsage.get(ip) || 0;
      if (used >= ANONYMOUS_FREE_LIMIT) {
        return NextResponse.json(
          { error: "Free analysis limit reached. Please sign up to continue.", creditsRemaining: 0 },
          { status: 402 }
        );
      }
      anonymousUsage.set(ip, used + 1);
      creditsRemaining = ANONYMOUS_FREE_LIMIT - (used + 1);
    }

    const input: AnalysisInput = {
      contractText: sanitizeInput(body.contractText),
      projectScope: sanitizeInput(body.projectScope || ""),
      quotedPrice: body.quotedPrice && typeof body.quotedPrice === "number" ? body.quotedPrice : undefined,
      estimatedHours: body.estimatedHours && typeof body.estimatedHours === "number" ? body.estimatedHours : undefined,
      currency: body.currency || "USD",
      country: body.country,
      claudeApiKey: body.claudeApiKey,
    };

    // Run heuristic analysis
    const result = analyzeContract(input);

    // Add country-specific legal context
    result.countryContext = getCountryContext(input.currency, input.country);

    // AI-first analysis: AI does the FULL analysis, merged with regex results
    const hasAIKey = input.claudeApiKey || getAIProvider();
    if (hasAIKey && adminSettings.features.aiAnalysis !== false) {
      try {
        const aiResult = await enhanceWithAI(input, result, input.claudeApiKey || undefined);
        result.aiInsights = aiResult.aiInsights;

        // Merge AI red flags with regex flags (deduplicate by issue text)
        const existingIssues = new Set(result.redFlags.map(f => f.issue.toLowerCase()));
        aiResult.extraRedFlags.forEach(flag => {
          const cleanedIssue = flag.issue.replace("\uD83E\uDD16 AI: ", "").toLowerCase();
          if (!existingIssues.has(cleanedIssue)) {
            result.redFlags.push(flag);
            existingIssues.add(cleanedIssue);
          }
        });

        // Merge AI green flags (AI is more accurate for context, add any new ones)
        const existingGreenBenefits = new Set(result.greenFlags.map(g => g.benefit.toLowerCase()));
        aiResult.extraGreenFlags.forEach(flag => {
          if (!existingGreenBenefits.has(flag.benefit.toLowerCase())) {
            result.greenFlags.push(flag);
            existingGreenBenefits.add(flag.benefit.toLowerCase());
          }
        });

        // Merge AI missing clauses (deduplicate by name)
        const existingMissing = new Set(result.missingClauses.map(m => m.name.toLowerCase()));
        aiResult.extraMissing.forEach(clause => {
          if (!existingMissing.has(clause.name.toLowerCase())) {
            result.missingClauses.push(clause);
            existingMissing.add(clause.name.toLowerCase());
          }
        });

        // Use AI's detectedInfo for contract type, price, jurisdiction
        if (aiResult.detectedInfo.contractType && aiResult.detectedInfo.contractType !== "unknown") {
          result.contractType = aiResult.detectedInfo.contractType;
        }
        if (aiResult.detectedInfo.totalPrice != null) {
          result.detectedPrice = aiResult.detectedInfo.totalPrice;
        }
        if (aiResult.detectedInfo.hourlyRate != null) {
          result.detectedRate = aiResult.detectedInfo.hourlyRate;
        }

        // Final score = weighted: 40% regex + 60% AI
        const finalScore = Math.round(
          (result.overallScore * 0.4) + (aiResult.suggestedScore * 0.6)
        );
        result.overallScore = Math.max(0, Math.min(100, finalScore));

      } catch {
        // AI analysis failed — still return heuristic results
        result.aiInsights = "AI enhancement is temporarily unavailable. Results below are from heuristic analysis.";
      }
    }

    return NextResponse.json({ ...result, creditsRemaining }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON", details: "Request body must be valid JSON." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
