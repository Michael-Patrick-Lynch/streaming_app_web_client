import { stripe } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { account } = await req.json();
    const origin = req.headers.get('origin');
    if (!origin) {
      throw new Error('Missing origin header');
    }

    const accountLink = await stripe.accountLinks.create({
      account,
      refresh_url: `${origin}/seller-onboarding/refresh/${account}`,
      return_url: `${origin}/seller-onboarding/success`,
      type: 'account_onboarding',
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      status: 200,
    });
  } catch (error: unknown) {
    console.error(
      'An error occurred when calling the Stripe API to create an account link:',
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
