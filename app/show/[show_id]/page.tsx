'use client';

import LiveStream from '@/components/LiveStream';

export default function WatchShowPage() {
  return (
    <div style={{ height: 'calc(100vh - 64px)' }} className="overflow-hidden">
      <div className="flex flex-col lg:flex-row w-full h-full">
        {/* Shop (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/3 items-center justify-center bg-gray-100 p-4">
          <p>Shop</p>
        </div>

        {/* LiveStream Component (chat will be in that component on mobile) */}
        <div className="w-full h-full lg:w-1/3">
          <LiveStream
            streamUrl="https://api.firmsnap.com/hls/bullshit.m3u8"
            streamerName="bullshit"
            streamerImage="/profile.jpg"
          />
        </div>

        {/* Livechat (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/3 items-center justify-center bg-gray-100 p-4">
          <p>Livechat</p>
        </div>
      </div>
    </div>
  );
}
