import React, { useEffect, useState } from "react";
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
  Sparkles,
  Badge,
  Check,
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

import { useToast } from "@/components/ui/use-toast"; // 👈 shadcn toast hook
import { getMyProfile } from "@/api/profile";

const allMenuItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "My Profile", url: "/profile", icon: User },
  { title: "Services", url: "/services", icon: Scissors },
  { title: "Unlocked Leads", url: "/leads", icon: Unlock },
  { title: "Reported Leads", url: "/reported-leads", icon: Flag },
  { title: "Wedmac Plans", url: "/plans", icon: Crown },
  // { title: "Credit History", url: "/credit-history", icon: Clock },
  { title: "Assigned Lead", url: "/assigned", icon: Check },
  { title: "Wedmac Shop", url: "/shop", icon: ShoppingBag },
  { title: "Refer & Earn", url: "/refer", icon: Share2 },
  { title: "Payments / Plan", url: "/payments", icon: CreditCard },
  { title: "Support / Help", url: "/support", icon: HelpCircle },
];

export function AppSidebar() {
  const location = useLocation();
  const { toast } = useToast(); // 👈 initialize toast
  const [profileComplete, setProfileComplete] = useState(false);
  const [paymentApproved, setPaymentApproved] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
const [createdByAdmin, setCreatedByAdmin] = useState(false); // 👈 new state

useEffect(() => {
  getMyProfile()
    .then((profile) => {
      const dob = profile?.date_of_birth;
      const paymentStatus = profile?.payment_status;
      const adminFlag = profile?.created_by_admin; // 👈 get from API

      setCreatedByAdmin(!!adminFlag); 
      setProfileComplete(!!dob);
      setPaymentApproved(paymentStatus === "approved");
    })
    .catch(() => {
      setCreatedByAdmin(false);
      setProfileComplete(false);
      setPaymentApproved(false);
    })
    .finally(() => setLoadingProfile(false));
}, []);


const handleClick = (
  e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  url: string
) => {
  if (loadingProfile) {
    e.preventDefault();
    toast({
      title: "Loading Profile",
      description: "Please wait, loading your profile...",
      variant: "default",
    });
    return;
  }

  const alwaysAllowed = [
    "/",
    "/profile",
    "/services",
    "/plans",
    "/shop",
    "/payments",
  ];
  if (alwaysAllowed.includes(url)) return;

  // 👇 only check if NOT created_by_admin
  if (!createdByAdmin) {
    if (!profileComplete) {
      e.preventDefault();
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile first.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentApproved) {
      e.preventDefault();
      toast({
        title: "Payment Required",
        description: "Please complete your payment first.",
        variant: "destructive",
      });
      return;
    }
  }
};

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
       
          <div className="item-center">
  <img
                          src="/images/website_logo.png"
                          alt="Website Logo"
                          width={140}
                          height={50}
                          className="object-contain"
                        />              <p className="text-xs text-muted-foreground">Artist Hub</p>
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
              {allMenuItems.map((item) => (
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

      {/* <SidebarFooter className="p-4">
        <div className="bg-gradient-to-r from-[#FF577F]/10 to-[#E6447A]/10 rounded-lg p-3 border border-primary/20">
          <p className="text-xs font-medium text-primary mb-1">Premium Plan</p>
          <p className="text-xs text-muted-foreground">30 days remaining</p>
        </div>
      </SidebarFooter> */}
    </Sidebar>
  );
}
