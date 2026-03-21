import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { description, pageUrl, userEmail } = await request.json();
  if (!description?.trim()) return NextResponse.json({ error: "Description required" }, { status: 400 });

  const { error } = await supabase.from("issue_reports").insert({
    description, page_url: pageUrl, user_email: userEmail,
  });
  if (error) return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  return NextResponse.json({ success: true });
}
