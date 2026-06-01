import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — MediCompare" }] }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-primary-gradient lg:flex lg:flex-col lg:justify-between lg:p-12 lg:text-primary-foreground">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur"><Heart className="h-4 w-4" fill="currentColor" /></span>
          <span className="text-lg font-semibold">MediCompare</span>
        </Link>
        <blockquote className="max-w-md text-2xl font-medium leading-snug">
          "I found a cardiologist within 2 km, booked the same day, and paid 30% less than at my regular hospital."
          <footer className="mt-4 text-sm font-normal opacity-80">— Verified patient, Bengaluru</footer>
        </blockquote>
        <p className="text-xs opacity-70">© 2026 MediCompare Health Technologies</p>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <form
          onSubmit={(e) => { e.preventDefault(); toast.success("Welcome back!"); }}
          className="w-full max-w-sm"
        >
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your appointments.</p>

          <div className="mt-8 space-y-4">
            <div><Label>Email</Label><Input type="email" required className="mt-1.5" placeholder="you@example.com" /></div>
            <div>
              <div className="flex justify-between">
                <Label>Password</Label>
                <Link to="/login" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <Input type="password" required className="mt-1.5" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full rounded-full">Sign in</Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="font-medium text-primary hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
