import { Link } from "@tanstack/react-router";
import { Heart, Twitter, Linkedin, Github, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const groups = [
  {
    title: "Company",
    links: [
      ["About Us", "/about"],
      ["How It Works", "/how-it-works"],
      ["Features", "/features"],
      ["Contact Us", "/contact"],
    ],
  },
  {
    title: "Services",
    links: [
      ["Compare Services", "/compare"],
      ["Verified Reviews", "/reviews"],
      ["AI Health Assistant", "/ai-assistant"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Transparency Guide", "/about"],
      ["API Reference", "#"],
      ["Help Center", "/contact"],
      ["System Status", "#"],
    ],
  },
] as const;

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Subscribed to transparency updates!");
    setEmail("");
  };

  return (
    <footer className="border-t border-border bg-[#F8FAFC] text-[#1E3A5F]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-5 lg:gap-12">
          {/* Brand + Newsletter */}
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2.5 w-fit group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Heart className="h-4.5 w-4.5" fill="currentColor" />
              </span>
              <span className="text-[15px] font-bold tracking-tight text-[#1E3A5F] transition-colors group-hover:text-primary">MediCompare</span>
            </Link>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground font-semibold">
              The transparent way to find, compare, and book quality healthcare services across India.
            </p>
            {/* Newsletter input */}
            <form onSubmit={handleSubscribe} className="max-w-sm space-y-2.5">
              <label htmlFor="footer-email" className="block text-[10px] font-bold uppercase tracking-widest text-[#1E3A5F]">
                Subscribe to transparency reports
              </label>
              <div className="flex gap-2">
                <input
                  id="footer-email"
                  type="email"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all hover:border-border-hover"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  Join
                </button>
              </div>
            </form>
          </div>

          {/* Links lists */}
          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1E3A5F]">
                {g.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {g.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      to={href as any}
                      className="text-xs font-semibold text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-0.5 inline-block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 text-[11px] font-semibold text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} MediCompare Health Technologies. All rights reserved.</p>
          
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
              <Twitter className="h-4.5 w-4.5" />
            </a>
            <a href="#" className="hover:text-primary transition-colors" aria-label="LinkedIn">
              <Linkedin className="h-4.5 w-4.5" />
            </a>
            <a href="#" className="hover:text-primary transition-colors" aria-label="GitHub">
              <Github className="h-4.5 w-4.5" />
            </a>
          </div>

          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Made for better healthcare decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
