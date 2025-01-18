'use client';

import React, { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import LiveChat from '@/components/LiveChat';
import StreamDescriptionCard from '@/components/StreamDescriptionCard';
import Shop from '@/components/Shop';

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
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col lg:flex-row">
        {/* Video Player and Description */}
        <div className="flex-1">
          <div className="w-full aspect-video">
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
          <div className="w-full">
            <StreamDescriptionCard streamerName={name} />
          </div>
        </div>

        {/* Live Chat */}
        <div className="w-full lg:w-1/3">
          <LiveChat streamerName={name} />
        </div>
      </div>

      <div className="flex-grow bg-black text-white">
        <Shop streamerName={name} />
      </div>
    </div>
  );
}
