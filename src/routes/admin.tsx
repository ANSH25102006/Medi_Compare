import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Briefcase,
  BadgeDollarSign,
  CalendarCheck,
  Star,
  BarChart3,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adminAppointmentsTrend, servicePopularity } from "@/lib/mock-data";
import { useHospitals } from "@/hooks/use-hospitals";
import { supabase } from "@/lib/supabase";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Hospital Admin — MediCompare" }] }),
  component: AdminPage,
});

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Services", url: "/admin/services", icon: Briefcase },
  { title: "Pricing", url: "/dashboard/admin/pricing", icon: BadgeDollarSign },
  { title: "Appointments", url: "/admin/appointments", icon: CalendarCheck },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
];

function AdminPage() {
  const { user: authUser, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      navigate({ to: "/login", search: { redirect: "/admin" } });
      return;
    }
    if (authUser?.role !== "Admin") {
      toast.error("Access denied. Admin portal is restricted.");
      navigate({ to: "/dashboard" });
    }
  }, [isLoggedIn, authUser, navigate, loading]);

  const { data: hospitalsList = [] } = useHospitals();
  const [services, setServices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    appointmentsCount: 0,
    totalRevenue: 0,
    averageRating: 4.5,
    proceduresCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStatsAndProfile() {
      setLoadingStats(true);
      try {
        // Fetch logged in profile and user ID
        const {
          data: { user: sbUser },
        } = await supabase.auth.getUser();
        if (sbUser) {
          const { data: profData } = await supabase
            .from("profiles")
            .select("*, hospitals(*)")
            .eq("id", sbUser.id)
            .single();
          if (profData) {
            setProfile(profData);
          }
        }

        // 1. Fetch appointments count and total revenue
        const { data: bookings, error: bErr } = await supabase.from("bookings").select("amount");

        let appCount = 0;
        let rev = 0;
        if (!bErr && bookings) {
          appCount = bookings.length;
          rev = bookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
        }

        // 2. Fetch average rating of hospitals
        const { data: ratingData, error: rErr } = await supabase.from("hospitals").select("rating");

        let avgRating = 4.5;
        if (!rErr && ratingData && ratingData.length > 0) {
          const validRatings = ratingData.map((h) => Number(h.rating)).filter((r) => !isNaN(r));
          if (validRatings.length > 0) {
            avgRating =
              Math.round((validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length) * 10) /
              10;
          }
        }

        // 3. Fetch procedures count
        const { count: procCount } = await supabase
          .from("procedures")
          .select("*", { count: "exact", head: true });

        setStats({
          appointmentsCount: appCount,
          totalRevenue: rev,
          averageRating: avgRating,
          proceduresCount: procCount || 0,
        });
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStatsAndProfile();
  }, [authUser]);

  useEffect(() => {
    if (hospitalsList.length > 0) {
      const myHospital =
        hospitalsList.find((h) => h.id === profile?.hospital_id) || hospitalsList[0];
      if (myHospital) {
        setServices(myHospital.services);
      }
    }
  }, [hospitalsList, profile, services.length]);

  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDuration, setNewDuration] = useState("");

  const metrics = useMemo(
    () => [
      {
        label: "Total appointments",
        value: stats.appointmentsCount > 0 ? stats.appointmentsCount.toLocaleString() : "2,930",
        change: "+18%",
        icon: CalendarCheck,
      },
      {
        label: "Monthly revenue",
        value:
          stats.totalRevenue > 0 ? `₹${(stats.totalRevenue / 100000).toFixed(1)} L` : "₹10.4 L",
        change: "+14%",
        icon: BadgeDollarSign,
      },
      {
        label: "Average rating",
        value: `${stats.averageRating || 4.8} ★`,
        change: "+0.2",
        icon: Star,
      },
      {
        label: "Active services",
        value: stats.proceduresCount > 0 ? stats.proceduresCount : services.length,
        change: "Live",
        icon: Briefcase,
      },
    ],
    [stats, services.length],
  );

  if (loading) {
    return null;
  }

  if (!isLoggedIn || authUser?.role !== "Admin") {
    return null;
  }

  const user = {
    name: authUser?.name ?? "Hospital Admin",
    role: "Hospital Admin",
    avatar: authUser?.avatar ?? "https://i.pravatar.cc/120?img=64",
  };

  const addService = () => {
    if (!newName || !newPrice) return;
    setServices([
      ...services,
      { name: newName, price: Number(newPrice), duration: newDuration || "30 min" },
    ]);
    setNewName("");
    setNewPrice("");
    setNewDuration("");
    setOpen(false);
    toast.success("Service added");
  };

  return (
    <DashboardShell items={navItems} label="Hospital admin" user={user}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Operations overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Performance across appointments, revenue, and services.
          </p>
        </div>
        <Button className="rounded-full">Generate report</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-soft hover-card-lift"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <m.icon className="h-5 w-5" />
              </span>
              <Badge variant="secondary" className="rounded-full text-xs font-semibold">
                <TrendingUp className="mr-1 h-3 w-3 text-success" />
                {m.change}
              </Badge>
            </div>
            <p className="mt-4 text-2.5xl font-bold tracking-tight text-foreground">{m.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <h2 className="text-lg font-semibold">Appointments & revenue</h2>
          <p className="text-sm text-muted-foreground">Last 6 months</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adminAppointmentsTrend}>
                <defs>
                  <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.56 0.17 250)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.56 0.17 250)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.66 0.16 160)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.66 0.16 160)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.01 250)" />
                <XAxis dataKey="month" stroke="oklch(0.50 0.03 250)" fontSize={12} />
                <YAxis stroke="oklch(0.50 0.03 250)" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.93 0.01 250)" }}
                />
                <Area
                  type="monotone"
                  dataKey="appointments"
                  stroke="oklch(0.56 0.17 250)"
                  strokeWidth={2}
                  fill="url(#ag1)"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="oklch(0.66 0.16 160)"
                  strokeWidth={2}
                  fill="url(#ag2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Service popularity</h2>
          <p className="text-sm text-muted-foreground">Bookings by service</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={servicePopularity} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid horizontal={false} stroke="oklch(0.93 0.01 250)" />
                <XAxis type="number" stroke="oklch(0.50 0.03 250)" fontSize={12} />
                <YAxis
                  dataKey="service"
                  type="category"
                  width={100}
                  stroke="oklch(0.50 0.03 250)"
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.93 0.01 250)" }}
                />
                <Bar dataKey="bookings" fill="oklch(0.56 0.17 250)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Services & pricing</h2>
            <p className="text-sm text-muted-foreground">
              Manage active services for your hospital.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="mr-1 h-4 w-4" /> Add service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new service</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Service name</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Diabetes Screening"
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Input
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      placeholder="30 min"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addService}>Add service</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.name}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.duration}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    ₹{s.price.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => {
                        setServices(services.filter((x) => x.name !== s.name));
                        toast("Service removed");
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
