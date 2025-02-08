'use client';
import { User } from 'lucide-react';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';

export function RecommendedChannels() {
  const [sellers, setSellers] = useState<string[]>([]);
  const { currentUser } = useUser();

  useEffect(() => {
    async function fetchSellers() {
      try {
        const response = await fetch('https://api.firmsnap.com/shop/sellers');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSellers(data || []);
      } catch (error) {
        console.error('Failed to fetch sellers:', error);
        setSellers([]);
      }
    }
    fetchSellers();
  }, []);

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '20rem',
        } as React.CSSProperties
      }
    >
      <Sidebar className="fixed top-16">
        <SidebarContent>
          <SidebarGroup>
            <SidebarHeader>
              {currentUser && <p>Welcome {currentUser.username}!!!</p>}
            </SidebarHeader>
            <SidebarGroupContent>
              <SidebarMenu>
                {sellers.map((username) => (
                  <SidebarMenuItem key={username}>
                    <SidebarMenuButton asChild>
                      <Link href={username}>
                        <User />
                        <span>{username}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}

export default RecommendedChannels;
