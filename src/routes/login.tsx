import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

type SearchParams = { redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: "Login — MediCompare" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn, user } = useAuth();
  const { redirect } = Route.useSearch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedirect = useCallback(
    (path: string | undefined, role: "Patient" | "Doctor" | "Admin" | undefined) => {
      if (role === "Admin") {
        navigate({ to: "/admin" });
        return;
      }
      if (role === "Doctor") {
        navigate({ to: "/doctor" });
        return;
      }
      if (!path) {
        navigate({ to: "/dashboard" });
        return;
      }
      if (path.includes("/book")) {
        try {
          const urlStr = path.startsWith("http") ? path : `http://localhost${path}`;
          const url = new URL(urlStr);
          const hospital = url.searchParams.get("hospital") || undefined;
          const service = url.searchParams.get("service") || undefined;
          const date = url.searchParams.get("date") || undefined;
          const slot = url.searchParams.get("slot") || undefined;
          navigate({
            to: "/book",
            search: { hospital, service, date, slot },
          });
          return;
        } catch (err) {
          // fallback
        }
      }
      navigate({ to: path });
    },
    [navigate],
  );

  // Already logged in → go to appropriate dashboard
  useEffect(() => {
    if (isLoggedIn && user) {
      handleRedirect(redirect, user.role);
    }
  }, [isLoggedIn, user, redirect, handleRedirect]);

  if (isLoggedIn) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back! 👋");
      // Redirect will be handled by the useEffect above
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-primary-gradient lg:flex lg:flex-col lg:justify-between lg:p-12 lg:text-primary-foreground">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Heart className="h-4 w-4" fill="currentColor" />
          </span>
          <span className="text-lg font-semibold">MediCompare</span>
        </Link>
        <blockquote className="max-w-md text-2xl font-medium leading-snug">
          "I found a cardiologist within 2 km, booked the same day, and paid 30% less than at my
          regular hospital."
          <footer className="mt-4 text-sm font-normal opacity-80">
            — Verified patient, Bengaluru
          </footer>
        </blockquote>
        <p className="text-xs opacity-70">© 2026 MediCompare Health Technologies</p>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your appointments.</p>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-8 space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                required
                className="mt-1.5"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="login-password">Password</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => toast.info("Password reset link sent to your email.")}
                >
                  Forgot?
                </button>
              </div>
              <Input
                id="login-password"
                type="password"
                required
                className="mt-1.5"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link
              to="/signup"
              search={{ redirect }}
              className="font-medium text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>

          <div className="mt-8 rounded-2xl bg-secondary/30 p-4 text-xs space-y-1 text-muted-foreground border border-border/60">
            <p className="font-semibold text-foreground">
              Demo Accounts (use any password ≥ 6 chars):
            </p>
            <p>
              • Patient: <span className="font-mono">patient@medicompare.com</span>
            </p>
            <p>
              • Doctor: <span className="font-mono">doctor@medicompare.com</span>
            </p>
            <p>
              • Hospital Admin: <span className="font-mono">admin@medicompare.com</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
