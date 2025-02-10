// Start of Selection
'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Socket, Presence, Channel } from 'phoenix';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Share2, Info, ShoppingCart } from 'lucide-react';

interface LiveStreamProps {
  streamUrl: string;
  streamerName: string;
  streamerImage: string;
}

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export default function LiveStream({
  streamUrl,
  streamerName,
  streamerImage,
}: LiveStreamProps) {
  const [highestBid, setHighestBid] = useState(14);
  const [timeLeft] = useState('2:45');
  const [itemName] = useState('Vintage Designer Handbag');
  const [bidCount] = useState(12);
  const [viewerCount, setViewerCount] = useState(245);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [channel, setChannel] = useState<Channel | null>(null);

  const userId = useMemo(
    () => `anon_${Math.floor(Math.random() * 100000)}`,
    []
  );

  const calculateNextBid = (current: number) => {
    if (current < 15) return current + 1;
    if (current <= 25) return current + 5;
    return current + 10;
  };

  const handleBid = () => {
    setHighestBid((prev) => calculateNextBid(prev));
  };

  const handleSend = () => {
    if (inputValue.trim() && channel) {
      channel.push('new_msg', { body: inputValue });
      setInputValue('');
    }
  };

  useEffect(() => {
    const socket = new Socket('wss://api.firmsnap.com/socket');
    console.log('Connecting to live chat socket...');
    socket.onOpen(() => console.log('Socket opened.'));
    socket.onClose(() => console.log('Socket closed.'));
    socket.onError((err) => console.error('Socket error:', err));
    socket.connect();

    const newChannel = socket.channel(`streamer:${streamerName}`, {
      user_id: userId,
    });
    setChannel(newChannel);

    newChannel
      .join()
      .receive('ok', (resp: Record<string, unknown>) =>
        console.log('Joined channel successfully:', resp)
      )
      .receive('error', (resp: Record<string, unknown>) =>
        console.error('Unable to join channel:', resp)
      );

    newChannel.on('new_msg', (payload: { body: string }) => {
      setChatMessages((prev) => [...prev, payload.body]);
    });

    const presence = new Presence(newChannel);
    presence.onSync(() => {
      const presenceList = presence.list();
      setViewerCount(Object.keys(presenceList).length);
    });

    return () => {
      newChannel.leave();
      socket.disconnect();
    };
  }, [streamerName, userId]);

  return (
    <div className="relative w-full h-full aspect-[9/16] bg-black">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <ReactPlayer
          url={streamUrl}
          playing
          muted
          controls
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          config={{
            file: {
              attributes: {
                playsInline: true,
              },
            },
          }}
        />
      </div>

      {/* Top Info Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={streamerImage} />
            <AvatarFallback>{streamerName[0]}</AvatarFallback>
          </Avatar>
          <div className="text-white">
            <p className="font-semibold">{streamerName}</p>
            <p className="text-sm">⭐ 4.9 (128)</p>
          </div>
          <Button className="ml-2 bg-blue-600 text-white h-7 hover:bg-blue-700">
            Follow
          </Button>
        </div>

        <div className="flex items-center bg-red-600 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-white rounded-full mr-2" />
          <span className="text-white text-sm">{viewerCount} watching</span>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent flex flex-col">
        <div className="flex flex-1">
          {/* Left Column: Chat, Input & Item Info */}
          <div className="flex-1 pr-4">
            {/* Chat Section */}
            <Card className="mb-2 bg-transparent text-white border-white/20">
              <div className="p-2 h-[80px] overflow-y-auto">
                <div className="text-sm">
                  {chatMessages.length > 0 ? (
                    chatMessages.map((msg, idx) => (
                      <p key={idx}>
                        <span className="font-semibold">Anon:</span> {msg}
                      </p>
                    ))
                  ) : (
                    <p>No messages yet</p>
                  )}
                </div>
              </div>
            </Card>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Chat with the seller"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 p-2 rounded border border-white/30 bg-black text-white focus:outline-none"
              />
              <Button
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Send
              </Button>
            </div>
            {/* Item Info */}
            <div className="mt-2 text-white">
              <h3 className="font-bold text-lg">{itemName}</h3>
              <div className="flex gap-4 text-sm">
                <span>🔥 {bidCount} bids</span>
                <span>🚚 DE: €5.99</span>
                <span>🌍 EU: €9.99</span>
              </div>
            </div>
          </div>

          {/* Right Action Column */}
          <div className="w-24 pl-4 flex flex-col items-center">
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                className="flex flex-col h-fit p-2 text-white"
              >
                <Share2 className="w-6 h-6" />
                <span className="text-xs">Share</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col h-fit p-2 text-white"
              >
                <Info className="w-6 h-6" />
                <span className="text-xs">My Info</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col h-fit p-2 text-white"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="text-xs">Shop</span>
              </Button>
            </div>
            <div className="text-center">
              <p className="font-bold text-white">€{highestBid}</p>
              <p className="text-xs text-white">{timeLeft} left</p>
            </div>
          </div>
        </div>

        {/* Bid Controls */}
        <div className="mt-2">
          <div className="flex gap-2">
            <Button className="flex-1 bg-gray-700 text-white hover:bg-gray-600">
              Custom Bid
            </Button>
            <Button
              onClick={handleBid}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              Bid €{calculateNextBid(highestBid)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
