import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import HejTalentLanding from "./pages/HejTalentLanding";
import BackofficeLanding from "./pages/BackofficeLanding";
import ITDevelopmentLanding from "./pages/ITDevelopmentLanding";
import AIMLLanding from "./pages/AIMLLanding";
import AuthPage from "./pages/AuthPage";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import SearchRequests from "./pages/app/SearchRequests";
import NewSearchRequest from "./pages/app/NewSearchRequest";
import SearchRequestDetail from "./pages/app/SearchRequestDetail";
import ApplicantManagement from "./pages/app/ApplicantManagement";
import CandidateKanbanBoard from "./pages/app/CandidateKanbanBoard";
import CustomerCandidateDetail from "./pages/app/CustomerCandidateDetail";
import Specialists from "./pages/app/Specialists";
import SpecialistDetail from "./pages/app/SpecialistDetail";
import BackofficeSolution from "./pages/solutions/BackofficeSolution";
import AIMlSolution from "./pages/solutions/AIMlSolution";
import ITDevelopmentSolution from "./pages/solutions/ITDevelopmentSolution";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSearchRequests from "./pages/admin/AdminSearchRequests";
import CompanyManagement from "./pages/admin/CompanyManagement";
import AdminSettings from "./pages/admin/AdminSettings";
import SolutionsOverview from "./pages/SolutionsOverview";
import HowWeWork from "./pages/HowWeWork";
import ResourceHub from "./pages/ResourceHub";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Support from "./pages/app/Support";
import AdminSupport from "./pages/admin/AdminSupport";
import CandidateManagement from "./pages/admin/CandidateManagement";
import CandidateView from "./pages/admin/CandidateView";
import CandidateDetail from "./pages/admin/CandidateDetail";
import NewCandidate from "./pages/admin/NewCandidate";
import Settings from "./pages/app/Settings";
import InviteRegister from "./pages/InviteRegister";
import AboutUs from "./pages/AboutUs";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import SearchRequestAllocations from "./pages/admin/SearchRequestAllocations";
import AdminSearchRequestDetail from "./pages/admin/AdminSearchRequestDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Language route redirects */}
            <Route path="/" element={<Navigate to="/de" replace />} />
            <Route path="/de" element={<Index />} />
            <Route path="/en" element={<Index />} />
            
            {/* German routes */}
            <Route path="/de/landing" element={<HejTalentLanding />} />
            <Route path="/de/backoffice-landing" element={<BackofficeLanding />} />
            <Route path="/de/it-development-landing" element={<ITDevelopmentLanding />} />
            <Route path="/de/ai-ml-landing" element={<AIMLLanding />} />
            <Route path="/de/auth" element={<AuthPage />} />
            <Route path="/de/solutions" element={<SolutionsOverview />} />
            <Route path="/de/solutions/backoffice" element={<BackofficeSolution />} />
            <Route path="/de/solutions/it-development" element={<ITDevelopmentSolution />} />
            <Route path="/de/solutions/ai-ml" element={<AIMlSolution />} />
            <Route path="/de/how-we-work" element={<HowWeWork />} />
            <Route path="/de/about-us" element={<AboutUs />} />
            <Route path="/de/resource-hub" element={<ResourceHub />} />
            <Route path="/de/contact" element={<Contact />} />
            <Route path="/de/impressum" element={<Impressum />} />
            <Route path="/de/datenschutz" element={<Datenschutz />} />
            <Route path="/de/invite" element={<InviteRegister />} />
            
            {/* English routes */}
            <Route path="/en/landing" element={<HejTalentLanding />} />
            <Route path="/en/backoffice-landing" element={<BackofficeLanding />} />
            <Route path="/en/it-development-landing" element={<ITDevelopmentLanding />} />
            <Route path="/en/ai-ml-landing" element={<AIMLLanding />} />
            <Route path="/en/auth" element={<AuthPage />} />
            <Route path="/en/solutions" element={<SolutionsOverview />} />
            <Route path="/en/solutions/backoffice" element={<BackofficeSolution />} />
            <Route path="/en/solutions/it-development" element={<ITDevelopmentSolution />} />
            <Route path="/en/solutions/ai-ml" element={<AIMlSolution />} />
            <Route path="/en/how-we-work" element={<HowWeWork />} />
            <Route path="/en/about-us" element={<AboutUs />} />
            <Route path="/en/resource-hub" element={<ResourceHub />} />
            <Route path="/en/contact" element={<Contact />} />
            <Route path="/en/impressum" element={<Impressum />} />
            <Route path="/en/datenschutz" element={<Datenschutz />} />
            <Route path="/en/invite" element={<InviteRegister />} />
            
            {/* Legacy routes redirect to German */}
            <Route path="/landing" element={<Navigate to="/de/landing" replace />} />
            <Route path="/backoffice-landing" element={<Navigate to="/de/backoffice-landing" replace />} />
            <Route path="/it-development-landing" element={<Navigate to="/de/it-development-landing" replace />} />
            <Route path="/ai-ml-landing" element={<Navigate to="/de/ai-ml-landing" replace />} />
            <Route path="/auth" element={<Navigate to="/de/auth" replace />} />
            <Route path="/solutions" element={<Navigate to="/de/solutions" replace />} />
            <Route path="/solutions/backoffice" element={<Navigate to="/de/solutions/backoffice" replace />} />
            <Route path="/solutions/it-development" element={<Navigate to="/de/solutions/it-development" replace />} />
            <Route path="/solutions/ai-ml" element={<Navigate to="/de/solutions/ai-ml" replace />} />
            <Route path="/how-we-work" element={<Navigate to="/de/how-we-work" replace />} />
            <Route path="/about-us" element={<Navigate to="/de/about-us" replace />} />
            <Route path="/resource-hub" element={<Navigate to="/de/resource-hub" replace />} />
            <Route path="/contact" element={<Navigate to="/de/contact" replace />} />
            <Route path="/impressum" element={<Navigate to="/de/impressum" replace />} />
            <Route path="/datenschutz" element={<Navigate to="/de/datenschutz" replace />} />
            <Route path="/invite" element={<Navigate to="/de/invite" replace />} />
          <Route path="/app" element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="search-requests" element={<SearchRequests />} />
            <Route path="search-requests/new" element={<NewSearchRequest />} />
            <Route path="search-requests/:id" element={<SearchRequestDetail />} />
            <Route path="search-requests/:id/candidates" element={<CandidateKanbanBoard />} />
            <Route path="search-requests/:id/applicants" element={<ApplicantManagement />} />
            <Route path="candidate/:id" element={<CustomerCandidateDetail />} />
            <Route path="specialists" element={<Specialists />} />
            <Route path="specialists/:id" element={<SpecialistDetail />} />
            <Route path="support" element={<Support />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Admin Routes mit AppLayout */}
          <Route path="/admin" element={<AppLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="candidates" element={<CandidateManagement />} />
            <Route path="candidates/:id" element={<CandidateView />} />
            <Route path="candidates/:id/edit" element={<CandidateDetail />} />
            <Route path="candidates/new" element={<NewCandidate />} />
            <Route path="search-requests" element={<AdminSearchRequests />} />
            <Route path="search-requests/:id" element={<AdminSearchRequestDetail />} />
            <Route path="search-requests/:id/allocations" element={<SearchRequestAllocations />} />
            <Route path="companies" element={<CompanyManagement />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;