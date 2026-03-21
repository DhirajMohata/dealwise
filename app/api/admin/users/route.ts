import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllUsers, isAdmin, addCredits, setUserPlan, deleteUser } from "@/lib/credits";

// GET all users
export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return NextResponse.json(await getAllUsers());
}

// POST: add credits, change plan, delete user
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { action, email, amount, plan } = body;

  switch (action) {
    case 'addCredits':
      if (!email || !amount) return NextResponse.json({ error: "Missing email or amount" }, { status: 400 });
      return NextResponse.json(await addCredits(email, amount));
    case 'setPlan':
      if (!email || !plan) return NextResponse.json({ error: "Missing email or plan" }, { status: 400 });
      return NextResponse.json(await setUserPlan(email, plan));
    case 'deleteUser':
      if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
      return NextResponse.json({ deleted: await deleteUser(email) });
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
