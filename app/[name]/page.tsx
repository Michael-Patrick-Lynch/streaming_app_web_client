'use client';

import React, { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import LiveChat from '@/components/LiveChat';

interface PageParams {
  params: Promise<{
    name: string;
  }>;
}

// Dynamically import ReactPlayer for client-side rendering
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export default function VideoStreamPage({ params }: PageParams) {
  const [isClient, setIsClient] = useState(false);
  const resolvedParams = use(params);
  const { name } = resolvedParams;

  const streamUrl = `https://api.firmsnap.com/hls/${name}.m3u8`;

  // Ensure component is only rendered on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Prevent rendering until client-side
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-4xl aspect-video">
        <ReactPlayer
          url={streamUrl}
          playing
          muted
          controls
          width="100%"
          height="100%"
          config={{
            file: {
              attributes: {
                playsInline: true,
              },
            },
          }}
        />
      </div>

      <div className="w-80">
        <LiveChat streamerName={name} />
      </div>
    </div>
  );
}
