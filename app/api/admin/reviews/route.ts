import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/credits";
import { supabase } from "@/lib/supabase";

// GET: list all reviews
export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  return NextResponse.json(data);
}

// POST: approve/reject/feature reviews
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, action } = await request.json();
  if (!id || !action) return NextResponse.json({ error: "Missing id or action" }, { status: 400 });

  let updateData: Record<string, boolean> = {};

  switch (action) {
    case "approve":
      updateData = { is_approved: true };
      break;
    case "reject":
      updateData = { is_approved: false };
      break;
    case "feature":
      updateData = { is_featured: true };
      break;
    case "unfeature":
      updateData = { is_featured: false };
      break;
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const { error } = await supabase
    .from("reviews")
    .update(updateData)
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  return NextResponse.json({ success: true });
}
