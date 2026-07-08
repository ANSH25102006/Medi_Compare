import { Link } from "@tanstack/react-router";
import {
  Brain,
  ScanLine,
  TestTube,
  Bone,
  Activity,
  HeartPulse,
  Smile,
  Stethoscope,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  popularServices,
  getServiceMin,
  getServiceMax,
  getHospitalCountForService,
} from "@/lib/mock-data";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  ScanLine,
  TestTube,
  Bone,
  Activity,
  HeartPulse,
  Smile,
  Stethoscope,
};

const MAX_BOOKINGS = 6200;

export function PopularServices() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-primary">Popular Services</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            Compare prices for what matters most
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground text-sm">
            Transparent pricing on the most-searched medical services across verified hospitals.
          </p>
        </div>
        <Link
          to="/compare"
          className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          See all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {popularServices.map((s) => {
          const Icon = ICONS[s.icon] ?? Stethoscope;
          const minPrice = getServiceMin(s.name);
          const maxPrice = getServiceMax(s.name);
          const hospitalCount = getHospitalCountForService(s.name);
          const demandPct = Math.round((s.bookingCount / MAX_BOOKINGS) * 100);

          // Phase 7 Service Card Improvements: Subtle visual badges
          let smartBadge = "Trending";
          let badgeColor =
            "bg-primary-soft/80 text-primary border-primary/20 dark:bg-primary-soft/10";

          if (s.slug === "mri" || s.slug === "fullbody") {
            smartBadge = "Best Savings";
            badgeColor = "bg-success/10 text-success border-success/20";
          } else if (s.slug === "ct") {
            smartBadge = "Most Compared";
            badgeColor =
              "bg-primary-soft text-primary border-primary/20";
          } else if (s.slug === "blood") {
            smartBadge = "Most Booked";
            badgeColor = "bg-success/10 text-success border-success/20";
          } else if (s.slug === "xray") {
            smartBadge = "Fastest Availability";
            badgeColor = "bg-primary-soft text-primary border-primary/20";
          }

          return (
            <Link
              key={s.slug}
              to="/compare"
              search={{ q: s.name, city: "" }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/10"
            >
              {/* Tint gradient */}
              <div
                className="absolute inset-0 -z-0 bg-primary-soft opacity-0 transition-opacity duration-350 group-hover:opacity-100"
              />

              <div className="relative">
                {/* Header Row: Icon & Smart Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-background text-primary shadow-soft ring-1 ring-border transition-transform duration-300 group-hover:scale-110 dark:bg-background/40">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold ${badgeColor}`}
                  >
                    {smartBadge}
                  </span>
                </div>

                {/* Title + bookings */}
                <div className="mt-4 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold leading-tight">{s.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <TrendingUp className="h-3 w-3 text-success" />
                      {s.bookings} bookings this month
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>

                {/* Price range */}
                <div className="mt-4 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Price range
                    </p>
                    {minPrice > 0 && maxPrice > 0 ? (
                      <p className="mt-0.5 text-base font-bold text-primary">
                        ₹{minPrice.toLocaleString()} – ₹{maxPrice.toLocaleString()}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-base font-bold text-primary">
                        From ₹{s.startingAt.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                    {hospitalCount > 0 ? `${hospitalCount} hospitals` : "Multiple"}
                  </span>
                </div>

                {/* Demand bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Demand this month</span>
                    <span className="font-semibold text-foreground">{demandPct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700 group-hover:opacity-90"
                      style={{ width: `${demandPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
