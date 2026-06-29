import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SearchParams = { redirect?: string };

export const Route = createFileRoute("/signup")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign Up — MediCompare" }] }),
  component: SignupPage,
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

function SignupPage() {
  const navigate = useNavigate();
  const { signup, signInWithGoogle, isLoggedIn, user } = useAuth();
  const { redirect } = Route.useSearch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Patient" | "Doctor" | "Admin">("Patient");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role === "Admin") {
        navigate({ to: "/admin" });
      } else if (user.role === "Doctor") {
        navigate({ to: "/doctor" });
      } else if (redirect) {
        if (redirect.includes("/book")) {
          try {
            const urlStr = redirect.startsWith("http") ? redirect : `http://localhost${redirect}`;
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
        navigate({ to: redirect });
      } else {
        navigate({ to: "/dashboard" });
      }
    }
  }, [isLoggedIn, user, redirect, navigate]);

  if (isLoggedIn) {
    return null;
  }

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "Full name is required.";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Enter a valid email address.";
    if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    return errs;
  };

  const handleGoogleSignIn = async () => {
    setErrors({});
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Redirecting to Google...");
    } catch (err) {
      setErrors({ general: (err as Error).message });
      toast.error("Google authentication failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await signup(name.trim(), email, password, role);
      toast.success("Account created! Welcome to MediCompare 🎉");
    } catch (err) {
      setErrors({ general: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength =
    password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "bg-destructive", "bg-warning", "bg-success"];

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-primary-gradient lg:flex lg:flex-col lg:justify-between lg:p-12 lg:text-primary-foreground">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Heart className="h-4 w-4" fill="currentColor" />
          </span>
          <span className="text-lg font-semibold">MediCompare</span>
        </Link>
        <div className="space-y-3 max-w-md">
          <h2 className="text-3xl font-bold leading-snug">Healthcare, on your terms.</h2>
          <p className="text-sm opacity-80">
            Join 50,000+ patients who book smarter, save more, and care better.
          </p>
          <ul className="mt-4 space-y-2 text-sm opacity-90">
            {[
              "Free forever — no hidden fees",
              "Compare prices across 500+ hospitals",
              "Book in seconds, 24/7",
              "Verified reviews you can trust",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs opacity-70">© 2026 MediCompare Health Technologies</p>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Free forever. No credit card required.
          </p>

          {errors.general && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {errors.general}
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
              <Label htmlFor="signup-name">Full name</Label>
              <Input
                id="signup-name"
                required
                className={`mt-1.5 ${errors.name ? "border-destructive" : ""}`}
                placeholder="Ananya Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
                disabled={loading || googleLoading}
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                required
                className={`mt-1.5 ${errors.email ? "border-destructive" : ""}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: undefined }));
                }}
                disabled={loading || googleLoading}
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="signup-role">I am a...</Label>
              <Select
                value={role}
                onValueChange={(v: "Patient" | "Doctor" | "Admin") => setRole(v)}
                disabled={loading || googleLoading}
              >
                <SelectTrigger id="signup-role" className="mt-1.5 w-full">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Patient">Patient</SelectItem>
                  <SelectItem value="Doctor">Doctor / Care Provider</SelectItem>
                  <SelectItem value="Admin">Hospital Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                required
                className={`mt-1.5 ${errors.password ? "border-destructive" : ""}`}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: undefined }));
                }}
                disabled={loading || googleLoading}
              />
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColor[passwordStrength] : "bg-secondary"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {strengthLabel[passwordStrength]}
                  </span>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={loading || googleLoading}
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              search={{ redirect }}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
