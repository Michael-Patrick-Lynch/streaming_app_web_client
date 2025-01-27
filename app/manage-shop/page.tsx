'use client';
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useUser } from '@/context/UserContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  picture_url?: string;
  description?: string;
}

export default function ManageShopPage() {
  const { currentUser } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const streamerName = currentUser?.username;

  const handleDelete = async (productId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://api.firmsnap.com/shop/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(products.filter((product) => product.id !== productId));
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError('Failed to delete product');
    }
  };

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

  console.log(products);

  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Manage Your Shop</h1>
        <p className="text-gray-600">Add, remove or edit your products</p>
        <Link href="/add-product" className="hover:underline">
          Add Product
        </Link>
      </div>
      <div className="flex flex-col gap-8 w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <Card>
          <CardContent>
            <div className="p-4 text-white bg-gray-800">
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
                    <p className="text-green-400 font-bold mb-2">
                      {product.price}
                    </p>
                    <p className="text-sm text-gray-300 mb-2">
                      {product.quantity > 0
                        ? `${product.quantity} in stock`
                        : 'Out of stock'}
                    </p>
                    {product.description && (
                      <p className="text-sm text-gray-300">
                        {product.description}
                      </p>
                    )}
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="mt-2 text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </Card>
                ))}
              </div>

              {products.length === 0 && (
                <p className="text-gray-400">No products available yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
