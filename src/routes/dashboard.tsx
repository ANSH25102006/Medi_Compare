import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Star,
  Bookmark,
  Settings as SettingsIcon,
  FileText,
  TrendingUp,
  Activity,
  Clock,
  ArrowUpRight,
  Wallet,
  Search as SearchIcon,
  Download,
  Heart,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import {
  userAppointments,
  getHospitalNameById,
  recentSearches,
  medicalRecords,
  savingsTrend,
  healthSpendingBreakdown,
} from "@/lib/mock-data";
import { useHospitals } from "@/hooks/use-hospitals";
import { useAuth } from "@/lib/auth";
import { getItemSafe, setItemSafe } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard — MediCompare" }] }),
  component: Dashboard,
});

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Appointments", url: "/dashboard/appointments", icon: CalendarCheck },
  { title: "Reviews", url: "/dashboard/reviews", icon: Star },
  { title: "Saved Hospitals", url: "/dashboard/saved", icon: Bookmark },
  { title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
];

const visitsData = [
  { m: "Jan", v: 1 },
  { m: "Feb", v: 2 },
  { m: "Mar", v: 1 },
  { m: "Apr", v: 3 },
  { m: "May", v: 2 },
  { m: "Jun", v: 4 },
];

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Upcoming: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
  Confirmed: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  Completed: { bg: "bg-secondary", text: "text-foreground", dot: "bg-muted-foreground" },
  Cancelled: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
};

// Animated counter hook
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

