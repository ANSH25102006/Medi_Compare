import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  TrendingDown,
  Sparkles,
  Search,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  BadgeCheck,
  X,
  Trash2,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { HospitalCard } from "@/components/site/HospitalCard";
import { FloatingSearch } from "@/components/site/FloatingSearch";
import { getItemSafe, setItemSafe } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  services,
  getServiceAverage,
  getReviewsForHospital,
  getHospitalRatingDetails,
  type Hospital,
} from "@/lib/mock-data";
import { useHospitals, useProcedures } from "@/hooks/use-hospitals";
import { useAuth } from "@/lib/auth";
import { CardSkeleton, TableSkeleton, Skeleton } from "@/components/site/SkeletonLoader";
import { toast } from "sonner";

type SearchParams = {
  q?: string;
  city?: string;
  specialty?: string;
  hospitalType?: string;
  service?: string;
  maxPrice?: number;
  minRating?: number;
  maxDistance?: number;
  availableOnly?: boolean | string;
};

export const Route = createFileRoute("/compare")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s.q === "string" ? s.q : "",
    city: typeof s.city === "string" ? s.city : "",
    specialty: typeof s.specialty === "string" ? s.specialty : "",
    hospitalType: typeof s.hospitalType === "string" ? s.hospitalType : "",
    service: typeof s.service === "string" ? s.service : "all",
    maxPrice: typeof s.maxPrice === "number" ? s.maxPrice : 15000,
    minRating: typeof s.minRating === "number" ? s.minRating : 3.0,
    maxDistance: typeof s.maxDistance === "number" ? s.maxDistance : 20,
    availableOnly: s.availableOnly === true || s.availableOnly === "true",
  }),
  component: ComparePage,
});

const SORT_PILLS: { key: SortKey; label: string }[] = [
  { key: "price", label: "Lowest Price" },
  { key: "rating", label: "Highest Rating" },
  { key: "distance", label: "Nearest" },
  { key: "earliest", label: "Earliest Slot" },
];

const getAffordabilityScore = (price: number, maxPrice: number, minPrice: number) => {
  if (maxPrice === minPrice) return 100;
  return Math.round(((maxPrice - price) / (maxPrice - minPrice)) * 100);
};

const getFacilities = (hospital: Hospital) => {
  const facilitiesList: Record<string, string[]> = {
    "apollo-central": ["24/7 Emergency", "ICU", "Pharmacy", "NABL Accredited", "Ambulance"],
    "fortis-greens": ["24/7 Emergency", "ICU", "Diagnostics", "NABL Accredited", "Parking"],
    "max-superspecialty": ["24/7 Emergency", "ICU", "Organ Transplant", "Blood Bank", "Ambulance"],
    "manipal-city": ["ICU", "Pharmacy", "Diagnostics", "Parking", "Cafeteria"],
    kokilaben: ["24/7 Emergency", "ICU", "Robotic Surgery", "Blood Bank", "Ambulance"],
    medanta: ["24/7 Emergency", "ICU", "Blood Bank", "Ambulance", "Helipad"],
    "apollo-chennai": ["24/7 Emergency", "ICU", "NABL Accredited", "Pharmacy", "Parking"],
    "fortis-malar-chennai": ["ICU", "Pharmacy", "Diagnostics", "Ambulance", "Cafeteria"],
    "care-hyderabad": ["24/7 Emergency", "ICU", "Pharmacy", "NABL Accredited", "Ambulance"],
    "continental-hyderabad": ["24/7 Emergency", "ICU", "Blood Bank", "Diagnostics", "Parking"],
    "fortis-bangalore": ["24/7 Emergency", "ICU", "Blood Bank", "Ambulance", "NABL Accredited"],
  };
  return facilitiesList[hospital.id] || ["ICU", "Diagnostics", "Pharmacy"];
};

const getWaitTime = (hospital: Hospital) => {
  const slotsCount = hospital.slots.length;
  if (slotsCount >= 6) return "1 hr";
  if (slotsCount >= 5) return "2 hrs";
  if (slotsCount >= 4) return "3 hrs";
  return "4+ hrs";
};

