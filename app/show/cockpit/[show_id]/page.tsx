'use client';
import { WHIPClient } from '@eyevinn/whip-web-client';
import { useState } from 'react';
import { useParams } from 'next/navigation';

// Allows sellers to control their show (go live, start auctions, end show etc)
export default function ShowCockpit() {
  const [isLive, setIsLive] = useState(false);
  const { show_id } = useParams();

  async function handleGoLive() {
    try {
      // Retrieve the auth token (adjust this logic to match your project's auth flow)
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      // Call the API to get show secrets including the publish_url.
      const response = await fetch(
        `https://api.firmsnap.com/shows/with_secrets/${show_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch show secrets');
        return;
      }

      const showData = await response.json();
      const publishUrl = showData.publish_url;
      if (!publishUrl) {
        console.error('publish_url not found in show data');
        return;
      }

      // Initialize WHIP client with the obtained publish_url.
      const client = new WHIPClient({
        endpoint: publishUrl,
        opts: {
          debug: true,
          iceServers: [{ urls: 'stun:stun.l.google.com:19320' }],
        },
      });

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
        setIsLive(true);
      }
    } catch (error) {
      console.error('Error starting stream:', error);
    }
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)' }} className="overflow-hidden">
      <div className="flex flex-col lg:flex-row w-full h-full">
        {/* Shop (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/3 items-center justify-center bg-black p-4">
          <p>Shop</p>
        </div>

        {/* LiveStream Component */}
        <div className="w-full h-full lg:w-1/3 flex flex-col items-center justify-center bg-black p-4">
          <video id="ingest" autoPlay playsInline className="w-full h-full" />
          {!isLive && (
            <button
              onClick={handleGoLive}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Go Live
            </button>
          )}
        </div>

        {/* Livechat (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/3 items-center justify-center bg-black p-4">
          <p>Livechat</p>
        </div>
      </div>
    </div>
  );
}
