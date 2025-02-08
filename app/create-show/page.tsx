'use client';
import * as React from 'react';
import { SellerHubSidebar } from '@/components/SellerHubSidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import CreateShowForm from '@/components/CreateShowForm';

export default function CreateShowPage() {
  return (
    <SidebarProvider>
      <SellerHubSidebar />
      <SidebarInset>
        <div className="pt-10">
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 pb-8">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <h1 className="text-4xl font-semibold">
                Schedule your livestream show
              </h1>
            </div>
          </header>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="mb-8 text-left max-w-6xl lg:pt-10 lg:pr-80 lg:pl-40">
            <CreateShowForm />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
