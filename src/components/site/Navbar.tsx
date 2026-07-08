import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, LogOut, LayoutDashboard, ChevronDown, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/features", label: "Features" },
  { to: "/compare", label: "Compare Services" },
  { to: "/ai-assistant", label: "AI Assistant" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const dashboardPath =
    user?.role === "Admin" ? "/admin" : user?.role === "Doctor" ? "/doctor" : "/dashboard";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setOpen(false);
    toast.success("You've been signed out.");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/65 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--ring),0.2)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <Heart className="h-4.5 w-4.5" fill="currentColor" />
          </span>
          <span className="text-[15px] font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            MediCompare
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-secondary/40"
              activeProps={{
                className:
                  "rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide text-primary bg-primary/8 dark:bg-primary/15 border border-primary/10",
              }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn && user ? (
            // ── Logged-in user menu ──
            <div className="relative" ref={dropdownRef}>
              <button
                id="user-menu-btn"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-border/80 bg-card/55 pl-1.5 pr-3 py-1 text-xs font-semibold tracking-wide transition-all duration-200 hover:bg-secondary hover:border-border/100 cursor-pointer shadow-sm focus-visible:outline-none"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-6 w-6 rounded-full object-cover ring-1 ring-border/50"
                />
                <span className="hidden max-w-[120px] truncate sm:block">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown
                  className={`h-3 w-3 text-muted-foreground transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-56 rounded-xl border border-border bg-card/95 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md animate-fade-in z-50">
                  <div className="border-b border-border/50 px-3 py-2.5 mb-1.5">
                    <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</p>
                  </div>
                  <Link
                    to={dashboardPath}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground/80" />
                    Dashboard
                  </Link>
                  <button
                    id="logout-btn"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/8 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            // ── Logged-out auth buttons ──
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-xs font-bold tracking-wide hover:bg-secondary/50">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full shadow-sm text-xs font-bold tracking-wide px-4 h-8 bg-primary hover:shadow-[0_4px_12px_rgba(var(--ring),0.25)] transition-all">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 md:hidden bg-card/40 hover:bg-secondary"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col p-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-border pt-2">
              {isLoggedIn ? (
                <>
                  <Link
                    to={dashboardPath}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-secondary"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
