import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deductCredits, CREDIT_COSTS } from "@/lib/credits";

export async function GET() {
  return NextResponse.json(
    { error: "Use POST to send chat messages.", docs: "/api-docs" },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      contractContext,
      history: chatHistory,
      apiKey: userApiKey,
    } = body as {
      message: string;
      contractContext?: string;
      history?: Array<{ role: string; content: string }>;
      apiKey?: string;
    };

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    // --- Credit check ---
    const session = await auth();
    let creditsRemaining: number | undefined;

    if (session?.user?.email) {
      const creditResult = await deductCredits(session.user.email, CREDIT_COSTS.chat);
      if (!creditResult.success) {
        return NextResponse.json(
          { error: creditResult.error || "Not enough credits.", creditsRemaining: creditResult.remaining },
          { status: 402 }
        );
      }
      creditsRemaining = creditResult.remaining;
    }

    // Determine AI provider — user-provided key takes priority
    let openaiKey = process.env.OPENAI_API_KEY;
    let anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (userApiKey) {
      if (userApiKey.startsWith("sk-ant-")) {
        anthropicKey = userApiKey;
        openaiKey = undefined;
      } else {
        openaiKey = userApiKey;
        anthropicKey = undefined;
      }
    }

    if (!openaiKey && !anthropicKey) {
      // Fallback: provide a helpful static response when no API key is configured
      return NextResponse.json({
        reply: getFallbackReply(message, contractContext),
        creditsRemaining,
      });
    }

    // Build system prompt
    let systemPrompt =
      "You are a senior contract lawyer specializing in freelancer contracts. The user is asking about their contract. Be direct, practical, and specific. If they provide contract text, analyze it in context. Always explain in plain English. Use short paragraphs and bullet points where helpful.";

    if (contractContext) {
      systemPrompt += `\n\nThe user has provided the following contract text for context:\n\n---\n${contractContext}\n---\n\nAnswer questions with reference to this contract. Quote specific clauses when relevant.`;
    }

    // Build messages array
    const messages: Array<{ role: string; content: string }> = [];

    if (chatHistory && Array.isArray(chatHistory)) {
      // Include recent history (last 10 exchanges to keep token usage reasonable)
      const recent = chatHistory.slice(-20);
      for (const msg of recent) {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    }

    messages.push({ role: "user", content: message });

    let reply: string;

    if (openaiKey) {
      reply = await callOpenAI(systemPrompt, messages, openaiKey);
    } else {
      reply = await callAnthropic(systemPrompt, messages, anthropicKey!);
    }

    return NextResponse.json({ reply, creditsRemaining });
  } catch (err: unknown) {
    console.error("Chat API error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  AI Provider Calls                                                  */
/* ------------------------------------------------------------------ */

async function callOpenAI(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 2048,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";
}

async function callAnthropic(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "I couldn't generate a response. Please try again.";
}

/* ------------------------------------------------------------------ */
/*  Fallback (no API key)                                              */
/* ------------------------------------------------------------------ */

function getFallbackReply(message: string, context?: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("ip") || lower.includes("intellectual property")) {
    return "**Intellectual Property** is one of the most important clauses in any freelance contract. Here are the key things to look for:\n\n- **Transfer timing**: IP should only transfer to the client upon full payment. Never agree to IP transferring upon creation.\n- **Portfolio rights**: Always retain the right to showcase your work in your portfolio.\n- **Pre-existing IP**: Make sure your pre-existing tools, code libraries, or assets remain yours.\n- **Work for hire**: Be cautious with 'work for hire' language, as it may give the client broader rights than intended.\n\nIf your contract doesn't address these points, you should negotiate to add them before signing.";
  }

  if (lower.includes("payment") || lower.includes("pay") || lower.includes("invoice")) {
    return "**Payment terms** can make or break a freelance engagement. Here's what to watch for:\n\n- **Deposit**: Always require 25-50% upfront before starting work.\n- **Milestones**: For larger projects, tie payments to milestones rather than completion.\n- **Net terms**: Net-15 is ideal; Net-30 is acceptable. Avoid Net-60 or longer.\n- **Late payment penalties**: Include a late fee clause (1.5% per month is standard).\n- **Kill fee**: If the project is cancelled, you should be paid for work completed plus a cancellation fee (typically 25% of remaining value).\n\nNever start work without a signed contract and a deposit.";
  }

  if (lower.includes("termination") || lower.includes("cancel")) {
    return "**Termination clauses** protect both parties. Key elements to include:\n\n- **Notice period**: Require at least 14-30 days written notice for termination.\n- **Kill fee**: If the client terminates without cause, a kill fee (25-50% of remaining contract value) compensates you for lost income.\n- **Payment for work done**: All completed work must be paid for regardless of termination.\n- **Deliverable ownership**: Clarify what happens to partially completed work.\n- **Mutual termination**: Both parties should have the right to terminate, not just the client.";
  }

  if (lower.includes("revision") || lower.includes("change")) {
    return "**Revision and change clauses** prevent scope creep. Best practices:\n\n- **Cap revisions**: Limit the number of included revision rounds (2-3 is standard).\n- **Define a revision**: Clearly state what constitutes a 'revision' vs. a 'change in scope'.\n- **Additional cost**: Extra revisions beyond the cap should be billed at your hourly rate.\n- **Approval process**: Require written approval for any changes to scope.\n- **Timeline impact**: Additional revisions extend the delivery timeline.";
  }

  if (context) {
    return "I can see you've shared a contract for context. While I can't perform a detailed AI analysis without an API key configured, here are general tips:\n\n1. **Check payment terms** - Look for deposit requirements, payment timeline, and late fees.\n2. **Review IP clauses** - Ensure IP transfers only on full payment.\n3. **Look for revision caps** - Unlimited revisions is a red flag.\n4. **Check termination terms** - Both parties should have exit options.\n5. **Verify scope definition** - Vague scope leads to scope creep.\n\nTo get AI-powered analysis, configure your OpenAI or Anthropic API key in Settings.";
  }

  return "I'm here to help with your freelance contract questions! Here are some common topics I can help with:\n\n- **Payment terms** - deposits, milestones, late fees\n- **IP and ownership** - when and how intellectual property transfers\n- **Revision limits** - protecting against scope creep\n- **Termination clauses** - exit strategies and kill fees\n- **Non-compete/NDA** - understanding restrictive covenants\n- **Liability and indemnification** - limiting your risk\n\nAsk me about any specific clause or concern, and I'll give you practical advice.\n\n*Note: For full AI-powered contract analysis, configure your API key in Settings.*";
}
