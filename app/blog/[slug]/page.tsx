import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Nav from "@/components/Nav";
import { getPostBySlug as getHardcodedPost, getAllPosts as getHardcodedPosts } from "@/lib/blog-posts";
import { supabase } from "@/lib/supabase";

const categoryColors: Record<string, string> = {
  Rates: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Contracts: "bg-blue-50 text-blue-700 border-blue-200",
  Legal: "bg-purple-50 text-purple-700 border-purple-200",
  Payments: "bg-amber-50 text-amber-700 border-amber-200",
  general: "bg-gray-100 text-gray-700 border-gray-200",
  guides: "bg-blue-50 text-blue-700 border-blue-200",
  news: "bg-indigo-50 text-indigo-700 border-indigo-200",
  tips: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

async function getPost(slug: string) {
  // Try DB first
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (!error && data) {
      // Increment view count
      supabase.from("blog_posts").update({ view_count: (data.view_count || 0) + 1 }).eq("id", data.id).then(() => {});
      return {
        slug: data.slug,
        title: data.title,
        description: data.excerpt || data.seo_description || "",
        date: data.published_at || data.created_at,
        readTime: `${Math.max(3, Math.ceil(data.content.length / 1000))} min read`,
        category: data.category || "general",
        content: data.content,
      };
    }
  } catch {}

  // Fallback to hardcoded
  return getHardcodedPost(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} | dealwise Blog`,
    description: post.description,
  };
}

export function generateStaticParams() {
  return getHardcodedPosts().map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <article className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Blog
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${
              categoryColors[post.category] ||
              "bg-gray-100 text-gray-700 border-gray-200"
            }`}
          >
            {post.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path
                strokeLinecap="round"
                strokeWidth="2"
                d="M12 6v6l4 2"
              />
            </svg>
            {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          {post.title}
        </h1>

        {/* Date */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
          <span className="flex items-center gap-1.5">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                strokeWidth="2"
              />
              <path strokeWidth="2" d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </span>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none prose-headings:tracking-tight prose-headings:font-bold prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-xl border border-indigo-100 bg-indigo-50/50 p-6 sm:p-8 text-center">
          <h2
            className="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Analyze your contract now
          </h2>
          <p className="text-sm text-gray-600 mb-5 max-w-md mx-auto">
            Upload your freelance contract and get your real effective hourly
            rate, red flag detection, and a sign/negotiate/walk recommendation
            in 30 seconds.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Try dealwise free
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </article>
    </div>
  );
}
