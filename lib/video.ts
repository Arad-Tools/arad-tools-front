import type { Video } from '@/lib/types';

const APARAT_HASH_PATTERN = /aparat\.com\/(?:v\/|video\/video\/embed\/videohash\/)([a-zA-Z0-9]+)/;

export function getVideoEmbedUrl(video: Video): string | null {
  if (video.embedUrl) {
    return video.embedUrl;
  }

  const match = video.videoUrl.match(APARAT_HASH_PATTERN);

  if (!match) {
    return null;
  }

  return `https://www.aparat.com/video/video/embed/videohash/${match[1]}/vt/frame`;
}
