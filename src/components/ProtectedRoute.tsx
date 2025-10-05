import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading spinner while checking for a session
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // If the user is not logged in, redirect them to the auth page.
    // We pass the current location in the `state` object.
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // If the user is logged in, render the component they were trying to access.
  return <>{children}</>;
};