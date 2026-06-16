import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Star,
  Users,
  Settings as SettingsIcon,
  Activity,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  TrendingUp,
  Check,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { getItemSafe, setItemSafe } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/doctor")({
  head: () => ({ meta: [{ title: "Doctor Dashboard — MediCompare" }] }),
  component: DoctorDashboard,
});

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/doctor", icon: LayoutDashboard },
  { title: "My Appointments", url: "/doctor#appointments", icon: CalendarCheck },
  { title: "Reviews", url: "/doctor#reviews", icon: Star },
  { title: "Patients", url: "/doctor#patients", icon: Users },
  { title: "Settings", url: "/doctor#settings", icon: SettingsIcon },
];

type Appointment = {
  id: string;
  date: string;
  hospital: string;
  service: string;
  status: "Upcoming" | "Confirmed" | "Completed" | "Cancelled";
};

function DoctorDashboard() {
  const { user, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      navigate({ to: "/login", search: { redirect: "/doctor" } });
      return;
    }
    if (user?.role !== "Doctor") {
      toast.error("Access denied. Doctor dashboard is restricted.");
      navigate({ to: "/dashboard" });
    }
  }, [isLoggedIn, user, navigate, loading]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function loadDoctorAppointments() {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
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
        console.warn("Failed to load appointments in doctor dashboard from Supabase:", err);
        setAppointments(getItemSafe<Appointment[]>("medicompare_appointments", userAppointments));
      }
    }

    loadDoctorAppointments();
  }, [refreshTrigger]);

  const updateStatus = (id: string, newStatus: "Confirmed" | "Completed" | "Cancelled") => {
    try {
      const localAppts = getItemSafe<Appointment[]>("medicompare_appointments", userAppointments);
      const updatedLocal = localAppts.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
      setItemSafe("medicompare_appointments", updatedLocal);

      const updatedState = appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
      setAppointments(updatedState);
    } catch (err) {
      console.error("Local storage fallback status update failed:", err);
    }

    async function updateInSupabase() {
      try {
        const { error } = await supabase
          .from("bookings")
          .update({ booking_status: newStatus })
          .eq("id", id);

        if (error) throw error;
        toast.success(`Appointment status updated to ${newStatus}.`);
      } catch (err) {
        console.error("Failed to update status in Supabase:", err);
        toast.success(`Appointment status updated to ${newStatus} locally.`);
      } finally {
        setRefreshTrigger((prev) => prev + 1);
      }
    }

    updateInSupabase();
  };

  if (loading) {
    return null;
  }

  if (!isLoggedIn || user?.role !== "Doctor") {
    return null;
  }

  const authUser = {
    name: user?.name ?? "Doctor",
    role: "Medical Provider",
    avatar: user?.avatar ?? "https://i.pravatar.cc/120?img=49",
  };

  const upcoming = appointments.filter((a) => a.status === "Upcoming" || a.status === "Confirmed");
  const completed = appointments.filter((a) => a.status === "Completed");

  const metrics = [
    {
      label: "Active Appointments",
      value: upcoming.length,
      change: "Live",
      icon: CalendarCheck,
      tone: "primary",
    },
    {
      label: "Completed Visits",
      value: completed.length,
      change: "+12% MoM",
      icon: Activity,
      tone: "success",
    },
    { label: "Unique Patients", value: 48, change: "+8 this week", icon: Users, tone: "primary" },
    { label: "Patient Rating", value: "4.9 ★", change: "Top 5%", icon: Star, tone: "warning" },
  ];

  const toneMap = {
    primary: { bg: "bg-primary-soft", icon: "text-primary" },
    success: { bg: "bg-success/15", icon: "text-success" },
    warning: { bg: "bg-warning/15", icon: "text-warning" },
  };

  const statusVariant: Record<string, string> = {
    Upcoming: "bg-primary/10 text-primary",
    Confirmed: "bg-success/15 text-success",
    Completed: "bg-secondary text-foreground",
    Cancelled: "bg-destructive/10 text-destructive",
  };

  return (
    <DashboardShell items={navItems} label="Medical Provider" user={authUser}>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-primary-gradient p-7 text-primary-foreground shadow-elevated md:p-10">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm opacity-80">Good morning,</p>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">{authUser.name} 👋</h1>
            <p className="mt-2 max-w-md text-sm opacity-80">
              You have <strong>{upcoming.length} active appointments</strong> scheduled for today.
              Review your patient line-up below.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Practitioner
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <Stethoscope className="h-3.5 w-3.5" /> General Cardiology
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const t = toneMap[m.tone as keyof typeof toneMap];
          return (
            <div
              key={m.label}
              className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.bg} ${t.icon}`}
                >
                  <m.icon className="h-5 w-5" />
                </span>
                <Badge variant="secondary" className="rounded-full text-xs">
                  {m.change}
                </Badge>
              </div>
              <p className="mt-4 text-3xl font-bold">{m.value}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* Appointments */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Patient Appointments</h2>
            <p className="text-sm text-muted-foreground">
              Manage and confirm bookings assigned to your hospital/clinic.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No appointments found.
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {a.id}
                    </TableCell>
                    <TableCell className="text-sm">
                      <Clock className="mr-1.5 inline h-3.5 w-3.5 text-muted-foreground" />
                      {a.date}
                    </TableCell>
                    <TableCell className="font-semibold">{a.service}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusVariant[a.status]}`}
                      >
                        {a.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {a.status === "Upcoming" && (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-full border-success/30 text-success hover:bg-success/10"
                            onClick={() => updateStatus(a.id, "Confirmed")}
                          >
                            <Check className="h-3 w-3 mr-1" /> Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 rounded-full text-destructive hover:bg-destructive/10"
                            onClick={() => updateStatus(a.id, "Cancelled")}
                          >
                            <X className="h-3 w-3 mr-1" /> Decline
                          </Button>
                        </div>
                      )}
                      {a.status === "Confirmed" && (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="h-8 rounded-full"
                            onClick={() => updateStatus(a.id, "Completed")}
                          >
                            <Check className="h-3 w-3 mr-1" /> Mark Visited
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 rounded-full text-destructive hover:bg-destructive/10"
                            onClick={() => updateStatus(a.id, "Cancelled")}
                          >
                            <X className="h-3 w-3 mr-1" /> Cancel
                          </Button>
                        </div>
                      )}
                      {a.status === "Completed" && (
                        <Badge variant="secondary" className="rounded-full">
                          Completed
                        </Badge>
                      )}
                      {a.status === "Cancelled" && (
                        <Badge variant="outline" className="rounded-full text-muted-foreground">
                          Cancelled
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
