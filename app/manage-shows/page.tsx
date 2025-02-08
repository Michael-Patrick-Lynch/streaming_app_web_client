'use client';
import * as React from 'react';
import { SellerHubSidebar } from '@/components/SellerHubSidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import SellerShowDisplay from '@/components/SellerShowDisplay';

export default function ManageShopPage() {
  const router = useRouter();

  return (
    <SidebarProvider>
      <SellerHubSidebar />
      <SidebarInset>
        <div className="pt-10">
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <h1 className="text-3xl font-bold">Scheduled Shows</h1>
            </div>
            <div className="pb-4 lg:pr-10">
              <Button
                onClick={() => router.push('/create-show')}
                className="bg-green-300 text-black font-bold rounded-full lg:text-lg lg:px-6 lg:py-6"
              >
                Create Show
              </Button>
            </div>
          </header>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="mb-8 text-left lg:pt-20">
            <SellerShowDisplay />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
