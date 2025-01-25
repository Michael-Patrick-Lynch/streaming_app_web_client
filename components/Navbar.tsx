'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export function Navbar() {
  const { currentUser } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full h-16 bg-gray-800 text-white flex items-center px-4 sm:px-8 fixed top-0">
      {/* Logo - always shown */}
      <div className="text-lg font-bold">
        <Link href="/" className="hover:underline">
          Firmsnap
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex ml-auto space-x-6 items-center">
        <Link
          href="/about"
          className="text-gray-300 hover:text-white hover:underline"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="text-gray-300 hover:text-white hover:underline"
        >
          Contact
        </Link>
        
        {currentUser ? (
          <>
            {currentUser.is_seller && (
              <Link href="/manage-shop" className="hover:underline">
                Manage Shop
              </Link>
            )}
            <Link href="/settings" className="hover:underline">
              Settings
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline">
              Log In
            </Link>
            <Link href="/signup" className="hover:underline">
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu button */}
      <div className="ml-auto md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-700 rounded-full"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-gray-800 md:hidden">
          <div className="px-4 py-2 space-y-2">
            <Link
              href="/about"
              className="block py-2 text-gray-300 hover:text-white"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-gray-300 hover:text-white"
            >
              Contact
            </Link>
            
            {currentUser ? (
              <>
                {currentUser.is_seller && (
                  <Link href="/manage-shop" className="block py-2">
                    Manage Shop
                  </Link>
                )}
                <Link href="/settings" className="block py-2">
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2">
                  Log In
                </Link>
                <Link href="/signup" className="block py-2">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
