import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import RolesPage from "./pages/RolesPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              
              {/* Protected routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute screenId="dashboard">
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute screenId="users">
                  <UsersPage />
                </ProtectedRoute>
              } />
              <Route path="/ai-agents" element={
                <ProtectedRoute screenId="ai-agents">
                  <AIAgentsPage />
                </ProtectedRoute>
              } />
              <Route path="/knowledge-base" element={
                <ProtectedRoute screenId="knowledge-base">
                  <KnowledgeBasePage />
                </ProtectedRoute>
              } />
              <Route path="/channels" element={
                <ProtectedRoute screenId="channels">
                  <ChannelsPage />
                </ProtectedRoute>
              } />
              <Route path="/flow-builder" element={
                <ProtectedRoute screenId="flow-builder">
                  <FlowBuilderPage />
                </ProtectedRoute>
              } />
              <Route path="/live-ops" element={
                <ProtectedRoute screenId="live-ops">
                  <LiveOpsPage />
                </ProtectedRoute>
              } />
              <Route path="/outbound-calls" element={
                <ProtectedRoute screenId="outbound-calls">
                  <OutboundCallsPage />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute screenId="analytics">
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
              <Route path="/integrations" element={
                <ProtectedRoute screenId="integrations">
                  <IntegrationsPage />
                </ProtectedRoute>
              } />
              <Route path="/billing" element={
                <ProtectedRoute screenId="billing">
                  <BillingPage />
                </ProtectedRoute>
              } />
              <Route path="/security" element={
                <ProtectedRoute screenId="security">
                  <SecurityPage />
                </ProtectedRoute>
              } />
              <Route path="/sdks" element={
                <ProtectedRoute screenId="sdks">
                  <SDKsPage />
                </ProtectedRoute>
              } />
              <Route path="/theme" element={
                <ProtectedRoute screenId="theme">
                  <ThemeSettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/roles" element={
                <ProtectedRoute screenId="roles">
                  <RolesPage />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;