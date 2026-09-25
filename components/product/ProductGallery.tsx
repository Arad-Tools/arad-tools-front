'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Play, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { cn, productImage } from '@/lib/utils';
import { PRODUCT_PLACEHOLDER } from '@/lib/media';

interface Props {
  images?: string[];
  title: string;
  videoUrl?: string;
}

export default function ProductGallery({ images, title, videoUrl }: Props) {
  const rawImages = Array.isArray(images) ? images : [];
  const gallery = rawImages.length > 0
    ? rawImages.map((src) => productImage(src))
    : [PRODUCT_PLACEHOLDER];

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageError = (index: number) => {
    setFailedImages((prev) => {
      if (prev[index]) return prev;
      return { ...prev, [index]: true };
    });
  };

  const getImageSrc = (index: number) => {
    if (failedImages[index]) {
      return PRODUCT_PLACEHOLDER;
    }
    const src = gallery[index];
    if (!src || src.includes('product-placeholder.svg')) {
      return PRODUCT_PLACEHOLDER;
    }
    return src;
  };

  const updateZoomPosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setZoomPosition({
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    updateZoomPosition(e.clientX, e.clientY);
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomed) {
      setZoomed(false);
    } else {
      updateZoomPosition(e.clientX, e.clientY);
      setZoomed(true);
    }
  };

  const handleToggleMagnifier = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!zoomed) {
      setZoomPosition({ x: 50, y: 50 });
    }
    setZoomed((z) => !z);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (zoomed) {
      if (e.touches.length > 0) {
        updateZoomPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
      return;
    }
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!zoomed || e.touches.length === 0) return;
    const touch = e.touches[0];
    updateZoomPosition(touch.clientX, touch.clientY);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (zoomed) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      setActiveIndex((i) => Math.min(i + 1, gallery.length - 1));
      setZoomed(false);
      setZoomPosition({ x: 50, y: 50 });
    } else if (diff < -50) {
      setActiveIndex((i) => Math.max(i - 1, 0));
      setZoomed(false);
      setZoomPosition({ x: 50, y: 50 });
    }
  };

  const activeSrc = getImageSrc(activeIndex);
  const isActivePlaceholder =
    !activeSrc ||
    activeSrc === PRODUCT_PLACEHOLDER ||
    activeSrc.includes('product-placeholder.svg');

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className={cn(
          'relative bg-white rounded-2xl border border-gray-100 overflow-hidden aspect-square select-none group',
          zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in',
        )}
        onTouchStart={onTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseMove={handleMouseMove}
        onClick={handleContainerClick}
      >
        {/* Loading skeleton shimmer */}
        {!loadedImages[activeIndex] && !isActivePlaceholder && (
          <div className="absolute inset-0 bg-gray-100/80 animate-pulse pointer-events-none z-0" />
        )}

        {/* Zoomable / pannable image layer */}
        <div
          className="relative w-full h-full will-change-transform"
          style={{
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
            transform: zoomed ? 'scale(2.4)' : 'scale(1)',
            transition: zoomed
              ? 'transform 200ms ease-out, transform-origin 60ms linear'
              : 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1), transform-origin 250ms ease',
          }}
        >
          <Image
            key={activeSrc}
            src={activeSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={cn(
              'object-contain p-4 transition-all duration-300',
              isActivePlaceholder
                ? 'opacity-35 grayscale-[30%] scale-90'
                : (loadedImages[activeIndex] ? 'opacity-100' : 'opacity-0'),
            )}
            priority
            onLoad={() => setLoadedImages((prev) => ({ ...prev, [activeIndex]: true }))}
            onError={() => {
              handleImageError(activeIndex);
              setLoadedImages((prev) => ({ ...prev, [activeIndex]: true }));
            }}
          />
        </div>

        {/* Magnifier helper tooltip when zoomed */}
        {zoomed && (
          <div className="hidden sm:flex absolute bottom-3 start-1/2 -translate-x-1/2 bg-gray-900/85 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg pointer-events-none z-20 items-center gap-1.5 animate-in fade-in duration-200">
            <Move className="w-3.5 h-3.5 text-brand" />
            <span>اشاره‌گر را روی تصویر حرکت دهید</span>
          </div>
        )}

        {/* Product video badge if available */}
        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 start-3 flex items-center gap-2 bg-navy/90 text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-navy transition-colors z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Play className="w-3.5 h-3.5" />
            ویدیو محصول
          </a>
        )}

        {/* Magnifier toggle button */}
        <button
          type="button"
          className={cn(
            'flex absolute top-3 end-3 p-2.5 rounded-full shadow-md transition-all z-20',
            zoomed
              ? 'bg-brand text-white ring-2 ring-brand/30 scale-105'
              : 'bg-white/90 hover:bg-white text-gray-700 hover:text-brand hover:scale-105',
          )}
          aria-label={zoomed ? 'بستن بزرگنمایی' : 'بزرگنمایی تصویر'}
          title={zoomed ? 'بستن بزرگنمایی' : 'بزرگنمایی تصویر (کلیک کنید و ماوس را حرکت دهید)'}
          onClick={handleToggleMagnifier}
        >
          {zoomed ? (
            <ZoomOut className="w-4 h-4" />
          ) : (
            <ZoomIn className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Thumbnails row */}
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {gallery.map((src, i) => {
            const thumbSrc = getImageSrc(i);
            const isThumbPlaceholder =
              !thumbSrc ||
              thumbSrc === PRODUCT_PLACEHOLDER ||
              thumbSrc.includes('product-placeholder.svg');

            return (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => {
                  setActiveIndex(i);
                  setZoomed(false);
                  setZoomPosition({ x: 50, y: 50 });
                }}
                className={cn(
                  'relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-white transition-all',
                  i === activeIndex ? 'border-brand ring-2 ring-brand/20' : 'border-gray-100 hover:border-gray-300',
                )}
                aria-label={`تصویر ${i + 1}`}
              >
                <Image
                  src={thumbSrc}
                  alt=""
                  fill
                  sizes="80px"
                  className={cn(
                    'object-contain p-1 transition-all duration-200',
                    isThumbPlaceholder && 'opacity-35 grayscale-[30%] scale-90',
                  )}
                  onError={() => handleImageError(i)}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
