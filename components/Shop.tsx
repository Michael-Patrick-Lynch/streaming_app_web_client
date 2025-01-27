'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  picture_url?: string;
  description?: string;
}

interface ShopProps {
  streamerName: string;
}

export default function Shop({ streamerName }: ShopProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `https://api.firmsnap.com/shop/${streamerName}`
        );
        setProducts(response.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products');
      }
    };

    fetchProducts();
  }, [streamerName]);

  if (error) {
    return (
      <div className="p-4 text-white bg-gray-800">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 text-white bg-gray-800">
      <h2 className="font-bold mb-4 text-2xl">{streamerName}&#39;s Shop</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="bg-gray-700 p-4">
            {product.picture_url && (
              <div className="relative w-full h-48 mb-3">
                <Image
                  src={`https://pub-b0d5f024ddc742a2993ac9ca697c41f7.r2.dev/${product.picture_url}`}
                  alt={product.name}
                  fill
                  className="object-cover rounded-md"
                  unoptimized
                />
              </div>
            )}
            <h3 className="font-bold text-lg mb-2">{product.name}</h3>
            <p className="text-green-400 font-bold mb-2">{product.price}</p>
            <p className="text-sm text-gray-300 mb-2">
              {product.quantity > 0
                ? `${product.quantity} in stock`
                : 'Out of stock'}
            </p>
            {product.description && (
              <p className="text-sm text-gray-300">{product.description}</p>
            )}
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-gray-400">No products available yet.</p>
      )}
    </div>
  );
}
