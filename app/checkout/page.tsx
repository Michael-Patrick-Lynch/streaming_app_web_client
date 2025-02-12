'use client';

export default function CheckoutPage() {
  return (
    <div className="container">
      <h1>Checkout</h1>
      <p>Click the button below to begin the payment process.</p>
      <form action="/api/stripe/create_checkout_session" method="POST">
        <button type="submit">Proceed to Checkout</button>
      </form>
    </div>
  );
}
