'use client';

import { useEffect, useRef, use } from 'react';
import Hls from 'hls.js';

interface PageParams {
  params: Promise<{
    name: string;
  }>;
}

export default function VideoStreamPage({ params }: PageParams) {
  const resolvedParams = use(params);
  const { name } = resolvedParams;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamUrl = `https://api.firmsnap.com/hls/${name}.m3u8`;

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: false,
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((error: Error) => {
            console.log('Playback failed:', error);
          });
        });

        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch((error: Error) => {
            console.log('Playback failed:', error);
          });
        });
      }
    }
  }, [streamUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-4xl aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          playsInline
        />
      </div>
    </div>
  );
}
