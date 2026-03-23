import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

// GET — get user's teams
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Get teams where user is owner or member
  const { data: memberships } = await supabase
    .from('team_members')
    .select('team_id, role, teams(id, name, owner_email, created_at)')
    .eq('email', session.user.email);

  // Also get teams the user owns
  const { data: ownedTeams } = await supabase
    .from('teams')
    .select('*')
    .eq('owner_email', session.user.email);

  return NextResponse.json({ memberships: memberships || [], ownedTeams: ownedTeams || [] });
}

// POST — create a team
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name } = await request.json();
  if (!name || typeof name !== 'string') return NextResponse.json({ error: "Team name required" }, { status: 400 });

  const { data, error } = await supabase.from('teams').insert({
    name: name.trim(),
    owner_email: session.user.email,
  }).select().single();

  if (error) return NextResponse.json({ error: "Failed to create team" }, { status: 500 });

  // Add owner as team member
  await supabase.from('team_members').insert({
    team_id: data.id,
    email: session.user.email,
    role: 'owner',
    accepted: true,
  });

  return NextResponse.json({ team: data });
}
