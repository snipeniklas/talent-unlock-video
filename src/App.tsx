import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import HeyTalentLanding from "./pages/HeyTalentLanding";
import AuthPage from "./pages/AuthPage";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import SearchRequests from "./pages/app/SearchRequests";
import NewSearchRequest from "./pages/app/NewSearchRequest";
import Specialists from "./pages/app/Specialists";
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
          <Route path="/landing" element={<HeyTalentLanding />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/app" element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="search-requests" element={<SearchRequests />} />
            <Route path="search-requests/new" element={<NewSearchRequest />} />
            <Route path="specialists" element={<Specialists />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
