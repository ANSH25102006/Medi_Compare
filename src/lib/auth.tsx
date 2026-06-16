import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "./supabase";

export type AuthUser = {
  name: string;
  email: string;
  avatar: string;
  role: "Patient" | "Doctor" | "Admin";
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
};

function generateAvatar(email: string) {
  const n = Math.abs(email.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 70);
  return `https://i.pravatar.cc/120?img=${n + 1}`;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const mapUser = (supabaseUser: any): AuthUser | null => {
  if (!supabaseUser) return null;
  return {
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
    email: supabaseUser.email || "",
    avatar: supabaseUser.user_metadata?.avatar || generateAvatar(supabaseUser.email || ""),
    role: (supabaseUser.user_metadata?.role as "Patient" | "Doctor" | "Admin") || "Patient",
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapUser(session?.user));
      setLoading(false);
    });

    // Listen to session changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user));
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
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
        throw new Error(error.message);
      }
      // Notify the user if email verification is enabled and session was not created
      if (data.user && !data.session) {
        throw new Error("Verification email sent! Please check your inbox to confirm your email.");
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
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

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, loading, login, signup, logout, updateProfile }}
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
