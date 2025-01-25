'use client'
import React from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export function Navbar() {
  const { currentUser } = useUser();

  return (
    <nav className="w-full h-16 bg-gray-800 text-white flex items-center px-8 fixed top-0">
      {/* Logo - always shown */}
      <div className="text-lg font-bold">
        <Link href="/" className="hover:underline">
          Firmsnap
        </Link>
      </div>

      {/* Burger menu - moved next to logo */}
      <div className="relative ml-4">
        <button
          className="p-2 hover:bg-gray-700 rounded-full group"
          aria-label="More options"
        >
          <Menu
            size={24}
            className="group-hover:text-gray-300"
            data-tooltip-id="navbar-tooltip"
            data-tooltip-content="More Options"
          />
          <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 hidden group-hover:block">
            <Link
              href="/about"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              About
            </Link>
            <Link
              href="/help"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              Help
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              Contact
            </Link>
          </div>
        </button>
      </div>

      {/* Navigation links */}
      <ul className="flex ml-auto space-x-6 items-center">
        {currentUser ? (
          // Logged in user
          <>
            {currentUser.is_seller && (
              <li>
                <Link href="/manage-shop" className="hover:underline">
                  Manage Shop
                </Link>
              </li>
            )}
            <li>
              <Link href="/settings" className="hover:underline">
                Settings
              </Link>
            </li>
          </>
        ) : (
          // Not logged in
          <>
            <li>
              <Link href="/login" className="hover:underline">
                Log In
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:underline">
                Sign Up
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
