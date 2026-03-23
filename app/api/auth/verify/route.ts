import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
  }

  // Find user with this token
  const { data: user, error } = await supabase
    .from('users')
    .select('email, email_verified')
    .eq('verification_token', token)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
  }

  if (user.email_verified) {
    return NextResponse.json({ message: "Email already verified" });
  }

  // Mark as verified
  await supabase
    .from('users')
    .update({ email_verified: true, verification_token: null })
    .eq('email', user.email);

  return NextResponse.json({ message: "Email verified successfully! You can now sign in." });
}
