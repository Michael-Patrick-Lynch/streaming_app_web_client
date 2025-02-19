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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState({
    listingId: listing.id,
    quantity: 1,
    token: token || '',
    buyerCountry: '',
  });

  const handleBuyerCountryChange = (value: string) => {
    setFormState((prev) => ({ ...prev, buyerCountry: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      router.push('/login');
      return;
    }

    if (!formState.buyerCountry) {
      return; // Don't submit if country not selected
    }

    // Create and submit the form programmatically
    const form = e.currentTarget;
    form.submit();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="bg-white hover:bg-slate-200 text-black rounded-none"
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

        <form
          action="/api/stripe/create_checkout_session"
          method="POST"
          onSubmit={handleSubmit}
          id="checkout-form"
        >
          <input type="hidden" name="listingId" value={formState.listingId} />
          <input type="hidden" name="quantity" value={formState.quantity} />
          <input type="hidden" name="token" value={formState.token} />
          <input
            type="hidden"
            name="buyerCountry"
            value={formState.buyerCountry}
          />

          <RadioGroup
            value={formState.buyerCountry}
            onValueChange={handleBuyerCountryChange}
            className="space-y-3 my-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={listing.seller_country} id="option1" />
              <Label htmlFor="option1">{listing.seller_country}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="eu_outside_sellers_country" id="option2" />
              <Label htmlFor="option2">
                EU member state outside of {listing.seller_country}
              </Label>
            </div>
          </RadioGroup>

          <Button
            type="submit"
            className="w-full mt-4"
            disabled={!formState.buyerCountry}
          >
            Proceed to Checkout
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
