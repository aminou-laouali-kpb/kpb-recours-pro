import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthRoute } from "@/components/AuthRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";
import Dashboard from "./pages/Dashboard";
import NouveauRecours from "./pages/recours/NouveauRecours";
import Historique from "./pages/recours/Historique";
import MonProfil from "./pages/MonProfil";
import AdminLeads from "./pages/admin/Leads";
import AdminRecours from "./pages/admin/Recours";
import AdminAnalytics from "./pages/admin/Analytics";

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
            <Route path="/inscription" element={<Inscription />} />

            {/* Authenticated */}
            <Route path="/dashboard" element={<AuthRoute><Dashboard /></AuthRoute>} />
            <Route path="/recours/nouveau" element={<AuthRoute><NouveauRecours /></AuthRoute>} />
            <Route path="/recours/historique" element={<AuthRoute><Historique /></AuthRoute>} />
            <Route path="/mon-profil" element={<AuthRoute><MonProfil /></AuthRoute>} />

            {/* Admin */}
            <Route path="/admin/leads" element={<ProtectedRoute requireAdmin><AdminLeads /></ProtectedRoute>} />
            <Route path="/admin/recours" element={<ProtectedRoute requireAdmin><AdminRecours /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><AdminAnalytics /></ProtectedRoute>} />

            {/* Legacy redirects */}
            <Route path="/premium/dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/premium/nouvelle-lettre" element={<Navigate to="/recours/nouveau" replace />} />
            <Route path="/premium/historique" element={<Navigate to="/recours/historique" replace />} />
            <Route path="/premium/mon-acces" element={<Navigate to="/mon-profil" replace />} />
            <Route path="/activation" element={<Navigate to="/" replace />} />
            <Route path="/payer" element={<Navigate to="/" replace />} />
            <Route path="/access-check" element={<Navigate to="/dashboard" replace />} />
            <Route path="/payments/*" element={<Navigate to="/" replace />} />
            <Route path="/admin/premium-access" element={<Navigate to="/admin/leads" replace />} />
            <Route path="/admin/orders" element={<Navigate to="/admin/recours" replace />} />
            <Route path="/admin/generated-letters" element={<Navigate to="/admin/analytics" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
