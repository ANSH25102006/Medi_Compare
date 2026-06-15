import { createFileRoute } from "@tanstack/react-router";
import { Star, CheckCircle2, Edit2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  getAllReviews,
  getHospitalIdByName,
  getHospitalNameById,
  defaultHospitalReviews,
  type PatientReview,
  testimonials,
} from "@/lib/mock-data";
import { useHospitals } from "@/hooks/use-hospitals";
import { useAuth } from "@/lib/auth";
import { getItemSafe, setItemSafe } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/reviews")({
  head: () => ({ meta: [{ title: "Patient Reviews — MediCompare" }] }),
  component: ReviewsPage,
});

const more = [
  {
    name: "Sneha R.",
    role: "Patient — Apollo",
    text: "Booking the cardiac consultation was so easy. The doctor was excellent and my appointment started right on time.",
  },
  {
    name: "Vivek M.",
    role: "Patient — Fortis",
    text: "MediCompare helped me save significantly on my MRI scan. Quality of service was top-notch.",
  },
  {
    name: "Lakshmi T.",
    role: "Patient — Manipal",
    text: "Comprehensive health checkup was thorough. Loved the digital reports being available the same day.",
  },
  {
    name: "Aditya P.",
    role: "Patient — Medanta",
    text: "Trustworthy, transparent and seamless. This is how healthcare should work in 2026.",
  },
];

const allReviewsBase = [
  ...testimonials.map((t) => ({ ...t, rating: 5, avatar: t.avatar })),
  ...more.map((t) => ({ ...t, rating: 5, avatar: undefined as undefined | string })),
];

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
          aria-label={`${i} star`}
        >
          <Star
            className={`h-5 w-5 transition-colors ${(hover || value) >= i ? "fill-warning text-warning" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewsPage() {
  const { user, isLoggedIn } = useAuth();
  const { data: hospitalsList = [] } = useHospitals();
  const [rating, setRating] = useState(5);
  const [hospital, setHospital] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState<PatientReview[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  useEffect(() => {
    async function loadAllReviews() {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const supabaseReviews = (data || []).map((r: any) => ({
          id: r.id,
          hospitalId: r.hospital_id,
          hospitalName: getHospitalNameById(r.hospital_id, hospitalsList),
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

        // Get base reviews
        const customLocal = getItemSafe<PatientReview[]>("medicompare_reviews", []);

        // Get static default reviews
        const base: PatientReview[] = [];
        hospitalsList.forEach((h) => {
          const reviews = defaultHospitalReviews[h.id] || [];
          reviews.forEach((r, i) => {
            base.push({
              id: `default-${h.id}-${i}`,
              hospitalId: h.id,
              hospitalName: h.name,
              userName: r.name,
              userEmail: "anonymous@example.com",
              rating: r.rating,
              text: r.text,
              date: r.date,
            });
          });
        });

        const seenIds = new Set(supabaseReviews.map((sr) => sr.id));
        const customLocalFiltered = customLocal.filter((clr) => !seenIds.has(clr.id));

        setReviews([...supabaseReviews, ...customLocalFiltered, ...base]);
      } catch (err) {
        console.warn("Failed to load reviews from Supabase, falling back to localStorage", err);
        setReviews(getAllReviews());
      }
    }

    loadAllReviews();
  }, [refreshTrigger, hospitalsList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || !hospital) {
      toast.error("Please fill in all fields.");
      return;
    }
    const newReview: PatientReview = {
      id: `custom-${Date.now()}`,
      hospitalId: getHospitalIdByName(hospital),
      hospitalName: hospital,
      userName: user?.name ?? "Anonymous",
      userEmail: user?.email ?? "",
      rating,
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
        toast.success("Review submitted! Thank you for your feedback 🙏");
      } catch (err) {
        console.error("Failed to post review to Supabase:", err);
        toast.success("Review saved locally (Offline mode).");
      } finally {
        setRefreshTrigger((prev) => prev + 1);
        setReviewText("");
        setHospital("");
        setRating(5);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
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
        setRefreshTrigger((prev) => prev + 1);
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
        setRefreshTrigger((prev) => prev + 1);
      }
    }

    updateInSupabase();
  };

  return (
    <SiteShell>
      <section className="border-b border-border bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold md:text-4xl">Patient reviews</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every review on MediCompare is tied to a verified appointment booking.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1 text-warning">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <span className="text-sm font-semibold">4.8 average</span>
            <span className="text-sm text-muted-foreground">from {reviews.length} reviews</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* Reviews grid */}
          <div className="grid auto-rows-min gap-6 sm:grid-cols-2">
            {reviews.map((t, idx) => {
              const isMyReview = isLoggedIn && user && t.userEmail === user.email;
              const isEditing = editingReviewId === t.id;

              return (
                <figure
                  key={t.id || `${t.userName}-${idx}`}
                  className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated relative"
                >
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
                        placeholder="Update your review..."
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
                          Save
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1 text-warning">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                          {Array.from({ length: 5 - t.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-muted-foreground" />
                          ))}
                        </div>
                        {isMyReview && (
                          <div className="flex items-center gap-2 text-xs">
                            <button
                              onClick={() => {
                                setEditingReviewId(t.id);
                                setEditText(t.text);
                                setEditRating(t.rating);
                              }}
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <Edit2 className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(t.id)}
                              className="flex items-center gap-1 text-destructive hover:underline"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                      <blockquote className="mt-4 text-sm leading-relaxed">"{t.text}"</blockquote>
                      <figcaption className="mt-5 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary text-sm font-bold">
                          {t.userName ? t.userName[0].toUpperCase() : "A"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{t.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            Patient — {t.hospitalName}
                          </p>
                        </div>
                        <CheckCircle2 className="ml-auto h-4 w-4 text-success" />
                      </figcaption>
                    </>
                  )}
                </figure>
              );
            })}
          </div>

          {/* Write a review */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-elevated">
              <h2 className="text-lg font-semibold">Write a review</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Share your experience to help others.
              </p>

              {!isLoggedIn && (
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary-soft/50 p-3 text-sm text-muted-foreground">
                  <a href="/login" className="font-medium text-primary hover:underline">
                    Sign in
                  </a>{" "}
                  to post a verified review.
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <Label>Hospital</Label>
                  <Select value={hospital} onValueChange={setHospital} disabled={!isLoggedIn}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select hospital…" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitalsList.map((h) => (
                        <SelectItem key={h.name} value={h.name}>
                          {h.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Your rating</Label>
                  <div className="mt-2">
                    <StarRating
                      value={rating}
                      onChange={isLoggedIn ? setRating : undefined}
                      readonly={!isLoggedIn}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="review-text">Your review</Label>
                  <Textarea
                    id="review-text"
                    rows={4}
                    className="mt-1.5 resize-none"
                    placeholder="Describe your experience…"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    disabled={!isLoggedIn}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full"
                  disabled={!isLoggedIn || submitted}
                >
                  {submitted ? "Review submitted ✓" : "Submit review"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
