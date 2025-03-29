'use client';
import { WHIPClient } from '@eyevinn/whip-web-client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Socket, Channel } from 'phoenix';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser } from '@/context/UserContext';

type Listing = {
  id: string;
  title: string;
  description: string;
  type: 'auction' | 'bin' | 'giveaway';
  quantity: number | null;
  reserved_quantity: number | null;
  starting_bid?: {
    amount: number;
    currency: string;
  };
  image: string;
  seller_country: string;
  shipping_domestic_price: {
    amount: number;
    currency: string;
  };
  shipping_eu_price: {
    amount: number;
    currency: string;
  };
};

type ApiListing = {
  id: string;
  title: string;
  description: string;
  quantity?: number;
  reserved_quantity?: number;
  starting_bid?: {
    amount: number;
    currency: string;
  };
  picture_url?: string;
  seller_country: string;
  shipping_domestic_price: {
    amount: number;
    currency: string;
  };
  shipping_eu_price: {
    amount: number;
    currency: string;
  };
};

// Allows sellers to control their show (go live, start auctions)
export default function ShowCockpit() {
  const [isLive, setIsLive] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(
    new Set()
  );
  const [token, setToken] = useState<string | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const { currentUser } = useUser();
  const sellerUsername = currentUser?.username;
  const { show_id } = useParams();
  const [auctionFailedToStartAlert, setAuctionFailedToStartAlert] =
    useState(false);

  // Initialize Phoenix socket and join channel
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken && sellerUsername) {
      setToken(authToken);

      // Initialize Phoenix socket
      const phoenixSocket = new Socket('wss://api.firmsnap.com/socket', {
        params: { token: authToken },
      });

      phoenixSocket.connect();

      // Join the auctioneer channel with seller username
      const auctioneerChannel = phoenixSocket.channel(
        `auctioneer:${sellerUsername}`
      );
      auctioneerChannel
        .join()
        .receive('ok', (resp) => {
          console.log('Joined auctioneer channel successfully', resp);
          setChannel(auctioneerChannel);
        })
        .receive('error', (resp) => {
          console.error('Unable to join auctioneer channel', resp);
        });
    }
  }, [sellerUsername]);

  useEffect(() => {
    const fetchListings = async () => {
      if (!sellerUsername) return;

      try {
        const response = await fetch(
          `https://api.firmsnap.com/listings/shop/${sellerUsername}`
        );

        if (!response.ok) throw new Error('Failed to fetch listings');

        const data = await response.json();
        console.log('Listings data:', data); // Debug log

        // Only process auction listings
        const auctionListings = (data.auctions || [])
          .map(formatListing)
          .filter((listing: Listing) => listing.type === 'auction');

        setListings(auctionListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };

    fetchListings();
  }, [sellerUsername]);

  const formatListing = (listing: ApiListing): Listing => ({
    id: listing.id,
    title: listing.title,
    description: listing.description,
    type: 'auction',
    quantity: listing.quantity ?? null,
    reserved_quantity: listing.reserved_quantity ?? null,
    starting_bid: listing.starting_bid,
    image: listing.picture_url || '/placeholder-image.jpg',
    seller_country: listing.seller_country,
    shipping_domestic_price: listing.shipping_domestic_price,
    shipping_eu_price: listing.shipping_eu_price,
  });

  const toggleDescription = (listingId: string) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listingId)) {
        newSet.delete(listingId);
      } else {
        newSet.add(listingId);
      }
      return newSet;
    });
  };

  const handleStartAuction = (listingId: string) => {
    if (!channel) {
      console.error('Channel not connected');
      return;
    }

    // Auction ID is the seller username, to ensure they can
    // only have a single auction at a time
    const auctionId = sellerUsername;

    // Send start_auction message to the channel
    channel
      .push('start_auction', {
        listing_id: listingId,
        token: token,
        auction_id: auctionId,
      })
      .receive('ok', () => {
        console.log(`Auction started for listing ${listingId}`);
        // You could update UI to show the auction is active
      })
      .receive('error', (err) => {
        if (
          err.reason ===
          'seller already has an active auction, you can only have 1 at a time'
        ) {
          setAuctionFailedToStartAlert(true);
          setTimeout(() => setAuctionFailedToStartAlert(false), 5000);
        }
        console.error('Failed to start auction:', err);
      });
  };

  async function handleGoLive() {
    try {
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

      // Create a custom peer connection factory to enforce sendonly
      // Without setting sendonly, the client does not work on Safari
      const peerConnectionFactory = (config: RTCConfiguration) => {
        const pc = new RTCPeerConnection(config);

        // Override addTrack to automatically set direction
        const originalAddTrack = pc.addTrack.bind(pc);
        pc.addTrack = (track: MediaStreamTrack, ...streams: MediaStream[]) => {
          const sender = originalAddTrack(track, ...streams);
          const transceiver = pc
            .getTransceivers()
            .find((t) => t.sender === sender);
          if (transceiver) {
            transceiver.direction = 'sendonly';
          }
          return sender;
        };
        return pc;
      };

      // Initialize WHIP client with custom factory
      const client = new WHIPClient({
        endpoint: publishUrl,
        opts: {
          debug: true,
          iceServers: [{ urls: 'stun:stun.l.google.com:19320' }],
        },
        peerConnectionFactory, // Use custom factory
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

        // Ingest will use the custom peer connection with sendonly tracks
        await client.ingest(mediaStream);
        setIsLive(true);
      }
    } catch (error) {
      console.error('Error starting stream:', error);
    }
  }

  const filteredListings = listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ height: 'calc(100vh - 64px)' }} className="overflow-hidden">
      {auctionFailedToStartAlert && (
        <Alert className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md bg-red-600 text-white border-red-700">
          <AlertTitle>Cannot Start Auction</AlertTitle>
          <AlertDescription>
            You already have an active auction. You can only run one auction at
            a time.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col lg:flex-row w-full h-full">
        {/* Auction Control Panel */}
        <div className="lg:w-1/3 bg-black p-4 overflow-auto">
          <h2 className="text-xl font-bold text-white mb-4">Auction Control</h2>
          <Input
            placeholder="Search auction items..."
            className="bg-gray-900 border-gray-800 text-white mb-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="space-y-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="space-y-4">
                <div className="flex gap-6">
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      {listing.title}
                    </h3>

                    <div className="text-slate-400">
                      {expandedDescriptions.has(listing.id)
                        ? listing.description
                        : `${listing.description.slice(0, 100)}${listing.description.length > 100 ? '...' : ''}`}
                      {listing.description.length > 100 && (
                        <Button
                          variant="link"
                          className="text-blue-500 p-0 ml-2 h-auto"
                          onClick={() => toggleDescription(listing.id)}
                        >
                          {expandedDescriptions.has(listing.id)
                            ? 'See less'
                            : 'See more'}
                        </Button>
                      )}
                    </div>

                    {listing.starting_bid && (
                      <div className="text-yellow-400">
                        Starting Bid:{' '}
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: listing.starting_bid.currency,
                        }).format(listing.starting_bid.amount / 100)}
                      </div>
                    )}

                    <Button
                      onClick={() => handleStartAuction(listing.id)}
                      className="mt-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    >
                      Start Auction
                    </Button>
                  </div>
                </div>
                <Separator className="bg-gray-800" />
              </div>
            ))}

            {filteredListings.length === 0 && (
              <div className="text-center text-white py-12">
                No auction items found
              </div>
            )}
          </div>
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
          {isLive && (
            <div className="mt-2 px-4 py-2 bg-green-600 text-white rounded">
              You are live!
            </div>
          )}
        </div>

        {/* Livechat and Auction Status */}
        <div className="hidden lg:flex lg:w-1/3 flex-col bg-black p-4">
          <h2 className="text-xl font-bold text-white mb-4">
            Live Chat & Auction Status
          </h2>
          <div className="flex-1 bg-gray-900 rounded p-4 mb-4 overflow-auto">
            <p className="text-white">Chat messages will appear here</p>
          </div>
          <div className="bg-gray-900 rounded p-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Current Auction
            </h3>
            <p className="text-slate-400">No active auction</p>
          </div>
        </div>
      </div>
    </div>
  );
}
