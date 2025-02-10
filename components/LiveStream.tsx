'use client';

import { useState } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { MessageCircle, Share2, Info, ShoppingCart } from 'lucide-react';

interface LiveStreamProps {
  streamUrl: string;
  streamerName: string;
  streamerImage: string;
}

export default function LiveStream({
  streamUrl,
  streamerName,
  streamerImage,
}: LiveStreamProps) {
  const [highestBid, setHighestBid] = useState(14);
  const [timeLeft] = useState('2:45');
  const [itemName] = useState('Vintage Designer Handbag');
  const [bidCount] = useState(12);
  const [viewerCount] = useState(245);

  const calculateNextBid = (current: number) => {
    if (current < 15) return current + 1;
    if (current <= 25) return current + 5;
    return current + 10;
  };

  const handleBid = () => {
    setHighestBid((prev) => calculateNextBid(prev));
  };

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
          <Button variant="outline" className="ml-2 text-white h-7">
            Follow
          </Button>
        </div>

        <div className="flex items-center bg-red-600 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-white rounded-full mr-2" />
          <span className="text-white text-sm">{viewerCount} watching</span>
        </div>
      </div>

      {/* Right Action Column */}
      <div className="absolute right-4 top-1/2 z-10 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4">
          <Button
            variant="ghost"
            className="flex flex-col h-auto p-2 text-white"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Description</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col h-auto p-2 text-white"
          >
            <Share2 className="w-6 h-6" />
            <span className="text-xs">Share</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col h-auto p-2 text-white"
          >
            <Info className="w-6 h-6" />
            <span className="text-xs">My Info</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col h-auto p-2 text-white"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-xs">Shop</span>
          </Button>
        </div>

        <div className="text-center text-white">
          <p className="font-bold">€{highestBid}</p>
          <p className="text-xs">{timeLeft} left</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent">
        {/* Chat Section */}
        <Card className="mb-4 bg-transparent text-white border-white/20">
          <div className="p-2 h-[120px] overflow-y-auto">
            {/* Chat Messages */}
            <div className="text-sm">
              <p>
                <span className="font-semibold">User1:</span> Love this item! 💖
              </p>
              <p>
                <span className="font-semibold">Bidder22:</span> Going once!
              </p>
            </div>
          </div>
        </Card>

        {/* Bid Controls */}
        <div className="flex gap-2 mb-4">
          <Button variant="outline" className="flex-1 text-white">
            Custom Bid
          </Button>
          <Button
            onClick={handleBid}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            Bid €{calculateNextBid(highestBid)}
          </Button>
        </div>

        {/* Item Info */}
        <div className="text-white">
          <h3 className="font-bold text-lg">{itemName}</h3>
          <div className="flex gap-4 text-sm">
            <span>🔥 {bidCount} bids</span>
            <span>🚚 DE: €5.99</span>
            <span>🌍 EU: €9.99</span>
          </div>
        </div>
      </div>
    </div>
  );
}
