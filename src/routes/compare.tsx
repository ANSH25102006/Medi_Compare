import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { HospitalCard } from "@/components/site/HospitalCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hospitals, services } from "@/lib/mock-data";

type SearchParams = { q?: string; city?: string };

export const Route = createFileRoute("/compare")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s.q === "string" ? s.q : "",
    city: typeof s.city === "string" ? s.city : "",
  }),
  head: () => ({
    meta: [
      { title: "Compare Healthcare Providers — MediCompare" },
      { name: "description", content: "Compare hospital pricing, ratings, and availability across India." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { q: initialQ, city: initialCity } = Route.useSearch();
  const [query, setQuery] = useState(initialQ ?? "");
  const [location, setLocation] = useState(initialCity ?? "");
  const [service, setService] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState([10000]);
  const [minRating, setMinRating] = useState([4]);
  const [maxDistance, setMaxDistance] = useState([10]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState("recommended");

  const filtered = useMemo(() => {
    let list = hospitals.filter((h) => {
      if (query && !h.name.toLowerCase().includes(query.toLowerCase()) && !h.specialties.some(s => s.toLowerCase().includes(query.toLowerCase()))) return false;
      if (location && !h.city.toLowerCase().includes(location.toLowerCase())) return false;
      if (h.rating < minRating[0]) return false;
      if (h.distance > maxDistance[0]) return false;
      const svc = service !== "all" ? h.services.find(s => s.name === service) : h.services[0];
      if (service !== "all" && !svc) return false;
      if (svc && svc.price > maxPrice[0]) return false;
      if (availableOnly && h.slots.length < 3) return false;
      return true;
    });

    if (sort === "price") {
      list = [...list].sort((a, b) => a.services[0].price - b.services[0].price);
    } else if (sort === "rating") {
      list = [...list].sort((a, b) => b.rating - a.rating);
    } else if (sort === "distance") {
      list = [...list].sort((a, b) => a.distance - b.distance);
    }
    return list;
  }, [query, location, service, minRating, maxDistance, maxPrice, availableOnly, sort]);

  return (
    <SiteShell>
      <section className="border-b border-border bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold md:text-4xl">Compare Healthcare Providers</h1>
          <p className="mt-2 text-muted-foreground">
            {filtered.length} verified hospitals matching your criteria.
          </p>

          <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-border bg-background/80 p-2 shadow-soft backdrop-blur sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Service, hospital, specialty" className="border-0 shadow-none focus-visible:ring-0" />
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City" className="border-0 shadow-none focus-visible:ring-0" />
            </div>
            <Button className="rounded-xl">Search</Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        {/* Filters */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-20">
          <div className="flex items-center gap-2 pb-4">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Filters</h2>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Service Type</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  {services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <Label className="font-medium uppercase tracking-wide text-muted-foreground">Max Price</Label>
                <span className="font-semibold text-primary">₹{maxPrice[0].toLocaleString()}</span>
              </div>
              <Slider value={maxPrice} onValueChange={setMaxPrice} min={500} max={15000} step={500} className="mt-3" />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <Label className="font-medium uppercase tracking-wide text-muted-foreground">Min Rating</Label>
                <span className="font-semibold text-primary">{minRating[0].toFixed(1)} ★</span>
              </div>
              <Slider value={minRating} onValueChange={setMinRating} min={3} max={5} step={0.1} className="mt-3" />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <Label className="font-medium uppercase tracking-wide text-muted-foreground">Max Distance</Label>
                <span className="font-semibold text-primary">{maxDistance[0]} km</span>
              </div>
              <Slider value={maxDistance} onValueChange={setMaxDistance} min={1} max={20} step={1} className="mt-3" />
            </div>

            <label className="flex items-center gap-2.5 rounded-lg bg-secondary/50 px-3 py-2.5 text-sm">
              <Checkbox checked={availableOnly} onCheckedChange={(v) => setAvailableOnly(!!v)} />
              <span>Available today</span>
            </label>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filtered.length} results</p>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price">Price: low to high</SelectItem>
                <SelectItem value="rating">Highest rated</SelectItem>
                <SelectItem value="distance">Nearest first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
              <p className="text-lg font-semibold">No hospitals match your filters</p>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting the price range or distance.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
              {filtered.map((h) => (
                <HospitalCard key={h.id} hospital={h} serviceName={service !== "all" ? service : undefined} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
