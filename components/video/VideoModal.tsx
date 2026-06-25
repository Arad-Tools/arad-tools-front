'use client';

import { useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Video } from '@/lib/types';
import { getVideoEmbedUrl } from '@/lib/video';

interface Props {
  video: Video | null;
  onClose: () => void;
}

export default function VideoModal({ video, onClose }: Props) {
  const embedUrl = video ? getVideoEmbedUrl(video) : null;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!video) {
      return;
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [video, handleKeyDown]);

  if (!video || !embedUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute start-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          aria-label="بستن ویدیو"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={video.title}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="border-t border-white/10 bg-navy-900 px-4 py-3">
          <p className="text-sm font-bold text-white">{video.title}</p>
        </div>
      </div>
    </div>
  );
}
