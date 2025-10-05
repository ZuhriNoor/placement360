import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// --- Interface and Context creation remain the same ---
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // The onAuthStateChange listener is now the single source of truth.
    // It fires immediately with the initial session or null.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // Set loading to false once we have the session state.
      }
    );

    // The separate getSession() call is no longer needed because the listener
    // handles the initial session check for us.

    // Cleanup the listener when the component unmounts
    return () => subscription.unsubscribe();
  }, []); // The dependency array can be empty now.

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      if (data.user) {
        toast.info("Account created! Please check your email to verify.");
        // We don't navigate here, we let the user verify first.
      }
    } catch (error: any) {
      toast.error(error.message || "Error signing up");
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in successfully!");
      navigate('/'); // Navigate AFTER successful sign-in
    } catch (error: any) {
      toast.error(error.message || "Error signing in");
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      // No navigation needed here; Supabase handles the redirect.
    } catch (error: any) {
      toast.error(error.message || "Error signing in with Google");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
      navigate("/auth"); // Navigate AFTER successful sign-out
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
    }
  };

  const value = { user, session, loading, signUp, signIn, signInWithGoogle, signOut };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// --- useAuth hook remains the same ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};