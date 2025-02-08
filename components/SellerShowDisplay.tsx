'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Show {
  id: number;
  title: string;
  category: string;
  status: string;
  thumbnail_url?: string;
  scheduled_time: string;
}

export default function SellerShowDisplay() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchShows = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('https://api.firmsnap.com/shows', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error('Failed to fetch shows');
          setLoading(false);
          return;
        }

        const data: Show[] = await res.json();
        setShows(data);
      } catch (error) {
        console.error('Error fetching shows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, []);

  // Group shows by status (live, scheduled, ended, cancelled)
  const groupedShows = shows.reduce<Record<string, Show[]>>((acc, show) => {
    // Ensure the status is in lowercase for consistency
    const key = show.status.toLowerCase();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(show);
    return acc;
  }, {});

  // Copy show link to clipboard
  const handleCopyLink = async (showId: number) => {
    try {
      await navigator.clipboard.writeText(
        `https://firmsnap.com/show-${showId}`
      );
      alert('Show link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy show link:', error);
    }
  };

  // Navigate to the edit show page using the App Router
  const handleEditShow = (showId: number) => {
    router.push(`/edit-show/${showId}`);
  };

  // Call the cancel endpoint and update the show status in the UI
  const handleCancelShow = async (showId: number) => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(
        `https://api.firmsnap.com/shows/cancel/${showId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        console.error('Failed to cancel show');
        return;
      }

      // Update the UI: set the cancelled show's status to "cancelled"
      setShows((prevShows) =>
        prevShows.map((show) =>
          show.id === showId ? { ...show, status: 'cancelled' } : show
        )
      );
    } catch (error) {
      console.error('Error cancelling show:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading shows...</p>
      </div>
    );
  }

  const statusOrder = ['live', 'scheduled', 'ended', 'cancelled'];

  return (
    <div className="container mx-auto px-4 py-8">
      {statusOrder.map((status) => {
        const showsByStatus = groupedShows[status] || [];
        if (showsByStatus.length === 0) return null;
        return (
          <section key={status} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 capitalize">
              {status} shows
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showsByStatus.map((show) => (
                <Card key={show.id} className="shadow">
                  <CardHeader>
                    <CardTitle>{show.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {show.thumbnail_url && (
                      <img
                        src={show.thumbnail_url}
                        alt={show.title}
                        className="w-full h-40 object-cover rounded mb-2"
                      />
                    )}
                    <p>
                      <strong>Scheduled Time:</strong>{' '}
                      {new Date(show.scheduled_time).toLocaleString()}
                    </p>
                    <p>
                      <strong>Category:</strong> {show.category}
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    <Link href={`/show-${show.id}`}>
                      <Button variant="outline">Open Show</Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => handleCopyLink(show.id)}
                    >
                      Copy Show Link
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleEditShow(show.id)}
                    >
                      Edit Show
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelShow(show.id)}
                    >
                      Cancel Show
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
