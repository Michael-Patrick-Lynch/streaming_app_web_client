/* eslint-disable */
import { stripe } from '@/lib/utils';

export async function POST() {
  try {
    const account = await stripe.accounts.create({
      controller: {
        stripe_dashboard: {
          type: 'express',
        },
        fees: {
          payer: 'application',
        },
        losses: {
          payments: 'application',
        },
      },
    } as any); // Because Stripe typescript type definition is broken

    return new Response(JSON.stringify({ account: account.id }), {
      status: 200,
    });
  } catch (error: unknown) {
    console.error(
      'An error occurred when calling the Stripe API to create an account:',
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
