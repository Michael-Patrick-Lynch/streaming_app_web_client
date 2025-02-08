'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatCategory } from '@/lib/utils';

interface Show {
  id: number;
  title: string;
  category: string;
  status: string;
  thumbnail_url?: string;
  scheduled_time: string;
}

export default function AllShows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const res = await fetch('https://api.firmsnap.com/shows/all');
        if (!res.ok) {
          console.error('Failed to fetch shows');
          setShows([]);
        } else {
          const data: Show[] = await res.json();
          setShows(data);
        }
      } catch (error) {
        console.error('Error fetching shows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">Loading...</div>
    );
  }

  if (shows.length === 0) {
    return (
      <div className="text-center py-8">
        Sorry, no scheduled or live shows at the moment. But you can still shop
        on sellers profiles!
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold pb-10 underline">Shows</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-16">
        {shows.map((show) => (
          <div
            key={show.id}
            className="bg-white shadow rounded overflow-hidden flex flex-col"
          >
            {show.thumbnail_url && (
              <div className="relative h-48 lg:h-80 w-full">
                <Image
                  src={show.thumbnail_url}
                  alt={show.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-bold mb-2">{show.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {formatCategory(show.category)}
              </p>
              <div className="mt-auto">
                {show.status.toLowerCase() === 'live' ? (
                  <span className="inline-block bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    Live
                  </span>
                ) : show.status.toLowerCase() === 'scheduled' ? (
                  <span className="inline-block bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    Scheduled Time →{' '}
                    {new Date(show.scheduled_time).toLocaleString()}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
