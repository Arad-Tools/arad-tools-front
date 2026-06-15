import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import type { BlogPost } from '@/lib/types';
import { toPersianDigits, truncate } from '@/lib/utils';

interface Props {
  post: BlogPost;
  featured?: boolean; // larger card variant
}

export default function BlogCard({ post, featured = false }: Props) {
  return (
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col h-full">

      {/* ── Thumbnail ──────────────────────────────────────────────────────── */}
      <Link href={`/blog/${post.slug}`} className="block overflow-hidden flex-shrink-0" tabIndex={-1} aria-hidden>
        <div className={`relative w-full bg-gray-100 overflow-hidden ${featured ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
          <Image
            src={post.image || 'https://placehold.co/600x400?text=Loading'}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-400"
          />
          {/* Category badge on image */}
          <span className="absolute top-3 end-3 bg-navy-800/90 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {post.category}
          </span>
        </div>
      </Link>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-2">

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className={`font-bold text-gray-900 leading-relaxed group-hover:text-brand transition-colors ${featured ? 'text-lg' : 'text-sm'} line-clamp-2`}>
            {post.title}
          </h3>
        </Link>

        {/* Excerpt — only on featured or larger screens */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
          {truncate(post.excerpt, 120)}
        </p>

        {/* Footer: read time */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <Link
            href={`/blog/${post.slug}`}
            className="text-xs font-semibold text-brand hover:text-brand-700 transition-colors"
          >
            ادامه مطلب
          </Link>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{toPersianDigits(post.readTime)} دقیقه مطالعه</span>
          </div>
        </div>
      </div>
    </article>
  );
}
