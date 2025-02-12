import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Stripe from 'stripe';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCategory(category: string) {
  const catToFormattedCat: Record<string, string> = {
    trading_card_games: 'Trading Card Games',
  };

  return catToFormattedCat[category] ?? category;
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16',
});
