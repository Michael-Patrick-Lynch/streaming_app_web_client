'use client';
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useUser } from '@/context/UserContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { SellerHubSidebar } from '@/components/SellerHubSidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SellerInventoryTable } from '@/components/SellerInventoryTable';
import { Button } from '@/components/ui/button';

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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  const handleUpdate = async (
    productId: number,
    updatedFields: Partial<Product>
  ) => {
    try {
      const token = localStorage.getItem('authToken');
      const existingProduct = products.find(
        (product) => product.id === productId
      );
      if (!existingProduct) {
        throw new Error('Product not found');
      }
      const updatedProduct = { ...existingProduct, ...updatedFields };
      const payload = {
        product_id: productId,
        name: updatedProduct.name,
        price_in_euro: updatedProduct.price,
        quantity: updatedProduct.quantity,
        picture_url: updatedProduct.picture_url,
        description: updatedProduct.description,
      };
      await axios.put(
        `https://api.firmsnap.com/shop/product/${productId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProducts(
        products.map((product) =>
          product.id === productId ? updatedProduct : product
        )
      );
      setEditingProduct(null);
    } catch (err) {
      console.error('Failed to update product:', err);
      setError('Failed to update product');
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

  console.log(products);

  return (
    <SidebarProvider>
      <SellerHubSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-2xl font-bold">Manage Your Shop</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="mb-8 text-center">
            <div className="flex justify-end pb-4 lg:pr-10">
              <Button className="rounded-full">Create Listing</Button>
            </div>
            <SellerInventoryTable />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
