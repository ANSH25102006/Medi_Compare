import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — MediCompare" }] }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-primary-gradient lg:flex lg:flex-col lg:justify-between lg:p-12 lg:text-primary-foreground">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur"><Heart className="h-4 w-4" fill="currentColor" /></span>
          <span className="text-lg font-semibold">MediCompare</span>
        </Link>
        <div className="space-y-3 max-w-md">
          <h2 className="text-3xl font-bold leading-snug">Healthcare, on your terms.</h2>
          <p className="text-sm opacity-80">Join 50,000+ patients who book smarter, save more, and care better.</p>
        </div>
        <p className="text-xs opacity-70">© 2026 MediCompare Health Technologies</p>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <form
          onSubmit={(e) => { e.preventDefault(); toast.success("Account created!"); }}
          className="w-full max-w-sm"
        >
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Free forever. No credit card required.</p>

          <div className="mt-8 space-y-4">
            <div><Label>Full name</Label><Input required className="mt-1.5" /></div>
            <div><Label>Email</Label><Input type="email" required className="mt-1.5" /></div>
            <div><Label>Password</Label><Input type="password" required className="mt-1.5" /></div>
            <Button type="submit" className="w-full rounded-full">Create account</Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
