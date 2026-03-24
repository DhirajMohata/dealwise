import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { sendEmail, verificationEmailHTML } from "@/lib/email";
import { checkRateLimit } from "@/lib/security";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip, 5, 3600000)) {
    return NextResponse.json({ error: "Too many signup attempts. Try again later." }, { status: 429 });
  }

  const body = await request.json();
  const { email, password, name } = body as { email: string; password: string; name?: string };

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  // Validate password length
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  // Validate password complexity
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasUpper || !hasLower || !hasNumber) {
    return NextResponse.json({ error: "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number." }, { status: 400 });
  }

  // Check if email already exists
  const { data: existing } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists. Try signing in." }, { status: 409 });
  }

  // Create user
  const hashedPassword = bcrypt.hashSync(password, 12);
  const userId = crypto.randomUUID();
  const verificationToken = crypto.randomUUID();
  const userName = name || email.split("@")[0];

  const { error: insertError } = await supabase.from("users").insert({
    id: userId,
    name: userName,
    email,
    password: hashedPassword,
    email_verified: false,
    verification_token: verificationToken,
  });

  if (insertError) {
    return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
  }

  // Send verification email
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/auth/verify?token=${verificationToken}`;
  sendEmail(
    email,
    "Verify your email - dealwise",
    verificationEmailHTML(userName, verifyUrl)
  ).catch(() => {});

  return NextResponse.json({
    success: true,
    message: "Account created! Check your email to verify before signing in.",
  });
}
