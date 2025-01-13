import React from 'react';

export function Navbar() {
  return (
    <nav className="w-full h-16 bg-gray-800 text-white flex items-center px-8 fixed top-0">
      <div className="text-lg font-bold">My Stream Site</div>
      <ul className="flex ml-auto space-x-6">
        <li>
          <a href="#home" className="hover:underline">
            Home
          </a>
        </li>
        <li>
          <a href="#streams" className="hover:underline">
            Streams
          </a>
        </li>
        <li>
          <a href="#about" className="hover:underline">
            About
          </a>
        </li>
      </ul>
    </nav>
  );
}
