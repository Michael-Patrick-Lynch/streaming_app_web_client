// This API needs to live in Next because
// of CORS issues around redirects
import { stripe } from '@/lib/utils';
import type { Stripe } from 'stripe';
type AllowedCountry =
  Stripe.Checkout.Session.ShippingAddressCollection.AllowedCountry;
import { NextResponse } from 'next/server';
import { Listing } from '@/components/Shop';

export async function POST(req: Request) {
  const formData = await req.formData();
  const listingId = parseInt(formData.get('listingId') as string, 10);
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const token = formData.get('token') as string;
  const buyerCountry = formData.get('buyerCountry') as string;

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
    console.log('Listing:', listing);

    const shippingDetails = createShippingDetails(buyerCountry, listing);

    const session = await stripe.checkout.sessions.create({
      shipping_address_collection: {
        allowed_countries:
          shippingDetails.shipping_address_collection.allowed_countries,
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount:
                shippingDetails.shipping_options.shipping_options
                  .shipping_rate_data.fixed_amount.amount,
              currency:
                shippingDetails.shipping_options.shipping_options
                  .shipping_rate_data.fixed_amount.currency,
            },
            display_name:
              shippingDetails.shipping_options.shipping_options
                .shipping_rate_data.display_name,
          },
        },
      ],
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

    // Schedule session expiration if reservation is still pending after a certain amount of time
    // (if reservation is still pending, that means payment has not been processed yet)
    setTimeout(
      async () => {
        const getReservationResponse = await fetch(
          `https://api.firmsnap.com/reservations/${reservation_id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const {
          reservation: { status },
        } = await getReservationResponse.json();

        if (status === 'pending') {
          const stripeResponse = await stripe.checkout.sessions.expire(
            session.id
          );
          console.log(
            `Received response from Stripe when expiring session ${session.id}:`,
            stripeResponse
          );
        }
      },
      5 * 60 * 1000
    ); // 5 minutes in milliseconds

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

// Function to generate shipping details
const createShippingDetails = (buyerCountry: string, listing: Listing) => {
  if (buyerCountry === listing.seller_country) {
    console.log(
      `Buyer country: ${buyerCountry}, seller country: ${listing.seller_country}`
    );
    return {
      shipping_address_collection: {
        allowed_countries: [countryToIsoCode(listing.seller_country)],
      },
      shipping_options: buildShippingOptions(
        listing.shipping_domestic_price,
        `Domestic Shipping Within ${listing.seller_country}`
      ),
    };
  } else {
    console.log(
      `Buyer country: ${buyerCountry}, seller country: ${listing.seller_country}`
    );
    console.log(`Listing object: ${listing}`);
    return {
      shipping_address_collection: {
        allowed_countries: allEuIsoCodes(),
      },
      shipping_options: buildShippingOptions(
        listing.shipping_eu_price,
        'EU Shipping'
      ),
    };
  }
};

function buildShippingOptions(
  shipping_cost: { amount: number; currency: string },
  shipping_name: string
) {
  return {
    shipping_options: {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: shipping_cost.amount,
          currency: shipping_cost.currency.toLowerCase(),
        },
        display_name: shipping_name,
      },
    },
  };
}

function countryToIsoCode(country: string): AllowedCountry {
  const mapping: Record<string, AllowedCountry> = {
    Austria: 'AT',
    Belgium: 'BE',
    Bulgaria: 'BG',
    Croatia: 'HR',
    Cyprus: 'CY',
    'Czech Republic': 'CZ',
    Denmark: 'DK',
    Estonia: 'EE',
    Finland: 'FI',
    France: 'FR',
    Germany: 'DE',
    Greece: 'GR',
    Hungary: 'HU',
    Ireland: 'IE',
    Italy: 'IT',
    Latvia: 'LV',
    Lithuania: 'LT',
    Luxembourg: 'LU',
    Malta: 'MT',
    Netherlands: 'NL',
    Poland: 'PL',
    Portugal: 'PT',
    Romania: 'RO',
    Slovakia: 'SK',
    Slovenia: 'SI',
    Spain: 'ES',
    Sweden: 'SE',
  };

  const isoCode = mapping[country];
  if (!isoCode) {
    throw new Error(`Invalid country: ${country}`);
  }
  return isoCode;
}

function allEuIsoCodes(): AllowedCountry[] {
  return [
    'AT', // Austria
    'BE', // Belgium
    'BG', // Bulgaria
    'HR', // Croatia
    'CY', // Cyprus
    'CZ', // Czech Republic
    'DK', // Denmark
    'EE', // Estonia
    'FI', // Finland
    'FR', // France
    'DE', // Germany
    'GR', // Greece
    'HU', // Hungary
    'IE', // Ireland
    'IT', // Italy
    'LV', // Latvia
    'LT', // Lithuania
    'LU', // Luxembourg
    'MT', // Malta
    'NL', // Netherlands
    'PL', // Poland
    'PT', // Portugal
    'RO', // Romania
    'SK', // Slovakia
    'SI', // Slovenia
    'ES', // Spain
    'SE', // Sweden
  ];
}
