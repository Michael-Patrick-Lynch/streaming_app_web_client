'use client';

import { useState, useEffect, useRef } from 'react';
import { WebRTCPlayer } from '@eyevinn/webrtc-player';
import { Socket, Presence, Channel } from 'phoenix';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Share2, Info, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from './ui/dialog';
import Shop from './Shop';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

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
  // Auction state
  const [auctionId, setAuctionId] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [itemTitle, setItemTitle] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [highestBid, setHighestBid] = useState<number | null>(null);
  const [startingBid, setStartingBid] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0); // seconds
  const [bidCount, setBidCount] = useState<number>(0);
  const [domesticShippingPrice, setDomesticShippingPrice] = useState<number>(0);
  const [euShippingPrice, setEuShippingPrice] = useState<number>(0);
  const [auctionActive, setAuctionActive] = useState<boolean>(false);
  const [auctionEndTime, setAuctionEndTime] = useState<number | null>(null);
  const [customBidAmount, setCustomBidAmount] = useState<string>('');
  const [showCustomBidInput, setShowCustomBidInput] = useState<boolean>(false);

  // Livechat state
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatChannel, setChatChannel] = useState<Channel | null>(null);
  const [auctionChannel, setAuctionChannel] = useState<Channel | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Livestream state
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<WebRTCPlayer | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { currentUser } = useUser();
  const router = useRouter();

  // Load auth token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    setToken(storedToken);
  }, []);

  // Update time left for auction
  useEffect(() => {
    if (!auctionActive || auctionEndTime === null) return;

    const updateTimeLeft = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((auctionEndTime - now) / 1000));

      setTimeLeft(remaining);

      if (remaining <= 0) {
        setAuctionActive(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    };

    updateTimeLeft();
    timerRef.current = setInterval(updateTimeLeft, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [auctionActive, auctionEndTime]);

  const calculateNextBid = (current: number | null) => {
    // starting bid defaults to 0 if null
    const starting = startingBid ?? 0;

    // current bid defaults to starting bid if null
    current = current ?? starting;

    if (current < 1000) return current + 100;
    if (current < 2000) return current + 300;
    if (current < 3000) return current + 500;
    if (current < 4000) return current + 800;
    if (current < 10000) return current + 1000;
    return current + 2000;
  };

  const handleBid = () => {
    if (!auctionChannel || !auctionActive || !auctionId) return;

    if (!currentUser) {
      router.push('/login');
      return;
    }

    const bidAmount = calculateNextBid(highestBid);
    if (bidAmount) {
      auctionChannel.push('bid', {
        amount: {
          amount: bidAmount,
          currency: 'EUR',
        },
        auction_id: auctionId,
        bidder_user_id: currentUser.id,
        bidder_username: currentUser.username,
      });
    }
  };

  const handleCustomBid = () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (!auctionChannel || !auctionActive || !auctionId || !customBidAmount)
      return;

    const bidAmount = parseFloat(customBidAmount);
    if (!isNaN(bidAmount) && bidAmount > (highestBid || startingBid || 0)) {
      auctionChannel.push('bid', {
        amount: {
          amount: bidAmount,
          currency: 'EUR',
        },
        auction_id: auctionId,
        bidder_user_id: currentUser.id,
        bidder_username: currentUser.username,
      });
      setShowCustomBidInput(false);
      setCustomBidAmount('');
    }
  };

  const formatTimeLeft = (time_in_seconds_left: number) => {
    if (time_in_seconds_left < 60) {
      return `0:${time_in_seconds_left.toString().padStart(2, '0')}`;
    }
    const mins = Math.floor(time_in_seconds_left / 60);
    const secs = time_in_seconds_left % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (inputValue.trim() && chatChannel) {
      chatChannel.push('new_msg', { body: inputValue });
      setInputValue('');
    }
  };

  // Setup Phoenix socket and channels
  useEffect(() => {
    const socket = new Socket('wss://api.firmsnap.com/socket');
    console.log('Connecting to socket...');
    socket.onOpen(() => console.log('Socket opened.'));
    socket.onClose(() => console.log('Socket closed.'));
    socket.connect();

    // Chat channel
    const newChatChannel = socket.channel(`streamer:${streamerName}`, {
      user_id: currentUser ? currentUser.id : 'anon',
    });
    setChatChannel(newChatChannel);

    newChatChannel
      .join()
      .receive('ok', (resp: Record<string, unknown>) =>
        console.log('Joined chat channel successfully:', resp)
      )
      .receive('error', (resp: Record<string, unknown>) =>
        console.error('Unable to join chat channel:', resp)
      );

    newChatChannel.on('new_msg', (payload: { body: string }) => {
      setChatMessages((prev) => [...prev, payload.body]);
    });

    const presence = new Presence(newChatChannel);
    presence.onSync(() => {
      const presenceList = presence.list();
      setViewerCount(Object.keys(presenceList).length);
    });

    // Auction channel
    const newAuctionChannel = socket.channel(`auctioneer:${streamerName}`, {
      user_id: currentUser ? currentUser.id : 'anon',
    });
    setAuctionChannel(newAuctionChannel);

    newAuctionChannel
      .join()
      .receive('ok', (resp: Record<string, unknown>) =>
        console.log('Joined auction channel successfully:', resp)
      )
      .receive('error', (resp: Record<string, unknown>) =>
        console.error('Unable to join auction channel:', resp)
      );

    // Handle auction events
    newAuctionChannel.on(
      'auction_started',
      (payload: {
        auction_id: string;
        listing_id: string;
        title: string;
        description: string;
        starting_bid: { amount: number; currency: string };
        duration_ms: number;
        shipping_domestic_price: { amount: number; currency: string };
        shipping_eu_price: { amount: number; currency: string };
      }) => {
        console.log('Auction started:', payload);
        setAuctionId(payload.auction_id);
        setItemId(payload.listing_id);
        setItemTitle(payload.title);
        setItemDescription(payload.description);
        setStartingBid(payload.starting_bid.amount);
        setHighestBid(null);
        setBidCount(0);
        setDomesticShippingPrice(payload.shipping_domestic_price.amount);
        setEuShippingPrice(payload.shipping_eu_price.amount);
        setAuctionActive(true);
        setAuctionEndTime(Date.now() + payload.duration_ms);
      }
    );

    newAuctionChannel.on(
      'new_bid',
      (payload: {
        auction_id: string;
        amount: { amount: number; currency: string };
        bidder: string;
      }) => {
        console.log('New bid received:', payload);
        if (payload.auction_id === auctionId) {
          setHighestBid(payload.amount.amount);
          setBidCount((prev) => prev + 1);
        }
      }
    );

    newAuctionChannel.on(
      'auction_closed',
      (payload: {
        auction_id: string;
        winner: string | null;
        final_amount: { amount: number; currency: string } | null;
      }) => {
        console.log('Auction closed:', payload);
        if (payload.auction_id === auctionId) {
          setAuctionActive(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }
    );

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      newChatChannel.leave();
      newAuctionChannel.leave();
      socket.disconnect();
    };
  }, [streamerName, currentUser, token, auctionId]);

  // Initialize WebRTC player
  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = new WebRTCPlayer({
      video: videoRef.current,
      type: 'whep',
      statsTypeFilter: '^candidate-*|^inbound-rtp',
    });

    const initializePlayer = async () => {
      try {
        await playerRef.current?.load(new URL(streamUrl));
        playerRef.current?.unmute();
      } catch (error) {
        console.error('Error initializing WebRTC player:', error);
      }
    };

    initializePlayer();

    playerRef.current?.on('no-media', () => {
      console.log('media timeout occurred');
    });

    playerRef.current?.on('media-recovered', () => {
      console.log('media recovered');
    });

    playerRef.current?.on('stats:inbound-rtp', (report) => {
      if (report.kind === 'video') {
        console.log(report);
      }
    });

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [streamUrl]);

  return (
    <div className="relative w-full aspect-[9/16] bg-black">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
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
          </div>
        </div>

        <div className="flex items-center bg-red-600 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-white rounded-full mr-2" />
          <span className="text-white text-sm">{viewerCount} watching</span>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-10 lg:bottom-20 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent flex flex-col">
        <div className="flex flex-1">
          {/* Left Column: Chat, Input & Item Info */}
          <div className="flex-1 pr-4">
            {/* Chat Section (Only shows here on small screens)*/}
            <div>
              <Card className="mb-2 bg-transparent text-white border-white/20 lg:hidden">
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
              <div className="mt-2 lg:hidden">
                <Input
                  type="text"
                  placeholder="Chat with the seller"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSend();
                    }
                  }}
                  className="w-full p-2 rounded border border-white/30 bg-black text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Item Info */}
            {itemId && (
              <div className="mt-2 text-white">
                <h3 className="font-bold text-lg">{itemTitle}</h3>
                <h3 className="font-bold text-lg">{itemDescription}</h3>
                <div className="flex gap-4 text-sm">
                  <span>🔥 {bidCount} bids</span>
                  <span>
                    🚚 Domestic Shipping: €
                    {formatCurrency(domesticShippingPrice)}
                  </span>
                  <span>
                    🌍 EU Shipping: €{formatCurrency(euShippingPrice)}
                  </span>
                </div>
              </div>
            )}
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-col h-fit p-2 text-white"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    <span className="text-xs">Shop</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="fixed inset-0 w-screen h-screen transform-none max-w-none rounded-none bg-black border-none">
                  <div className="absolute top-4 right-4">
                    <DialogClose className="text-white text-4xl">×</DialogClose>
                  </div>
                  <div className="w-full h-full pt-12 overflow-auto">
                    {' '}
                    <Shop sellerName={streamerName} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {itemId && (
              <div className="text-center">
                {highestBid ? (
                  <p className="font-bold text-white">
                    €{formatCurrency(highestBid)}
                  </p>
                ) : (
                  <p className="font-bold text-white">
                    €{formatCurrency(startingBid)}
                  </p>
                )}
                <p className="text-xs text-white">
                  {auctionActive
                    ? `${formatTimeLeft(timeLeft)} left`
                    : 'Auction ended'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bid Controls */}
        <div className="mt-2 pb-14">
          {showCustomBidInput ? (
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter bid amount"
                value={customBidAmount}
                onChange={(e) => setCustomBidAmount(e.target.value)}
                className="flex-1 bg-gray-800 text-white border-gray-700"
              />
              <Button
                onClick={handleCustomBid}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                Bid
              </Button>
              <Button
                onClick={() => setShowCustomBidInput(false)}
                className="bg-gray-700 text-white hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          ) : itemId && auctionActive ? (
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCustomBidInput(true)}
                className="flex-1 bg-gray-700 text-white hover:bg-gray-600"
              >
                Custom Bid
              </Button>
              <Button
                onClick={handleBid}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                Bid €{formatCurrency(calculateNextBid(highestBid))}
              </Button>
            </div>
          ) : itemId && !auctionActive ? (
            <Button className="w-full bg-gray-500 text-white" disabled>
              Auction ended
            </Button>
          ) : (
            <Button className="w-full bg-gray-500 text-white" disabled>
              Waiting for next auction to start
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
