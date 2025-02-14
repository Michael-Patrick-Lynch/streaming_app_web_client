import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40">
      <div className="max-w-md w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="bg-green-500 rounded-full p-4">
            <CircleCheckIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-center">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground text-center">
            Thank you for your purchase. We&apos;re processing your payment and
            will send you a confirmation email shortly.
          </p>
        </div>
        <Separator className="my-8" />
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <span>Items</span>
                  <span>1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>€x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>€y</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span>€x + y</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div>
                  <span className="font-medium">Shipping to:</span>
                  <address className="not-italic text-muted-foreground">
                    xxxx
                    <br />
                    xxxx
                    <br />
                    xxxx
                  </address>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-center mt-8"></div>
      </div>
    </div>
  );
}

function CircleCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
