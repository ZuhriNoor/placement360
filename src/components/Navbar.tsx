import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      setIsAdmin(!!data);
    };

    checkAdminStatus();
  }, [user]);

  return (
    <header className="border-b border-border sticky top-0 bg-background z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/">
          <h1 className="text-2xl font-bold">Placement360</h1>
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          {/* This link is hidden on mobile (hidden) and shown on medium screens and up (md:block) */}
          <Link
            to="/companies"
            className="hidden md:block text-muted-foreground hover:text-foreground transition-colors"
          >
            View Reviews
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              {/* Admin button is hidden on mobile */}
              {isAdmin && (
                <Link to="/admin" className="hidden md:block">
                  <Button variant="ghost" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              {/* User email is hidden on mobile */}
              <span className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                {user.email}
              </span>
              {/* Logout button is always visible */}
              <Button variant="outline" className="neon-border gap-2" onClick={signOut}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          ) : (
            // Login button is always visible
            <Link to="/auth">
              <Button variant="outline" className="neon-border">
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};