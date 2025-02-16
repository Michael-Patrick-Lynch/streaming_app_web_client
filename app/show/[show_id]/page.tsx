'use client';

import LiveChat from '@/components/LiveChat';
import LiveStream from '@/components/LiveStream';
import Shop from '@/components/Shop';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WatchShowPage() {
  const { show_id } = useParams();
  const [playUrl, setPlayUrl] = useState<string>();

  useEffect(() => {
    async function fetchShowData() {
      try {
        const response = await fetch(
          `https://api.firmsnap.com/shows/${show_id}`
        );
        const showData = await response.json();
        const play_url = showData.play_url;
        if (!play_url) {
          console.error('play_url not found in show data');
          return;
        }
        setPlayUrl(play_url);
      } catch (error) {
        console.error('Failed to fetch show data:', error);
      }
    }
    fetchShowData();
  }, [show_id]);

  return (
    <div
      style={{ height: 'calc(100vh - 64px)' }}
      className="overflow-hidden bg-black"
    >
      <div className="flex flex-col lg:flex-row w-full h-full">
        {/* Shop (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/3 items-center justify-center bg-black p-4">
          <Shop sellerName={'bullshit'} />
        </div>

        {/* LiveStream Component (chat will be in that component on mobile) */}
        <div className="w-full h-full lg:w-1/3">
          {playUrl ? (
            <LiveStream
              streamUrl={playUrl}
              streamerName="bullshit"
              streamerImage="/profile.jpeg"
            />
          ) : (
            <p className="text-white">Loading ...</p>
          )}
        </div>

        {/* Livechat (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/3 items-center justify-center bg-black p-4">
          <LiveChat streamerName="bullshit" />
        </div>
      </div>
    </div>
  );
}
