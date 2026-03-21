import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { name, email, subject, message } = await request.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const { error } = await supabase.from("contact_messages").insert({ name, email, subject, message });
  if (error) return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}
