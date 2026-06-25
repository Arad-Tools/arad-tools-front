'use client';

import { useState } from 'react';
import StoryCard from './StoryCard';
import VideoModal from '@/components/video/VideoModal';
import type { Video } from '@/lib/types';

interface Props {
  videos: Video[];
}

export default function VideoStoriesClient({ videos }: Props) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  return (
    <>
      <div
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        role="list"
        aria-label="لیست ویدیوها"
      >
        {videos.map((video) => (
          <div key={video.id} role="listitem">
            <StoryCard video={video} onClick={() => setSelectedVideo(video)} />
          </div>
        ))}
      </div>

      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </>
  );
}
