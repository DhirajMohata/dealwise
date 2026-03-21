import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllUsers, isAdmin } from "@/lib/credits";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await getAllUsers();
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Get auth users from Supabase
  let authUsers: Array<{name: string; email: string; id: string}> = [];
  try {
    const { data } = await supabase
      .from('users')
      .select('name, email, id')
      .order('created_at', { ascending: false })
      .limit(5);
    authUsers = data || [];
  } catch {
    // ignore
  }

  const stats = {
    totalUsers: users.length,
    totalAuthUsers: authUsers.length,
    totalCreditsUsed: users.reduce((sum, u) => sum + u.totalUsed, 0),
    totalCreditsRemaining: users.reduce((sum, u) => sum + (u.plan === 'admin' ? 0 : u.credits), 0),
    activeToday: users.filter(u => u.lastUsedAt?.startsWith(today)).length,
    adminCount: users.filter(u => u.plan === 'admin').length,
    proCount: users.filter(u => u.plan === 'pro').length,
    freeCount: users.filter(u => u.plan === 'free').length,
    avgCreditsPerUser: users.length > 0 ? Math.round(users.reduce((s, u) => s + u.totalUsed, 0) / users.length) : 0,
    usersWithZeroCredits: users.filter(u => u.credits <= 0 && u.plan !== 'admin').length,
    recentSignups: authUsers,
  };

  return NextResponse.json(stats);
}
