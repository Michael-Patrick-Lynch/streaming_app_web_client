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

  const handleUpdate = async (productId: number, updatedFields: Partial<Product>) => {
    try {
      const token = localStorage.getItem('authToken');
      const existingProduct = products.find(product => product.id === productId);
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
      await axios.put(`https://api.firmsnap.com/shop/product/${productId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(products.map((product) => 
        product.id === productId ? updatedProduct : product
      ));
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
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="mt-2 text-blue-500 hover:text-blue-700"
                    >
                      Edit
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

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const updatedFields: Partial<Product> = {
                  name: formData.get('name') as string,
                  price: parseFloat(formData.get('price') as string),
                  quantity: parseInt(formData.get('quantity') as string, 10),
                  picture_url: formData.get('picture_url') as string,
                  description: formData.get('description') as string,
                };
                handleUpdate(editingProduct.id, updatedFields);
              }}
            >
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct.name}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  defaultValue={editingProduct.price}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  defaultValue={editingProduct.quantity}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Picture URL
                </label>
                <input
                  type="text"
                  name="picture_url"
                  defaultValue={editingProduct.picture_url}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingProduct.description}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="mr-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-blue-500 hover:text-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
