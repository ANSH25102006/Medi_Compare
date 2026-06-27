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
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 w-fit">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-gradient text-primary-foreground shadow-soft">
                <Heart className="h-4 w-4" fill="currentColor" />
              </span>
              <span className="text-lg font-bold tracking-tight text-foreground">MediCompare</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground font-medium">
              The transparent way to find, compare, and book quality healthcare services across
              India.
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">{g.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {g.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm font-semibold text-muted-foreground/85 transition-all duration-200 hover:text-primary hover:pl-0.5"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-xs font-semibold text-muted-foreground/80 sm:flex-row">
          <p>© {new Date().getFullYear()} MediCompare Health Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Made for better healthcare decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
