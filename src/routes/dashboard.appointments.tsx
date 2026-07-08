import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Star,
  Bookmark,
  Settings as SettingsIcon,
  CreditCard,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { userAppointments, getHospitalNameById } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getItemSafe, setItemSafe } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard/appointments")({
  head: () => ({ meta: [{ title: "Appointments — MediCompare" }] }),
  component: AppointmentsPage,
});

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Appointments", url: "/dashboard/appointments", icon: CalendarCheck },
  { title: "Reviews", url: "/dashboard/reviews", icon: Star },
  { title: "Saved Hospitals", url: "/dashboard/saved", icon: Bookmark },
  { title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
  { title: "Billing & Subscription", url: "/billing", icon: CreditCard },
];

const statusVariant: Record<string, string> = {
  Upcoming: "bg-primary/10 text-primary",
  Confirmed: "bg-success/15 text-success",
  Completed: "bg-secondary text-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
};

import { DashboardLayoutSkeleton } from "@/components/site/SkeletonLoader";
import { EmptyState } from "@/components/site/EmptyState";

type Appointment = {
  id: string;
  date: string;
  hospital: string;
  service: string;
  status: "Upcoming" | "Confirmed" | "Completed" | "Cancelled";
};

function AppointmentsPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      navigate({ to: "/login", search: { redirect: "/dashboard/appointments" } });
      return;
    }
    if (user?.role === "Admin") {
      navigate({ to: "/admin" });
    } else if (user?.role === "Doctor") {
      navigate({ to: "/doctor" });
    }
  }, [isLoggedIn, user, navigate, loading]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function loadAppointments() {
      if (!user?.email) return;
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_email", user.email)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const dbAppts = (data || []).map((b: any) => ({
          id: b.id,
          date: b.booking_date,
          hospital: getHospitalNameById(b.hospital_id),
          service: b.service_name,
          status: (b.booking_status || b.status) as any,
        }));

        const localAppts = getItemSafe<Appointment[]>("medicompare_appointments", userAppointments);
        const seenIds = new Set(dbAppts.map((a) => a.id));
        const localApptsUnique = localAppts.filter((la) => !seenIds.has(la.id));

        setAppointments([...dbAppts, ...localApptsUnique]);
      } catch (err) {
        console.warn("Failed to load appointments from Supabase, using local fallback:", err);
        setAppointments(getItemSafe<Appointment[]>("medicompare_appointments", userAppointments));
      }
    }

    loadAppointments();
  }, [user?.email, refreshTrigger]);

  const cancelAppointment = (id: string) => {
    try {
      const localAppts = getItemSafe<Appointment[]>("medicompare_appointments", userAppointments);
      const updatedLocal = localAppts.map((a) =>
        a.id === id ? { ...a, status: "Cancelled" as const } : a,
      );
      setItemSafe("medicompare_appointments", updatedLocal);

      const updatedState = appointments.map((a) =>
        a.id === id ? { ...a, status: "Cancelled" as const } : a,
      );
      setAppointments(updatedState);
    } catch (err) {
      console.error("Local storage fallback cancel failed:", err);
    }

    async function cancelInSupabase() {
      try {
        const { error } = await supabase
          .from("bookings")
          .update({ booking_status: "Cancelled" })
          .eq("id", id);

        if (error) throw error;
        toast.success("Appointment cancelled successfully.");
      } catch (err) {
        console.error("Failed to cancel appointment in Supabase:", err);
        toast.success("Appointment cancelled locally.");
      } finally {
        setRefreshTrigger((prev) => prev + 1);
      }
    }

    cancelInSupabase();
  };

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!isLoggedIn || user?.role !== "Patient") {
    return null;
  }

  const authUser = {
    name: user?.name ?? "Patient",
    role: user?.role ?? "Patient",
    avatar: user?.avatar ?? "https://i.pravatar.cc/120?img=25",
  };

  return (
    <DashboardShell items={navItems} label="Patient" user={authUser}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            Manage all your past and upcoming appointments.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/compare">Book new</Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-6">
                    <EmptyState
                      icon={CalendarCheck}
                      title="No appointments booked yet"
                      description="You don't have any medical appointments scheduled. Use search to find a procedure and book."
                      actionText="Find and book"
                      onActionClick={() => navigate({ to: "/compare" })}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {a.id}
                    </TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell className="font-medium">{a.hospital}</TableCell>
                    <TableCell className="text-muted-foreground">{a.service}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusVariant[a.status]}`}
                      >
                        {a.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {a.status === "Upcoming" || a.status === "Confirmed" ? (
                        <Badge
                          variant="outline"
                          className="cursor-pointer rounded-full text-destructive hover:bg-destructive/10 border-destructive/30"
                          onClick={() => cancelAppointment(a.id)}
                        >
                          Cancel
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-full">
                          View
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardShell>
  );
}
