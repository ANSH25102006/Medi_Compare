import { createFileRoute } from "@tanstack/react-router";
import { Star, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { testimonials } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
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
  const [rating, setRating] = useState(5);
  const [hospital, setHospital] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState(allReviewsBase);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || !hospital) {
      toast.error("Please fill in all fields.");
      return;
    }
    const newReview = {
      name: user?.name ?? "Anonymous",
      role: `Patient — ${hospital}`,
      text: reviewText.trim(),
      rating,
      avatar: user?.avatar,
    };
    setReviews((prev) => [newReview, ...prev]);
    setReviewText("");
    setHospital("");
    setRating(5);
    setSubmitted(true);
    toast.success("Review submitted! Thank you for your feedback 🙏");
    setTimeout(() => setSubmitted(false), 3000);
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
            {reviews.map((t, idx) => (
              <figure
                key={`${t.name}-${idx}`}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className="flex items-center gap-1 text-warning">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  {Array.from({ length: 5 - t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-muted-foreground" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed">"{t.text}"</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary text-sm font-bold">
                      {t.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                  <CheckCircle2 className="ml-auto h-4 w-4 text-success" />
                </figcaption>
              </figure>
            ))}
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
                      {[
                        "Apollo Specialty Hospital",
                        "Fortis Greens Medical Center",
                        "Max Super Speciality Hospital",
                        "Manipal City Hospital",
                        "Kokilaben Dhirubhai Ambani Hospital",
                        "Medanta The Medicity",
                      ].map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
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