function StatCard({
  label,
  raw,
  prefix = "",
  suffix = "",
  icon: Icon,
  tone,
  hint,
}: {
  label: string;
  raw: number;
  prefix?: string;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "warning";
  hint: string;
}) {
  const count = useCountUp(raw);
  const toneMap = {
    primary: { bg: "bg-primary-soft", icon: "text-primary", value: "" },
    success: { bg: "bg-success/15", icon: "text-success", value: "text-success" },
    warning: { bg: "bg-warning/15", icon: "text-warning", value: "text-warning" },
  };
  const t = toneMap[tone];

  return (
    <div className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-center justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.bg} ${t.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className={`mt-4 text-3xl font-bold ${t.value}`}>
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

type Appointment = {
  id: string;
  date: string;
  hospital: string;
  service: string;
  status: "Upcoming" | "Confirmed" | "Completed" | "Cancelled";
};

function Dashboard() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { data: hospitalsList = [], isLoading } = useHospitals();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/login", search: { redirect: "/dashboard" } });
      return;
    }
    if (user?.role === "Admin") {
      navigate({ to: "/admin" });
    } else if (user?.role === "Doctor") {
      navigate({ to: "/doctor" });
    }
  }, [isLoggedIn, user, navigate]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn || !user?.email) return;

    async function loadDashboardData() {
      const localSaved = getItemSafe<string[]>(
        "medicompare_saved_hospitals",
        ["apollo-central", "fortis-greens", "max-superspecialty", "manipal-city"]
      );
      setSavedCount(localSaved.length);

      const localAppts = getItemSafe<Appointment[]>("medicompare_appointments", userAppointments);
      setAppointments(localAppts);

      try {
        const { data: favs, error: favsErr } = await supabase
          .from("favorites")
          .select("hospital_id")
          .eq("user_email", user.email);

        if (favsErr) throw favsErr;
        const favIds = (favs || []).map((f: any) => f.hospital_id);
        const mergedFavs = Array.from(new Set([...localSaved, ...favIds]));
        setSavedCount(mergedFavs.length);
        setItemSafe("medicompare_saved_hospitals", mergedFavs);

        const { data: bookingsData, error: bookingsErr } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_email", user.email);

        if (bookingsErr) throw bookingsErr;
        const dbAppts = (bookingsData || []).map((b: any) => ({
          id: b.id,
          date: b.booking_date,
          hospital: getHospitalNameById(b.hospital_id, hospitalsList),
          service: b.service_name,
          status: b.status as any,
        }));

        const seenIds = new Set(dbAppts.map((a) => a.id));
        const uniqueLocal = localAppts.filter((la) => !seenIds.has(la.id));
        const mergedAppts = [...dbAppts, ...uniqueLocal];
        setAppointments(mergedAppts);
        setItemSafe("medicompare_appointments", mergedAppts);
      } catch (err) {
        console.warn("Failed to load dashboard metrics from Supabase, using local fallback:", err);
      }
    }

    loadDashboardData();
  }, [isLoggedIn, user?.email, hospitalsList]);

  if (!isLoggedIn || user?.role !== "Patient") {
    return null;
  }

  const authUser = {
    name: user?.name ?? "Patient",
    role: user?.role ?? "Patient",
    avatar: user?.avatar ?? "https://i.pravatar.cc/120?img=25",
  };

  const upcoming = appointments.filter((a) => a.status === "Upcoming" || a.status === "Confirmed");
  const past = appointments.filter((a) => a.status === "Completed");
  const totalSaved = savingsTrend.reduce((a, b) => a + b.saved, 0);

  const stats = [
    {
      label: "Upcoming Appointments",
      raw: upcoming.length,
      icon: CalendarCheck,
      hint: "Next slot reserved",
      tone: "primary" as const,
      prefix: "",
      suffix: "",
    },
    {
      label: "Money Saved",
      raw: totalSaved,
      icon: Wallet,
      hint: "Lifetime savings vs. average",
      tone: "success" as const,
      prefix: "₹",
      suffix: "",
    },
    {
      label: "Saved Hospitals",
      raw: savedCount,
      icon: Bookmark,
      hint: "Bookmarked providers",
      tone: "primary" as const,
      prefix: "",
      suffix: "",
    },
    {
      label: "Past Visits",
      raw: past.length,
      icon: Activity,
      hint: "This year",
      tone: "primary" as const,
      prefix: "",
      suffix: "",
    },
  ];

  return (
    <DashboardShell items={navItems} label="Patient" user={authUser}>
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-primary-gradient p-7 text-primary-foreground shadow-elevated md:p-10">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm opacity-80">Good morning,</p>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">
              {authUser.name.split(" ")[0]} 👋
            </h1>
            <p className="mt-2 max-w-md text-sm opacity-80">
              You have <strong>{upcoming.length} upcoming appointments</strong>. You've saved{" "}
              <strong>₹{totalSaved.toLocaleString()}</strong> this year by comparing prices.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Patient
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <Heart className="h-3.5 w-3.5" /> Health Score: 78/100
              </span>
            </div>
          </div>
          <Button asChild size="lg" variant="secondary" className="rounded-full shadow-elevated">
            <Link to="/compare">
              <Plus className="mr-1.5 h-4 w-4" /> Book New Appointment
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Upcoming appointments highlight */}
      {upcoming.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Upcoming Appointments</h2>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
              <Link to="/dashboard/appointments">
                View all <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((a) => {
              const st = statusConfig[a.status];
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft hover:shadow-elevated transition-all"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Stethoscope className="h-5 w-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold">{a.hospital}</p>
                    <p className="text-xs text-muted-foreground">{a.service}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {a.date}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${st.bg} ${st.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                    {a.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts row 1 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Visits chart */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">Visits this year</h2>
              <p className="text-sm text-muted-foreground">Your appointment activity.</p>
            </div>
            <Badge variant="secondary" className="rounded-full">
              <TrendingUp className="mr-1 h-3 w-3" />
              +22%
            </Badge>
          </div>
          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitsData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.56 0.17 250)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.56 0.17 250)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.01 250)" />
                <XAxis dataKey="m" stroke="oklch(0.50 0.03 250)" fontSize={12} />
                <YAxis stroke="oklch(0.50 0.03 250)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.93 0.01 250)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="oklch(0.56 0.17 250)"
                  strokeWidth={2.5}
                  fill="url(#g1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health spending donut */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-base font-bold">Health Spending</h2>
          <p className="text-sm text-muted-foreground">Breakdown by category.</p>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthSpendingBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {healthSpendingBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [`${v}%`, ""]}
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1.5">
            {healthSpendingBreakdown.map((d) => (
              <li key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold">{d.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Money saved bar chart */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">Money saved by comparing</h2>
              <p className="text-sm text-muted-foreground">
                Total: <strong className="text-success">₹{totalSaved.toLocaleString()}</strong>
              </p>
            </div>
            <Badge className="rounded-full bg-success/15 text-success hover:bg-success/20">
              <TrendingUp className="mr-1 h-3 w-3" />
              +34%
            </Badge>
          </div>
          <div className="mt-6 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.01 250)" />
                <XAxis dataKey="m" stroke="oklch(0.50 0.03 250)" fontSize={12} />
                <YAxis stroke="oklch(0.50 0.03 250)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.93 0.01 250)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, "Saved"]}
                />
                <Bar dataKey="saved" radius={[8, 8, 0, 0]} fill="oklch(0.65 0.16 160)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent searches */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-base font-bold">Recent searches</h2>
          <p className="text-sm text-muted-foreground">Pick up where you left off.</p>
          <ul className="mt-4 space-y-2.5">
            {recentSearches.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-border p-2.5 transition-colors hover:bg-secondary/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <SearchIcon className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{s.query}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.location} · {s.when}
                  </p>
                </div>
                <Button asChild size="sm" variant="ghost" className="rounded-full text-xs px-2">
                  <Link to="/compare" search={{ q: s.query, city: s.location }}>
                    →
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Saved providers */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold">Saved Hospitals</h2>
            <p className="text-sm text-muted-foreground">Quick access to your favorites.</p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
            <Link to="/dashboard/saved">View all</Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="h-10 w-10 rounded-lg bg-secondary shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-secondary rounded w-3/4" />
                  <div className="h-2 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))
          ) : (
            hospitalsList.slice(0, 4).map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-secondary/30"
              >
                <img src={h.image} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{h.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    ★ {h.rating} · {h.city}
                  </p>
                </div>
                <Button asChild size="sm" variant="ghost" className="rounded-full px-2">
                  <Link to="/hospitals/$hospitalId" params={{ hospitalId: h.id }}>
                    →
                  </Link>
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Medical records */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold">Medical Records</h2>
            <p className="text-sm text-muted-foreground">All your reports in one secure vault.</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-xs">
            Upload new
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {medicalRecords.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-secondary/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold">{r.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {r.type} · {r.date} · {r.size}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full h-8 w-8"
                aria-label="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Appointments table */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">All Appointments</h2>
          <Button variant="outline" size="sm" className="rounded-full text-xs">
            Export
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((a) => {
                const st = statusConfig[a.status];
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {a.id}
                    </TableCell>
                    <TableCell className="flex items-center gap-1.5 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {a.date}
                    </TableCell>
                    <TableCell className="font-semibold">{a.hospital}</TableCell>
                    <TableCell className="text-muted-foreground">{a.service}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${st.bg} ${st.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        {a.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardShell>
  );
}
