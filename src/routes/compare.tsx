import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  TrendingDown,
  Sparkles,
  Search,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { HospitalCard } from "@/components/site/HospitalCard";
import { FloatingSearch } from "@/components/site/FloatingSearch";
import {
  ComparisonTable,
  buildRows,
  sortRows,
  type SortKey,
} from "@/components/site/ComparisonTable";
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

type SearchParams = {
  q?: string;
  city?: string;
  specialty?: string;
  hospitalType?: string;
  service?: string;
};

export const Route = createFileRoute("/compare")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s.q === "string" ? s.q : "",
    city: typeof s.city === "string" ? s.city : "",
    specialty: typeof s.specialty === "string" ? s.specialty : "",
    hospitalType: typeof s.hospitalType === "string" ? s.hospitalType : "",
    service: typeof s.service === "string" ? s.service : "",
  }),
  head: () => ({
    meta: [
      { title: "Compare Prices — MediCompare" },
      {
        name: "description",
        content: "Compare hospital pricing, ratings, distance, and availability side by side.",
      },
    ],
  }),
  component: ComparePage,
});

const SORT_PILLS: { key: SortKey; label: string }[] = [
  { key: "price", label: "Lowest Price" },
  { key: "rating", label: "Highest Rating" },
  { key: "distance", label: "Nearest" },
  { key: "earliest", label: "Earliest Slot" },
];

