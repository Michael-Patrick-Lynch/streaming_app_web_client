'use client';
import React, { useState, useEffect, useRef, JSX } from 'react';
import { Book, Menu, Sunset, Zap } from 'lucide-react';
import { useUser } from '@/context/UserContext';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: JSX.Element;
  items?: MenuItem[];
}

interface NavbarProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  mobileExtraLinks?: {
    name: string;
    url: string;
  }[];
}

const Navbar = ({
  logo = {
    url: '/',
    src: 'https://www.shadcnblocks.com/images/block/block-1.svg',
    alt: 'logo',
    title: 'Firmsnap',
  },
  menu = [
    { title: 'About', url: '/about' },
    {
      title: 'Resources',
      url: '/resources',
      items: [
        {
          title: 'Contact',
          description: 'Get in touch with us',
          icon: <Sunset className="size-5 shrink-0" />,
          url: '/contact',
        },
        {
          title: 'Help Center',
          description: 'Find answers to common questions',
          icon: <Zap className="size-5 shrink-0" />,
          url: '/help',
        },
        {
          title: 'Terms of Service',
          description: 'Read our terms and conditions',
          icon: <Book className="size-5 shrink-0" />,
          url: '/terms',
        },
      ],
    },
  ],
  mobileExtraLinks = [],
}: NavbarProps) => {
  const { currentUser } = useUser();
  // State and ref to manage disabling click when the menu is opened via hover
  // https://github.com/shadcn-ui/ui/issues/76
  const [disable, setDisable] = useState(false);
  const triggerRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observerCallback = (mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-state' &&
          (mutation.target as HTMLElement).getAttribute('data-state') === 'open'
        ) {
          setDisable(true);
          const timeout = setTimeout(() => {
            setDisable(false);
            clearTimeout(timeout);
          }, 1000);
        }
      }
    };

    const observer = new MutationObserver(observerCallback);
    triggerRefs.current.forEach((element) => {
      if (element) {
        observer.observe(element, { attributes: true });
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="py-4">
      {/* Container wrapper so the elements are not touching the edge of the screen */}
      <div className="max-w-9xl mx-auto px-4">
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            <a href={logo.url} className="flex items-center gap-2">
              <img src={logo.src} className="w-8" alt={logo.alt} />
              <span className="text-lg font-semibold">{logo.title}</span>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item, index) =>
                    renderMenuItem(item, index, disable, triggerRefs)
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-2">
            {currentUser ? (
              <>
                {currentUser.is_seller ? (
                  <Button asChild size="sm">
                    <a href="/manage-shop">Manage Shop</a>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <a href="/become-seller">Become Seller</a>
                  </Button>
                )}
                <Button asChild size="sm">
                  <a href="/manage-buyer">Buyer Hub</a>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <a href="/login">Log In</a>
                </Button>
                <Button asChild size="sm">
                  <a href="/signup">Sign Up</a>
                </Button>
              </>
            )}
          </div>
        </nav>
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <a href={logo.url} className="flex items-center gap-2">
              <img src={logo.src} className="w-8" alt={logo.alt} />
              <span className="text-lg font-semibold">{logo.title}</span>
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2">
                      <img src={logo.src} className="w-8" alt={logo.alt} />
                      <span className="text-lg font-semibold">
                        {logo.title}
                      </span>
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="my-6 flex flex-col gap-6">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>
                  {mobileExtraLinks.length > 0 && (
                    <div className="border-t py-4">
                      <div className="grid grid-cols-2 justify-start">
                        {mobileExtraLinks.map((link, idx) => (
                          <a
                            key={idx}
                            className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground"
                            href={link.url}
                          >
                            {link.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    {currentUser ? (
                      <>
                        {currentUser.is_seller ? (
                          <Button asChild size="sm">
                            <a href="/manage-shop">Manage Shop</a>
                          </Button>
                        ) : (
                          <Button asChild variant="outline" size="sm">
                            <a href="/become-seller">Become Seller</a>
                          </Button>
                        )}
                        <Button asChild size="sm">
                          <a href="/manage-buyer">Buyer Hub</a>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button asChild variant="outline">
                          <a href="/login">Log In</a>
                        </Button>
                        <Button asChild>
                          <a href="/signup">Sign Up</a>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (
  item: MenuItem,
  index: number,
  disable: boolean,
  triggerRefs: React.RefObject<(HTMLElement | null)[]>
) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title} className="text-muted-foreground">
        <NavigationMenuTrigger
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (disable) {
              e.preventDefault();
            }
          }}
          ref={(ref) => {
            triggerRefs.current[index] = ref;
          }}
        >
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent
          onPointerEnter={(event) => event.preventDefault()}
          onPointerLeave={(event) => event.preventDefault()}
        >
          <ul className="w-80 p-3">
            {item.items.map((subItem) => (
              <li key={subItem.title}>
                <NavigationMenuLink asChild>
                  <a
                    className="flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
                    href={subItem.url}
                  >
                    {subItem.icon}
                    <div>
                      <div className="text-sm font-semibold">
                        {subItem.title}
                      </div>
                      {subItem.description && (
                        <p className="text-sm leading-snug text-muted-foreground">
                          {subItem.description}
                        </p>
                      )}
                    </div>
                  </a>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <a
      key={item.title}
      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      {item.title}
    </a>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <a
              key={subItem.title}
              className="flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
              href={subItem.url}
            >
              {subItem.icon}
              <div>
                <div className="text-sm font-semibold">{subItem.title}</div>
                {subItem.description && (
                  <p className="text-sm leading-snug text-muted-foreground">
                    {subItem.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a key={item.title} href={item.url} className="font-semibold">
      {item.title}
    </a>
  );
};

export { Navbar };
