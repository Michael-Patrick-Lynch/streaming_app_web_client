'use client';
import AllShows from '@/components/AllShows';
import RecommendedChannels from '@/components/RecommendedChannels';

export default function Home() {
  return (
    <>
      <div className="lg:pl-80 lg:pt-28">
        <main className="lg:pl-32">
          <AllShows />
          <RecommendedChannels />
        </main>
      </div>
    </>
  );
}
