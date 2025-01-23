'use client';
import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useUser } from '@/context/UserContext';

export default function AddNewProductForm() {
  const { currentUser } = useUser();
  const [name, setName] = useState('');
  const [priceInEuro, setPriceInEuro] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const params = {
        shop_id: currentUser.id,
        name,
        price_in_euro: parseFloat(priceInEuro) * 100,
        quantity: parseInt(quantity),
        picture_url: pictureUrl,
        description,
      };
      console.log('Adding product with params:', params);
      //   const res = await axios.post("https://api.firmsnap.com/shop", params, {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //     })
      // console.log("result from /shop:", res)

      const response = await axios.post(
        'https://api.firmsnap.com/shop/product',
        params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.error('Adding product succeeded, response:', response);

      window.location.href = '/';
    } catch (err) {
      if (err instanceof Error) {
        console.error('Adding product failed:', err.message);
      }
      setError('Failed to add product. Please check your input and try again.');
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center">
      <div className="flex flex-col gap-8 w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Add a new product to your shop</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                {error && <p className="text-red-500">{error}</p>}

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="price">Price (EUR)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceInEuro}
                    onChange={(e) => setPriceInEuro(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="picture-url">Picture URL (optional)</Label>
                  <Input
                    id="picture-url"
                    type="url"
                    value={pictureUrl}
                    onChange={(e) => setPictureUrl(e.target.value)}
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <CardFooter className="flex justify-end">
                <Button type="submit" className="font-bold">
                  Add Product →
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
