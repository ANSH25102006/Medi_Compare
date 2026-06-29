import { createFileRoute, Link, notFound, useNavigate, useLocation } from "@tanstack/react-router";
import {
  Star,
  MapPin,
  Phone,
  ShieldCheck,
  Award,
  Calendar,
  Heart,
  ShieldAlert,
  Edit2,
  Trash2,
  Scale,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  getReviewsForHospital,
  getHospitalRatingDetails,
  getHospitalNameById,
  defaultHospitalReviews,
  type Hospital,
  type PatientReview,
} from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { DetailSkeleton } from "@/components/site/SkeletonLoader";
import { getItemSafe, setItemSafe } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { useHospital } from "@/hooks/use-hospitals";

export const Route = createFileRoute("/hospitals/$hospitalId")({
  head: ({ params }) => {
    const name = getHospitalNameById(params.hospitalId);
    return {
      meta: [
        { title: `${name} — MediCompare` },
        { name: "description", content: `View services, ratings, and compare prices at ${name}.` },
      ],
    };
  },
  component: HospitalDetails,
});

function HospitalDetails() {
  const { hospitalId } = Route.useParams();
  const { data: hospital, isLoading, error } = useHospital(hospitalId);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [refreshReviews, setRefreshReviews] = useState(0);

  const [reviewsList, setReviewsList] = useState<PatientReview[]>([]);

  // Sync rating calculations reactive to reviewsList
  const { rating, reviewsCount } = useMemo(() => {
    if (!hospital) return { rating: 0, reviewsCount: 0 };
    const customReviews = reviewsList.filter((r) => !r.id.startsWith("default-"));
    const baseReviewsCount = hospital.reviews;
    const baseRating = hospital.rating;

    const N_0 = baseReviewsCount;
    const R_0 = baseRating;
    const N_custom = customReviews.length;
    const sum_custom = customReviews.reduce((sum, r) => sum + r.rating, 0);

    const totalReviews = N_0 + N_custom;
    const averageRating =
      totalReviews > 0 ? Math.round(((R_0 * N_0 + sum_custom) / totalReviews) * 10) / 10 : R_0;

    return { rating: averageRating, reviewsCount: totalReviews };
  }, [reviewsList, hospital]);

  const [trendService, setTrendService] = useState<string>("");

  useEffect(() => {
    if (hospital?.services?.[0]?.name) {
      setTrendService(hospital.services[0].name);
    }
  }, [hospital]);

  const { trendData, sixMonthHigh, sixMonthLow, trendStatus, trendColor, selectedSvcPrice } =
    useMemo(() => {
      if (!hospital) {
        return {
          trendData: [],
          sixMonthHigh: 0,
          sixMonthLow: 0,
          trendStatus: "Stable",
          trendColor: "text-muted-foreground",
          selectedSvcPrice: 0,
        };
      }
      const svc = hospital.services.find((s) => s.name === trendService) || hospital.services[0];
      if (!svc) {
        return {
          trendData: [],
          sixMonthHigh: 0,
          sixMonthLow: 0,
          trendStatus: "Stable",
          trendColor: "text-muted-foreground",
          selectedSvcPrice: 0,
        };
      }
      const currentPrice = svc.price;

      const seed = (hospital.id.charCodeAt(0) + (trendService.charCodeAt(0) || 0)) % 3;
      let multipliers: number[];
      let status: string;
      let color: string;

      if (seed === 0) {
        multipliers = [1.06, 1.05, 1.03, 1.02, 1.01, 1.0];
        status = "Downward";
        color = "text-success";
      } else if (seed === 1) {
        multipliers = [0.93, 0.94, 0.97, 0.98, 0.99, 1.0];
        status = "Upward";
        color = "text-destructive";
      } else {
        multipliers = [0.99, 1.01, 0.98, 1.02, 0.99, 1.0];
        status = "Stable";
        color = "text-primary";
      }

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const currentMonthIdx = new Date().getMonth();
      const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
        const idx = (currentMonthIdx - 5 + i + 12) % 12;
        return monthNames[idx];
      });

      const data = lastSixMonths.map((m, idx) => ({
        month: m,
        price: Math.round(currentPrice * multipliers[idx]),
      }));

      const prices = data.map((d) => d.price);
      const high = Math.max(...prices);
      const low = Math.min(...prices);

      return {
        trendData: data,
        sixMonthHigh: high,
        sixMonthLow: low,
        trendStatus: status,
        trendColor: color,
        selectedSvcPrice: currentPrice,
      };
    }, [hospital, trendService]);

  useEffect(() => {
    setIsPageLoading(true);

    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [hospital?.id]);

  const [date, setDate] = useState<string>(() =>
    new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  );
  const [slot, setSlot] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function checkSaved() {
      if (!hospital) return;
      const ids = getItemSafe<string[]>("medicompare_saved_hospitals", [
        "apollo-central",
        "fortis-greens",
        "max-superspecialty",
        "manipal-city",
      ]);
      setIsSaved(ids.includes(hospital.id));

      if (isLoggedIn && user?.email) {
        try {
          const { data, error } = await supabase
            .from("favorites")
            .select("id")
            .eq("hospital_id", hospital.id)
            .eq("user_email", user.email)
            .maybeSingle();

          if (error) throw error;
          if (data) {
            setIsSaved(true);
            if (!ids.includes(hospital.id)) {
              setItemSafe("medicompare_saved_hospitals", [...ids, hospital.id]);
            }
          }
        } catch (err) {
          console.warn("Failed to check saved status in Supabase:", err);
        }
      }
    }
    checkSaved();
  }, [hospital?.id, isLoggedIn, user?.email]);

  const [isCompared, setIsCompared] = useState(false);

  const loadCompared = () => {
    if (!hospital) return;
    const compareIds = getItemSafe<string[]>("medicompare_compared_hospitals", []);
    setIsCompared(compareIds.includes(hospital.id));
  };

  useEffect(() => {
    loadCompared();
  }, [hospital?.id]);

  const toggleSave = () => {
    if (!hospital) return;
    const hospitalId = hospital.id;
    if (!isLoggedIn) {
      toast.error("Please sign in to save hospitals.");
      navigate({
        to: "/login",
        search: { redirect: location.href },
      });
      return;
    }

    const nextSavedState = !isSaved;

    try {
      let ids = getItemSafe<string[]>("medicompare_saved_hospitals", [
        "apollo-central",
        "fortis-greens",
        "max-superspecialty",
        "manipal-city",
      ]);
      if (ids.includes(hospitalId)) {
        ids = ids.filter((id: string) => id !== hospitalId);
        toast.success("Removed from bookmarks.");
        setIsSaved(false);
      } else {
        ids.push(hospitalId);
        toast.success("Hospital bookmarked!");
        setIsSaved(true);
      }
      setItemSafe("medicompare_saved_hospitals", ids);
    } catch {
      toast.error("Failed to update saved list.");
    }

    async function syncFavorite() {
      if (!user?.email) return;
      try {
        if (nextSavedState) {
          const { error } = await supabase
            .from("favorites")
            .insert([{ hospital_id: hospitalId, user_email: user.email }]);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("hospital_id", hospitalId)
            .eq("user_email", user.email);
          if (error) throw error;
        }
      } catch (err) {
        console.warn("Failed to sync favorite with Supabase:", err);
      }
    }

    syncFavorite();
  };

  const toggleCompare = () => {
    if (!hospital) return;
    try {
      let ids = getItemSafe<string[]>("medicompare_compared_hospitals", []);
      if (isCompared) {
        ids = ids.filter((id: string) => id !== hospital.id);
        setIsCompared(false);
        toast.success("Removed from comparison.");
      } else {
        if (ids.length >= 4) {
          toast.error("You can compare up to 4 hospitals at a time.");
          return;
        }
        ids.push(hospital.id);
        setIsCompared(true);
        toast.success("Added to comparison!");
      }
      setItemSafe("medicompare_compared_hospitals", ids);
    } catch {
      toast.error("Failed to update comparison.");
    }
  };

  const [reviewText, setReviewText] = useState("");
  const [userRating, setUserRating] = useState(5);

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  useEffect(() => {
    async function loadReviews() {
      if (!hospital) return;
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .eq("hospital_id", hospital.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const supabaseReviews = (data || []).map((r: any) => ({
          id: r.id,
          hospitalId: r.hospital_id,
          hospitalName: hospital.name,
          userName: r.user_name,
          userEmail: r.user_email,
          rating: r.rating,
          text: r.review_text,
          date: new Date(r.created_at || Date.now()).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        }));

        const base = (defaultHospitalReviews[hospital.id] || []).map((r: any, i: number) => ({
          id: `default-${hospital.id}-${i}`,
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          userName: r.name,
          userEmail: "anonymous@example.com",
          rating: r.rating,
          text: r.text,
          date: r.date,
        }));

        setReviewsList([...supabaseReviews, ...base]);
      } catch (err) {
        console.warn("Failed to fetch reviews from Supabase, falling back to localStorage", err);
        setReviewsList(getReviewsForHospital(hospital.id));
      }
    }

    loadReviews();
  }, [hospital?.id, refreshReviews]);

  if (isLoading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <DetailSkeleton />
        </div>
      </SiteShell>
    );
  }

  if (error || !hospital) {
    return (
      <SiteShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Hospital Not Found or Failed to Load
          </h1>
          <p className="mt-3 text-base text-muted-foreground max-w-md">
            There was an error fetching details for this provider. Please make sure the ID is
            correct or try again.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full bg-primary-gradient px-6">
              <Link to="/compare">Browse Directory</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </SiteShell>
    );
  }

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please sign in to write a review.");
      navigate({
        to: "/login",
        search: { redirect: location.href },
      });
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Review text is required.");
      return;
    }

    const newReview: PatientReview = {
      id: `custom-${Date.now()}`,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      userName: user?.name ?? "Patient",
      userEmail: user?.email ?? "",
      rating: userRating,
      text: reviewText.trim(),
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    try {
      const current = getItemSafe<PatientReview[]>("medicompare_reviews", []);
      setItemSafe("medicompare_reviews", [newReview, ...current]);
    } catch (err) {
      console.error("Local storage fallback save failed:", err);
    }

    async function saveToSupabase() {
      try {
        const { error } = await supabase.from("reviews").insert([
          {
            id: newReview.id,
            hospital_id: newReview.hospitalId,
            user_name: newReview.userName,
            user_email: newReview.userEmail,
            rating: newReview.rating,
            review_text: newReview.text,
            created_at: new Date().toISOString(),
          },
        ]);
        if (error) throw error;
        toast.success("Review posted successfully!");
      } catch (err) {
        console.error("Failed to post review to Supabase:", err);
        toast.success("Review saved locally (Offline mode).");
      } finally {
        setReviewText("");
        setUserRating(5);
        setRefreshReviews((prev) => prev + 1);
      }
    }

    saveToSupabase();
  };

  const handleDeleteReview = (id: string) => {
    try {
      const current = getItemSafe<any[]>("medicompare_reviews", []);
      const updated = current.filter((r: any) => r.id !== id);
      setItemSafe("medicompare_reviews", updated);
    } catch (err) {
      console.error("Local storage fallback delete failed:", err);
    }

    async function deleteFromSupabase() {
      try {
        const { error } = await supabase.from("reviews").delete().eq("id", id);
        if (error) throw error;
        toast.success("Review deleted.");
      } catch (err) {
        console.error("Failed to delete review from Supabase:", err);
        toast.success("Review deleted locally.");
      } finally {
        setRefreshReviews((prev) => prev + 1);
      }
    }

    deleteFromSupabase();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) {
      toast.error("Review text is required.");
      return;
    }

    try {
      const current = getItemSafe<any[]>("medicompare_reviews", []);
      const updated = current.map((r: any) => {
        if (r.id === editingReviewId) {
          return { ...r, text: editText.trim(), rating: editRating };
        }
        return r;
      });
      setItemSafe("medicompare_reviews", updated);
    } catch (err) {
      console.error("Local storage fallback update failed:", err);
    }

    async function updateInSupabase() {
      try {
        const { error } = await supabase
          .from("reviews")
          .update({
            review_text: editText.trim(),
            rating: editRating,
          })
          .eq("id", editingReviewId);
        if (error) throw error;
        toast.success("Review updated!");
      } catch (err) {
        console.error("Failed to update review in Supabase:", err);
        toast.success("Review updated locally.");
      } finally {
        setEditingReviewId(null);
        setRefreshReviews((prev) => prev + 1);
      }
    }

    updateInSupabase();
  };

  if (isPageLoading) {
    return (
      <SiteShell>
        <DetailSkeleton />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative h-80 w-full overflow-hidden md:h-96">
        <img src={hospital.image} alt={hospital.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </section>

      <section className="mx-auto -mt-32 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-7 shadow-elevated">
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex-1 min-w-[260px]">
              <div className="flex flex-wrap gap-1.5">
                {hospital.specialties.map((s) => (
                  <Badge key={s} variant="secondary" className="rounded-full font-normal">
                    {s}
                  </Badge>
                ))}
              </div>
              <h1 className="mt-3 text-3xl font-bold md:text-4xl">{hospital.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-warning text-warning" />{" "}
                  <strong className="text-foreground">{rating.toFixed(1)}</strong> ({reviewsCount}{" "}
                  reviews)
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {hospital.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" /> {hospital.phone}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 font-medium">
              <Button
                variant={isCompared ? "secondary" : "outline"}
                className={`rounded-full gap-1.5 transition-all ${
                  isCompared
                    ? "border-primary text-primary bg-primary-soft/50 hover:bg-primary-soft/60"
                    : ""
                }`}
                onClick={toggleCompare}
              >
                <Scale className="h-4 w-4" />
                {isCompared ? "Comparing" : "Compare"}
              </Button>
              <Button
                variant={isSaved ? "default" : "outline"}
                className="rounded-full gap-1.5"
                onClick={toggleSave}
              >
                <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button asChild className="rounded-full">
                <Link
                  to="/book"
                  search={{ hospital: hospital.id, service: hospital.services[0].name }}
                >
                  Book Appointment
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 border-t border-border pt-6 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: "NABH Accredited" },
              { icon: Award, label: "Top 1% network rating" },
              { icon: Calendar, label: "Avg. wait under 15 min" },
            ].map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-3 rounded-xl bg-primary-soft/50 p-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-primary">
                  <b.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-7xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <Tabs defaultValue="overview">
            <TabsList className="rounded-full">
              <TabsTrigger value="overview" className="rounded-full">
                Overview
              </TabsTrigger>
              <TabsTrigger value="services" className="rounded-full">
                Services
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-full">
                Reviews
              </TabsTrigger>
              <TabsTrigger value="doctors" className="rounded-full">
                Doctors
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="overview"
              className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-7 shadow-soft"
            >
              <h2 className="text-xl font-semibold">About {hospital.name}</h2>
              <p className="text-muted-foreground">{hospital.about}</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Beds", "420+"],
                  ["Specialties", "30+"],
                  ["Doctors", "180+"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-secondary/60 p-4">
                    <p className="text-2xl font-bold">{v}</p>
                    <p className="text-xs text-muted-foreground">{k}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="services" className="mt-6 space-y-8 outline-none">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
                <h3 className="text-lg font-bold mb-4 px-2">Services & Procedures</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="w-40 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hospital.services.map((s) => (
                      <TableRow key={s.name}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.duration}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          ₹{s.price.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline" className="rounded-full">
                            <Link to="/book" search={{ hospital: hospital.id, service: s.name }}>
                              Book
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Price Trends Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5 mb-6">
                  <div>
                    <h3 className="text-lg font-bold">Historical Cost Trends</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Monitor cost changes for procedures at this hospital over the last 6 months
                    </p>
                  </div>
                  <Select value={trendService} onValueChange={setTrendService}>
                    <SelectTrigger className="w-56 rounded-xl">
                      <SelectValue placeholder="Select procedure" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospital.services.map((s) => (
                        <SelectItem key={s.name} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Trend summary metrics */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
                  <div className="rounded-xl bg-secondary/50 p-4">
                    <p className="text-xs text-muted-foreground">Current Cost</p>
                    <p className="text-xl font-bold text-primary mt-1">
                      ₹{selectedSvcPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-4">
                    <p className="text-xs text-muted-foreground">6-Month High</p>
                    <p className="text-xl font-bold mt-1">₹{sixMonthHigh.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-4">
                    <p className="text-xs text-muted-foreground">6-Month Low</p>
                    <p className="text-xl font-bold mt-1">₹{sixMonthLow.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-4">
                    <p className="text-xs text-muted-foreground">Trend Status</p>
                    <p
                      className={`text-lg font-bold mt-1.5 flex items-center gap-1.5 ${trendColor}`}
                    >
                      {trendStatus === "Upward"
                        ? "↗ Upward"
                        : trendStatus === "Downward"
                          ? "↘ Downward"
                          : "→ Stable"}
                    </p>
                  </div>
                </div>

                {/* Line Chart */}
                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{ left: 10, right: 10, top: 10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(226,232,240,0.3)"
                      />
                      <XAxis
                        dataKey="month"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        formatter={(value: any) => [`₹${value.toLocaleString()}`, "Price"]}
                        contentStyle={{
                          background: "oklch(var(--card))",
                          border: "1px solid oklch(var(--border))",
                          borderRadius: "16px",
                          boxShadow: "var(--shadow-soft)",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="rgb(59,130,246)"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: "oklch(var(--card))" }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="reviews"
              className="mt-6 space-y-6 rounded-2xl border border-border bg-card p-7 shadow-soft"
            >
              {/* Reviews list */}
              <div className="space-y-4">
                {reviewsList.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground bg-secondary/10 flex flex-col items-center max-w-sm mx-auto">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary border border-border text-muted-foreground mb-3">
                      <Star className="h-4.5 w-4.5" />
                    </span>
                    <p className="font-bold text-foreground text-sm">No reviews yet</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      Be the first to share your healthcare experience at this facility. All reviews
                      are securely verified.
                    </p>
                  </div>
                ) : (
                  reviewsList.map((r) => {
                    const isMyReview = isLoggedIn && user && r.userEmail === user.email;
                    const isEditing = editingReviewId === r.id;

                    return (
                      <div key={r.id} className="rounded-xl border border-border p-5 bg-card">
                        {isEditing ? (
                          <form onSubmit={handleSaveEdit} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-primary">
                                Editing your review
                              </p>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setEditRating(star)}
                                    className="transition-transform hover:scale-110"
                                  >
                                    <Star
                                      className={`h-4 w-4 ${
                                        editRating >= star
                                          ? "fill-warning text-warning"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              rows={3}
                              className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                              placeholder="Update your review details..."
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                type="button"
                                onClick={() => setEditingReviewId(null)}
                              >
                                Cancel
                              </Button>
                              <Button size="sm" className="rounded-full" type="submit">
                                Save changes
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-foreground">{r.userName}</p>
                                <p className="text-[11px] text-muted-foreground">{r.date}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <div className="flex text-warning">
                                  {Array.from({ length: r.rating }).map((_, i) => (
                                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                                  ))}
                                  {Array.from({ length: 5 - r.rating }).map((_, i) => (
                                    <Star key={i} className="h-3.5 w-3.5 text-muted-foreground" />
                                  ))}
                                </div>
                                {isMyReview && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <button
                                      onClick={() => {
                                        setEditingReviewId(r.id);
                                        setEditText(r.text);
                                        setEditRating(r.rating);
                                      }}
                                      className="flex items-center gap-1 text-primary hover:underline"
                                    >
                                      <Edit2 className="h-3 w-3" /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReview(r.id)}
                                      className="flex items-center gap-1 text-destructive hover:underline"
                                    >
                                      <Trash2 className="h-3 w-3" /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                              "{r.text}"
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Form to submit review */}
              <div className="border-t border-border pt-6">
                <h3 className="text-base font-bold text-foreground mb-3">Write a review</h3>
                {isLoggedIn ? (
                  <form onSubmit={handleAddReview} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Your Rating:
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                userRating >= star
                                  ? "fill-warning text-warning"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="review-textarea"
                        className="text-xs font-semibold text-muted-foreground"
                      >
                        Your experience
                      </label>
                      <textarea
                        id="review-textarea"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={4}
                        placeholder="Share details of your experience, doctor consultation, facilities..."
                        className="w-full rounded-2xl border border-input bg-background p-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none shadow-inner"
                      />
                    </div>
                    <Button type="submit" className="rounded-full bg-primary-gradient px-6">
                      Publish Review
                    </Button>
                  </form>
                ) : (
                  <div className="rounded-xl border border-primary/20 bg-primary-soft/50 p-4 text-sm text-muted-foreground">
                    Please{" "}
                    <Link
                      to="/login"
                      search={{ redirect: location.href }}
                      className="font-bold text-primary hover:underline"
                    >
                      sign in
                    </Link>{" "}
                    to write a verified patient review.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="doctors" className="mt-6 grid gap-4 sm:grid-cols-2">
              {hospital.doctors.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft hover-card-lift cursor-pointer"
                >
                  <img
                    src={d.avatar}
                    alt={d.name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-primary/20 shrink-0"
                  />
                  <div>
                    <p className="font-bold text-foreground leading-tight">{d.name}</p>
                    <p className="text-sm font-semibold text-primary mt-1">{d.specialty}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      {d.experience} yrs experience
                    </p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking sidebar */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Book quickly</p>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-success/15 px-2 py-0.5 text-[9px] font-extrabold text-success border border-success/20">
              🔒 SECURE CHECKOUT
            </span>
          </div>
          <h3 className="mt-2 text-xl font-bold text-foreground">Reserve a slot</h3>

          <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
          />

          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Time slot
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {hospital.slots.map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={`rounded-xl border px-2 py-2 text-sm transition-all btn-interactive cursor-pointer ${
                  slot === s
                    ? "border-primary bg-primary text-primary-foreground shadow-soft font-bold"
                    : "border-border bg-background hover:border-primary/40 text-muted-foreground font-semibold"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <Button
            className="mt-6 w-full rounded-full bg-primary-gradient text-primary-foreground font-bold btn-interactive shadow-soft"
            disabled={!slot}
            onClick={() => {
              navigate({
                to: "/book",
                search: {
                  hospital: hospital.id,
                  service: hospital.services[0].name,
                  date,
                  slot: slot || undefined,
                },
              });
            }}
          >
            Book Appointment
          </Button>
          <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">
            Free cancellation up to 4 hrs before
          </p>
          <div className="mt-4 border-t border-border/60 pt-4 flex items-center justify-center gap-1.5 text-[10px] font-extrabold tracking-wider text-muted-foreground/80 uppercase">
            <span>🛡️ HIPAA Compliant</span>
            <span>•</span>
            <span>🔒 SSL Encrypted</span>
          </div>
        </aside>
      </section>
    </SiteShell>
  );
}