function ComparePage() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      toast.error("Please sign in to view the comparison page.");
      navigate({ to: "/login", search: { redirect: "/compare" } });
    }
  }, [isLoggedIn, loading, navigate]);

  const {
    q = "",
    city = "",
    specialty = "",
    hospitalType = "",
    service = "all",
    maxPrice = 15000,
    minRating = 3.0,
    maxDistance = 20,
    availableOnly = false,
  } = searchParams;

  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localMinRating, setLocalMinRating] = useState(minRating);
  const [localMaxDistance, setLocalMaxDistance] = useState(maxDistance);
  const [sort, setSort] = useState<SortKey>("price");
  const [view, setView] = useState<"table" | "grid">("table");
  const [isSimulatingLoading, setIsSimulatingLoading] = useState(false);
  const [dbReviews, setDbReviews] = useState<any[]>([]);

  const {
    data: hospitalsList = [],
    isLoading: isHospitalsLoading,
    error: hospitalsError,
  } = useHospitals();

  const { data: dbProcedures = [], isLoading: isProceduresLoading } = useProcedures();

  const servicesList = useMemo(() => {
    if (dbProcedures.length > 0) {
      return dbProcedures.map((p) => p.name);
    }
    return services;
  }, [dbProcedures]);

  useEffect(() => {
    async function loadAllReviews() {
      try {
        const { data, error } = await supabase.from("reviews").select("*");
        if (error) throw error;
        setDbReviews(data || []);
      } catch (err) {
        console.warn("Failed to load reviews from Supabase for comparison ratings:", err);
        const local = getItemSafe<any[]>("medicompare_reviews", []);
        setDbReviews(local);
      }
    }
    loadAllReviews();
  }, []);

  // Sync sliders locally with query params
  useEffect(() => {
    setLocalMaxPrice(maxPrice);
  }, [maxPrice]);

  useEffect(() => {
    setLocalMinRating(minRating);
  }, [minRating]);

  useEffect(() => {
    setLocalMaxDistance(maxDistance);
  }, [maxDistance]);

  // Trigger loading when any filter or query changes
  useEffect(() => {
    setIsSimulatingLoading(true);
    const timer = setTimeout(() => {
      setIsSimulatingLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [q, city, specialty, hospitalType, service, maxPrice, minRating, maxDistance, availableOnly]);

  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [showCompareView, setShowCompareView] = useState(false);

  const loadCompared = () => {
    setComparedIds(getItemSafe<string[]>("medicompare_compared_hospitals", []));
  };

  useEffect(() => {
    loadCompared();
  }, []);

  const updateSearch = (newParams: Partial<SearchParams>) => {
    navigate({
      to: "/compare",
      search: (prev) => {
        const next = { ...prev, ...newParams };
        if (next.q === "") delete next.q;
        if (next.city === "") delete next.city;
        if (next.specialty === "") delete next.specialty;
        if (next.hospitalType === "") delete next.hospitalType;
        if (next.service === "all") delete next.service;
        if (next.maxPrice === 15000) delete next.maxPrice;
        if (next.minRating === 3.0) delete next.minRating;
        if (next.maxDistance === 20) delete next.maxDistance;
        if (!next.availableOnly) delete next.availableOnly;
        return next;
      },
    });
  };

  const handleCardCompareToggle = () => {
    loadCompared();
  };

  const clearComparison = () => {
    try {
      setItemSafe("medicompare_compared_hospitals", []);
      setComparedIds([]);
      setShowCompareView(false);
      toast.success("Comparison cleared.");
    } catch {
      // ignore storage access errors
    }
  };

  const removeComparedId = (id: string) => {
    try {
      const updated = comparedIds.filter((x) => x !== id);
      setItemSafe("medicompare_compared_hospitals", updated);
      setComparedIds(updated);
      if (updated.length < 2) {
        setShowCompareView(false);
      }
      toast.success("Hospital removed from comparison.");
    } catch {
      // ignore storage access errors
    }
  };

  const allSpecialties = useMemo(() => {
    return Array.from(new Set(hospitalsList.flatMap((h) => h.specialties)));
  }, [hospitalsList]);

  const allHospitalTypes = useMemo(() => {
    return Array.from(new Set(hospitalsList.map((h) => h.type).filter(Boolean)));
  }, [hospitalsList]);

  // Filter logic
  const filteredHospitals = useMemo(() => {
    return hospitalsList
      .map((h) => {
        const customReviews = dbReviews.filter(
          (r) => r.hospital_id === h.id || r.hospitalId === h.id || r.hospitalName === h.name,
        );
        const N_0 = h.reviews;
        const R_0 = h.rating;
        const N_custom = customReviews.length;
        const sum_custom = customReviews.reduce((sum, r) => sum + (r.rating || 0), 0);

        const totalReviews = N_0 + N_custom;
        const averageRating =
          totalReviews > 0 ? Math.round(((R_0 * N_0 + sum_custom) / totalReviews) * 10) / 10 : R_0;

        return {
          ...h,
          rating: averageRating,
          reviews: totalReviews,
        };
      })
      .filter((h) => {
        // 1. Search Query Matching (Name, treatment, specialties, reviews)
        if (q) {
          const qLower = q.toLowerCase();
          const matchesName = h.name.toLowerCase().includes(qLower);
          const matchesSpecialty = h.specialties.some((s) => s.toLowerCase().includes(qLower));
          const matchesDoctor = h.doctors.some((d) => d.name.toLowerCase().includes(qLower));
          const matchesService = h.services.some((s) => s.name.toLowerCase().includes(qLower));
          const matchesCity = h.city.toLowerCase().includes(qLower);

          const reviewsList = getReviewsForHospital(h.id);
          const matchesReview = reviewsList.some((r) => r.text.toLowerCase().includes(qLower));

          if (
            !matchesName &&
            !matchesSpecialty &&
            !matchesDoctor &&
            !matchesService &&
            !matchesCity &&
            !matchesReview
          ) {
            return false;
          }
        }

        // 2. City Matching
        if (city) {
          const locLower = city.toLowerCase();
          const hospitalCityLower = h.city.toLowerCase();

          const isMatch =
            hospitalCityLower.includes(locLower) ||
            locLower.includes(hospitalCityLower) ||
            (locLower === "bangalore" && hospitalCityLower === "bengaluru") ||
            (locLower === "bengaluru" && hospitalCityLower === "bangalore") ||
            (locLower === "delhi" && hospitalCityLower === "new delhi") ||
            (locLower === "new delhi" && hospitalCityLower === "delhi");

          if (!isMatch) return false;
        }

        // 3. Specialty Matching
        if (specialty) {
          const matchesSpecialty = h.specialties.some(
            (s) => s.toLowerCase() === specialty.toLowerCase(),
          );
          if (!matchesSpecialty) return false;
        }

        // 4. Hospital Type Matching
        if (hospitalType) {
          if (h.type.toLowerCase() !== hospitalType.toLowerCase()) return false;
        }

        // 5. Min Rating Matching
        if (h.rating < minRating) return false;

        // 6. Max Distance Matching
        if (h.distance > maxDistance) return false;

        // 7. Service matching and Max Price matching
        const svc = service !== "all" ? h.services.find((s) => s.name === service) : h.services[0];
        if (service !== "all" && !svc) return false;

        if (svc && svc.price > maxPrice) return false;

        // 8. Availability matching
        if (availableOnly && h.slots.length < 3) return false;

        return true;
      });
  }, [
    q,
    city,
    specialty,
    hospitalType,
    service,
    minRating,
    maxDistance,
    maxPrice,
    availableOnly,
    dbReviews,
  ]);

  const tableRows = useMemo(() => {
    const all = buildRows(service, hospitalsList);
    const ids = new Set(filteredHospitals.map((h) => h.id));
    const filtered = all.filter((r) => ids.has(r.hospitalId));
    return sortRows(filtered, sort);
  }, [filteredHospitals, hospitalsList, service, sort]);

  const avgPrice = service !== "all" ? getServiceAverage(service, hospitalsList) : 0;
  const maxSavings = tableRows.length > 0 ? Math.max(...tableRows.map((r) => r.savings)) : 0;

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (city) count++;
    if (specialty) count++;
    if (hospitalType) count++;
    if (service !== "all") count++;
    if (maxPrice < 15000) count++;
    if (minRating > 3.0) count++;
    if (maxDistance < 20) count++;
    if (availableOnly) count++;
    return count;
  }, [city, specialty, hospitalType, service, maxPrice, minRating, maxDistance, availableOnly]);

  // Comparison logic data calculation
  const comparedHospitals = useMemo(() => {
    return hospitalsList.filter((h) => comparedIds.includes(h.id));
  }, [comparedIds, hospitalsList]);

  const comparisonData = useMemo(() => {
    if (comparedHospitals.length < 2) return [];

    const prices = comparedHospitals.map((h) => {
      const s = service !== "all" ? h.services.find((x) => x.name === service) : h.services[0];
      return s?.price ?? 0;
    });
    const maxP = Math.max(...prices);
    const minP = Math.min(...prices);

    const scored = comparedHospitals.map((h) => {
      const s = service !== "all" ? h.services.find((x) => x.name === service) : h.services[0];
      const price = s?.price ?? 0;

      const ratingScore = Math.max(0, Math.min(100, ((h.rating - 3) / 2) * 100));
      const affordabilityScore = getAffordabilityScore(price, maxP, minP);

      const facilities = getFacilities(h);
      const facilitiesScore = Math.min(100, (facilities.length / 5) * 100);

      const slotsCount = h.slots.length;
      const waitTimeScore = Math.min(100, (slotsCount / 6) * 100);

      const overallScore = Math.round(
        0.4 * ratingScore + 0.3 * affordabilityScore + 0.2 * facilitiesScore + 0.1 * waitTimeScore,
      );

      return {
        hospital: h,
        price,
        serviceName: s?.name ?? "General Service",
        rating: h.rating,
        reviews: h.reviews,
        distance: h.distance,
        city: h.city,
        address: h.address,
        slots: h.slots,
        facilities,
        specialties: h.specialties,
        overallScore,
      };
    });

    const highestRating = Math.max(...scored.map((s) => s.rating));
    const lowestPrice = Math.min(...scored.map((s) => s.price));
    const highestScore = Math.max(...scored.map((s) => s.overallScore));

    return scored.map((s) => {
      const isHighestRated = s.rating === highestRating;
      const isCheapest = s.price === lowestPrice;
      const isBestValue = s.overallScore === highestScore;

      return {
        ...s,
        isHighestRated,
        isCheapest,
        isBestValue,
      };
    });
  }, [comparedHospitals, service]);

  if (loading) {
    return (
      <SiteShell>
        <section className="border-b border-border bg-hero-gradient py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
            <Skeleton className="h-8 w-1/3 rounded-xl animate-pulse" />
            <Skeleton className="h-4 w-1/4 rounded-md animate-pulse" />
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar filter skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-2xl animate-pulse" />
              <Skeleton className="h-72 w-full rounded-2xl animate-pulse" />
            </div>
            {/* Main content skeleton */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48 rounded-lg animate-pulse" />
                <Skeleton className="h-8 w-24 rounded-lg animate-pulse" />
              </div>
              <TableSkeleton />
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-hero-gradient">
        <div className="absolute inset-0 z-0 opacity-[0.02] bg-[linear-gradient(to_right,oklch(0.55_0.22_260)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.55_0.22_260)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
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
      {maxSavings > 500 && !showCompareView && (
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

      {showCompareView ? (
        /* Side by side comparison view */
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 rounded-full text-primary"
                onClick={() => setShowCompareView(false)}
              >
                ← Back to list
              </Button>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">Side-by-Side Comparison</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Comparing {comparedHospitals.length} hospitals for{" "}
                {service === "all" ? "General Services" : service}
              </p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={clearComparison}>
              Clear comparison
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-[200px_1fr]">
            {/* Left labels column on large screens */}
            <div className="hidden md:flex flex-col pt-[180px] space-y-[92px] text-xs font-bold uppercase tracking-wider text-muted-foreground select-none">
              <div>Overall Score</div>
              <div>Price</div>
              <div>Ratings</div>
              <div>Location</div>
              <div>Wait Time</div>
              <div>Facilities</div>
              <div>Specialties</div>
            </div>

            {/* Side by side columns */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {comparisonData.map(
                ({
                  hospital: h,
                  price,
                  serviceName,
                  rating,
                  reviews,
                  distance,
                  city,
                  address,
                  slots,
                  facilities,
                  specialties,
                  overallScore,
                  isHighestRated,
                  isCheapest,
                  isBestValue,
                }) => (
                  <div
                    key={h.id}
                    className="rounded-2xl border border-border/40 bg-card/65 p-6 shadow-sm backdrop-blur-md relative flex flex-col justify-between hover:border-primary/20 transition-all duration-300 max-h-[900px] overflow-y-auto scrollbar-thin"
                  >
                    <div className="sticky top-0 bg-card/90 backdrop-blur-md z-30 pb-4 border-b border-border/40 -mx-6 px-6 -mt-6 pt-6">
                      <button
                        onClick={() => removeComparedId(h.id)}
                        className="absolute top-6 right-6 flex h-7 w-7 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer border border-border/35 z-40"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      <img
                        src={h.image}
                        alt={h.name}
                        className="h-28 w-full rounded-xl object-cover mb-4 ring-1 ring-border/50 shadow-sm"
                      />
                      <h3 className="font-bold text-sm text-foreground truncate pr-8">{h.name}</h3>
                      <p className="text-[11px] text-muted-foreground/80 font-medium mt-0.5">{h.type}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5 h-6">
                        {isBestValue && (
                          <span className="inline-flex items-center rounded-full bg-primary/8 border border-primary/15 px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wide">
                            Best Value
                          </span>
                        )}
                        {isCheapest && (
                          <span className="inline-flex items-center rounded-full bg-success/8 border border-success/15 px-2 py-0.5 text-[9px] font-bold text-success uppercase tracking-wide">
                            Cheapest
                          </span>
                        )}
                        {isHighestRated && (
                          <span className="inline-flex items-center rounded-full bg-amber-500/8 border border-amber-500/15 px-2 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wide">
                            Top Rated
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Attributes */}
                    <div className="py-4 space-y-6 flex-1 text-sm">
                      {/* Overall Score */}
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:hidden mb-1">
                          Overall Score
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-foreground">
                            {overallScore}%
                          </span>
                          <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${overallScore}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Price & Savings Progress Bar */}
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:hidden mb-1">
                          Price
                        </span>
                        <div className="flex items-baseline justify-between">
                          <p className="text-2.5xl font-black text-primary">
                            ₹{price.toLocaleString()}
                          </p>
                          {avgPrice > 0 && price < avgPrice && (
                            <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20 animate-pulse">
                              -{Math.round(((avgPrice - price) / avgPrice) * 100)}% Saved
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {serviceName}
                        </span>

                        {/* Elegant Progress Bar Visualization */}
                        {avgPrice > 0 && (
                          <div className="mt-3.5 space-y-1.5">
                            <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden dark:bg-secondary/40">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  price < avgPrice
                                    ? "bg-success"
                                    : price === avgPrice
                                      ? "bg-primary"
                                      : "bg-destructive/80"
                                }`}
                                style={{ width: `${Math.min(100, (price / avgPrice) * 100)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                              <span>₹{price.toLocaleString()}</span>
                              <span className="text-[9px] uppercase tracking-wider">
                                Avg: ₹{avgPrice.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ratings */}
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:hidden mb-1">
                          Ratings
                        </span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          {rating}
                          <span className="text-xs text-muted-foreground font-medium">
                            ({reviews} reviews)
                          </span>
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:hidden mb-1">
                          Location
                        </span>
                        <p className="font-semibold text-foreground truncate">{city}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {address} ({distance} km)
                        </p>
                      </div>

                      {/* Wait Time */}
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:hidden mb-1">
                          Wait Time
                        </span>
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-primary" /> {getWaitTime(h)} avg wait
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {slots.length} slots available today
                        </span>
                      </div>

                      {/* Facilities */}
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:hidden mb-1">
                          Facilities
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {facilities.slice(0, 3).map((f) => (
                            <Badge
                              key={f}
                              variant="secondary"
                              className="rounded-full text-[10px] font-medium"
                            >
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Specialties */}
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:hidden mb-1">
                          Specialties
                        </span>
                        <p className="text-xs text-muted-foreground truncate">
                          {specialties.join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border mt-auto">
                      <Button asChild className="w-full rounded-full bg-primary">
                        <Link to="/book" search={{ hospital: h.id, service: serviceName }}>
                          Book Appointment
                        </Link>
                      </Button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      ) : (
        /* Normal listing and filter views */
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[270px_1fr] lg:px-8">
          {/* Filters sidebar */}
          <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-20">
            <div className="flex items-center gap-2 pb-5 border-b border-border">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                        updateSearch({ service: tag, q: tag });
                      }}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border transition-all cursor-pointer ${
                        service === tag
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary text-muted-foreground border-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/20"
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
                    updateSearch({ service: v });
                  }}
                >
                  <SelectTrigger className="mt-2 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All services</SelectItem>
                    {servicesList.map((s) => (
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
                  value={city || "all"}
                  onValueChange={(v) => {
                    const val = v === "all" ? "" : v;
                    updateSearch({ city: val });
                  }}
                >
                  <SelectTrigger className="mt-2 rounded-xl">
                    <SelectValue placeholder="Any city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any city</SelectItem>
                    {Array.from(new Set(hospitalsList.map((h) => h.city))).map((c) => (
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
                    updateSearch({ specialty: val });
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
                    updateSearch({ hospitalType: val });
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
                  <span className="font-bold text-primary">₹{localMaxPrice.toLocaleString()}</span>
                </div>
                <Slider
                  value={[localMaxPrice]}
                  onValueChange={(val) => setLocalMaxPrice(val[0])}
                  onValueCommit={(val) => updateSearch({ maxPrice: val[0] })}
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
                  <span className="font-bold text-primary">{localMinRating.toFixed(1)} ★</span>
                </div>
                <Slider
                  value={[localMinRating]}
                  onValueChange={(val) => setLocalMinRating(val[0])}
                  onValueCommit={(val) => updateSearch({ minRating: val[0] })}
                  min={3}
                  max={5}
                  step={0.1}
                />
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
                  <span className="font-bold text-primary">{localMaxDistance} km</span>
                </div>
                <Slider
                  value={[localMaxDistance]}
                  onValueChange={(val) => setLocalMaxDistance(val[0])}
                  onValueCommit={(val) => updateSearch({ maxDistance: val[0] })}
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
                <Checkbox
                  checked={availableOnly === true || availableOnly === "true"}
                  onCheckedChange={(v) => updateSearch({ availableOnly: !!v })}
                />
                <span className="font-medium">Available today only</span>
              </label>

              <Button
                variant="outline"
                className="w-full rounded-xl text-xs font-semibold"
                onClick={() => {
                  updateSearch({
                    q: "",
                    city: "",
                    specialty: "",
                    hospitalType: "",
                    service: "all",
                    maxPrice: 15000,
                    minRating: 3.0,
                    maxDistance: 20,
                    availableOnly: false,
                  });
                }}
              >
                Reset filters
              </Button>
            </div>
          </aside>

          {/* Results */}
          <div>
            {/* Active filter badges */}
            {activeFiltersCount > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-secondary/20 px-4 py-3">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground mr-1">
                  Active Filters ({activeFiltersCount}):
                </span>
                {service !== "all" && (
                  <Badge variant="outline" className="gap-1 rounded-full pl-3 pr-2.5 py-1 text-xs">
                    Service: {service}
                    <button
                      onClick={() => updateSearch({ service: "all" })}
                      className="text-muted-foreground hover:text-foreground font-bold hover:scale-110 ml-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {city && (
                  <Badge variant="outline" className="gap-1 rounded-full pl-3 pr-2.5 py-1 text-xs">
                    City: {city}
                    <button
                      onClick={() => updateSearch({ city: "" })}
                      className="text-muted-foreground hover:text-foreground font-bold hover:scale-110 ml-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {specialty && (
                  <Badge variant="outline" className="gap-1 rounded-full pl-3 pr-2.5 py-1 text-xs">
                    Specialty: {specialty}
                    <button
                      onClick={() => updateSearch({ specialty: "" })}
                      className="text-muted-foreground hover:text-foreground font-bold hover:scale-110 ml-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {hospitalType && (
                  <Badge variant="outline" className="gap-1 rounded-full pl-3 pr-2.5 py-1 text-xs">
                    Type: {hospitalType}
                    <button
                      onClick={() => updateSearch({ hospitalType: "" })}
                      className="text-muted-foreground hover:text-foreground font-bold hover:scale-110 ml-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {maxPrice < 15000 && (
                  <Badge variant="outline" className="gap-1 rounded-full pl-3 pr-2.5 py-1 text-xs">
                    Max Price: ₹{maxPrice.toLocaleString()}
                    <button
                      onClick={() => updateSearch({ maxPrice: 15000 })}
                      className="text-muted-foreground hover:text-foreground font-bold hover:scale-110 ml-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {minRating > 3.0 && (
                  <Badge variant="outline" className="gap-1 rounded-full pl-3 pr-2.5 py-1 text-xs">
                    Min Rating: {minRating.toFixed(1)} ★
                    <button
                      onClick={() => updateSearch({ minRating: 3.0 })}
                      className="text-muted-foreground hover:text-foreground font-bold hover:scale-110 ml-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {maxDistance < 20 && (
                  <Badge variant="outline" className="gap-1 rounded-full pl-3 pr-2.5 py-1 text-xs">
                    Max Distance: {maxDistance} km
                    <button
                      onClick={() => updateSearch({ maxDistance: 20 })}
                      className="text-muted-foreground hover:text-foreground font-bold hover:scale-110 ml-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {availableOnly && (
                  <Badge variant="outline" className="gap-1 rounded-full pl-3 pr-2.5 py-1 text-xs">
                    Available Today
                    <button
                      onClick={() => updateSearch({ availableOnly: false })}
                      className="text-muted-foreground hover:text-foreground font-bold hover:scale-110 ml-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <button
                  onClick={() =>
                    updateSearch({
                      q: "",
                      city: "",
                      specialty: "",
                      hospitalType: "",
                      service: "all",
                      maxPrice: 15000,
                      minRating: 3.0,
                      maxDistance: 20,
                      availableOnly: false,
                    })
                  }
                  className="text-xs font-bold text-primary hover:underline ml-auto"
                >
                  Clear all
                </button>
              </div>
            )}

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
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                        sort === p.key
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
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
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/10">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-foreground">No matches found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We couldn't find any medical services matching your criteria in{" "}
                  <strong className="text-foreground">{city || "any city"}</strong>.
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
                            updateSearch({ q: term, service: term });
                          }}
                          className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary transition-all duration-300 cursor-pointer"
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
                      updateSearch({
                        q: "",
                        city: "",
                        specialty: "",
                        hospitalType: "",
                        service: "all",
                        maxPrice: 15000,
                        minRating: 3.0,
                        maxDistance: 20,
                        availableOnly: false,
                      });
                    }}
                  >
                    Reset all filters
                  </Button>
                </div>
              </div>
            ) : isHospitalsLoading || isSimulatingLoading ? (
              view === "table" ? (
                <TableSkeleton />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              )
            ) : view === "table" ? (
              <ComparisonTable rows={tableRows} onCompareToggle={handleCardCompareToggle} />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {filteredHospitals.map((h) => (
                  <HospitalCard
                    key={h.id}
                    hospital={h}
                    serviceName={service !== "all" ? service : undefined}
                    onCompareToggle={handleCardCompareToggle}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Floating comparison drawer at the bottom */}
      {comparedIds.length > 0 && !showCompareView && (
        <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4 animate-slide-up">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-background/95 p-4 shadow-elevated backdrop-blur md:flex-nowrap">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                {comparedIds.length}
              </span>
              <div>
                <p className="text-sm font-bold">Selected for Comparison</p>
                <p className="text-xs text-muted-foreground">
                  Compare ratings, prices, and facilities side-by-side.
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-semibold px-4"
                onClick={clearComparison}
              >
                Clear
              </Button>
              <Button
                size="sm"
                className="rounded-full bg-primary text-xs font-semibold px-5"
                disabled={comparedIds.length < 2}
                onClick={() => setShowCompareView(true)}
              >
                Compare Now ({comparedIds.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </SiteShell>
  );
}
