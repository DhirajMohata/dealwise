import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/security";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip, 10, 3600000)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const { description, pageUrl, userEmail } = await request.json();
  if (!description?.trim()) return NextResponse.json({ error: "Description required" }, { status: 400 });
  if (description.length > 5000) return NextResponse.json({ error: "Description too long (max 5000 characters)" }, { status: 400 });

  const { error } = await supabase.from("issue_reports").insert({
    description, page_url: pageUrl, user_email: userEmail,
  });
  if (error) return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  return NextResponse.json({ success: true });
}
