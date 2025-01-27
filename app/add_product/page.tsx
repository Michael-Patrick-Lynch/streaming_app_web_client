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
import { useRouter } from 'next/navigation';

export default function AddNewProductForm() {
  const { currentUser } = useUser();
  const [name, setName] = useState('');
  const [priceInEuro, setPriceInEuro] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // for client side routing (prevents the app from remounting)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append(
        'productData',
        JSON.stringify({
          name,
          price_in_euro: parseFloat(priceInEuro) * 100,
          quantity: parseInt(quantity),
          description,
        })
      );
      if (pictureFile) {
        formData.append('file', pictureFile);
      }
      formData.append('token', token || '');

      console.log('Adding product with formData:', formData);

      await axios.post('/api/product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      router.push('/');
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
                  <Label htmlFor="picture-file">Picture File (optional)</Label>
                  <Input
                    id="picture-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setPictureFile(e.target.files?.[0] || null)
                    }
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
