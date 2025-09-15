
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import OTPVerification from "./pages/OTPVerification";
import NotFound from "./pages/NotFound";
import AssignedLeads from "./pages/AssignedLeads";
import ReceiveToken from "./pages/ReceiveToken";

const queryClient = new QueryClient();

const App = () => (
  
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
           <Route path="/receive-token" element={<ReceiveToken />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/otp-verification" element={<OTPVerification />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            } />
            <Route path="/services" element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            } />
            <Route path="/leads" element={
              <ProtectedRoute>
                <UnlockedLeads />
              </ProtectedRoute>
            } />
            <Route path="/reported-leads" element={
              <ProtectedRoute>
                <ReportedLeads />
              </ProtectedRoute>
            } />
            <Route path="/plans" element={
              <ProtectedRoute>
                <WedmacPlans />
              </ProtectedRoute>
            } />
            <Route path="/credit-history" element={
              <ProtectedRoute>
                <CreditHistory />
              </ProtectedRoute>
            } />
            <Route path="/shop" element={
              <ProtectedRoute>
                <WedmacShop />
              </ProtectedRoute>
            } />
             <Route path="/assigned" element={
              <ProtectedRoute>
                <AssignedLeads />
              </ProtectedRoute>
            } />
            <Route path="/refer" element={
              <ProtectedRoute>
                <ReferEarn />
              </ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute>
                <PaymentsPlan />
              </ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
