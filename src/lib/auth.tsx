import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "./supabase";
import { toast } from "sonner";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "Patient" | "Doctor" | "Admin";
  plan: string;
  subscription_status: string;
  subscription_start: string | null;
  subscription_end: string | null;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  ai_messages_today: number;
  last_ai_reset: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role?: "Patient" | "Doctor" | "Admin",
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

function generateAvatar(email: string) {
  const n = Math.abs(email.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 70);
  return `https://i.pravatar.cc/120?img=${n + 1}`;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const mapUser = (supabaseUser: any): AuthUser | null => {
  if (!supabaseUser) return null;
  const rawRole = supabaseUser.user_metadata?.role || "Patient";
  const normalizedRole =
    rawRole.toLowerCase() === "admin" ||
    rawRole.toLowerCase() === "hospital_admin" ||
    rawRole.toLowerCase() === "super_admin"
      ? "Admin"
      : rawRole.toLowerCase() === "doctor"
        ? "Doctor"
        : "Patient";

  const name =
    supabaseUser.user_metadata?.name ||
    supabaseUser.user_metadata?.full_name ||
    supabaseUser.email?.split("@")[0] ||
    "User";

  const avatar =
    supabaseUser.user_metadata?.avatar_url ||
    supabaseUser.user_metadata?.picture ||
    supabaseUser.user_metadata?.avatar ||
    generateAvatar(supabaseUser.email || "");

  return {
    id: supabaseUser.id,
    name,
    email: supabaseUser.email || "",
    avatar,
    role: normalizedRole,
    plan: "Free",
    subscription_status: "inactive",
    subscription_start: null,
    subscription_end: null,
    razorpay_payment_id: null,
    razorpay_order_id: null,
    ai_messages_today: 0,
    last_ai_reset: null,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAndCreateProfile = useCallback(async (sessionUser: any) => {
    if (!sessionUser) return;
    console.log("[Auth Context] Checking profile for user:", sessionUser.id);
    try {
      // Check if profile exists
      const { data: profile, error: selectError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (selectError) {
        console.error("[Auth Context] Error fetching profile:", selectError);
        return;
      }

      const email = sessionUser.email || "";
      const fullName =
        sessionUser.user_metadata?.name ||
        sessionUser.user_metadata?.full_name ||
        email.split("@")[0] ||
        "User";
      const avatarUrl =
        sessionUser.user_metadata?.avatar_url ||
        sessionUser.user_metadata?.picture ||
        sessionUser.user_metadata?.avatar ||
        "";
      const authProvider = sessionUser.app_metadata?.provider || "google";

      // If google provider is used, default role to patient, otherwise preserve existing if profile exists
      const rawRole = sessionUser.user_metadata?.role || (profile ? profile.role : "patient");
      const roleForDb =
        rawRole.toLowerCase() === "admin" ||
        rawRole.toLowerCase() === "hospital_admin" ||
        rawRole.toLowerCase() === "super_admin"
          ? "hospital_admin"
          : rawRole.toLowerCase() === "doctor"
            ? "doctor"
            : "patient";

      if (!profile) {
        console.log("[Auth Context] Profile doesn't exist. Creating profile in DB...");
        const { error: insertError } = await supabase.from("profiles").insert({
          id: sessionUser.id,
          full_name: fullName,
          role: roleForDb,
          email: email,
          avatar_url: avatarUrl,
          auth_provider: authProvider,
        });
        if (insertError) {
          console.error("[Auth Context] Failed to create profile record:", insertError);
          toast.error("Failed to initialize user profile. Please try logging in again.");
        } else {
          console.log("[Auth Context] Profile created successfully");
          setUser({
            id: sessionUser.id,
            name: fullName,
            email: email,
            avatar: avatarUrl || generateAvatar(email),
            role: rawRole.toLowerCase() === "admin" ? "Admin" : rawRole.toLowerCase() === "doctor" ? "Doctor" : "Patient",
            plan: "Free",
            subscription_status: "inactive",
            subscription_start: null,
            subscription_end: null,
            razorpay_payment_id: null,
            razorpay_order_id: null,
            ai_messages_today: 0,
            last_ai_reset: null,
          });
        }
      } else {
        // Sync/Update profile ONLY if fields have changed
        if (
          profile.full_name !== fullName ||
          profile.email !== email ||
          profile.avatar_url !== avatarUrl ||
          profile.auth_provider !== authProvider
        ) {
          console.log("[Auth Context] Profile fields out of sync. Syncing...");
          await supabase
            .from("profiles")
            .update({
              full_name: fullName,
              email: email,
              avatar_url: avatarUrl,
              auth_provider: authProvider,
            })
            .eq("id", sessionUser.id);
        }

        const rawRole = profile.role || "patient";
        const normalizedRole =
          rawRole.toLowerCase() === "admin" ||
          rawRole.toLowerCase() === "hospital_admin" ||
          rawRole.toLowerCase() === "super_admin"
            ? "Admin"
            : rawRole.toLowerCase() === "doctor"
              ? "Doctor"
              : "Patient";

        setUser({
          id: sessionUser.id,
          name: profile.full_name || fullName,
          email: profile.email || email,
          avatar: profile.avatar_url || avatarUrl || generateAvatar(email),
          role: normalizedRole,
          plan: profile.plan || "Free",
          subscription_status: profile.subscription_status || "inactive",
          subscription_start: profile.subscription_start || null,
          subscription_end: profile.subscription_end || null,
          razorpay_payment_id: profile.razorpay_payment_id || null,
          razorpay_order_id: profile.razorpay_order_id || null,
          ai_messages_today: profile.ai_messages_today ?? 0,
          last_ai_reset: profile.last_ai_reset || null,
        });
      }
    } catch (err) {
      console.error("[Auth Context] Error during profile check/creation:", err);
    }
  }, []);

  useEffect(() => {
    // Check active session immediately
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log(
        "[Auth Context] Initial session restoration check:",
        session?.user ? "Session found" : "No active session",
      );
      if (session?.user) {
        setUser(mapUser(session.user));
        await checkAndCreateProfile(session.user);
      }
      setLoading(false);
    });

    // Listen to session changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        `[Auth Context] Auth state change event: ${event}, user email: ${session?.user?.email || "none"}`,
      );
      if (session?.user) {
        setUser(mapUser(session.user));
        if (event === "SIGNED_IN") {
          await checkAndCreateProfile(session.user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAndCreateProfile]);

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
    console.log(`[Auth Context] Initiating login for: ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("[Auth Context] Supabase sign-in error details:", error);
      throw new Error(error.message);
    }
    console.log("[Auth Context] Sign-in successful. User:", data.user?.email);
  }, []);

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: "Patient" | "Doctor" | "Admin" = "Patient",
    ) => {
      if (!name || !email || !password) {
        throw new Error("Name, email, and password are required.");
      }
      console.log(`[Auth Context] Initiating signup for email: ${email}, role: ${role}`);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            avatar: generateAvatar(email),
          },
        },
      });
      if (error) {
        console.error("[Auth Context] Supabase signup error details:", error);
        throw new Error(error.message);
      }
      console.log("[Auth Context] Signup response data:", data);

      // Notify the user if email verification is enabled and session was not created
      if (data.user && !data.session) {
        console.log("[Auth Context] Account created, but email verification link was sent.");
        throw new Error("Verification email sent! Please check your inbox to confirm your email.");
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    console.log("[Auth Context] Initiating logout...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[Auth Context] Supabase logout error:", error);
      throw new Error(error.message);
    }
    console.log("[Auth Context] Logout successful");
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (newName: string, newEmail: string) => {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
      data: {
        name: newName,
      },
    });
    if (error) {
      throw new Error(error.message);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    console.log("[Auth Context] Initiating Google Sign-In...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error("[Auth Context] Google Sign-In error:", error);
      throw new Error(error.message);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await checkAndCreateProfile(session.user);
    }
  }, [checkAndCreateProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        signInWithGoogle,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
