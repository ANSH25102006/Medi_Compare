import { Link } from "@tanstack/react-router";
import {
  Brain, ScanLine, TestTube, Bone, Activity, HeartPulse, Smile, Stethoscope, ArrowRight,
} from "lucide-react";
import { popularServices } from "@/lib/mock-data";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain, ScanLine, TestTube, Bone, Activity, HeartPulse, Smile, Stethoscope,
};

export function PopularServices() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Popular services</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Compare prices for what matters most</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Transparent pricing on the most-searched medical services across verified hospitals.
          </p>
        </div>
        <Link to="/compare" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          See all services <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {popularServices.map((s) => {
          const Icon = ICONS[s.icon] ?? Stethoscope;
          return (
            <Link
              key={s.slug}
              to="/compare"
              search={{ q: s.name, city: "" }}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated`}
            >
              <div className={`absolute inset-0 -z-0 bg-gradient-to-br ${s.tint}`} />
              <div className="relative">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-background text-primary shadow-soft">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{s.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.bookings} bookings this month</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Starting at</p>
                    <p className="text-xl font-bold text-primary">₹{s.startingAt.toLocaleString()}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
