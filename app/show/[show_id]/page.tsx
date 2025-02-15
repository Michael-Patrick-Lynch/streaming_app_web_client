'use client';

import LiveChat from '@/components/LiveChat';
import LiveStream from '@/components/LiveStream';
import Shop from '@/components/Shop';

export default function WatchShowPage() {
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
          <LiveStream
            streamUrl="https://customer-tlb6mk8af2mabbbv.cloudflarestream.com/18d4238b51825269494dfc75ca0f827e/webRTC/play"
            streamerName="bullshit"
            streamerImage="/profile.jpg"
          />
        </div>

        {/* Livechat (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/3 items-center justify-center bg-black p-4">
          <LiveChat streamerName="bullshit" />
        </div>
      </div>
    </div>
  );
}
