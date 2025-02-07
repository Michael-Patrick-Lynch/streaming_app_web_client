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

export default function CreateListingForm() {
  const [isAuction, setIsAuction] = useState(false);
  const [showReserve, setShowReserve] = useState(false);
  const [shows] = useState([
    { id: '1', name: 'Paris Live Show 2024' },
    { id: '2', name: 'Berlin Auction Event' },
  ]);
  // const [file, setFiles] = useState<File | null>(null);

  // Dummy file change handler as a placeholder
  const handleFileChange: React.Dispatch<
    React.SetStateAction<string[]>
  > = () => {
    // Placeholder: do nothing for now.
    console.log('Dropzone file change triggered.');
  };

  return (
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

          <FormSection title="Product Details">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="art">Art</SelectItem>
                    <SelectItem value="collectibles">Collectibles</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Product title" />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Product description" />
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" placeholder="Available quantity" />
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
                    <Input type="number" placeholder="Enter starting price" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="suddenDeath" />
                    <Label htmlFor="suddenDeath">Sudden Death</Label>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Price (EUR)</Label>
                    <Input type="number" placeholder="Enter price" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="acceptOffers" />
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
                  <Select>
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
                />
              </div>
              <div className="space-y-2">
                <Label>EU Shipping (EUR)</Label>
                <Input type="number" placeholder="Enter EU shipping price" />
              </div>
            </div>
          </FormSection>
        </div>
      </div>
    </div>
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
