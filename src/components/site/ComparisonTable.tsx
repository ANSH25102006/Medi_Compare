import { Link } from "@tanstack/react-router";
import { Star, MapPin, Clock, ArrowRight, TrendingDown, BadgeCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getCachedOrDefaultHospitals, getServiceAverage, getServiceMin, getHospitalRatingDetails, type Hospital } from "@/lib/mock-data";
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
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-16 px-5 py-4 text-center font-semibold">Compare</th>
              <th className="px-5 py-4 text-left font-semibold">Hospital</th>
              <th className="px-4 py-4 text-left font-semibold">Service</th>
              <th className="px-4 py-4 text-right font-semibold">Price</th>
              <th className="px-4 py-4 text-left font-semibold">Rating</th>
              <th className="px-4 py-4 text-left font-semibold">Distance</th>
              <th className="px-4 py-4 text-left font-semibold">Slots</th>
              <th className="px-4 py-4 text-right font-semibold">Book</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.hospitalId + r.service}
                className="border-t border-border align-middle transition-colors hover:bg-secondary/30"
              >
                <td className="px-5 py-4 text-center">
                  <Checkbox
                    checked={comparedIds.includes(r.hospitalId)}
                    onCheckedChange={(checked) =>
                      handleCompareChange(r.hospitalId, !!checked, r.hospitalName)
                    }
                  />
                </td>
                <td className="px-5 py-4">
                  <Link
                    to="/hospitals/$hospitalId"
                    params={{ hospitalId: r.hospitalId }}
                    className="flex items-center gap-3 group"
                  >
                    <img src={r.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate font-semibold group-hover:text-primary">
                        {r.hospitalName}
                        {r.isCheapest && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                            <BadgeCheck className="h-3 w-3" /> Best price
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{r.city}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-4 text-muted-foreground">{r.service}</td>
                <td className="px-4 py-4 text-right">
                  <p className="text-lg font-bold text-primary">₹{r.price.toLocaleString()}</p>
                  {r.savings > 0 ? (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                      <TrendingDown className="h-3 w-3" /> ₹{r.savings.toLocaleString()} cheaper
                      than avg
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">At market average</p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {r.rating}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    {r.reviews.toLocaleString()} reviews
                  </p>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {r.distance} km
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1 text-sm font-medium">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {r.earliest}
                  </span>
                  <p className="text-[11px] text-muted-foreground">{r.slots.length} slots today</p>
                </td>
                <td className="px-4 py-4 text-right">
                  <Button asChild size="sm" className="rounded-full">
                    <Link to="/book" search={{ hospital: r.hospitalId, service: r.service }}>
                      Book <ArrowRight className="ml-1 h-3 w-3" />
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
