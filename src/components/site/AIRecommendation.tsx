import { Link } from "@tanstack/react-router";
import { Sparkles, Star, MapPin, ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiRecommendation, hospitals, getServiceAverage } from "@/lib/mock-data";

export function AIRecommendation() {
  const h = hospitals.find((x) => x.id === aiRecommendation.hospitalId) ?? hospitals[0];
  const svc = h.services.find((s) => s.name === aiRecommendation.service) ?? h.services[0];
  const avg = getServiceAverage(svc.name);
  const savings = Math.max(avg - svc.price, 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-card p-6 shadow-elevated md:p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-primary-glow/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> AI Recommendation
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
              Smart matches, tailored to your needs.
            </h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              Our AI compares price, rating, distance and availability across every partner hospital so you can decide in seconds.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your query</p>
                  <p className="mt-0.5 text-sm font-medium">"{aiRecommendation.query}"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl border border-border bg-background p-5 shadow-elevated">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Recommended for you
            </div>

            <div className="mt-4 flex gap-4">
              <img src={h.image} alt={h.name} className="h-20 w-20 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold">{h.name}</h3>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {h.city} • {h.distance} km
                  <span className="inline-flex items-center gap-0.5 text-warning">
                    <Star className="h-3.5 w-3.5 fill-current" /> {h.rating}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-primary-soft p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{svc.name}</p>
                <p className="mt-1 text-xl font-bold text-primary">₹{svc.price.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-success/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-success">You save</p>
                <p className="mt-1 text-xl font-bold text-success">₹{savings.toLocaleString()}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">{aiRecommendation.rationale}</p>

            <div className="mt-5 flex gap-2">
              <Button asChild variant="outline" className="flex-1 rounded-full">
                <Link to="/hospitals/$hospitalId" params={{ hospitalId: h.id }}>View details</Link>
              </Button>
              <Button asChild className="flex-1 rounded-full">
                <Link to="/book" search={{ hospital: h.id, service: svc.name }}>
                  Book now <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
