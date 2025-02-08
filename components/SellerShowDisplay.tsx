'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Show {
  id: number;
  title: string;
  category: string;
  status: string;
  thumbnail_url?: string;
  scheduled_time: string;
}

export default function ShowsDashboard() {
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

  const groupedShows = shows.reduce<Record<string, Show[]>>((acc, show) => {
    let key = show.status.toLowerCase();
    if (key === 'scheduled') key = 'upcoming';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(show);
    return acc;
  }, {});

  const handleOpenShow = (showId: number) => {
    router.push(`/show/${showId}`);
  };

  const handleCopyLink = async (showId: number) => {
    try {
      await navigator.clipboard.writeText(
        `https://firmsnap.com/show/${showId}`
      );
      alert('Show link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy show link:', error);
    }
  };

  const handleEditShow = (showId: number) => {
    router.push(`/edit-show/${showId}`);
  };

  const handleCancelShow = async (showId: number) => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`https://api.firmsnap.com/shows/${showId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ show: { status: 'cancelled' } }),
      });

      if (!res.ok) {
        console.error('Failed to cancel show');
        return;
      }

      // Update the show in state with the returned updated show object
      const updatedShow = await res.json();
      setShows((prevShows) =>
        prevShows.map((show) => (show.id === showId ? updatedShow : show))
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

  const statusOrder = ['live', 'upcoming', 'ended', 'cancelled'];

  return (
    <div className="container mx-auto px-4 py-8">
      {statusOrder.map((status) => {
        const showsByStatus = groupedShows[status] || [];
        return (
          <section key={status} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 capitalize">
              {status} shows
            </h2>
            {showsByStatus.length === 0 ? (
              <p>You currently have no {status} shows.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {showsByStatus.map((show) => {
                  const statusLower = show.status.toLowerCase();
                  const isEndedOrCancelled =
                    statusLower === 'ended' || statusLower === 'cancelled';
                  const isLive = statusLower === 'live';
                  return (
                    <Card key={show.id} className="shadow">
                      <CardHeader>
                        <CardTitle>{show.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {show.thumbnail_url && (
                          <div className="relative w-full h-48 mb-3">
                            <Image
                              src={show.thumbnail_url}
                              alt={show.title}
                              fill
                              className="w-full h-40 object-cover rounded mb-2"
                              unoptimized
                            />
                          </div>
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
                        <Button
                          variant="outline"
                          onClick={() => handleOpenShow(show.id)}
                          disabled={isEndedOrCancelled}
                        >
                          Open Show
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleCopyLink(show.id)}
                          disabled={isEndedOrCancelled}
                        >
                          Copy Show Link
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleEditShow(show.id)}
                          disabled={isEndedOrCancelled || isLive}
                        >
                          Edit Show
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelShow(show.id)}
                          disabled={isEndedOrCancelled || isLive}
                        >
                          Cancel Show
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
