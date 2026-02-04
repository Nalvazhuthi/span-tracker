import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { subscriptionService } from "@/services/subscriptionService";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isPro: boolean;
  upgradeToPro: (billingCycle: "monthly" | "yearly") => Promise<void>;
  refreshProStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  // Function to check Pro status from database
  const refreshProStatus = useCallback(async () => {
    if (!user) {
      setIsPro(false);
      return;
    }

    try {
      const isProUser = await subscriptionService.isUserPro(user.id);
      setIsPro(isProUser);
    } catch (error) {
      console.error("Error checking Pro status:", error);
      setIsPro(false);
    }
  }, [user]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      setLoading(false);

      // Check Pro status from database instead of localStorage
      if (session?.user) {
        try {
          const isProUser = await subscriptionService.isUserPro(
            session.user.id,
          );
          setIsPro(isProUser);
        } catch (error) {
          console.error("Error checking Pro status:", error);
          setIsPro(false);
        }
      } else {
        setIsPro(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      setLoading(false);

      // Check Pro status from database instead of localStorage
      if (session?.user) {
        try {
          const isProUser = await subscriptionService.isUserPro(
            session.user.id,
          );
          setIsPro(isProUser);
        } catch (error) {
          console.error("Error checking Pro status:", error);
          setIsPro(false);
        }
      } else {
        setIsPro(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    return { error: error as Error | null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    return { error: error as Error | null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setIsPro(false);
  }, []);

  const upgradeToPro = useCallback(
    async (billingCycle: "monthly" | "yearly" = "monthly") => {
      if (!user) {
        throw new Error("User must be logged in to upgrade");
      }

      // This is a placeholder - actual upgrade should happen after payment verification
      // For now, we'll create a subscription record
      // In production, this should only be called from a webhook after payment confirmation
      try {
        await subscriptionService.upgradeToPro(
          user.id,
          billingCycle,
          "temp-transaction-id",
        );
        await refreshProStatus();
      } catch (error) {
        console.error("Error upgrading to Pro:", error);
        throw error;
      }
    },
    [user, refreshProStatus],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        isPro,
        upgradeToPro,
        refreshProStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
