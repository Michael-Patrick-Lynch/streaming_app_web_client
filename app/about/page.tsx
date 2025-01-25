import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">About Firmsnap</h1>
        <p className="text-gray-600">FAQs</p>
      </div>
      <div className="flex flex-col gap-4 w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>What is Firmsnap?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex flex-col space-y-1.5">
                <p>Firmsnap is a new livestreaming app. I hope you like it!</p>
              </div>
            </div>
          </CardContent>

          <CardHeader>
            <CardTitle>How can I become a seller on Firmsnap?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex flex-col space-y-1.5">
                <p>
                  Seller onboarding is currently under development. Details to
                  come soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
