import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserCredits } from "@/lib/credits";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const credits = await getUserCredits(session.user.email);
  return NextResponse.json(credits);
}
