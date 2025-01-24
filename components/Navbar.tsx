import React from 'react';
import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="w-full h-16 bg-gray-800 text-white flex items-center px-8 fixed top-0">
      <div className="text-lg font-bold">
        <Link href="/" className="hover:underline">
          Firmsnap
        </Link>
      </div>
      <ul className="flex ml-auto space-x-6">
        <li>
          <Link href="/add_product" className="hover:underline">
            Add Product
          </Link>
        </li>
      </ul>
    </nav>
  );
}
