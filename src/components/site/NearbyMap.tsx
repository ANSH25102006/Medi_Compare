import { Link } from "@tanstack/react-router";
import { MapPin, Star, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hospitals } from "@/lib/mock-data";

// Pre-computed pseudo-coords (percentage positions on the faux map canvas)
const pins = [
  { id: "apollo-central", x: 22, y: 38 },
  { id: "fortis-greens", x: 64, y: 28 },
  { id: "max-superspecialty", x: 48, y: 58 },
  { id: "manipal-city", x: 32, y: 70 },
  { id: "kokilaben", x: 78, y: 62 },
  { id: "medanta", x: 56, y: 80 },
];

export function NearbyMap() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Hospitals near you</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Find care within minutes</h2>
        </div>
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/compare">
            <Navigation className="mr-1 h-4 w-4" /> Use my location
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Map canvas */}
        <div className="relative h-[420px] overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
          {/* Faux map background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(120deg, oklch(0.97 0.02 220) 0%, oklch(0.94 0.03 240) 100%)",
            }}
          />
          {/* Grid lines */}
          <svg className="absolute inset-0 h-full w-full opacity-40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.85 0.03 240)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Roads */}
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M 0 30 Q 30 35 60 40 T 100 50" stroke="oklch(0.78 0.04 240)" strokeWidth="0.8" fill="none" />
            <path d="M 20 0 Q 25 40 35 70 T 50 100" stroke="oklch(0.78 0.04 240)" strokeWidth="0.8" fill="none" />
            <path d="M 0 75 Q 40 70 70 80 T 100 85" stroke="oklch(0.78 0.04 240)" strokeWidth="0.6" fill="none" />
          </svg>

          {/* User marker */}
          <div className="absolute" style={{ left: "45%", top: "45%" }}>
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-background bg-primary shadow-elevated" />
            </span>
          </div>

          {/* Hospital pins */}
          {pins.map((p) => {
            const h = hospitals.find((x) => x.id === p.id)!;
            return (
              <Link
                key={p.id}
                to="/hospitals/$hospitalId"
                params={{ hospitalId: p.id }}
                className="group absolute -translate-x-1/2 -translate-y-full"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-foreground shadow-elevated ring-1 ring-border transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    ₹{h.services[0].price.toLocaleString()}
                  </div>
                  <span className="-mt-1 h-2 w-2 rotate-45 bg-background ring-1 ring-border group-hover:bg-primary" />
                </div>
              </Link>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 rounded-xl bg-background/90 p-3 text-xs shadow-soft backdrop-blur">
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Your location</div>
            <div className="mt-1 flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-foreground" /> Hospitals</div>
          </div>
        </div>

        {/* List */}
        <ul className="space-y-3">
          {hospitals.slice(0, 5).map((h) => (
            <li key={h.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <img src={h.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{h.name}</p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {h.distance} km
                  <span className="inline-flex items-center gap-0.5 text-warning">
                    <Star className="h-3 w-3 fill-current" /> {h.rating}
                  </span>
                </p>
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link to="/hospitals/$hospitalId" params={{ hospitalId: h.id }}>Open</Link>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
