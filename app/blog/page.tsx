import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { getAllPosts as getHardcodedPosts } from "@/lib/blog-posts";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "dealwise Blog | Freelance Contract Insights & Guides",
  description:
    "Expert guides on freelance contracts, payment terms, negotiation, and protecting your rates. Learn to spot red flags and earn what you deserve.",
};

const categoryColors: Record<string, string> = {
  Rates: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Contracts: "bg-blue-50 text-blue-700 border-blue-200",
  Legal: "bg-purple-50 text-purple-700 border-purple-200",
  Payments: "bg-amber-50 text-amber-700 border-amber-200",
  general: "bg-gray-100 text-gray-700 border-gray-200",
  guides: "bg-blue-50 text-blue-700 border-blue-200",
  news: "bg-indigo-50 text-indigo-700 border-indigo-200",
  tips: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "case-studies": "bg-amber-50 text-amber-700 border-amber-200",
  "product-updates": "bg-purple-50 text-purple-700 border-purple-200",
};

async function getPosts() {
  // Try DB first
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, category, published_at, created_at, view_count, is_featured")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false });

    if (!error && data && data.length > 0) {
      return data.map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.excerpt || "",
        date: p.published_at || p.created_at,
        readTime: `${Math.max(3, Math.ceil((p.view_count || 100) / 100))} min read`,
        category: p.category || "general",
      }));
    }
  } catch {}

  // Fallback to hardcoded posts
  return getHardcodedPosts();
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            dealwise Blog
          </h1>
          <p className="mt-3 text-base text-gray-500 max-w-xl mx-auto">
            Insights and guides for freelancers
          </p>
        </div>

        {/* Post grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <article className="group h-full flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-xs hover:shadow-sm hover:-translate-y-px hover:border-gray-300 transition-all duration-200">
                {/* Category & read time */}
                <div className="flex items-center gap-2 mb-3">
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
                <h2 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">
                  {post.description}
                </p>

                {/* Footer */}
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <time
                    dateTime={post.date}
                    className="text-xs text-gray-400"
                  >
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  <span className="text-xs font-medium text-indigo-600 group-hover:underline">
                    Read more
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
