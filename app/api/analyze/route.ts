import { NextRequest, NextResponse } from "next/server";
import { analyzeContract, type AnalysisInput } from "@/lib/analyzer";
import { enhanceWithAI, getCountryContext, getAIProvider } from "@/lib/ai-enhance";
import { sanitizeInput, checkRateLimit } from "@/lib/security";
import { auth } from "@/auth";
import { deductCredits, CREDIT_COSTS } from "@/lib/credits";
import { getAdminSettings } from "@/lib/admin-settings";


export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to analyze a contract.", docs: "/api-docs" },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Dev-mode test bypass (only works in development)
    const isTestMode = process.env.NODE_ENV === "development" &&
      request.headers.get("x-test-key") === "dealwise-test-runner";

    // Load admin settings for dynamic limits
    const adminSettings = await getAdminSettings();
    const MAX_CONTRACT_LENGTH = adminSettings.maxContractLength;

    // Rate limiting (skip in test mode)
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!isTestMode && !checkRateLimit(ip)) {
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
    const creditCost = CREDIT_COSTS.analyze; // 1 credit per analysis (AI included)
    let creditsRemaining: number | undefined;

    if (session?.user?.email) {
      const creditResult = await deductCredits(session.user.email, creditCost);
      if (!creditResult.success) {
        return NextResponse.json(
          { error: creditResult.error || "Not enough credits.", creditsRemaining: creditResult.remaining },
          { status: 402 }
        );
      }
      creditsRemaining = creditResult.remaining;
    } else if (isTestMode) {
      // Test mode: skip authentication
      creditsRemaining = 999;
    } else {
      return NextResponse.json(
        { error: "Please sign up to analyze contracts. You'll get 5 free analyses!", creditsRemaining: 0 },
        { status: 401 }
      );
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

    // Run regex analysis as fast baseline
    const result = analyzeContract(input);

    // Add country-specific legal context
    result.countryContext = getCountryContext(input.currency, input.country);

    // AI-FIRST: Always run AI analysis (we have OpenAI key in env)
    // AI does the FULL analysis — score, flags, extraction. Regex is just backup.
    const aiProvider = getAIProvider();
    if (aiProvider && adminSettings.features.aiAnalysis !== false) {
      try {
        const aiResult = await enhanceWithAI(input, result, input.claudeApiKey || undefined);
        result.aiInsights = aiResult.aiInsights;

        // AI SCORE IS PRIMARY — use AI's score directly (not weighted with regex)
        result.overallScore = Math.max(0, Math.min(100, aiResult.suggestedScore));

        // Use AI's recommendation based on AI score
        if (result.overallScore >= 65) result.recommendation = "sign";
        else if (result.overallScore <= 20) result.recommendation = "walk_away";
        else result.recommendation = "negotiate";

        // REPLACE regex flags with AI flags (AI understands context better)
        // Keep regex flags only if AI found fewer (fallback)
        if (aiResult.extraRedFlags.length > 0) {
          result.redFlags = aiResult.extraRedFlags;
        }
        if (aiResult.extraGreenFlags.length > 0) {
          result.greenFlags = aiResult.extraGreenFlags;
        }
        if (aiResult.extraMissing.length > 0) {
          result.missingClauses = aiResult.extraMissing;
        }

        // Use AI's detected info for contract type, price, jurisdiction
        if (aiResult.detectedInfo.contractType && aiResult.detectedInfo.contractType !== "unknown") {
          result.contractType = aiResult.detectedInfo.contractType;
        }
        if (aiResult.detectedInfo.totalPrice != null) {
          result.detectedPrice = aiResult.detectedInfo.totalPrice;
        }
        if (aiResult.detectedInfo.hourlyRate != null) {
          result.detectedRate = aiResult.detectedInfo.hourlyRate;
          // Update nominal rate from AI detection
          if (aiResult.detectedInfo.hourlyRate > 0) {
            result.nominalHourlyRate = aiResult.detectedInfo.hourlyRate;
          }
        }

      } catch (aiError: unknown) {
        // AI failed — fall back to regex-only results
        const msg = aiError instanceof Error ? aiError.message : String(aiError);
        console.error("[AI Analysis Error]", msg);
        result.aiInsights = `AI analysis failed: ${msg.substring(0, 200)}. Results are from pattern-matching analysis only.`;
      }
    }

    // Send analysis complete email (non-blocking)
    const userEmail = session?.user?.email;
    if (userEmail) {
      import('@/lib/email').then(({ sendEmail, analysisCompleteEmailHTML }) => {
        sendEmail(userEmail, "Your contract analysis is ready!",
          analysisCompleteEmailHTML(userEmail.split('@')[0], result.overallScore, result.recommendation)
        ).catch(() => {});
      }).catch(() => {});
    }

    // Webhook notification (if configured)
    if (body.webhookUrl) {
      fetch(body.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'analysis_complete',
          score: result.overallScore,
          recommendation: result.recommendation,
          redFlags: result.redFlags.length,
          greenFlags: result.greenFlags.length,
          missingClauses: result.missingClauses.length,
          contractType: result.contractType,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    // Slack notification (if configured)
    if (body.slackWebhookUrl) {
      const emoji = result.recommendation === 'sign' ? '\u2705' : result.recommendation === 'negotiate' ? '\u26A0\uFE0F' : '\uD83D\uDEAB';
      fetch(body.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${emoji} Contract analyzed: Score ${result.overallScore}/100 (${result.recommendation.replace('_', ' ')}). ${result.redFlags.length} red flags, ${result.greenFlags.length} green flags.`,
        }),
      }).catch(() => {});
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
