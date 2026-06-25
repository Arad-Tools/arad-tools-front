import Image from 'next/image';
import { Play } from 'lucide-react';
import type { Video } from '@/lib/types';
import { truncate } from '@/lib/utils';

interface Props {
  video: Video;
  onClick?: () => void;
}

export default function StoryCard({ video, onClick }: Props) {
  return (
    <article
      className="flex-shrink-0 w-44 sm:w-52 group cursor-pointer"
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `پخش ویدیو: ${video.title}` : undefined}
    >
      <div className="relative rounded-xl overflow-hidden aspect-[9/6] bg-gray-100 shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
        <Image
          src={video.thumbnail || 'https://placehold.co/600x400?text=Loading'}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 176px, 208px"
          className="object-cover group-hover:scale-105 transition-transform duration-400"
        />

        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-navy-900 fill-navy-900 ms-0.5" />
          </div>
        </div>

        <div className="absolute bottom-2 start-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-md" dir="ltr">
          {video.duration}
        </div>
      </div>

      <p className="mt-2 text-sm font-semibold text-gray-200 group-hover:text-white leading-relaxed transition-colors line-clamp-2">
        {truncate(video.title, 60)}
      </p>
    </article>
  );
}