function ComparePage() {
  const navigate = useNavigate();
  const {
    q: initialQ,
    city: initialCity,
    specialty: initialSpecialty,
    hospitalType: initialHospitalType,
    service: initialServiceParam,
  } = Route.useSearch();

  const normalizedInitialCity = useMemo(() => {
    if (!initialCity) return "";
    const lower = initialCity.trim().toLowerCase();
    if (lower === "bangalore") return "Bengaluru";
    if (lower === "delhi") return "New Delhi";
    // Check case-insensitively in cities list
    const found = [
      "Bengaluru",
      "Mumbai",
      "New Delhi",
      "Gurugram",
      "Noida",
      "Hyderabad",
      "Chennai",
    ].find((c) => c.toLowerCase() === lower);
    return found ?? initialCity;
  }, [initialCity]);

  const [location, setLocation] = useState(normalizedInitialCity);
  const [specialty, setSpecialty] = useState(initialSpecialty ?? "");
  const [hospitalType, setHospitalType] = useState(initialHospitalType ?? "");

  const initialService = useMemo(() => {
    if (initialServiceParam) return initialServiceParam;
    if (!initialQ) return "all";
    const exact = services.find((s) => s.toLowerCase() === initialQ.toLowerCase());
    if (exact) return exact;
    const partial = services.find(
      (s) =>
        s.toLowerCase().includes(initialQ.toLowerCase()) ||
        initialQ.toLowerCase().includes(s.toLowerCase()),
    );
    return partial ?? "all";
  }, [initialQ, initialServiceParam]);

  const [service, setService] = useState<string>(initialService);

  useEffect(() => {
    setLocation(normalizedInitialCity);
  }, [normalizedInitialCity]);

  useEffect(() => {
    setService(initialService);
  }, [initialService]);

  useEffect(() => {
    setSpecialty(initialSpecialty ?? "");
  }, [initialSpecialty]);

  useEffect(() => {
    setHospitalType(initialHospitalType ?? "");
  }, [initialHospitalType]);

  const [maxPrice, setMaxPrice] = useState([12000]);
  const [minRating, setMinRating] = useState([3.5]);
  const [maxDistance, setMaxDistance] = useState([10]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("price");
  const [view, setView] = useState<"table" | "grid">("table");

  const allSpecialties = useMemo(() => {
    return Array.from(new Set(hospitals.flatMap((h) => h.specialties)));
  }, []);

  const allHospitalTypes = useMemo(() => {
    return Array.from(new Set(hospitals.map((h) => h.type).filter(Boolean)));
  }, []);

  const filteredHospitals = useMemo(() => {
    console.log("[DEBUG] Starting hospital filter with parameters:", {
      initialQ,
      location,
      specialty,
      hospitalType,
      service,
      minRating: minRating[0],
      maxDistance: maxDistance[0],
      maxPrice: maxPrice[0],
      availableOnly,
    });

    return hospitals.filter((h) => {
      // 1. Search Query Matching (q)
      if (initialQ) {
        const qLower = initialQ.toLowerCase();
        const matchesName = h.name.toLowerCase().includes(qLower);
        const matchesSpecialty = h.specialties.some((s) => s.toLowerCase().includes(qLower));
        const matchesDoctor = h.doctors.some((d) => d.name.toLowerCase().includes(qLower));
        const matchesService = h.services.some((s) => s.name.toLowerCase().includes(qLower));

        if (!matchesName && !matchesSpecialty && !matchesDoctor && !matchesService) {
          console.log(
            `[DEBUG] Hospital "${h.name}" EXCLUDED: does not match search query "${initialQ}"`,
          );
          return false;
        }
      }

      // 2. City Matching
      if (location) {
        const locLower = location.toLowerCase();
        const hospitalCityLower = h.city.toLowerCase();

        const isMatch =
          hospitalCityLower.includes(locLower) ||
          locLower.includes(hospitalCityLower) ||
          (locLower === "bangalore" && hospitalCityLower === "bengaluru") ||
          (locLower === "bengaluru" && hospitalCityLower === "bangalore") ||
          (locLower === "delhi" && hospitalCityLower === "new delhi") ||
          (locLower === "new delhi" && hospitalCityLower === "delhi");

        if (!isMatch) {
          console.log(
            `[DEBUG] Hospital "${h.name}" EXCLUDED: city "${h.city}" does not match location filter "${location}"`,
          );
          return false;
        }
      }

      // 3. Specialty Matching
      if (specialty) {
        const matchesSpecialty = h.specialties.some(
          (s) => s.toLowerCase() === specialty.toLowerCase(),
        );
        if (!matchesSpecialty) {
          console.log(
            `[DEBUG] Hospital "${h.name}" EXCLUDED: does not match specialty filter "${specialty}"`,
          );
          return false;
        }
      }

      // 4. Hospital Type Matching
      if (hospitalType) {
        if (h.type.toLowerCase() !== hospitalType.toLowerCase()) {
          console.log(
            `[DEBUG] Hospital "${h.name}" EXCLUDED: hospital type "${h.type}" does not match type filter "${hospitalType}"`,
          );
          return false;
        }
      }

      // 5. Min Rating matching
      if (h.rating < minRating[0]) {
        console.log(
          `[DEBUG] Hospital "${h.name}" EXCLUDED: rating ${h.rating} is below min rating ${minRating[0]}`,
        );
        return false;
      }

      // 6. Max Distance matching
      if (h.distance > maxDistance[0]) {
        console.log(
          `[DEBUG] Hospital "${h.name}" EXCLUDED: distance ${h.distance}km is above max distance ${maxDistance[0]}km`,
        );
        return false;
      }

      // 7. Service matching and Max Price matching
      const svc = service !== "all" ? h.services.find((s) => s.name === service) : h.services[0];
      if (service !== "all" && !svc) {
        console.log(`[DEBUG] Hospital "${h.name}" EXCLUDED: does not offer service "${service}"`);
        return false;
      }

      if (svc && svc.price > maxPrice[0]) {
        console.log(
          `[DEBUG] Hospital "${h.name}" EXCLUDED: service price ₹${svc.price} is above max price ₹${maxPrice[0]}`,
        );
        return false;
      }

      // 8. Availability matching
      if (availableOnly && h.slots.length < 3) {
        console.log(
          `[DEBUG] Hospital "${h.name}" EXCLUDED: has fewer than 3 slots (${h.slots.length}) but available today only is enabled`,
        );
        return false;
      }

      console.log(`[DEBUG] Hospital "${h.name}" PASSED all filters!`);
      return true;
    });
  }, [
    initialQ,
    location,
    specialty,
    hospitalType,
    service,
    minRating,
    maxDistance,
    maxPrice,
    availableOnly,
  ]);

  const tableRows = useMemo(() => {
    const all = buildRows(service);
    const ids = new Set(filteredHospitals.map((h) => h.id));
    const filtered = all.filter((r) => ids.has(r.hospitalId));
    return sortRows(filtered, sort);
  }, [filteredHospitals, service, sort]);

  const avgPrice = service !== "all" ? getServiceAverage(service) : 0;
  const maxSavings = tableRows.length > 0 ? Math.max(...tableRows.map((r) => r.savings)) : 0;

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-hero-gradient">
        <div className="absolute inset-0 -z-0 opacity-30 [background:radial-gradient(50%_40%_at_70%_30%,oklch(0.80_0.10_250/.5),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold md:text-4xl">Compare Healthcare Prices</h1>
            <p className="mt-2 text-muted-foreground">
              {filteredHospitals.length} verified hospitals
              {service !== "all" && avgPrice > 0 && (
                <>
                  {" "}
                  · Avg price{" "}
                  <strong className="text-foreground">₹{avgPrice.toLocaleString()}</strong> for{" "}
                  {service}
                </>
              )}
            </p>
          </div>
          <FloatingSearch />
        </div>
      </section>

      {/* Savings banner */}
      {maxSavings > 500 && (
        <div className="bg-success/5 border-b border-success/15">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
              <TrendingDown className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-success">
              Save up to <span className="text-lg">₹{maxSavings.toLocaleString()}</span> compared to
              average prices — comparison shopping pays off!
            </p>
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Prices verified monthly
            </span>
          </div>
        </div>
      )}

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[270px_1fr] lg:px-8">
        {/* Filters sidebar */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-20">
          <div className="flex items-center gap-2 pb-5 border-b border-border">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wide">Filters</h2>
          </div>

          <div className="mt-5 space-y-6">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Popular Scans & Tests
              </Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["MRI Scan", "CT Scan", "Ultrasound", "Full Body Checkup"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setService(tag);
                      navigate({ to: "/compare", search: { q: tag, city: location } });
                    }}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border transition-all ${
                      service === tag
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary text-muted-foreground border-transparent hover:bg-primary-soft hover:text-primary hover:border-primary/20"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Service Type
              </Label>
              <Select
                value={service}
                onValueChange={(v) => {
                  setService(v);
                  navigate({
                    to: "/compare",
                    search: (prev) => ({ ...prev, service: v }),
                  });
                }}
              >
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  {services.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                City
              </Label>
              <Select
                value={location || "all"}
                onValueChange={(v) => {
                  const val = v === "all" ? "" : v;
                  setLocation(val);
                  navigate({
                    to: "/compare",
                    search: (prev) => ({ ...prev, city: val }),
                  });
                }}
              >
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue placeholder="Any city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any city</SelectItem>
                  {Array.from(new Set(hospitals.map((h) => h.city))).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Specialty
              </Label>
              <Select
                value={specialty || "all"}
                onValueChange={(v) => {
                  const val = v === "all" ? "" : v;
                  setSpecialty(val);
                  navigate({
                    to: "/compare",
                    search: (prev) => ({ ...prev, specialty: val }),
                  });
                }}
              >
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue placeholder="Any specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any specialty</SelectItem>
                  {allSpecialties.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Hospital Type
              </Label>
              <Select
                value={hospitalType || "all"}
                onValueChange={(v) => {
                  const val = v === "all" ? "" : v;
                  setHospitalType(val);
                  navigate({
                    to: "/compare",
                    search: (prev) => ({ ...prev, hospitalType: val }),
                  });
                }}
              >
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any type</SelectItem>
                  {allHospitalTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <Label className="font-bold uppercase tracking-wide text-muted-foreground">
                  Max Price
                </Label>
                <span className="font-bold text-primary">₹{maxPrice[0].toLocaleString()}</span>
              </div>
              <Slider
                value={maxPrice}
                onValueChange={setMaxPrice}
                min={500}
                max={15000}
                step={500}
              />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                <span>₹500</span>
                <span>₹15,000</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <Label className="font-bold uppercase tracking-wide text-muted-foreground">
                  Min Rating
                </Label>
                <span className="font-bold text-primary">{minRating[0].toFixed(1)} ★</span>
              </div>
              <Slider value={minRating} onValueChange={setMinRating} min={3} max={5} step={0.1} />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                <span>3.0</span>
                <span>5.0</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <Label className="font-bold uppercase tracking-wide text-muted-foreground">
                  Max Distance
                </Label>
                <span className="font-bold text-primary">{maxDistance[0]} km</span>
              </div>
              <Slider
                value={maxDistance}
                onValueChange={setMaxDistance}
                min={1}
                max={20}
                step={1}
              />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                <span>1 km</span>
                <span>20 km</span>
              </div>
            </div>

            <label className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary/40 px-3 py-3 text-sm cursor-pointer hover:bg-secondary transition-colors">
              <Checkbox checked={availableOnly} onCheckedChange={(v) => setAvailableOnly(!!v)} />
              <span className="font-medium">Available today only</span>
            </label>

            <Button
              variant="outline"
              className="w-full rounded-xl text-xs font-semibold"
              onClick={() => {
                setService("all");
                setLocation("");
                setSpecialty("");
                setHospitalType("");
                setMaxPrice([12000]);
                setMinRating([3.5]);
                setMaxDistance([10]);
                setAvailableOnly(false);
                navigate({
                  to: "/compare",
                  search: { q: "", city: "", specialty: "", hospitalType: "", service: "" },
                });
              }}
            >
              Reset filters
            </Button>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-muted-foreground font-medium">
                {tableRows.length} results
              </p>

              {/* Sort pills */}
              <div className="flex flex-wrap gap-1.5">
                {SORT_PILLS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setSort(p.key)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      sort === p.key
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "bg-secondary text-muted-foreground hover:bg-primary-soft hover:text-primary"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* View toggle */}
            <div className="inline-flex rounded-full border border-border bg-card p-0.5">
              <Button
                size="sm"
                variant={view === "table" ? "default" : "ghost"}
                className="rounded-full"
                onClick={() => setView("table")}
              >
                <TableIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant={view === "grid" ? "default" : "ghost"}
                className="rounded-full"
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {tableRows.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center max-w-lg mx-auto shadow-soft mt-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary dark:bg-primary-soft/10">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground">No matches found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We couldn't find any medical services matching your criteria in{" "}
                <strong className="text-foreground">{location || "any city"}</strong>.
              </p>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
                  Try popular services:
                </p>
                <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                  {["MRI Scan", "Full Body Checkup", "Ultrasound", "CT Scan", "Consultation"].map(
                    (term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setService(term);
                          navigate({
                            to: "/compare",
                            search: { q: term, city: location },
                          });
                        }}
                        className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary transition-all duration-300"
                      >
                        {term}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl px-5"
                  onClick={() => {
                    setService("all");
                    setLocation("");
                    setSpecialty("");
                    setHospitalType("");
                    setMaxPrice([12000]);
                    setMinRating([3.5]);
                    setMaxDistance([10]);
                    setAvailableOnly(false);
                    navigate({
                      to: "/compare",
                      search: { q: "", city: "", specialty: "", hospitalType: "", service: "" },
                    });
                  }}
                >
                  Reset all filters
                </Button>
              </div>
            </div>
          ) : view === "table" ? (
            <ComparisonTable rows={tableRows} sort={sort} onSort={setSort} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredHospitals.map((h) => (
                <HospitalCard
                  key={h.id}
                  hospital={h}
                  serviceName={service !== "all" ? service : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
