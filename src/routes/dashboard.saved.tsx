import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Star,
  Bookmark,
  Settings as SettingsIcon,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useHospitals } from "@/hooks/use-hospitals";
import { CardSkeleton } from "@/components/site/SkeletonLoader";
import { HospitalCard } from "@/components/site/HospitalCard";
import { getItemSafe, setItemSafe } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard/saved")({
  head: () => ({ meta: [{ title: "Saved Hospitals — MediCompare" }] }),
  component: SavedPage,
});

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Appointments", url: "/dashboard/appointments", icon: CalendarCheck },
  { title: "Reviews", url: "/dashboard/reviews", icon: Star },
  { title: "Saved Hospitals", url: "/dashboard/saved", icon: Bookmark },
  { title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
];

function SavedPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      navigate({ to: "/login", search: { redirect: "/dashboard/saved" } });
      return;
    }
    if (user?.role === "Admin") {
      navigate({ to: "/admin" });
    } else if (user?.role === "Doctor") {
      navigate({ to: "/doctor" });
    }
  }, [isLoggedIn, user, navigate, loading]);

  const [savedIds, setSavedIds] = useState<string[]>([]);

  const loadSaved = async () => {
    const localSaved = getItemSafe<string[]>("medicompare_saved_hospitals", []);
    if (isLoggedIn && user?.email) {
      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("hospital_id")
          .eq("user_email", user.email);

        if (error) throw error;
        const dbIds = (data || []).map((f: any) => f.hospital_id);
        const merged = Array.from(new Set([...localSaved, ...dbIds]));
        setSavedIds(merged);
        setItemSafe("medicompare_saved_hospitals", merged);
      } catch (err) {
        console.warn("Failed to load saved hospitals from Supabase, using local fallback:", err);
        setSavedIds(localSaved);
      }
    } else {
      setSavedIds(localSaved);
    }
  };

  useEffect(() => {
    loadSaved();
  }, [user?.email, isLoggedIn]);

  const { data: hospitalsList = [], isLoading } = useHospitals();

  if (loading) {
    return null;
  }

  if (!isLoggedIn || user?.role !== "Patient") {
    return null;
  }

  const authUser = {
    name: user?.name ?? "Patient",
    role: user?.role ?? "Patient",
    avatar: user?.avatar ?? "https://i.pravatar.cc/120?img=25",
  };

  const saved = hospitalsList.filter((h) => savedIds.includes(h.id));

  return (
    <DashboardShell items={navItems} label="Patient" user={authUser}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Saved Hospitals</h1>
          <p className="text-sm text-muted-foreground">
            Hospitals you've bookmarked for quick access.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => navigate({ to: "/compare" })}
        >
          Browse all
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <Bookmark className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-semibold">No saved hospitals yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse hospitals and click the bookmark icon to save them here.
          </p>
          <Button className="mt-5 rounded-full" onClick={() => navigate({ to: "/compare" })}>
            Browse hospitals
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {saved.map((h) => (
            <HospitalCard key={h.id} hospital={h} onSaveToggle={loadSaved} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
