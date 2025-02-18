'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import BuyNowButton from './BuyNowButton';

export type Listing = {
  id: string;
  title: string;
  description: string;
  type: 'auction' | 'bin' | 'giveaway';
  quantity: number | null;
  price: {
    amount: number;
    currency: string;
  } | null;
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

interface APIListing {
  id: string;
  title: string;
  description: string;
  type: 'auction' | 'bin' | 'giveaway';
  quantity?: number;
  price?: { amount: number; currency: string };
  picture_url?: string;
  seller_country: string;
  shipping_domestic_price: { amount: number; currency: string };
  shipping_eu_price: { amount: number; currency: string };
}

const formatListing = (listing: APIListing): Listing => ({
  id: listing.id,
  title: listing.title,
  description: listing.description,
  type: listing.type,
  quantity: listing.type === 'giveaway' ? null : (listing.quantity ?? null),
  price:
    listing.type === 'giveaway' || !listing.price
      ? null
      : {
          amount: listing.price.amount / 100,
          currency: listing.price.currency,
        },
  image: listing.picture_url || '/placeholder-image.jpg',
  seller_country: listing.seller_country,
  shipping_domestic_price: listing.shipping_domestic_price,
  shipping_eu_price: listing.shipping_eu_price,
});

interface ShopProps {
  sellerName: string;
}

export default function Shop({ sellerName }: ShopProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'auction' | 'bin' | 'giveaway'>(
    'auction'
  );
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(
    new Set()
  );
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('authToken'));
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(
          `https://api.firmsnap.com/listings/shop/${sellerName}`
        );

        if (!response.ok) throw new Error('Failed to fetch listings');

        const data = await response.json();
        const combined = [
          ...(data.buy_it_now || []),
          ...(data.auctions || []),
          ...(data.giveaways || []),
        ].map(formatListing);

        setListings(combined);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };

    fetchListings();
  }, [sellerName]);

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

  const filteredListings = listings
    .filter((listing) => listing.type === activeTab)
    .filter(
      (listing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="bg-black text-white p-6 rounded-lg border border-gray-800 w-full h-full">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'auction' | 'bin' | 'giveaway')}
      >
        <div className="flex justify-between items-center mb-6 w-full grid grid-rows-2 gap-4">
          <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger
              value="auction"
              className="relative data-[state=active]:bg-black data-[state=active]:text-white rounded-none data-[state=active]:border-b px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none"
            >
              Auctions
            </TabsTrigger>
            <TabsTrigger
              value="bin"
              className="relative data-[state=active]:bg-black data-[state=active]:text-white rounded-none data-[state=active]:border-b px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none"
            >
              Buy Now
            </TabsTrigger>
            <TabsTrigger
              value="giveaway"
              className="relative data-[state=active]:bg-black data-[state=active]:text-white rounded-none data-[state=active]:border-b px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none"
            >
              Giveaways
            </TabsTrigger>
          </TabsList>
          <Input
            placeholder="Search listings..."
            className="bg-gray-900 border-gray-800 text-white w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

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
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{listing.title}</h3>
                    {listing.type === 'bin' && (
                      <BuyNowButton listing={listing} token={token} />
                    )}
                  </div>

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

                  <div className="flex gap-6 text-white">
                    {listing.quantity !== null && (
                      <div className="text-slate-400">
                        {listing.quantity} Available
                      </div>
                    )}
                    {listing.price && (
                      <div>
                        {' '}
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: listing.price.currency,
                        }).format(listing.price.amount)}
                      </div>
                    )}
                    {listing.type === 'auction' && (
                      <div className="text-yellow-400">Starting Bid</div>
                    )}
                  </div>
                </div>
              </div>
              <Separator className="bg-gray-800" />
            </div>
          ))}

          {filteredListings.length === 0 && (
            <div className="text-center text-white py-12">
              No listings found in this category
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
