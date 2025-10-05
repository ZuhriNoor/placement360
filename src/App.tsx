import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import WriteReview from "./pages/WriteReview";
import WritePlacementReview from "./pages/WritePlacementReview";
import WriteWorkReview from "./pages/WriteWorkReview";
import PlacementReviews from "./pages/PlacementReviews";
import WorkReviews from "./pages/WorkReviews";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

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
            <Route path="/auth" element={<Auth />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/company/:slug" element={<CompanyDetail />} />
            <Route path="/company/:slug/placement" element={<PlacementReviews />} />
            <Route path="/company/:slug/work" element={<WorkReviews />} />
            <Route path="/write" element={<WriteReview />} />
            <Route path="/write/placement" element={<WritePlacementReview />} />
            <Route path="/write/work" element={<WriteWorkReview />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
