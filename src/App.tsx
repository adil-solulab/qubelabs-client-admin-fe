import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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
import PlaceholderPage from "./pages/PlaceholderPage";
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
          <Route path="/security" element={<PlaceholderPage />} />
          <Route path="/sdks" element={<PlaceholderPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
