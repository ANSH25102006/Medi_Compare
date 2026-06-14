import { Link } from "@tanstack/react-router";
import { Star, MapPin, Clock, ArrowRight, TrendingDown, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getServiceAverage, type Hospital } from "@/lib/mock-data";

export function HospitalCard({
  hospital,
  serviceName,
}: {
  hospital: Hospital;
  serviceName?: string;
}) {
  const service = serviceName
    ? (hospital.services.find((s) => s.name === serviceName) ?? hospital.services[0])
    : hospital.services[0];
  const avg = getServiceAverage(service.name);
  const savings = Math.max(avg - service.price, 0);
  const isDeal = savings > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-[250ms] ease-out hover:-translate-y-[6px] hover:scale-[1.01] hover:shadow-elevated hover:border-primary/30">
      <div className="relative h-44 overflow-hidden">
        <img
          src={hospital.image}
          alt={hospital.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold shadow-soft backdrop-blur">
          <Star className="h-3 w-3 fill-warning text-warning" />
          {hospital.rating}
          <span className="text-muted-foreground">({hospital.reviews})</span>
        </div>
        {isDeal && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-[11px] font-bold text-success-foreground shadow-[0_4px_12px_rgba(34,197,94,0.3)]">
            <TrendingDown className="h-3 w-3" /> Save ₹{savings.toLocaleString()}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors duration-300">
          {hospital.name}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground/85" />
          {hospital.city} • {hospital.distance} km
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {hospital.specialties.slice(0, 3).map((s) => (
            <Badge key={s} variant="secondary" className="rounded-full font-normal">
              {s}
            </Badge>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-primary-soft/40 border border-primary/5 p-3 shadow-inner dark:bg-primary-soft/5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {service.name}
            </p>
            {isDeal && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success">
                <BadgeCheck className="h-3 w-3" /> Best value
              </span>
            )}
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-2xl font-black text-primary">₹{service.price.toLocaleString()}</p>
            <span className="text-xs text-muted-foreground line-through opacity-80">
              ₹{avg.toLocaleString()} avg
            </span>
          </div>
          {isDeal && (
            <p className="mt-1 text-[11px] font-semibold text-success flex items-center gap-1">
              ✓ ₹{savings.toLocaleString()} cheaper than average
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary/80" />
            {hospital.slots.length} slots today
          </span>
          <span className="font-semibold text-primary">Next: {hospital.slots[0]}</span>
        </div>

        <div className="mt-5 flex gap-2 pt-1">
          <Button asChild variant="outline" className="flex-1 rounded-full">
            <Link to="/hospitals/$hospitalId" params={{ hospitalId: hospital.id }}>
              View Details
            </Link>
          </Button>
          <Button asChild className="flex-1 rounded-full bg-primary-gradient hover:shadow-md">
            <Link to="/book" search={{ hospital: hospital.id, service: service.name }}>
              Book <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
