import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  User,
  Scissors,
  Unlock,
  Flag,
  Crown,
  Clock,
  ShoppingBag,
  Share2,
  CreditCard,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { getMyProfile } from "@/api/profile";

const menuItems = [
  { title: "Dashboard",       url: "/",               icon: BarChart3 },
  { title: "My Profile",      url: "/profile",        icon: User },
  { title: "Services",        url: "/services",       icon: Scissors },
  { title: "Unlocked Leads",  url: "/leads",          icon: Unlock },
  { title: "Reported Leads",  url: "/reported-leads", icon: Flag },
  { title: "Wedmac Plans",    url: "/plans",          icon: Crown },
  { title: "Credit History",  url: "/credit-history", icon: Clock },
  { title: "Wedmac Shop",     url: "/shop",           icon: ShoppingBag },
  { title: "Refer & Earn",    url: "/refer",          icon: Share2 },
  { title: "Payments / Plan", url: "/payments",       icon: CreditCard },
  { title: "Support / Help",  url: "/support",        icon: HelpCircle },
];

export function AppSidebar() {
  const location = useLocation();
  const [profileComplete, setProfileComplete] = useState<boolean>(false);

  // on mount, fetch profile and decide completeness
  useEffect(() => {
    getMyProfile()
      .then(profile => {
        // here we decide “complete” by date_of_birth not null
        setProfileComplete(profile.date_of_birth !== null);
      })
      .catch(err => {
        console.error('Could not load profile:', err);
        // if you want to be stricter, you could treat failure as “incomplete”
        setProfileComplete(false);
      });
  }, []);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    url: string
  ) => {
    // always allow Dashboard & My Profile
    if (url === '/' || url === '/profile') return;

    // if profile incomplete, block and show message
    if (!profileComplete) {
      e.preventDefault();
      alert('Please complete your profile first to continue.');
    }
  };

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FF577F] to-[#E6447A] rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Wedmac</h2>
            <p className="text-xs text-muted-foreground">Artist Hub</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                    isActive={location.pathname === item.url}
                  >
                    <Link
                      to={item.url}
                      onClick={(e) => handleClick(e, item.url)}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="bg-gradient-to-r from-[#FF577F]/10 to-[#E6447A]/10 rounded-lg p-3 border border-primary/20">
          <p className="text-xs font-medium text-primary mb-1">Premium Plan</p>
          <p className="text-xs text-muted-foreground">30 days remaining</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
