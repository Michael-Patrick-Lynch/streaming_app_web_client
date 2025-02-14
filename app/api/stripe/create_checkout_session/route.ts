// This API needs to live in Next because
// of CORS issues around redirects
import { stripe } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const listingId = parseInt(formData.get('listingId') as string, 10);
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const token = formData.get('token') as string;

  // Reserve inventory
  const reserveRes = await fetch('https://api.firmsnap.com/reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ listing_id: listingId, quantity }),
  });

  if (!reserveRes.ok) {
    return new Response('Inventory unavailable', { status: 400 });
  }

  const { reservation_id, reference_id } = await reserveRes.json();

  try {
    const listingRes = await fetch(
      `https://api.firmsnap.com/listings/${listingId}`
    );
    const listing = await listingRes.json();

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: listing.price.currency,
            product_data: {
              name: listing.title,
            },
            unit_amount: listing.price.amount,
          },
          quantity: quantity,
        },
      ],
      payment_intent_data: {
        transfer_group: reference_id,
      },
      mode: 'payment',
      client_reference_id: reference_id,
      success_url:
        'https://firmsnap.com/checkout/success?session_id={CHECKOUT_SESSION_ID}',
    });

    return NextResponse.redirect(session.url as string, 303);
  } catch (error) {
    await fetch(
      `https://api.firmsnap.com/reservations/${reservation_id}/release`,
      {
        method: 'DELETE',
      }
    );
    return new Response(`Internal Server Error: ${error}`, { status: 500 });
  }
}
