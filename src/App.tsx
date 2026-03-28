import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import SignupChoice from "./pages/SignupChoice.tsx";
import SignupUser from "./pages/SignupUser.tsx";
import SignupOrganization from "./pages/SignupOrganization.tsx";
import Login from "./pages/Login.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import UserDashboard from "./pages/UserDashboard.tsx";
import OrgDashboard from "./pages/OrgDashboard.tsx";
import CreateTestAccounts from "./pages/CreateTestAccounts.tsx";
import EventsPage from "./pages/EventsPage.tsx";
import EventDetailsPage from "./pages/EventDetailsPage.tsx";
import OrgDetailPage from "./pages/OrgDetailPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route path="/signup" element={<SignupChoice />} />
            <Route path="/signup/user" element={<SignupUser />} />
            <Route path="/signup/organization" element={<SignupOrganization />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/dashboard/org" element={<OrgDashboard />} />
            <Route path="/org/:id" element={<OrgDetailPage />} />
            <Route path="/setup-test" element={<CreateTestAccounts />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
