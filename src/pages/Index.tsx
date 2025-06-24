
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="border-b border-border/40 px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-primary/10 hover:text-primary" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Live Updates</span>
              </div>
            </div>
          </header>
          <div className="flex-1 p-6 overflow-auto">
            <Dashboard />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
