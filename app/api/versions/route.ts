import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

interface VersionRow {
  id: string;
  contract_name: string;
  version_number: number;
  analysis_id: string;
  created_at: string;
  overall_score: number | null;
  recommendation: string | null;
}

// GET: list user's contract versions grouped by contract name
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // First check if there are explicit version entries
  const { data: versionRows } = await supabase
    .from('contract_versions')
    .select('id, contract_name, version_number, analysis_id, created_at')
    .eq('user_email', session.user.email)
    .order('contract_name')
    .order('version_number');

  if (versionRows && versionRows.length > 0) {
    // Fetch corresponding analyses for scores
    const analysisIds = versionRows.map(v => v.analysis_id).filter(Boolean);
    const { data: analysesData } = analysisIds.length > 0
      ? await supabase
          .from('analyses')
          .select('id, overall_score, recommendation')
          .in('id', analysisIds)
      : { data: [] };

    const analysesMap: Record<string, { overall_score: number; recommendation: string }> = {};
    for (const a of (analysesData || [])) {
      analysesMap[a.id] = { overall_score: a.overall_score, recommendation: a.recommendation };
    }

    const versions: VersionRow[] = versionRows.map(v => ({
      ...v,
      overall_score: analysesMap[v.analysis_id]?.overall_score ?? null,
      recommendation: analysesMap[v.analysis_id]?.recommendation ?? null,
    }));

    // Group by contract name
    const grouped: Record<string, Array<{
      id: string;
      contractName: string;
      versionNumber: number;
      overallScore: number;
      recommendation: string;
      createdAt: string;
      analysisId: string;
    }>> = {};

    for (const v of versions) {
      const key = v.contract_name || 'Unnamed Contract';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        id: v.id,
        contractName: key,
        versionNumber: v.version_number,
        overallScore: v.overall_score ?? 0,
        recommendation: v.recommendation ?? 'negotiate',
        createdAt: v.created_at,
        analysisId: v.analysis_id,
      });
    }

    const groups = Object.entries(grouped).map(([name, vers]) => ({
      name,
      versions: vers,
    }));

    return NextResponse.json({ groups });
  }

  // Fallback: group analyses by contract_snippet similarity
  const { data: analyses } = await supabase
    .from('analyses')
    .select('id, contract_snippet, overall_score, recommendation, created_at')
    .eq('user_email', session.user.email)
    .order('created_at', { ascending: true });

  const grouped: Record<string, Array<{
    id: string;
    contractName: string;
    versionNumber: number;
    overallScore: number;
    recommendation: string;
    createdAt: string;
    analysisId: string;
  }>> = {};

  for (const a of (analyses || [])) {
    const key = (a.contract_snippet || 'Contract').slice(0, 30).trim();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      id: a.id,
      contractName: key,
      versionNumber: grouped[key].length + 1,
      overallScore: a.overall_score,
      recommendation: a.recommendation,
      createdAt: a.created_at,
      analysisId: a.id,
    });
  }

  const groups = Object.entries(grouped).map(([name, vers]) => ({
    name,
    versions: vers,
  }));

  return NextResponse.json({ groups });
}
