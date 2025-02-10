'use client';

import LiveStream from '@/components/LiveStream';

export default function WatchShowPage() {
  return (
    <div className="w-full h-full lg:w-1/3">
      <LiveStream
        streamUrl="https://api.firmsnap.com/hls/bullshit.m3u8"
        streamerName="FashionShopLive"
        streamerImage="/profile.jpg"
      />
    </div>
  );
}
