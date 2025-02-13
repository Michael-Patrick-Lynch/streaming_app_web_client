// This API needs to live in Next because
// of CORS issues around redirects
import { stripe } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ stripe_id: string }> }
) {
  try {
    const { stripe_id } = await params;
    const loginLink = await stripe.accounts.createLoginLink(stripe_id);
    return NextResponse.redirect(loginLink.url, 303);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
