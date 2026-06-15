import { createFileRoute, Link, notFound, useNavigate, useLocation } from "@tanstack/react-router";
import { Star, MapPin, Phone, ShieldCheck, Award, Calendar, Heart, ShieldAlert, Edit2, Trash2, Scale } from "lucide-react";
import { useState, useEffect } from "react";
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
  hospitals,
  getReviewsForHospital,
  getHospitalRatingDetails,
  type Hospital,
  type PatientReview,
} from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { DetailSkeleton } from "@/components/site/SkeletonLoader";

export const Route = createFileRoute("/hospitals/$hospitalId")({
  loader: ({ params }): Hospital => {
    const hospital = hospitals.find((h) => h.id === params.hospitalId);
    if (!hospital) throw notFound();
    return hospital;
  },
  notFoundComponent: () => (
    <SiteShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Hospital Not Found
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-md">
          The medical provider you are trying to view does not exist in our directory or has been
          removed.
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
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Hospital"} — MediCompare` },
      { name: "description", content: loaderData?.about ?? "Hospital details on MediCompare." },
      { property: "og:image", content: loaderData?.image },
    ],
  }),
  component: HospitalDetails,
});

function HospitalDetails() {
  const hospital = Route.useLoaderData() as Hospital;
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [refreshReviews, setRefreshReviews] = useState(0);

  // Sync rating calculations reactive to refreshReviews
  const { rating, reviewsCount } = getHospitalRatingDetails(hospital.id);

  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [hospital.id]);

  const [date, setDate] = useState<string>(() =>
    new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  );
  const [slot, setSlot] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      const stored = localStorage.getItem("medicompare_saved_hospitals");
      const ids = stored
        ? JSON.parse(stored)
        : ["apollo-central", "fortis-greens", "max-superspecialty", "manipal-city"];
      return ids.includes(hospital.id);
    } catch {
      return false;
    }
  });

  const [isCompared, setIsCompared] = useState(false);

  const loadCompared = () => {
    try {
      const stored = localStorage.getItem("medicompare_compared_hospitals");
      const compareIds = stored ? JSON.parse(stored) : [];
      setIsCompared(compareIds.includes(hospital.id));
    } catch {}
  };

  useEffect(() => {
    loadCompared();
  }, [hospital.id]);

  const toggleSave = () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to save hospitals.");
      navigate({
        to: "/login",
        search: { redirect: location.href },
      });
      return;
    }
    try {
      const stored = localStorage.getItem("medicompare_saved_hospitals");
      let ids = stored
        ? JSON.parse(stored)
        : ["apollo-central", "fortis-greens", "max-superspecialty", "manipal-city"];
      if (ids.includes(hospital.id)) {
        ids = ids.filter((id: string) => id !== hospital.id);
        toast.success("Removed from bookmarks.");
        setIsSaved(false);
      } else {
        ids.push(hospital.id);
        toast.success("Hospital bookmarked!");
        setIsSaved(true);
      }
      localStorage.setItem("medicompare_saved_hospitals", JSON.stringify(ids));
    } catch {
      toast.error("Failed to update saved list.");
    }
  };

  const toggleCompare = () => {
    try {
      const stored = localStorage.getItem("medicompare_compared_hospitals");
      let ids = stored ? JSON.parse(stored) : [];
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
      localStorage.setItem("medicompare_compared_hospitals", JSON.stringify(ids));
    } catch {
      toast.error("Failed to update comparison.");
    }
  };

  const [reviewsList, setReviewsList] = useState<PatientReview[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [userRating, setUserRating] = useState(5);

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  useEffect(() => {
    setReviewsList(getReviewsForHospital(hospital.id));
  }, [hospital.id, refreshReviews]);

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
      const stored = localStorage.getItem("medicompare_reviews");
      const current = stored ? JSON.parse(stored) : [];
      localStorage.setItem("medicompare_reviews", JSON.stringify([newReview, ...current]));
      toast.success("Review posted successfully!");
      setReviewText("");
      setUserRating(5);
      setRefreshReviews((prev) => prev + 1);
    } catch {
      toast.error("Failed to save review.");
    }
  };

  const handleDeleteReview = (id: string) => {
    try {
      const stored = localStorage.getItem("medicompare_reviews");
      if (!stored) return;
      const current = JSON.parse(stored);
      const updated = current.filter((r: any) => r.id !== id);
      localStorage.setItem("medicompare_reviews", JSON.stringify(updated));
      toast.success("Review deleted.");
      setRefreshReviews((prev) => prev + 1);
    } catch {
      toast.error("Failed to delete review.");
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) {
      toast.error("Review text is required.");
      return;
    }
    try {
      const stored = localStorage.getItem("medicompare_reviews");
      if (!stored) return;
      const current = JSON.parse(stored);
      const updated = current.map((r: any) => {
        if (r.id === editingReviewId) {
          return { ...r, text: editText.trim(), rating: editRating };
        }
        return r;
      });
      localStorage.setItem("medicompare_reviews", JSON.stringify(updated));
      toast.success("Review updated!");
      setEditingReviewId(null);
      setRefreshReviews((prev) => prev + 1);
    } catch {
      toast.error("Failed to update review.");
    }
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
                  isCompared ? "border-primary text-primary bg-primary-soft/50 hover:bg-primary-soft/60" : ""
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

            <TabsContent
              value="services"
              className="mt-6 rounded-2xl border border-border bg-card p-2 shadow-soft sm:p-6"
            >
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
            </TabsContent>

            <TabsContent
              value="reviews"
              className="mt-6 space-y-6 rounded-2xl border border-border bg-card p-7 shadow-soft"
            >
              {/* Reviews list */}
              <div className="space-y-4">
                {reviewsList.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground bg-secondary/10 font-medium">
                    Be the first to review.
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
                              <p className="text-xs font-semibold text-primary">Editing your review</p>
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
                                        editRating >= star ? "fill-warning text-warning" : "text-muted-foreground"
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
                            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">"{r.text}"</p>
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
                      <span className="text-xs font-semibold text-muted-foreground">Your Rating:</span>
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
                                userRating >= star ? "fill-warning text-warning" : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="review-textarea" className="text-xs font-semibold text-muted-foreground">
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
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
                >
                  <img
                    src={d.avatar}
                    alt={d.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-sm text-muted-foreground">{d.specialty}</p>
                    <p className="text-xs text-muted-foreground">{d.experience} yrs experience</p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking sidebar */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-20">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Book quickly</p>
          <h3 className="mt-1 text-xl font-semibold">Reserve a slot</h3>

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
                className={`rounded-xl border px-2 py-2 text-sm transition-all ${
                  slot === s
                    ? "border-primary bg-primary text-primary-foreground shadow-soft"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <Button
            className="mt-6 w-full rounded-full"
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
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Free cancellation up to 4 hrs before
          </p>
        </aside>
      </section>
    </SiteShell>
  );
}
