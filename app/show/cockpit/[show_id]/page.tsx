'use client';
import { WHIPClient } from '@eyevinn/whip-web-client';
import { useEffect } from 'react';

// Allows sellers to control their show (go live, start auctions, end show etc)
export default function ShowCockpit() {
  useEffect(() => {
    async function initWHIPClient() {
      const client = new WHIPClient({
        endpoint:
          'https://customer-tlb6mk8af2mabbbv.cloudflarestream.com/586df30e1aa71a27efbcd3cbd596a0dak18d4238b51825269494dfc75ca0f827e/webRTC/publish',
        opts: {
          debug: true,
          iceServers: [{ urls: 'stun:stun.l.google.com:19320' }],
        },
      });
      await client.setIceServersFromEndpoint();
      const videoIngest = document.querySelector(
        'video#ingest'
      ) as HTMLVideoElement;
      if (videoIngest) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        videoIngest.srcObject = mediaStream;
        await client.ingest(mediaStream);
      }
    }
    initWHIPClient();
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 64px)' }} className="overflow-hidden">
      <div className="flex flex-col lg:flex-row w-full h-full">
        {/* Shop (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/3 items-center justify-center bg-black p-4">
          <p>Shop</p>
        </div>

        {/* LiveStream Component (chat will be in that component on mobile) */}
        <div className="w-full h-full lg:w-1/3">
          <video id="ingest" autoPlay playsInline className="w-full h-full" />
        </div>

        {/* Livechat (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/3 items-center justify-center bg-black p-4">
          <p>Livechat</p>
        </div>
      </div>
    </div>
  );
}
