import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

const groups = [
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Careers", "/careers"],
    ],
  },
  {
    title: "Services",
    links: [
      ["Compare Prices", "/compare"],
      ["Hospitals", "/hospitals"],
      ["Reviews", "/reviews"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms of Service", "/terms"],
      ["Cookie Policy", "/cookies"],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-gradient text-primary-foreground shadow-soft">
                <Heart className="h-4 w-4" fill="currentColor" />
              </span>
              <span className="text-lg font-semibold tracking-tight">MediCompare</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The transparent way to find, compare, and book quality healthcare services across
              India.
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="text-sm font-semibold text-foreground">{g.title}</h4>
              <ul className="mt-4 space-y-2">
                {g.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} MediCompare Health Technologies. All rights reserved.</p>
          <p>Made for better healthcare decisions.</p>
        </div>
      </div>
    </footer>
  );
}
