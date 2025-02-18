import { useRouter } from 'next/navigation';
import { Listing } from './Shop';
import { FormEvent, useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

type BuyNowButtonProps = {
  listing: Listing;
  token: string | null;
};

export default function BuyNowButton({ listing, token }: BuyNowButtonProps) {
  const router = useRouter();
  const [buyerCountry, setBuyerCountry] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

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
      id="checkout-form"
    >
      <input type="hidden" name="listingId" value={listing.id} />
      <input type="hidden" name="quantity" value={1} />
      <input type="hidden" name="token" value={token || ''} />
      <input type="hidden" name="buyerCountry" value={buyerCountry} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            className="bg-white hover:bg-slate-200 text-black rounded-full"
          >
            Buy Now
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Where is your shipping address?</DialogTitle>
            <DialogDescription>
              Please choose your country for shipping purposes. Selecting an EU
              member state outside of {listing.seller_country} may affect the
              applicable postage costs.
            </DialogDescription>
          </DialogHeader>

          <RadioGroup
            value={buyerCountry}
            onValueChange={setBuyerCountry}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={listing.seller_country} id="option1" />
              <Label htmlFor="option1">{listing.seller_country}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="eu" id="option2" />
              <Label htmlFor="option2">
                EU member state outside of {listing.seller_country}
              </Label>
            </div>
          </RadioGroup>

          <Button type="submit" form="checkout-form" disabled={!buyerCountry}>
            Proceed to Checkout
          </Button>
        </DialogContent>
      </Dialog>
    </form>
  );
}
