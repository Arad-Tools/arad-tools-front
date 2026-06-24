'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { Play, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  images: string[];
  title: string;
  videoUrl?: string;
}

export default function ProductGallery({ images, title, videoUrl }: Props) {
  const gallery = images.length > 0 ? images : ['https://placehold.co/800x800?text=No+Image'];
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      setActiveIndex((i) => Math.min(i + 1, gallery.length - 1));
    } else if (diff < -50) {
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
  }, [gallery.length]);

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'relative bg-white rounded-2xl border border-gray-100 overflow-hidden aspect-square',
          zoomed && 'cursor-zoom-out',
        )}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => setZoomed((z) => !z)}
      >
        <Image
          src={gallery[activeIndex]}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn(
            'object-contain p-4 transition-transform duration-300',
            zoomed ? 'scale-150' : 'group-hover:scale-105',
          )}
          priority
        />

        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 start-3 flex items-center gap-2 bg-navy/90 text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-navy transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Play className="w-3.5 h-3.5" />
            ویدیو محصول
          </a>
        )}

        <button
          type="button"
          className="hidden md:flex absolute top-3 end-3 p-2 bg-white/90 rounded-full shadow-sm text-gray-600"
          aria-label="بزرگنمایی تصویر"
          onClick={(e) => {
            e.stopPropagation();
            setZoomed((z) => !z);
          }}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {gallery.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-white transition-all',
                i === activeIndex ? 'border-brand ring-2 ring-brand/20' : 'border-gray-100 hover:border-gray-300',
              )}
              aria-label={`تصویر ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
