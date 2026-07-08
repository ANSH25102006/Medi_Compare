import { Link } from "@tanstack/react-router";
import { Star, MapPin, Clock, ArrowRight, TrendingDown, BadgeCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getCachedOrDefaultHospitals,
  getServiceAverage,
  getServiceMin,
  getHospitalRatingDetails,
  type Hospital,
} from "@/lib/mock-data";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getItemSafe, setItemSafe } from "@/lib/storage";

type Row = {
  hospitalId: string;
  hospitalName: string;
  image: string;
  service: string;
  price: number;
  rating: number;
  reviews: number;
  distance: number;
  city: string;
  slots: string[];
  earliest: string;
  savings: number;
  isCheapest: boolean;
};

export type SortKey = "price" | "rating" | "distance" | "earliest";

export function buildRows(serviceName: string | "all", customList?: Hospital[]): Row[] {
  const rows: Row[] = [];
  const list = getCachedOrDefaultHospitals(customList);
  list.forEach((h) => {
    const matches =
      serviceName === "all" ? [h.services[0]] : h.services.filter((s) => s.name === serviceName);
    matches.forEach((s) => {
      const avg = getServiceAverage(s.name, list);
      const min = getServiceMin(s.name, list);
      const { rating, reviewsCount } = getHospitalRatingDetails(h.id, list);
      rows.push({
        hospitalId: h.id,
        hospitalName: h.name,
        image: h.image,
        service: s.name,
        price: s.price,
        rating,
        reviews: reviewsCount,
        distance: h.distance,
        city: h.city,
        slots: h.slots,
        earliest: h.slots[0] ?? "—",
        savings: Math.max(avg - s.price, 0),
        isCheapest: s.price === min,
      });
    });
  });
  return rows;
}

export function sortRows(rows: Row[], sort: SortKey): Row[] {
  const sorted = [...rows];
  switch (sort) {
    case "price":
      return sorted.sort((a, b) => a.price - b.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "distance":
      return sorted.sort((a, b) => a.distance - b.distance);
    case "earliest":
      return sorted.sort((a, b) => a.earliest.localeCompare(b.earliest));
  }
}

export function ComparisonTable({
  rows,
  onCompareToggle,
}: {
  rows: Row[];
  onCompareToggle?: () => void;
}) {
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  const loadCompared = () => {
    setComparedIds(getItemSafe<string[]>("medicompare_compared_hospitals", []));
  };

  useEffect(() => {
    loadCompared();
  }, [rows]);

  const handleCompareChange = (hospitalId: string, checked: boolean, hospitalName: string) => {
    try {
      let ids = getItemSafe<string[]>("medicompare_compared_hospitals", []);
      if (checked) {
        if (ids.length >= 4) {
          toast.error("You can compare up to 4 hospitals at a time.");
          loadCompared();
          return;
        }
        if (!ids.includes(hospitalId)) {
          ids.push(hospitalId);
          toast.success(`Added ${hospitalName} to comparison.`);
        }
      } else {
        ids = ids.filter((id: string) => id !== hospitalId);
        toast.success(`Removed ${hospitalName} from comparison.`);
      }
      setItemSafe("medicompare_compared_hospitals", ids);
      setComparedIds(ids);
      onCompareToggle?.();
    } catch {
      toast.error("Failed to update comparison.");
    }
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center max-w-lg mx-auto shadow-soft mt-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary dark:bg-primary-soft/10">
          <Search className="h-6 w-6" />
        </div>
        <h3 className="mt-5 text-lg font-bold text-foreground">No matches found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No medical services match your active search filters. Try widening your price range,
          increasing distance limits, or choosing a popular specialty.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/40 bg-card/65 shadow-sm backdrop-blur-md">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[960px] text-[13px]">
          <thead className="bg-muted text-[10px] uppercase tracking-wider text-[#1E3A5F]">
            <tr className="border-b border-border/45">
              <th className="w-16 px-5 py-4 text-center font-bold">Compare</th>
              <th className="px-5 py-4 text-left font-bold">Hospital</th>
              <th className="px-4 py-4 text-left font-bold">Service</th>
              <th className="px-4 py-4 text-right font-bold">Price</th>
              <th className="px-4 py-4 text-left font-bold">Rating</th>
              <th className="px-4 py-4 text-left font-bold">Distance</th>
              <th className="px-4 py-4 text-left font-bold">Slots</th>
              <th className="px-4 py-4 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.hospitalId + r.service}
                className="border-t border-border/40 align-middle transition-all duration-200 odd:bg-[#FFFFFF] even:bg-[#F8FAFC] hover:bg-[#F1F5F9]"
              >
                <td className="px-5 py-4 text-center">
                  <Checkbox
                    checked={comparedIds.includes(r.hospitalId)}
                    onCheckedChange={(checked) =>
                      handleCompareChange(r.hospitalId, !!checked, r.hospitalName)
                    }
                    className="border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </td>
                <td className="px-5 py-4">
                  <Link
                    to="/hospitals/$hospitalId"
                    params={{ hospitalId: r.hospitalId }}
                    className="flex items-center gap-3.5 group"
                  >
                    <img src={r.image} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-border/50 shadow-sm" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate font-bold text-foreground group-hover:text-primary transition-all">
                        {r.hospitalName}
                        {r.isCheapest && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-success/8 border border-success/15 px-2 py-0.5 text-[9px] font-bold text-success">
                            <BadgeCheck className="h-3 w-3" /> Best Value
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{r.city}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-4 text-muted-foreground font-medium">{r.service}</td>
                <td className="px-4 py-4 text-right">
                  <p className="text-[15px] font-bold text-primary">₹{r.price.toLocaleString()}</p>
                  {r.savings > 0 ? (
                    <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-success uppercase tracking-wider">
                      <TrendingDown className="h-3 w-3" /> Save ₹{r.savings.toLocaleString()}
                    </p>
                  ) : (
                    <p className="mt-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Average price</p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1 font-bold text-foreground">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {r.rating}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold uppercase tracking-wider">
                    {r.reviews.toLocaleString()} reviews
                  </p>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1 text-[13px] text-foreground font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground opacity-80" />
                    {r.distance} km
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary opacity-80" />
                    {r.earliest}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold uppercase tracking-wider">{r.slots.length} slots today</p>
                </td>
                <td className="px-4 py-4 text-right">
                  <Button asChild size="sm" className="rounded-lg bg-primary hover:shadow-[0_4px_12px_rgba(var(--ring),0.2)] text-xs font-bold tracking-wide">
                    <Link to="/book" search={{ hospital: r.hospitalId, service: r.service }}>
                      Book <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
