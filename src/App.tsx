import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import HejTalentLanding from "./pages/HejTalentLanding";
import BackofficeLanding from "./pages/BackofficeLanding";
import ITDevelopmentLanding from "./pages/ITDevelopmentLanding";
import AIMLLanding from "./pages/AIMLLanding";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
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
import CrmOverview from "./pages/admin/CrmOverview";
import CrmCompanies from "./pages/admin/CrmCompanies";
import CrmContacts from "./pages/admin/CrmContacts";
import CrmCompanyForm from "./pages/admin/CrmCompanyForm";
import CrmContactForm from "./pages/admin/CrmContactForm";
import CrmCompanyDetail from "./pages/admin/CrmCompanyDetail";
import CrmContactDetail from "./pages/admin/CrmContactDetail";
import OutreachProfile from "./pages/admin/OutreachProfile";
import OutreachCampaigns from "./pages/admin/OutreachCampaigns";
import OutreachCampaignNew from "./pages/admin/OutreachCampaignNew";
import OutreachCampaignDetail from "./pages/admin/OutreachCampaignDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/landing" element={<HejTalentLanding />} />
          <Route path="/backoffice-landing" element={<BackofficeLanding />} />
          <Route path="/it-development-landing" element={<ITDevelopmentLanding />} />
          <Route path="/ai-ml-landing" element={<AIMLLanding />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/solutions" element={<SolutionsOverview />} />
          <Route path="/solutions/backoffice" element={<BackofficeSolution />} />
          <Route path="/solutions/it-development" element={<ITDevelopmentSolution />} />
          <Route path="/solutions/ai-ml" element={<AIMlSolution />} />
          <Route path="/how-we-work" element={<HowWeWork />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/resource-hub" element={<ResourceHub />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/invite" element={<InviteRegister />} />
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
            <Route path="crm" element={<CrmOverview />} />
            <Route path="crm/companies" element={<CrmCompanies />} />
            <Route path="crm/companies/new" element={<CrmCompanyForm />} />
            <Route path="crm/companies/:id" element={<CrmCompanyDetail />} />
            <Route path="crm/companies/:id/edit" element={<CrmCompanyForm />} />
            <Route path="crm/contacts" element={<CrmContacts />} />
            <Route path="crm/contacts/new" element={<CrmContactForm />} />
            <Route path="crm/contacts/:id" element={<CrmContactDetail />} />
            <Route path="crm/contacts/:id/edit" element={<CrmContactForm />} />
            <Route path="outreach-profile" element={<OutreachProfile />} />
            <Route path="outreach-campaigns" element={<OutreachCampaigns />} />
            <Route path="outreach-campaigns/new" element={<OutreachCampaignNew />} />
            <Route path="outreach-campaigns/:id" element={<OutreachCampaignDetail />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;