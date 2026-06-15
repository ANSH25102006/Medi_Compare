import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Star as StarIcon,
  Bookmark,
  Settings as SettingsIcon,
  Edit2,
  Trash2,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { getItemSafe, setItemSafe } from "@/lib/storage";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getHospitalIdByName, getHospitalNameById, type PatientReview } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

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
  const [myReviews, setMyReviews] = useState<PatientReview[]>([]);
  const [refreshReviews, setRefreshReviews] = useState(0);

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  useEffect(() => {
    async function loadMyReviews() {
      if (!user?.email) return;
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .eq("user_email", user.email)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const supabaseReviews = (data || []).map((r: any) => ({
          id: r.id,
          hospitalId: r.hospital_id,
          hospitalName: getHospitalNameById(r.hospital_id),
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

        const localAll = getItemSafe<PatientReview[]>("medicompare_reviews", []);
        const localFiltered = localAll.filter((r) => r.userEmail === user.email);

        const seenIds = new Set(supabaseReviews.map((sr) => sr.id));
        const localFilteredUnique = localFiltered.filter((lr) => !seenIds.has(lr.id));

        setMyReviews([...supabaseReviews, ...localFilteredUnique]);
      } catch (err) {
        console.warn(
          "Failed to load user reviews from Supabase, falling back to localStorage",
          err,
        );
        const all = getItemSafe<PatientReview[]>("medicompare_reviews", []);
        setMyReviews(all.filter((r) => r.userEmail === user?.email));
      }
    }

    loadMyReviews();
  }, [user?.email, refreshReviews]);

  if (!isLoggedIn || user?.role !== "Patient") {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital || !text.trim()) {
      toast.error("Please select a hospital and write your review.");
      return;
    }
    const newReview: PatientReview = {
      id: `custom-${Date.now()}`,
      hospitalId: getHospitalIdByName(hospital),
      hospitalName: hospital,
      userName: user?.name ?? "Patient",
      userEmail: user?.email ?? "",
      rating,
      text: text.trim(),
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
        toast.success("Review published!");
      } catch (err) {
        console.error("Failed to post review to Supabase:", err);
        toast.success("Review saved locally (Offline mode).");
      } finally {
        setHospital("");
        setText("");
        setRating(5);
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
            myReviews.map((r, i) => {
              const isEditing = editingReviewId === r.id;
              return (
                <div
                  key={r.id || i}
                  className="rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  {isEditing ? (
                    <form onSubmit={handleSaveEdit} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-primary">
                          Editing review for {r.hospitalName}
                        </p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEditRating(star)}
                              className="transition-transform hover:scale-110"
                            >
                              <StarIcon
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
                        placeholder="Update review text..."
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
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{r.hospitalName}</p>
                          <span className="text-xs text-muted-foreground">{r.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            onClick={() => {
                              setEditingReviewId(r.id);
                              setEditText(r.text);
                              setEditRating(r.rating);
                            }}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(r.id)}
                            className="flex items-center gap-1 text-destructive hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-0.5 text-warning">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <StarIcon key={j} className="h-4 w-4 fill-current" />
                        ))}
                        {Array.from({ length: 5 - r.rating }).map((_, j) => (
                          <StarIcon key={j} className="h-4 w-4 text-muted-foreground" />
                        ))}
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        "{r.text}"
                      </p>
                    </>
                  )}
                </div>
              );
            })
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
