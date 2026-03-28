import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PremiumRoute } from "@/components/PremiumRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Connexion from "./pages/Connexion";
import Activation from "./pages/Activation";
import AccessCheck from "./pages/AccessCheck";
import PaymentReturn from "./pages/PaymentReturn";
import PaymentCancel from "./pages/PaymentCancel";
import PaymentSuccess from "./pages/PaymentSuccess";
import Payer from "./pages/Payer";
import PremiumDashboard from "./pages/premium/Dashboard";
import NouvelleLettre from "./pages/premium/NouvelleLettre";
import Historique from "./pages/premium/Historique";
import MonAcces from "./pages/premium/MonAcces";
import AdminPremiumAccess from "./pages/admin/PremiumAccess";
import AdminOrders from "./pages/admin/Orders";
import AdminGeneratedLetters from "./pages/admin/GeneratedLetters";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/activation" element={<Activation />} />
            <Route path="/access-check" element={<AccessCheck />} />
            <Route path="/payer" element={<Payer />} />
            <Route path="/payments/moneyfusion/return" element={<PaymentReturn />} />
            <Route path="/payments/moneyfusion/cancel" element={<PaymentCancel />} />
            <Route path="/payments/moneyfusion/success" element={<PaymentSuccess />} />

            {/* Premium */}
            <Route path="/premium/dashboard" element={<PremiumRoute><PremiumDashboard /></PremiumRoute>} />
            <Route path="/premium/nouvelle-lettre" element={<PremiumRoute><NouvelleLettre /></PremiumRoute>} />
            <Route path="/premium/historique" element={<PremiumRoute><Historique /></PremiumRoute>} />
            <Route path="/premium/mon-acces" element={<PremiumRoute><MonAcces /></PremiumRoute>} />

            {/* Admin */}
            <Route path="/admin/premium-access" element={<ProtectedRoute requireAdmin><AdminPremiumAccess /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/generated-letters" element={<ProtectedRoute requireAdmin><AdminGeneratedLetters /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
