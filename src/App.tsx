
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MyProfile from "./pages/MyProfile";
import Services from "./pages/Services";
import UnlockedLeads from "./pages/UnlockedLeads";
import ReportedLeads from "./pages/ReportedLeads";
import WedmacPlans from "./pages/WedmacPlans";
import CreditHistory from "./pages/CreditHistory";
import WedmacShop from "./pages/WedmacShop";
import ReferEarn from "./pages/ReferEarn";
import PaymentsPlan from "./pages/PaymentsPlan";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/services" element={<Services />} />
          <Route path="/leads" element={<UnlockedLeads />} />
          <Route path="/reported-leads" element={<ReportedLeads />} />
          <Route path="/plans" element={<WedmacPlans />} />
          <Route path="/credit-history" element={<CreditHistory />} />
          <Route path="/shop" element={<WedmacShop />} />
          <Route path="/refer" element={<ReferEarn />} />
          <Route path="/payments" element={<PaymentsPlan />} />
          <Route path="/support" element={<Support />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
