import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Star, Navigation, Clock, TrendingDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServiceAverage } from "@/lib/mock-data";
import { useHospitals } from "@/hooks/use-hospitals";

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
  const { data: hospitalsList = [] } = useHospitals();
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-primary">
            Hospitals near you
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Find care within minutes</h2>
          <p className="mt-1.5 text-muted-foreground">
            Click a pin to explore pricing and book instantly.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="rounded-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Link to="/compare">
            <Navigation className="mr-1.5 h-4 w-4" /> Use my location
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Map canvas */}
        <div className="relative h-[440px] overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
          {/* Map background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.97 0.02 220) 0%, oklch(0.93 0.04 240) 100%)",
            }}
          />

          {/* Grid pattern */}
          <svg
            className="absolute inset-0 h-full w-full opacity-30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="map-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path
                  d="M 36 0 L 0 0 0 36"
                  fill="none"
                  stroke="oklch(0.75 0.05 240)"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
          </svg>

          {/* Blocks/Buildings */}
          <svg
            className="absolute inset-0 h-full w-full opacity-40"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <rect x="8" y="10" width="6" height="8" rx="0.5" fill="oklch(0.86 0.03 240)" />
            <rect x="20" y="15" width="8" height="6" rx="0.5" fill="oklch(0.84 0.04 230)" />
            <rect x="38" y="8" width="5" height="7" rx="0.5" fill="oklch(0.85 0.03 240)" />
            <rect x="68" y="12" width="7" height="9" rx="0.5" fill="oklch(0.82 0.04 245)" />
            <rect x="80" y="38" width="9" height="6" rx="0.5" fill="oklch(0.84 0.03 235)" />
            <rect x="12" y="52" width="6" height="10" rx="0.5" fill="oklch(0.86 0.03 240)" />
            <rect x="55" y="88" width="8" height="7" rx="0.5" fill="oklch(0.83 0.04 240)" />
            <rect x="72" y="74" width="7" height="8" rx="0.5" fill="oklch(0.85 0.03 240)" />
          </svg>

          {/* Roads */}
          <svg
            className="absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <path
              d="M 0 30 Q 30 35 60 40 T 100 50"
              stroke="white"
              strokeWidth="2.5"
              fill="none"
              strokeOpacity="0.7"
            />
            <path
              d="M 0 30 Q 30 35 60 40 T 100 50"
              stroke="oklch(0.80 0.04 240)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M 20 0 Q 25 40 35 70 T 50 100"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeOpacity="0.7"
            />
            <path
              d="M 20 0 Q 25 40 35 70 T 50 100"
              stroke="oklch(0.80 0.04 240)"
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M 0 75 Q 40 70 70 80 T 100 85"
              stroke="white"
              strokeWidth="1.8"
              fill="none"
              strokeOpacity="0.6"
            />
            <path
              d="M 0 75 Q 40 70 70 80 T 100 85"
              stroke="oklch(0.82 0.04 240)"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M 60 0 Q 65 30 70 60 T 80 100"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
              strokeOpacity="0.5"
            />
            <path
              d="M 60 0 Q 65 30 70 60 T 80 100"
              stroke="oklch(0.83 0.04 240)"
              strokeWidth="0.8"
              fill="none"
            />
          </svg>

          {/* Distance rings */}
          <div
            className="absolute rounded-full border-2 border-primary/15 -translate-x-1/2 -translate-y-1/2"
            style={{ left: "45%", top: "45%", width: "20%", height: "30%", borderRadius: "50%" }}
          />
          <div
            className="absolute rounded-full border border-primary/8 -translate-x-1/2 -translate-y-1/2"
            style={{ left: "45%", top: "45%", width: "40%", height: "60%", borderRadius: "50%" }}
          />

          {/* User marker */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "45%", top: "45%" }}
          >
            <span className="relative flex h-5 w-5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary shadow-elevated" />
            </span>
          </div>

          {/* Hospital pins */}
          {pins.map((p) => {
            const h = hospitalsList.find((x) => x.id === p.id);
            if (!h) return null;
            const svc = h.services[0];
            const avg = getServiceAverage(svc.name, hospitalsList);
            const savings = Math.max(avg - svc.price, 0);
            const isHovered = hoveredPin === p.id;
            const isSelected = selectedHospital === p.id;

            return (
              <div
                key={p.id}
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <button
                  type="button"
                  onMouseEnter={() => setHoveredPin(p.id)}
                  onMouseLeave={() => setHoveredPin(null)}
                  onClick={() => setSelectedHospital(isSelected ? null : p.id)}
                  className="group flex flex-col items-center btn-interactive"
                >
                  <div
                    className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-elevated ring-2 transition-all duration-200 ${
                      isSelected
                        ? "scale-110 bg-primary text-primary-foreground ring-primary shadow-[0_4px_12px_rgba(59,130,246,0.45)]"
                        : isHovered
                          ? "scale-105 bg-primary text-primary-foreground ring-primary shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                          : "bg-background text-foreground ring-border hover:bg-primary hover:text-primary-foreground hover:ring-primary"
                    }`}
                  >
                    ₹{svc.price.toLocaleString()}
                  </div>
                  <span
                    className={`-mt-1 h-2 w-2 rotate-45 ring-2 transition-colors ${
                      isSelected || isHovered
                        ? "bg-primary ring-primary"
                        : "bg-background ring-border"
                    }`}
                  />
                </button>

                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-xl border border-border bg-background p-3 shadow-elevated z-10 pointer-events-none">
                    <p className="text-xs font-bold leading-tight">{h.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Star className="h-3 w-3 fill-warning text-warning" /> {h.rating} ·{" "}
                      {h.distance} km
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">
                        ₹{svc.price.toLocaleString()}
                      </span>
                      {savings > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-success">
                          <TrendingDown className="h-3 w-3" /> Save ₹{savings.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 rounded-xl bg-background/90 p-3 text-xs shadow-soft backdrop-blur">
            <div className="flex items-center gap-2 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Your location
            </div>
            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-foreground" /> Hospitals (tap to preview)
            </div>
          </div>

          {/* Scale indicator */}
          <div className="absolute bottom-4 right-4 rounded-lg bg-background/90 px-3 py-1.5 text-[10px] shadow-soft backdrop-blur font-semibold text-muted-foreground">
            ← 2 km →
          </div>
        </div>

        {/* Hospital list */}
        <div className="flex flex-col gap-3">
          {hospitalsList.slice(0, 5).map((h) => {
            const svc = h.services[0];
            const avg = getServiceAverage(svc.name, hospitalsList);
            const savings = Math.max(avg - svc.price, 0);
            const isSelected = selectedHospital === h.id;

            return (
              <div
                key={h.id}
                className={`flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated cursor-pointer hover:border-primary/25 ${
                  isSelected ? "border-primary/45 bg-primary/[0.04] shadow-md" : "border-border"
                }`}
                onClick={() => setSelectedHospital(isSelected ? null : h.id)}
              >
                <img src={h.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover border border-border/40" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{h.name}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3 text-muted-foreground/80" /> {h.distance} km
                    </span>
                    <span className="flex items-center gap-0.5 text-warning font-semibold">
                      <Star className="h-3 w-3 fill-current" /> {h.rating}
                    </span>
                    <span className="flex items-center gap-0.5 text-success font-semibold">
                      <Clock className="h-3 w-3" /> {h.slots.length} slots
                    </span>
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">
                      ₹{svc.price.toLocaleString()}
                    </span>
                    {savings > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-success bg-success/5 px-1.5 py-0.2 rounded border border-success/10">
                        Save ₹{savings.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-primary-gradient text-xs shadow-soft hover:shadow-elevated shrink-0 btn-interactive text-primary-foreground font-semibold"
                >
                  <Link to="/book" search={{ hospital: h.id, service: svc.name }}>
                    Book <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            );
          })}
          <Button
            asChild
            variant="ghost"
            className="rounded-full text-sm font-semibold text-primary hover:bg-primary-soft"
          >
            <Link to="/compare">View all hospitals →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
