import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, MapPin, CalendarDays, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { services, cities } from "@/lib/mock-data";

export function FloatingSearch({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const [service, setService] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/compare", search: { q: service, city } });
      }}
      className={`grid grid-cols-1 items-stretch overflow-hidden rounded-2xl border border-border bg-background/95 shadow-elevated backdrop-blur md:grid-cols-[1.3fr_1fr_1fr_auto] ${className}`}
    >
      <label className="group flex items-center gap-3 border-b border-border px-5 py-3 md:border-b-0 md:border-r">
        <Stethoscope className="h-4 w-4 text-primary" />
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Medical service
          </p>
          <input
            list="fs-services"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="MRI, Blood test, Consult…"
            className="mt-0.5 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <datalist id="fs-services">
            {services.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      </label>

      <label className="group flex items-center gap-3 border-b border-border px-5 py-3 md:border-b-0 md:border-r">
        <MapPin className="h-4 w-4 text-primary" />
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Location
          </p>
          <input
            list="fs-cities"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City or area"
            className="mt-0.5 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <datalist id="fs-cities">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </label>

      <label className="group flex items-center gap-3 border-b border-border px-5 py-3 md:border-b-0 md:border-r">
        <CalendarDays className="h-4 w-4 text-primary" />
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Date
          </p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-0.5 w-full bg-transparent text-sm outline-none"
          />
        </div>
      </label>

      <div className="flex items-center justify-end p-2">
        <Button type="submit" size="lg" className="h-12 w-full gap-2 rounded-xl md:w-auto md:px-6">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </form>
  );
}
