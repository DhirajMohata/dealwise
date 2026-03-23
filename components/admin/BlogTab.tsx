'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button, Card, Badge, Input, Textarea, Select } from '@/components/ui';
import {
  Plus,
  ArrowLeft,
  Eye,
  EyeOff,
  Star,
  Trash2,
  Save,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author_email: string;
  author_name: string;
  cover_image_url: string | null;
  tags: string[];
  category: string;
  is_published: boolean;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  view_count: number;
}

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'guides', label: 'Guides' },
  { value: 'news', label: 'News' },
  { value: 'tips', label: 'Tips' },
  { value: 'case-studies', label: 'Case Studies' },
  { value: 'product-updates', label: 'Product Updates' },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  // Editor state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('general');
  const [tagsInput, setTagsInput] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blog');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  function openEditor(post?: BlogPost) {
    if (post) {
      setEditingPost(post);
      setIsNewPost(false);
      setTitle(post.title);
      setSlug(post.slug);
      setContent(post.content);
      setExcerpt(post.excerpt || '');
      setCategory(post.category);
      setTagsInput(post.tags.join(', '));
      setCoverImageUrl(post.cover_image_url || '');
      setSeoTitle(post.seo_title || '');
      setSeoDescription(post.seo_description || '');
    } else {
      setEditingPost(null);
      setIsNewPost(true);
      setTitle('');
      setSlug('');
      setContent('');
      setExcerpt('');
      setCategory('general');
      setTagsInput('');
      setCoverImageUrl('');
      setSeoTitle('');
      setSeoDescription('');
    }
    setShowPreview(false);
    setShowSeo(false);
  }

  function closeEditor() {
    setEditingPost(null);
    setIsNewPost(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (isNewPost) {
        const res = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            title,
            content,
            excerpt: excerpt || undefined,
            category,
            tags,
            coverImageUrl: coverImageUrl || undefined,
            seoTitle: seoTitle || undefined,
            seoDescription: seoDescription || undefined,
          }),
        });
        if (res.ok) {
          closeEditor();
          fetchPosts();
        }
      } else if (editingPost) {
        const res = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            id: editingPost.id,
            title,
            slug,
            content,
            excerpt: excerpt || undefined,
            category,
            tags,
            coverImageUrl: coverImageUrl || undefined,
            seoTitle: seoTitle || undefined,
            seoDescription: seoDescription || undefined,
          }),
        });
        if (res.ok) {
          closeEditor();
          fetchPosts();
        }
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function handleAction(id: string, action: string) {
    if (action === 'delete' && !window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id }),
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch {
      // ignore
    }
  }

  // Editor view
  if (isNewPost || editingPost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={closeEditor} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {isNewPost ? 'New Post' : 'Edit Post'}
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Editor pane */}
          <div className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (isNewPost) setSlug(generateSlug(e.target.value));
              }}
              placeholder="Post title"
            />

            <Input
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-url-slug"
              hint={`/blog/${slug || '...'}`}
            />

            <Textarea
              label="Excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short description for listing cards"
              rows={2}
            />

            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={CATEGORY_OPTIONS}
            />

            <Input
              label="Tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="tag1, tag2, tag3"
              hint="Comma separated"
            />

            <Input
              label="Cover Image URL"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
            />

            {/* SEO section (collapsible) */}
            <button
              onClick={() => setShowSeo(!showSeo)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {showSeo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              SEO Settings
            </button>

            {showSeo && (
              <div className="space-y-3 pl-2 border-l-2 border-gray-100">
                <Input
                  label="SEO Title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Override page title for search engines"
                />
                <Textarea
                  label="SEO Description"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Meta description for search engines"
                  rows={2}
                />
              </div>
            )}

            <Textarea
              label="Content (Markdown)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post in markdown..."
              rows={16}
              className="font-mono text-sm"
            />
          </div>

          {/* Preview pane */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</span>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium xl:hidden"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
            <Card
              padding="md"
              className={`prose prose-sm max-w-none overflow-auto max-h-[70vh] ${
                showPreview ? '' : 'hidden xl:block'
              }`}
            >
              {title && <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>}
              {excerpt && <p className="text-gray-500 italic mb-4">{excerpt}</p>}
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : (
                <p className="text-gray-300 italic">Start writing to see preview...</p>
              )}
            </Card>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <Button onClick={handleSave} loading={saving} icon={<Save className="h-4 w-4" />}>
            Save Draft
          </Button>
          {editingPost && !editingPost.is_published && (
            <Button
              variant="outline"
              onClick={async () => {
                await handleSave();
                if (editingPost) await handleAction(editingPost.id, 'publish');
              }}
              icon={<Send className="h-4 w-4" />}
            >
              Publish
            </Button>
          )}
          {editingPost && editingPost.is_published && (
            <Button
              variant="secondary"
              onClick={() => handleAction(editingPost.id, 'unpublish')}
              icon={<EyeOff className="h-4 w-4" />}
            >
              Unpublish
            </Button>
          )}
          {editingPost && (
            <>
              {editingPost.is_featured ? (
                <Button
                  variant="ghost"
                  onClick={() => handleAction(editingPost.id, 'unfeature')}
                  icon={<Star className="h-4 w-4" />}
                >
                  Unfeature
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => handleAction(editingPost.id, 'feature')}
                  icon={<Star className="h-4 w-4" />}
                >
                  Feature
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => {
                  handleAction(editingPost.id, 'delete');
                  closeEditor();
                }}
                icon={<Trash2 className="h-4 w-4" />}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Post list view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Blog Posts</h2>
        <Button onClick={() => openEditor()} icon={<Plus className="h-4 w-4" />} size="sm">
          New Post
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : posts.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-gray-400 text-sm">No blog posts yet. Create your first post.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card
              key={post.id}
              padding="sm"
              hover
              className="cursor-pointer"
              onClick={() => openEditor(post)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{post.title}</h3>
                    {post.is_published && post.is_featured ? (
                      <Badge variant="warning">Featured</Badge>
                    ) : post.is_published ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="default">Draft</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="capitalize">{post.category}</span>
                    {post.tags.length > 0 && (
                      <span>{post.tags.join(', ')}</span>
                    )}
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.view_count}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {post.is_published ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAction(post.id, 'unpublish'); }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                      title="Unpublish"
                    >
                      <EyeOff className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAction(post.id, 'publish'); }}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-md hover:bg-gray-100 transition-colors"
                      title="Publish"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAction(post.id, post.is_featured ? 'unfeature' : 'feature'); }}
                    className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${post.is_featured ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
                    title={post.is_featured ? 'Unfeature' : 'Feature'}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAction(post.id, 'delete'); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
