import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getMyProfile, MyProfile } from "@/api/profile";
import TokenCapture from "./TokenCapture";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Grid, PanelLeft } from "lucide-react";
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
        if (mounted) {
          setProfile(p);

          // Save profile ID to localStorage
          if (p?.id) {
            localStorage.setItem("user_Id", String(p.id));
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const displayName =
    profile?.first_name || profile?.last_name
      ? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()
      : user?.name ?? "User";

  const avatarUrl = profile?.profile_picture_data?.file_url;
  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="border-b border-border/40 px-4 sm:px-6 py-3 sm:py-4 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center gap-3">
                <SidebarTrigger className="hover:bg-primary/10 hover:text-primary">
                  {/* Yaha icon replace kar do */}
                  <PanelLeft className="w-5 h-5" />
                  {/* Ya */}
                  {/* <PanelLeft className="w-5 h-5" /> */}
                </SidebarTrigger>
                <h1 className="text-lg sm:text-xl font-semibold text-foreground">
                  {title}
                </h1>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Desktop View (show name + phone + logout) */}
                <div className="hidden sm:flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-9 h-9 rounded-full object-cover border"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/images/avatar-placeholder.png";
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground text-sm sm:text-base">
                      {displayName}
                    </span>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      {profile?.phone ?? user?.phone ?? ""}
                    </span>
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

                {/* Mobile View (dropdown) */}
                <div className="sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover border cursor-pointer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/images/avatar-placeholder.png";
                        }}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem disabled>
                        <div>
                          <div className="font-medium">{displayName}</div>
                          <div className="text-xs text-muted-foreground">
                            {profile?.phone ?? user?.phone ?? ""}
                          </div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 overflow-auto">
            <TokenCapture />

            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
