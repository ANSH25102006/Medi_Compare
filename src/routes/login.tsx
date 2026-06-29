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

const GoogleIcon = () => (
  <svg
    className="mr-2 h-4 w-4 shrink-0"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

function AuthPage() {
  const navigate = useNavigate();
  const { login, signInWithGoogle, isLoggedIn, user } = useAuth();
  const { redirect } = Route.useSearch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Redirecting to Google...");
    } catch (err) {
      setError((err as Error).message);
      toast.error("Google authentication failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

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

          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full border-border/80 shadow-sm font-medium hover:bg-secondary/40 hover:text-foreground transition-all duration-200"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
            >
              <GoogleIcon />
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </Button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-medium">OR</span>
            </div>
          </div>

          <div className="space-y-4">
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
                disabled={loading || googleLoading}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="login-password">Password</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => toast.info("Password reset link sent to your email.")}
                  disabled={loading || googleLoading}
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
                disabled={loading || googleLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={loading || googleLoading}
            >
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
