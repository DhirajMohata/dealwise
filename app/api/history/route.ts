import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

// GET: list user's analysis history (or team analyses if teamId is provided)
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const hash = request.nextUrl.searchParams.get('hash');
  if (hash) {
    const { data } = await supabase
      .from('analyses')
      .select('id, overall_score, recommendation, created_at')
      .eq('user_email', session.user.email)
      .eq('contract_hash', hash)
      .order('created_at', { ascending: true });
    return NextResponse.json({ versions: data || [] });
  }

  const teamId = request.nextUrl.searchParams.get('teamId');

  if (teamId) {
    // Verify user is a member of this team
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('email', session.user.email)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this team" }, { status: 403 });
    }

    // Get analyses shared with this team
    const { data: analyses, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(analyses);
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
    contract_hash: body.contractHash || null,
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

  const { data, error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', id)
    .eq('user_email', session.user.email)
    .select();

  if (error) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
