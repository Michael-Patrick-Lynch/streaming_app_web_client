'use client';
import RecommendedChannels from '@/components/RecommendedChannels';
import StreamList from '@/components/StreamList';
import { useUser } from '@/context/UserContext';

export default function Home() {
  const { currentUser } = useUser();
  return (
    <>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div>List of links to active streams:</div>
          <StreamList />
          {currentUser && <p>Welcome {currentUser.username}</p>}
          {currentUser && <p>Is seller: {currentUser.is_seller ? 'Yes' : 'No'}</p>}
          <RecommendedChannels />
        </main>
      </div>
    </>
  );
}
