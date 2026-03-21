import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

// GET: list user's analysis history
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: analyses, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_email', session.user.email)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(analyses);
}

// POST: save a new analysis
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  const { error } = await supabase.from('analyses').insert({
    id: body.id || crypto.randomUUID(),
    user_email: session.user.email,
    contract_snippet: body.contractSnippet || "",
    overall_score: body.overallScore || 0,
    recommendation: body.recommendation || "",
    nominal_rate: body.nominalRate || 0,
    effective_rate: body.effectiveRate || 0,
    rate_reduction: body.rateReduction || 0,
    currency: body.currency || "USD",
    contract_type: body.contractType || "unknown",
    full_result: body.fullResult || "{}",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE: remove an analysis
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await supabase
    .from('analyses')
    .delete()
    .eq('id', id)
    .eq('user_email', session.user.email);

  return NextResponse.json({ success: true });
}
