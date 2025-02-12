// This API needs to live in Next because
// of CORS issues around redirects
import { stripe } from '@/lib/utils';
import { NextResponse } from 'next/server';

// TODO: Add application logic to call Elixir API to:
// 1. Validate item details for that product ID are correct (same price etc)
// 2. Reserve that item
// 3. Start 5 minute timer for the checkout
// 4. Validate that the item is not sold out yet
export async function POST() {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Pokemon Card (Squirtle)',
            },
            unit_amount: 100,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        transfer_group: 'ORDER100',
      },
      mode: 'payment',
      success_url:
        'https://firmsnap.com/checkout/success?session_id={CHECKOUT_SESSION_ID}',
    });

    return NextResponse.redirect(session.url as string, 303);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
