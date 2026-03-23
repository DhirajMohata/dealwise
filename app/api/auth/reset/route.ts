import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/security";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip, 5, 3600000)) {
    return NextResponse.json({ success: true }); // Don't reveal rate limiting to prevent enumeration
  }

  const { email, token, newPassword } = await request.json();

  // Step 1: Request reset (send email)
  if (email && !token) {
    const { data: user } = await supabase.from("users").select("name").eq("email", email).single();
    if (!user) return NextResponse.json({ success: true }); // Don't reveal if email exists

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    await supabase.from("password_reset_tokens").insert({ email, token: resetToken, expires_at: expiresAt });

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset?token=${resetToken}`;
    await sendEmail(email, "Reset your dealwise password", `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 20px">
        <h1 style="font-size:24px;font-weight:700;color:#111827">dealwise</h1>
        <h2 style="font-size:18px;color:#111827;margin-top:20px">Reset your password</h2>
        <p style="color:#4B5563">Hi ${user.name}, click the button below to reset your password. This link expires in 1 hour.</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${resetUrl}" style="display:inline-block;background:#4F46E5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
        </div>
        <p style="font-size:12px;color:#9CA3AF">If you didn't request this, ignore this email.</p>
      </div>
    `);

    return NextResponse.json({ success: true });
  }

  // Step 2: Reset password (with token)
  if (token && newPassword) {
    if (newPassword.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const { data: resetRecord } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (!resetRecord) return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    if (new Date(resetRecord.expires_at) < new Date()) return NextResponse.json({ error: "Reset link has expired" }, { status: 400 });

    const bcrypt = require("bcryptjs");
    const hashedPassword = bcrypt.hashSync(newPassword, 12);

    await supabase.from("users").update({ password: hashedPassword }).eq("email", resetRecord.email);
    await supabase.from("password_reset_tokens").update({ used: true }).eq("token", token);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
