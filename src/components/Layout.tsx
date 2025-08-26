
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getMyProfile, MyProfile } from "@/api/profile";
interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<MyProfile | null>(null);
const [loadingProfile, setLoadingProfile] = useState(true);
useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      setLoadingProfile(true);
      const p = await getMyProfile();
      if (mounted) setProfile(p);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      if (mounted) setLoadingProfile(false);
    }
  })();
  return () => { mounted = false; };
}, []);

const displayName =
  profile?.first_name || profile?.last_name
    ? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()
    : user?.name ?? "User";

const avatarUrl =
  profile?.profile_picture_data?.file_url ??
  profile?.id_documents_data?.[0]?.file_url 
 
  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="border-b border-border/40 px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-primary/10 hover:text-primary" />
                <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              </div>
              
                <div className="flex items-center gap-4">
                    <img
    src={avatarUrl}
    alt="avatar"
    className="w-9 h-9 rounded-full object-cover border"
    onError={(e) => {
      (e.currentTarget as HTMLImageElement).src = "/images/avatar-placeholder.png";
    }}
  />
                  <div className="text-sm">
    <div className="font-medium text-foreground">{displayName}</div>
    <div className="text-muted-foreground text-xs">{profile?.phone ?? user?.phone ?? ""}</div>
  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
            </div>
          </header>
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
