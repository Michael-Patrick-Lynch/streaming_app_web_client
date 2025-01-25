import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Contact Firmsnap</h1>
        <p className="text-gray-600">
          We will get back to you as soon as we can
        </p>
      </div>
      <div className="flex flex-col gap-4 w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex flex-col space-y-1.5">
                <p>founders@firmsnap.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
