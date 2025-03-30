import * as React from 'react';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useUser } from '@/context/UserContext';

// This is sample data.
const data = {
  navMain: [
    {
      items: [
        {
          title: 'Inventory',
          url: '/manage-shop',
        },
        {
          title: 'Sales',
          url: '/manage-sales',
        },
        {
          title: 'Shows',
          url: '/manage-shows',
        },
        {
          title: 'Financials',
          url: '/api/stripe/create_login_link',
        },
      ],
    },
  ],
};

export function SellerHubSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { currentUser } = useUser();

  const handleFinancialsClick = () => {
    if (!currentUser) {
      console.error('currentUser is null');
      return;
    }
    window.open(
      `/api/stripe/create_login_link/${currentUser.stripe_id}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <Sidebar {...props}>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup className="lg:top-16" key={'First Group'}>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {item.title === 'Financials' ? (
                        <button
                          onClick={handleFinancialsClick}
                          className="w-full text-left"
                        >
                          {item.title}
                        </button>
                      ) : (
                        <Link href={item.url}>{item.title}</Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
