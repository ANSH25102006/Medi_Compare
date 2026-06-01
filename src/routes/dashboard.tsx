import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarCheck, Star, Bookmark, Settings as SettingsIcon, FileText,
  TrendingUp, Activity, Clock, ArrowUpRight, Wallet, Search as SearchIcon, Download,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { userAppointments, hospitals, recentSearches, medicalRecords, savingsTrend } from "@/lib/mock-data";
import {
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart, BarChart, Bar,
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
  { m: "Jan", v: 1 }, { m: "Feb", v: 2 }, { m: "Mar", v: 1 },
  { m: "Apr", v: 3 }, { m: "May", v: 2 }, { m: "Jun", v: 4 },
];

const statusVariant: Record<string, string> = {
  Upcoming: "bg-primary/10 text-primary",
  Confirmed: "bg-success/15 text-success",
  Completed: "bg-secondary text-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
};

function Dashboard() {
  const user = { name: "Ananya Sharma", role: "Patient", avatar: "https://i.pravatar.cc/120?img=25" };

  const upcoming = userAppointments.filter((a) => a.status === "Upcoming" || a.status === "Confirmed");
  const past = userAppointments.filter((a) => a.status === "Completed");

  const totalSaved = savingsTrend.reduce((a, b) => a + b.saved, 0);

  const stats = [
    { label: "Upcoming", value: upcoming.length, icon: CalendarCheck, hint: "Next: Jun 12", tone: "primary" },
    { label: "Money saved", value: `₹${totalSaved.toLocaleString()}`, icon: Wallet, hint: "Lifetime", tone: "success" },
    { label: "Saved hospitals", value: 6, icon: Bookmark, hint: "+2 this week", tone: "primary" },
    { label: "Past visits", value: past.length, icon: Activity, hint: "This year", tone: "primary" },
  ];

  return (
    <DashboardShell items={navItems} label="Patient" user={user}>
      {/* Hero */}
      <div className="rounded-3xl bg-primary-gradient p-7 text-primary-foreground shadow-elevated md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm opacity-80">Good morning,</p>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">{user.name.split(" ")[0]} 👋</h1>
            <p className="mt-2 max-w-md text-sm opacity-80">
              You have <strong>{upcoming.length} upcoming appointments</strong>. Stay on top of your health.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="rounded-full">
            <Link to="/compare">Book new appointment</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tone === "success" ? "bg-success/15 text-success" : "bg-primary-soft text-primary"}`}><s.icon className="h-5 w-5" /></span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className={`mt-4 text-3xl font-bold ${s.tone === "success" ? "text-success" : ""}`}>{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-xs text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* Charts + saved */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Visits this year</h2>
              <p className="text-sm text-muted-foreground">Your activity at a glance.</p>
            </div>
            <Badge variant="secondary" className="rounded-full"><TrendingUp className="mr-1 h-3 w-3" />+22%</Badge>
          </div>
          <div className="mt-6 h-64">
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
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.93 0.01 250)" }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.56 0.17 250)" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Saved providers</h2>
          <p className="text-sm text-muted-foreground">Quick access to your favorites.</p>
          <ul className="mt-5 space-y-3">
            {hospitals.slice(0, 4).map((h) => (
              <li key={h.id} className="flex items-center gap-3">
                <img src={h.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.city} • ★ {h.rating}</p>
                </div>
                <Button asChild size="sm" variant="ghost" className="rounded-full">
                  <Link to="/hospitals/$hospitalId" params={{ hospitalId: h.id }}>Open</Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Money saved chart + recent searches */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Money saved by comparing</h2>
              <p className="text-sm text-muted-foreground">Total saved this year: <strong className="text-success">₹{totalSaved.toLocaleString()}</strong></p>
            </div>
            <Badge className="rounded-full bg-success/15 text-success hover:bg-success/20"><TrendingUp className="mr-1 h-3 w-3" />+34%</Badge>
          </div>
          <div className="mt-6 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.01 250)" />
                <XAxis dataKey="m" stroke="oklch(0.50 0.03 250)" fontSize={12} />
                <YAxis stroke="oklch(0.50 0.03 250)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.93 0.01 250)" }} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Saved"]} />
                <Bar dataKey="saved" radius={[8, 8, 0, 0]} fill="oklch(0.65 0.16 160)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Recent searches</h2>
          <p className="text-sm text-muted-foreground">Pick up where you left off.</p>
          <ul className="mt-5 space-y-3">
            {recentSearches.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-secondary/40">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><SearchIcon className="h-4 w-4" /></span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{s.query}</p>
                  <p className="text-xs text-muted-foreground">{s.location} • {s.when}</p>
                </div>
                <Button asChild size="sm" variant="ghost" className="rounded-full">
                  <Link to="/compare" search={{ q: s.query, city: s.location }}>Re-run</Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Medical records */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Medical records</h2>
            <p className="text-sm text-muted-foreground">All your reports, in one secure vault.</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full">Upload new</Button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {medicalRecords.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-secondary/40">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><FileText className="h-5 w-5" /></span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.type} • {r.date} • {r.size}</p>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full" aria-label="Download">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>



      {/* Appointments table */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent appointments</h2>
          <Button variant="outline" size="sm" className="rounded-full">View all</Button>
        </div>
        <div className="mt-4 overflow-x-auto">
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
              {userAppointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{a.id}</TableCell>
                  <TableCell className="flex items-center gap-1.5 text-sm"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{a.date}</TableCell>
                  <TableCell className="font-medium">{a.hospital}</TableCell>
                  <TableCell className="text-muted-foreground">{a.service}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusVariant[a.status]}`}>{a.status}</span>
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
