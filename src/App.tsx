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
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import { ProtectedRoute } from "./components/ProtectedRoute";

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
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <Companies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/:slug"
              element={
                <ProtectedRoute>
                  <CompanyDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/:slug/placement"
              element={
                <ProtectedRoute>
                  <PlacementReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/:slug/work"
              element={
                <ProtectedRoute>
                  <WorkReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/write"
              element={
                <ProtectedRoute>
                  <WriteReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/write/placement"
              element={
                <ProtectedRoute>
                  <WritePlacementReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/write/work"
              element={
                <ProtectedRoute>
                  <WriteWorkReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />


            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
