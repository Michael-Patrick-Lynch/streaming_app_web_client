import { useRouter } from 'next/navigation';
import { Listing } from './Shop';
import { FormEvent } from 'react';

type BuyNowButtonProps = {
  listing: Listing;
  token: string | null;
};

export default function BuyNowButton({ listing, token }: BuyNowButtonProps) {
  const router = useRouter();

  // Redirect to login if token is not available
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (!token) {
      e.preventDefault();
      router.push('/login');
    }
  };

  return (
    <form
      action="/api/stripe/create_checkout_session"
      method="POST"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="listingId" value={listing.id} />
      <input type="hidden" name="quantity" value={1} />
      <input type="hidden" name="token" value={token || ''} />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Buy Now
      </button>
    </form>
  );
}
