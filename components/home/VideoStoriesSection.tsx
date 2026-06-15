import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import StoryCard from './StoryCard';
import type { VideoStoriesSectionProps } from '@/lib/types';

export default function VideoStoriesSection({ videos }: VideoStoriesSectionProps) {
  if (videos.length === 0) return null;

  return (
    <section
      className="bg-navy-900 py-10"
      aria-label="ویدیوها و آموزش‌ها"
    >
      <div className="container mx-auto px-4">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 rounded-full bg-brand flex-shrink-0" aria-hidden />
            <div>
              <p className="text-xs font-medium text-gray-400 mb-0.5">محتوای تخصصی</p>
              <h2 className="text-lg font-black text-white">ویدیوها و آموزش‌ها</h2>
            </div>
          </div>
          <Link
            href="/videos"
            className="flex items-center gap-1 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
          >
            همه ویدیوها
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* ── Horizontal Scroll ──────────────────────────────────────────── */}
        {/*
          RTL note: overflow-x-auto here starts scrolling from the right side.
          The first video card appears at the rightmost position — correct for Persian UX.
        */}
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          role="list"
          aria-label="لیست ویدیوها"
        >
          {videos.map((video) => (
            <div key={video.id} role="listitem">
              <StoryCard video={video} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
