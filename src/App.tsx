import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import UsersPage from "./pages/UsersPage";
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
          <Route path="/ai-agents" element={<PlaceholderPage />} />
          <Route path="/knowledge-base" element={<PlaceholderPage />} />
          <Route path="/channels" element={<PlaceholderPage />} />
          <Route path="/flow-builder" element={<PlaceholderPage />} />
          <Route path="/live-ops" element={<PlaceholderPage />} />
          <Route path="/outbound-calls" element={<PlaceholderPage />} />
          <Route path="/analytics" element={<PlaceholderPage />} />
          <Route path="/integrations" element={<PlaceholderPage />} />
          <Route path="/billing" element={<PlaceholderPage />} />
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
