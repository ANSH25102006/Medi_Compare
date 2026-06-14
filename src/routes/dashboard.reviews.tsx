import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Star as StarIcon,
  Bookmark,
  Settings as SettingsIcon,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/reviews")({
  head: () => ({ meta: [{ title: "My Reviews — MediCompare" }] }),
  component: DashboardReviewsPage,
});

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Appointments", url: "/dashboard/appointments", icon: CalendarCheck },
  { title: "Reviews", url: "/dashboard/reviews", icon: StarIcon },
  { title: "Saved Hospitals", url: "/dashboard/saved", icon: Bookmark },
  { title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <StarIcon
            className={`h-6 w-6 transition-colors ${(hover || value) >= i ? "fill-warning text-warning" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  );
}

function DashboardReviewsPage() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/login", search: { redirect: "/dashboard/reviews" } });
      return;
    }
    if (user?.role === "Admin") {
      navigate({ to: "/admin" });
    } else if (user?.role === "Doctor") {
      navigate({ to: "/doctor" });
    }
  }, [isLoggedIn, user, navigate]);

  const authUser = {
    name: user?.name ?? "Patient",
    role: user?.role ?? "Patient",
    avatar: user?.avatar ?? "https://i.pravatar.cc/120?img=25",
  };

  const [rating, setRating] = useState(5);
  const [hospital, setHospital] = useState("");
  const [text, setText] = useState("");
  const [myReviews, setMyReviews] = useState<
    Array<{ hospital: string; rating: number; text: string; date: string }>
  >(() => {
    try {
      if (typeof window === "undefined") return [];
      const stored = localStorage.getItem("medicompare_reviews");
      return stored
        ? JSON.parse(stored)
        : [
            {
              hospital: "Apollo Specialty Hospital",
              rating: 5,
              text: "Excellent cardiac consultation. Highly recommended!",
              date: "12 May 2026",
            },
          ];
    } catch {
      return [
        {
          hospital: "Apollo Specialty Hospital",
          rating: 5,
          text: "Excellent cardiac consultation. Highly recommended!",
          date: "12 May 2026",
        },
      ];
    }
  });

  if (!isLoggedIn || user?.role !== "Patient") {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital || !text.trim()) {
      toast.error("Please select a hospital and write your review.");
      return;
    }
    const newReview = {
      hospital,
      rating,
      text: text.trim(),
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    const updated = [newReview, ...myReviews];
    setMyReviews(updated);
    try {
      localStorage.setItem("medicompare_reviews", JSON.stringify(updated));
    } catch {
      // ignore
    }
    setHospital("");
    setText("");
    setRating(5);
    toast.success("Review published!");
  };

  return (
    <DashboardShell items={navItems} label="Patient" user={authUser}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Reviews you've written for hospitals you visited.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Existing reviews */}
        <div className="space-y-4">
          {myReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-14 text-center">
              <StarIcon className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-semibold">No reviews yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Write your first review using the form →
              </p>
            </div>
          ) : (
            myReviews.map((r, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{r.hospital}</p>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
                <div className="mt-2 flex gap-0.5 text-warning">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <StarIcon key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">"{r.text}"</p>
              </div>
            ))
          )}
        </div>

        {/* Write review */}
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-2xl border border-border bg-card p-6 shadow-elevated"
        >
          <h2 className="text-lg font-semibold">Write a review</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Hospital visited</Label>
              <Select value={hospital} onValueChange={setHospital}>
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
              <Label>Rating</Label>
              <div className="mt-2">
                <StarPicker value={rating} onChange={setRating} />
              </div>
            </div>
            <div>
              <Label htmlFor="dash-review-text">Your experience</Label>
              <Textarea
                id="dash-review-text"
                rows={4}
                className="mt-1.5 resize-none"
                placeholder="How was the hospital, staff, and service?"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full rounded-full">
              Publish review
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
