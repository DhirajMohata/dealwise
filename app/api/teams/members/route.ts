import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

// GET — get team members
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const teamId = request.nextUrl.searchParams.get('teamId');
  if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

  // Verify user is a member of this team
  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('email', session.user.email)
    .single();

  if (!membership) return NextResponse.json({ error: "Not a member of this team" }, { status: 403 });

  const { data: members } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId);

  return NextResponse.json({ members: members || [], userRole: membership.role });
}

// POST — invite member
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { teamId, email } = await request.json();
  if (!teamId || !email) return NextResponse.json({ error: "teamId and email required" }, { status: 400 });

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  // Verify user is owner or admin
  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('email', session.user.email)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: "Only team owners/admins can invite" }, { status: 403 });
  }

  const { error } = await supabase.from('team_members').insert({
    team_id: teamId,
    email: email.trim().toLowerCase(),
    role: 'member',
    accepted: false,
  });

  if (error) return NextResponse.json({ error: "Failed to invite member (may already be a member)" }, { status: 400 });

  // Send invite email
  sendEmail(email, `You've been invited to a team on dealwise`,
    `<p>You've been invited to join a team on dealwise by ${session.user.email}.</p><p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard">Accept Invitation</a></p>`
  ).catch(() => {});

  return NextResponse.json({ success: true });
}

// DELETE — remove member
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { teamId, email } = await request.json();

  // Verify user is owner/admin OR removing themselves
  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('email', session.user.email)
    .single();

  const isSelf = email === session.user.email;
  if (!isSelf && (!membership || !['owner', 'admin'].includes(membership.role))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await supabase.from('team_members').delete().eq('team_id', teamId).eq('email', email);
  return NextResponse.json({ success: true });
}
