'use client';
import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dropzone } from '@/components/ui/dropzone';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface ListingData {
  title: string;
  description: string;
  type: 'auction' | 'bin';
  quantity: number;
  category: string;
  shipping_domestic_price: number;
  shipping_eu_price: number;
  auction_starting_bid?: number;
  auction_duration?: number;
  auction_sudden_death?: boolean;
  bin_price?: number;
  bin_accept_offers?: boolean;
  show_id?: string;
  reserve_for_live?: boolean;
}

export default function CreateListingForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState('trading_card_games');
  const [shippingDomestic, setShippingDomestic] = useState('');
  const [shippingEU, setShippingEU] = useState('');

  // State for auction vs. BIN:
  const [isAuction, setIsAuction] = useState(false);
  const [auctionStartingBid, setAuctionStartingBid] = useState('');
  const [auctionDuration, setAuctionDuration] = useState('');
  const [auctionSuddenDeath, setAuctionSuddenDeath] = useState(false);
  const [binPrice, setBinPrice] = useState('');
  const [binAcceptOffers, setBinAcceptOffers] = useState(false);

  // State for reserve-for-live and show selection:
  const [showReserve, setShowReserve] = useState(false);
  const [selectedShow, setSelectedShow] = useState('');
  const shows = [
    { id: '1', name: 'Paris Live Show 2024' },
    { id: '2', name: 'Berlin Auction Event' },
  ];

  // State to hold the file (using Dropzone that returns File objects)
  const [file, setFile] = useState<File | null>(null);

  // Handler for Dropzone file changes:
  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Debug: check if file is set
    if (!file) {
      console.error('No file uploaded!');
      return;
    }

    const listingData: ListingData = {
      title,
      description,
      type: isAuction ? 'auction' : 'bin',
      quantity: parseInt(quantity),
      category,
      shipping_domestic_price: parseInt(shippingDomestic) * 100,
      shipping_eu_price: parseInt(shippingEU) * 100,
    };

    if (isAuction) {
      listingData.auction_starting_bid = parseInt(auctionStartingBid) * 100;
      listingData.auction_duration = parseInt(auctionDuration);
      listingData.auction_sudden_death = auctionSuddenDeath;
    } else {
      listingData.bin_price = parseInt(binPrice) * 100;
      listingData.bin_accept_offers = binAcceptOffers;
    }

    if (showReserve && selectedShow) {
      listingData.show_id = selectedShow;
      listingData.reserve_for_live = true;
    }

    const token = localStorage.getItem('authToken');

    const formData = new FormData();
    formData.append('listing', JSON.stringify(listingData));
    if (file) {
      formData.append('file', file);
    }
    formData.append('token', token || '');

    try {
      await axios.post('/api/listing', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push('/manage-shop');
    } catch (error) {
      console.error('Error creating listing:', error);
      // TODO: Display an error message to the user.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="container mx-auto p-4 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <FormSection title="Media">
              <Dropzone
                className="h-48"
                fileExtensions={['png', 'jpg', 'jpeg', 'gif', 'webp']}
                onChange={handleFileChange}
              />
            </FormSection>

            <FormSection title="Listing Details">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={category}
                    onValueChange={(val) => setCategory(val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trading_card_games">
                        Trading Card Games
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Listing title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Listing description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    placeholder="Available quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>
            </FormSection>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <FormSection title="Pricing">
              <div className="space-y-4">
                <Tabs
                  value={isAuction ? 'auction' : 'buyNow'}
                  onValueChange={(v) => setIsAuction(v === 'auction')}
                >
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="buyNow">Buy It Now</TabsTrigger>
                    <TabsTrigger value="auction">Auction</TabsTrigger>
                  </TabsList>
                </Tabs>

                {isAuction ? (
                  <>
                    <div className="space-y-2">
                      <Label>Starting Price (EUR)</Label>
                      <Input
                        type="number"
                        placeholder="Enter starting price"
                        value={auctionStartingBid}
                        onChange={(e) => setAuctionStartingBid(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Auction Duration (sec)</Label>
                      <Input
                        type="number"
                        placeholder="Enter auction duration"
                        value={auctionDuration}
                        onChange={(e) => setAuctionDuration(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="suddenDeath"
                        checked={auctionSuddenDeath}
                        onCheckedChange={setAuctionSuddenDeath}
                      />
                      <Label htmlFor="suddenDeath">Sudden Death</Label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Price (EUR)</Label>
                      <Input
                        type="number"
                        placeholder="Enter price"
                        value={binPrice}
                        onChange={(e) => setBinPrice(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="acceptOffers"
                        checked={binAcceptOffers}
                        onCheckedChange={setBinAcceptOffers}
                      />
                      <Label htmlFor="acceptOffers">Accept Offers</Label>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reserveForLive"
                      checked={showReserve}
                      onCheckedChange={setShowReserve}
                    />
                    <Label htmlFor="reserveForLive">Reserve for Live</Label>
                  </div>
                  {showReserve && (
                    <Select
                      value={selectedShow}
                      onValueChange={setSelectedShow}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select show" />
                      </SelectTrigger>
                      <SelectContent>
                        {shows.map((show) => (
                          <SelectItem key={show.id} value={show.id}>
                            {show.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </FormSection>

            <FormSection title="Shipping">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Domestic Shipping (EUR)</Label>
                  <Input
                    type="number"
                    placeholder="Enter domestic shipping price"
                    value={shippingDomestic}
                    onChange={(e) => setShippingDomestic(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>EU Shipping (EUR)</Label>
                  <Input
                    type="number"
                    placeholder="Enter EU shipping price"
                    value={shippingEU}
                    onChange={(e) => setShippingEU(e.target.value)}
                  />
                </div>
              </div>
            </FormSection>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            className="bg-green-300 text-black font-bold rounded-full lg:text-lg lg:px-6 lg:py-6"
            type="submit"
          >
            Submit
          </Button>
        </div>
      </div>
    </form>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <h2 className="text-xl font-semibold">{title}</h2>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
