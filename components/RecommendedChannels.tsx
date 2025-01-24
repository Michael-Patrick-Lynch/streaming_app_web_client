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

// Menu items.
const items = [
  {
    title: 'Streamer 1',
    url: '#',
    icon: User,
  },
  {
    title: 'Streamer 2',
    url: '#',
    icon: User,
  },
  {
    title: 'Streamer 3',
    url: '#',
    icon: User,
  },
  {
    title: 'Streamer 4',
    url: '#',
    icon: User,
  },
  {
    title: 'Streamer 5',
    url: '#',
    icon: User,
  },
];

export function RecommendedChannels() {
  return (
    <SidebarProvider>
      <Sidebar className="fixed top-16">
        <SidebarContent>
          <SidebarGroup>
            <SidebarHeader>Application</SidebarHeader>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
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
