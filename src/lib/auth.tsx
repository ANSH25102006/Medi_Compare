import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type AuthUser = {
  name: string;
  email: string;
  avatar: string;
  role: "Patient" | "Doctor" | "Admin";
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role?: "Patient" | "Doctor" | "Admin",
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
};

const STORAGE_KEY = "medicompare_user";

function generateAvatar(email: string) {
  // Generate a deterministic pravatar based on email hash
  const n = Math.abs(email.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 70);
  return `https://i.pravatar.cc/120?img=${n + 1}`;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      if (typeof window === "undefined") return null;
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  // Keep localStorage in sync whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    if (!email || password.length < 6) {
      throw new Error("Invalid credentials. Password must be at least 6 characters.");
    }
    // Try to retrieve a previously registered name and role for this email
    let name = "Patient";
    let role: "Patient" | "Doctor" | "Admin" = "Patient";

    // Check email suffix/prefix defaults
    if (email.toLowerCase().includes("admin")) {
      role = "Admin";
      name = "Hospital Admin";
    } else if (email.toLowerCase().includes("doctor")) {
      role = "Doctor";
      name = "Doctor";
    }

    try {
      const accounts = JSON.parse(localStorage.getItem("medicompare_accounts") ?? "{}");
      if (accounts[email]) {
        if (typeof accounts[email] === "object") {
          name = accounts[email].name || name;
          role = accounts[email].role || role;
        } else {
          name = accounts[email];
        }
      }
    } catch {
      // ignore
    }
    const newUser: AuthUser = { name, email, avatar: generateAvatar(email), role };
    setUser(newUser);
  }, []);

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: "Patient" | "Doctor" | "Admin" = "Patient",
    ) => {
      if (!name || !email || password.length < 6) {
        throw new Error("Please fill all fields. Password must be at least 6 characters.");
      }
      // Store name and role keyed by email
      try {
        const accounts = JSON.parse(localStorage.getItem("medicompare_accounts") ?? "{}");
        accounts[email] = { name, role };
        localStorage.setItem("medicompare_accounts", JSON.stringify(accounts));
      } catch {
        // ignore
      }
      const newUser: AuthUser = { name, email, avatar: generateAvatar(email), role };
      setUser(newUser);
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (newName: string, newEmail: string) => {
      if (!user) return;
      try {
        const accounts = JSON.parse(localStorage.getItem("medicompare_accounts") ?? "{}");
        if (accounts[user.email]) {
          delete accounts[user.email];
        }
        accounts[newEmail] = { name: newName, role: user.role };
        localStorage.setItem("medicompare_accounts", JSON.stringify(accounts));
      } catch {
        // ignore
      }
      setUser((prev) => {
        if (!prev) return null;
        return { ...prev, name: newName, email: newEmail, avatar: generateAvatar(newEmail) };
      });
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, login, signup, logout, updateProfile }}
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
