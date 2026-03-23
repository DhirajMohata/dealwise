import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/credits";
import { supabase } from "@/lib/supabase";

// GET: list all posts (published + drafts) ordered by created_at DESC
export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  return NextResponse.json(data);
}

// POST: create, update, delete, publish, unpublish, feature, unfeature
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { action } = body;

  if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

  switch (action) {
    case "create": {
      const { title, content, excerpt, category, tags, coverImageUrl, seoTitle, seoDescription } = body;
      if (!title || !content) {
        return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
      }

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { data, error } = await supabase
        .from("blog_posts")
        .insert({
          title,
          slug,
          content,
          excerpt: excerpt || null,
          author_email: session.user.email,
          author_name: session.user.name || session.user.email,
          category: category || "general",
          tags: tags || [],
          cover_image_url: coverImageUrl || null,
          seo_title: seoTitle || null,
          seo_description: seoDescription || null,
          is_published: false,
          is_featured: false,
          view_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: "Failed to create post: " + error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    case "update": {
      const { id, title, slug, content, excerpt, category, tags, coverImageUrl, seoTitle, seoDescription } = body;
      if (!id) return NextResponse.json({ error: "Missing post id" }, { status: 400 });

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (title !== undefined) updateData.title = title;
      if (slug !== undefined) updateData.slug = slug;
      if (content !== undefined) updateData.content = content;
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (category !== undefined) updateData.category = category;
      if (tags !== undefined) updateData.tags = tags;
      if (coverImageUrl !== undefined) updateData.cover_image_url = coverImageUrl;
      if (seoTitle !== undefined) updateData.seo_title = seoTitle;
      if (seoDescription !== undefined) updateData.seo_description = seoDescription;

      const { error } = await supabase
        .from("blog_posts")
        .update(updateData)
        .eq("id", id);

      if (error) return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    case "delete": {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing post id" }, { status: 400 });

      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    case "publish": {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing post id" }, { status: 400 });

      // Check if already published (to preserve original published_at)
      const { data: existing } = await supabase
        .from("blog_posts")
        .select("published_at")
        .eq("id", id)
        .single();

      const updateData: Record<string, unknown> = {
        is_published: true,
        updated_at: new Date().toISOString(),
      };

      // Only set published_at if not already set (first publish)
      if (!existing?.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("blog_posts")
        .update(updateData)
        .eq("id", id);

      if (error) return NextResponse.json({ error: "Failed to publish post" }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    case "unpublish": {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing post id" }, { status: 400 });

      const { error } = await supabase
        .from("blog_posts")
        .update({ is_published: false, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) return NextResponse.json({ error: "Failed to unpublish post" }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    case "feature": {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing post id" }, { status: 400 });

      const { error } = await supabase
        .from("blog_posts")
        .update({ is_featured: true, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) return NextResponse.json({ error: "Failed to feature post" }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    case "unfeature": {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing post id" }, { status: 400 });

      const { error } = await supabase
        .from("blog_posts")
        .update({ is_featured: false, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) return NextResponse.json({ error: "Failed to unfeature post" }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
