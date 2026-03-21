import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";

// GET: fetch approved reviews (public)
export async function GET() {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  return NextResponse.json(data);
}

// POST: submit a review (authenticated)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { rating, reviewText } = await request.json();
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: "Rating 1-5 required" }, { status: 400 });

  const { error } = await supabase.from("reviews").insert({
    user_email: session.user.email,
    user_name: session.user.name || session.user.email.split("@")[0],
    rating,
    review_text: reviewText,
  });

  if (error) return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  return NextResponse.json({ success: true });
}
