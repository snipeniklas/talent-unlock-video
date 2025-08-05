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
import SearchRequestDetail from "./pages/app/SearchRequestDetail";
import ApplicantManagement from "./pages/app/ApplicantManagement";
import Specialists from "./pages/app/Specialists";
import SpecialistDetail from "./pages/app/SpecialistDetail";
import BackofficeSolution from "./pages/solutions/BackofficeSolution";
import AIMlSolution from "./pages/solutions/AIMlSolution";
import ITDevelopmentSolution from "./pages/solutions/ITDevelopmentSolution";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CandidateManagement from "./pages/admin/CandidateManagement";
import AdminSearchRequests from "./pages/admin/AdminSearchRequests";
import SolutionsOverview from "./pages/SolutionsOverview";
import HowWeWork from "./pages/HowWeWork";
import ResourceHub from "./pages/ResourceHub";
import Contact from "./pages/Contact";
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
          <Route path="/solutions" element={<SolutionsOverview />} />
          <Route path="/solutions/backoffice" element={<BackofficeSolution />} />
          <Route path="/solutions/it-development" element={<ITDevelopmentSolution />} />
          <Route path="/solutions/ai-ml" element={<AIMlSolution />} />
          <Route path="/how-we-work" element={<HowWeWork />} />
          <Route path="/resource-hub" element={<ResourceHub />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/app" element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="search-requests" element={<SearchRequests />} />
            <Route path="search-requests/new" element={<NewSearchRequest />} />
            <Route path="search-requests/:id" element={<SearchRequestDetail />} />
            <Route path="search-requests/:id/applicants" element={<ApplicantManagement />} />
            <Route path="specialists" element={<Specialists />} />
            <Route path="specialists/:id" element={<SpecialistDetail />} />
          </Route>
          
          {/* Admin Routes mit AppLayout */}
          <Route path="/admin" element={<AppLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="candidates" element={<CandidateManagement />} />
            <Route path="search-requests" element={<AdminSearchRequests />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
