import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, LayoutGrid, Table as TableIcon, TrendingDown } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { HospitalCard } from "@/components/site/HospitalCard";
import { FloatingSearch } from "@/components/site/FloatingSearch";
import { ComparisonTable, buildRows, sortRows, type SortKey } from "@/components/site/ComparisonTable";
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
import { hospitals, services, getServiceAverage } from "@/lib/mock-data";

type SearchParams = { q?: string; city?: string };

export const Route = createFileRoute("/compare")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s.q === "string" ? s.q : "",
    city: typeof s.city === "string" ? s.city : "",
  }),
  head: () => ({
    meta: [
      { title: "Compare Prices — MediCompare" },
      { name: "description", content: "Compare hospital pricing, ratings, distance, and availability side by side." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { q: initialQ, city: initialCity } = Route.useSearch();
  const [query] = useState(initialQ ?? "");
  const [location, setLocation] = useState(initialCity ?? "");
  // Resolve initial service from query (e.g., from popular service link)
  const initialService = useMemo(() => {
    if (!initialQ) return "all";
    const exact = services.find((s) => s.toLowerCase() === initialQ.toLowerCase());
    if (exact) return exact;
    const partial = services.find((s) => s.toLowerCase().includes(initialQ.toLowerCase()));
    return partial ?? "all";
  }, [initialQ]);

  const [service, setService] = useState<string>(initialService);
  const [maxPrice, setMaxPrice] = useState([10000]);
  const [minRating, setMinRating] = useState([4]);
  const [maxDistance, setMaxDistance] = useState([10]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("price");
  const [view, setView] = useState<"table" | "grid">("table");

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      if (query && !h.name.toLowerCase().includes(query.toLowerCase()) && !h.specialties.some((s) => s.toLowerCase().includes(query.toLowerCase()))) return false;
      if (location && !h.city.toLowerCase().includes(location.toLowerCase())) return false;
      if (h.rating < minRating[0]) return false;
      if (h.distance > maxDistance[0]) return false;
      const svc = service !== "all" ? h.services.find((s) => s.name === service) : h.services[0];
      if (service !== "all" && !svc) return false;
      if (svc && svc.price > maxPrice[0]) return false;
      if (availableOnly && h.slots.length < 3) return false;
      return true;
    });
  }, [query, location, service, minRating, maxDistance, maxPrice, availableOnly]);

  const tableRows = useMemo(() => {
    const all = buildRows(service);
    const ids = new Set(filteredHospitals.map((h) => h.id));
    const filtered = all.filter((r) => ids.has(r.hospitalId));
    return sortRows(filtered, sort);
  }, [filteredHospitals, service, sort]);

  const avgPrice = service !== "all" ? getServiceAverage(service) : 0;

  return (
    <SiteShell>
      {/* Hero with floating search */}
      <section className="relative overflow-hidden border-b border-border bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold md:text-4xl">Compare healthcare prices</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {filteredHospitals.length} verified hospitals
            {service !== "all" && avgPrice > 0 && (
              <> • Avg <strong className="text-foreground">₹{avgPrice.toLocaleString()}</strong> for {service}</>
            )}
          </p>
          <div className="mt-6">
            <FloatingSearch />
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
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">City</Label>
              <Select value={location || "all"} onValueChange={(v) => setLocation(v === "all" ? "" : v)}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Any city" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any city</SelectItem>
                  {Array.from(new Set(hospitals.map((h) => h.city))).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
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
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">{tableRows.length} results</p>
              {service !== "all" && tableRows.some((r) => r.savings > 0) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  <TrendingDown className="h-3 w-3" /> Save up to ₹{Math.max(...tableRows.map((r) => r.savings)).toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Lowest Price</SelectItem>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="distance">Nearest</SelectItem>
                  <SelectItem value="earliest">Earliest Appointment</SelectItem>
                </SelectContent>
              </Select>
              <div className="inline-flex rounded-full border border-border bg-card p-0.5">
                <Button size="sm" variant={view === "table" ? "default" : "ghost"} className="rounded-full" onClick={() => setView("table")}>
                  <TableIcon className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant={view === "grid" ? "default" : "ghost"} className="rounded-full" onClick={() => setView("grid")}>
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {view === "table" ? (
            <ComparisonTable rows={tableRows} />
          ) : filteredHospitals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
              <p className="text-lg font-semibold">No hospitals match your filters</p>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting the price range or distance.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
              {filteredHospitals.map((h) => (
                <HospitalCard key={h.id} hospital={h} serviceName={service !== "all" ? service : undefined} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
