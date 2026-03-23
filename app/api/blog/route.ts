import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: public — list published posts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const tag = searchParams.get("tag");
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  let query = supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  if (featured === "true") {
    query = query.eq("is_featured", true);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }

  return NextResponse.json({ posts: data, total: count });
}
