import { Link } from "@tanstack/react-router";
import { Star, MapPin, Clock, ArrowRight, TrendingDown, BadgeCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getServiceAverage, type Hospital } from "@/lib/mock-data";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function HospitalCard({
  hospital,
  serviceName,
  onSaveToggle,
  onCompareToggle,
}: {
  hospital: Hospital;
  serviceName?: string;
  onSaveToggle?: () => void;
  onCompareToggle?: () => void;
}) {
  const service = serviceName
    ? (hospital.services.find((s) => s.name === serviceName) ?? hospital.services[0])
    : hospital.services[0];
  const avg = getServiceAverage(service.name);
  const savings = Math.max(avg - service.price, 0);
  const isDeal = savings > 0;

  const [isSaved, setIsSaved] = useState(false);
  const [isCompared, setIsCompared] = useState(false);

  useEffect(() => {
    try {
      const savedStored = localStorage.getItem("medicompare_saved_hospitals");
      const savedIds = savedStored ? JSON.parse(savedStored) : [];
      setIsSaved(savedIds.includes(hospital.id));

      const compareStored = localStorage.getItem("medicompare_compared_hospitals");
      const compareIds = compareStored ? JSON.parse(compareStored) : [];
      setIsCompared(compareIds.includes(hospital.id));
    } catch {}
  }, [hospital.id]);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = localStorage.getItem("medicompare_saved_hospitals");
      let ids = stored ? JSON.parse(stored) : [];
      if (ids.includes(hospital.id)) {
        ids = ids.filter((id: string) => id !== hospital.id);
        toast.success("Removed from saved hospitals.");
        setIsSaved(false);
      } else {
        ids.push(hospital.id);
        toast.success("Hospital saved successfully!");
        setIsSaved(true);
      }
      localStorage.setItem("medicompare_saved_hospitals", JSON.stringify(ids));
      onSaveToggle?.();
    } catch {
      toast.error("Failed to save hospital.");
    }
  };

  const handleCompareChange = (checked: boolean) => {
    try {
      const stored = localStorage.getItem("medicompare_compared_hospitals");
      let ids = stored ? JSON.parse(stored) : [];
      if (checked) {
        if (ids.length >= 4) {
          toast.error("You can compare up to 4 hospitals at a time.");
          return;
        }
        if (!ids.includes(hospital.id)) {
          ids.push(hospital.id);
          setIsCompared(true);
          toast.success(`Added ${hospital.name} to comparison.`);
        }
      } else {
        ids = ids.filter((id: string) => id !== hospital.id);
        setIsCompared(false);
        toast.success(`Removed ${hospital.name} from comparison.`);
      }
      localStorage.setItem("medicompare_compared_hospitals", JSON.stringify(ids));
      onCompareToggle?.();
    } catch {
      toast.error("Failed to update comparison.");
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-[250ms] ease-out hover:-translate-y-[6px] hover:scale-[1.01] hover:shadow-elevated hover:border-primary/30">
      <div className="relative h-44 overflow-hidden">
        <img
          src={hospital.image}
          alt={hospital.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Rating Badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold shadow-soft backdrop-blur">
          <Star className="h-3 w-3 fill-warning text-warning" />
          {hospital.rating}
          <span className="text-muted-foreground">({hospital.reviews})</span>
        </div>

        {/* Floating Heart / Bookmark Button */}
        <button
          onClick={handleSaveToggle}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/95 text-muted-foreground shadow-soft transition-all hover:scale-110 active:scale-95 cursor-pointer z-10"
        >
          <Heart className={`h-4.5 w-4.5 ${isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </button>

        {/* Savings Badge */}
        {isDeal && (
          <div className="absolute right-13 top-3.5 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-[11px] font-bold text-success-foreground shadow-[0_4px_12px_rgba(34,197,94,0.3)]">
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

        {/* Compare Checkbox */}
        <div className="mt-4 flex items-center border-t border-border pt-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer select-none">
            <Checkbox checked={isCompared} onCheckedChange={handleCompareChange} />
            <span>Add to Compare</span>
          </label>
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
