import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: public — return a single published post by slug
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/blog/[slug]">
) {
  const { slug } = await ctx.params;

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Increment view_count non-blocking
  supabase
    .from("blog_posts")
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq("id", data.id)
    .then(() => {});

  return NextResponse.json(data);
}
