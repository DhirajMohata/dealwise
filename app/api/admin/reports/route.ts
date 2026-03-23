import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/credits";
import { supabase } from "@/lib/supabase";

// GET: list all issue reports
export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("issue_reports")
    .select("id, user_email, description, page_url, status, admin_notes, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  return NextResponse.json(data);
}

// POST: update report status/notes
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, status, admin_notes } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const updateData: Record<string, string> = {};
  if (status) updateData.status = status;
  if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

  const { error } = await supabase
    .from("issue_reports")
    .update(updateData)
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  return NextResponse.json({ success: true });
}
