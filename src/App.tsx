import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UserProfilePage from "./pages/UserProfilePage";
import UsersPage from "./pages/UsersPage";
import AIAgentsPage from "./pages/AIAgentsPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import ChannelsPage from "./pages/ChannelsPage";
import FlowBuilderPage from "./pages/FlowBuilderPage";
import LiveOpsPage from "./pages/LiveOpsPage";
import OutboundCallsPage from "./pages/OutboundCallsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BillingPage from "./pages/BillingPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import SecurityPage from "./pages/SecurityPage";
import SDKsPage from "./pages/SDKsPage";
import ThemeSettingsPage from "./pages/ThemeSettingsPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/" element={<Index />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/ai-agents" element={<AIAgentsPage />} />
            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="/channels" element={<ChannelsPage />} />
            <Route path="/flow-builder" element={<FlowBuilderPage />} />
            <Route path="/live-ops" element={<LiveOpsPage />} />
            <Route path="/outbound-calls" element={<OutboundCallsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/sdks" element={<SDKsPage />} />
            <Route path="/theme" element={<ThemeSettingsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
