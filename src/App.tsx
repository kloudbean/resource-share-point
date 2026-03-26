import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import Analytics from "./pages/Analytics";
import LinkManager from "./pages/LinkManager";
import AdminVendors from "./pages/AdminVendors";
import Quote from "./pages/Quote";
import PendingActivation from "./pages/PendingActivation";
import AgentDirectory from "./pages/AgentDirectory";
import Documents from "./pages/Documents";
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
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/links" element={<LinkManager />} />
          <Route path="/admin/vendors" element={<AdminVendors />} />
          <Route path="/pending" element={<PendingActivation />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/directory" element={<AgentDirectory />} />
          <Route path="/documents" element={<Documents />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
