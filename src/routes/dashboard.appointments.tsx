import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Star,
  Bookmark,
  Settings as SettingsIcon,
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
import { userAppointments } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getItemSafe, setItemSafe } from "@/lib/storage";

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
];

const statusVariant: Record<string, string> = {
  Upcoming: "bg-primary/10 text-primary",
  Confirmed: "bg-success/15 text-success",
  Completed: "bg-secondary text-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
};

type Appointment = {
  id: string;
  date: string;
  hospital: string;
  service: string;
  status: "Upcoming" | "Confirmed" | "Completed" | "Cancelled";
};

function AppointmentsPage() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/login", search: { redirect: "/dashboard/appointments" } });
      return;
    }
    if (user?.role === "Admin") {
      navigate({ to: "/admin" });
    } else if (user?.role === "Doctor") {
      navigate({ to: "/doctor" });
    }
  }, [isLoggedIn, user, navigate]);

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    return getItemSafe<Appointment[]>("medicompare_appointments", userAppointments);
  });

  const cancelAppointment = (id: string) => {
    try {
      const updated = appointments.map((a) => {
        if (a.id === id) {
          return { ...a, status: "Cancelled" };
        }
        return a;
      });
      setAppointments(updated);
      setItemSafe("medicompare_appointments", updated);
      toast.success("Appointment cancelled successfully.");
    } catch {
      toast.error("Failed to cancel appointment.");
    }
  };

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
              {appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{a.id}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardShell>
  );
}
