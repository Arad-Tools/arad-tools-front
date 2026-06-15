import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import BlogCard from './BlogCard';
import type { BlogSectionProps } from '@/lib/types';

export default function BlogSection({ posts }: BlogSectionProps) {
  if (posts.length === 0) return null;

  const [featured, ...rest] = posts;

  return (
    <section className="bg-gray-100 py-12" aria-label="مقالات و راهنماها">
      <div className="container mx-auto px-4">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 rounded-full bg-navy-800 flex-shrink-0" aria-hidden />
            <div>
              <p className="text-xs font-medium text-gray-400 mb-0.5">دانش ابزار</p>
              <h2 className="text-lg font-black text-gray-900">مقالات و راهنماها</h2>
            </div>
          </div>
          <Link
            href="/blog"
            className="flex items-center gap-1 text-sm font-semibold text-navy-800 hover:text-brand transition-colors"
          >
            همه مقالات
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* ── Layout: featured (large) + remaining (smaller) ─────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Featured post — takes up 2 columns on desktop */}
          {featured && (
            <div className="md:col-span-2">
              <BlogCard post={featured} featured />
            </div>
          )}

          {/* Rest of posts — stack in the 3rd column */}
          {rest.length > 0 && (
            <div className="flex flex-col gap-4">
              {rest.slice(0, 2).map((post) => (
                <div key={post.id} className="flex-1">
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
