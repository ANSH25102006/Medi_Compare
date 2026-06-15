import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Star,
  Bookmark,
  Settings as SettingsIcon,
  TrendingUp,
  Activity,
  Clock,
  ArrowUpRight,
  Wallet,
  Search as SearchIcon,
  Download,
  Plus,
  RefreshCw,
  Building,
  User,
  Sliders,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useHospitals } from "@/hooks/use-hospitals";
import { useAuth } from "@/lib/auth";
import { getItemSafe, setItemSafe } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Platform Dashboard — MediCompare" }] }),
  component: Dashboard,
});

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Appointments", url: "/dashboard/appointments", icon: CalendarCheck },
  { title: "Reviews", url: "/dashboard/reviews", icon: Star },
  { title: "Saved Hospitals", url: "/dashboard/saved", icon: Bookmark },
  { title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
];

// High fidelity platform fallback bookings (recent)
const platformMockBookings = [
  {
    id: "MC-8421",
    patient: "Aarav Sharma",
    hospital: "Apollo Specialty Hospital",
    treatment: "MRI Scan",
    paymentStatus: "Paid",
    amount: 7500,
    date: "2026-06-15",
  },
  {
    id: "MC-7832",
    patient: "Aditi Rao",
    hospital: "Fortis Greens Medical Center",
    treatment: "Cardiac Consultation",
    paymentStatus: "Paid",
    amount: 1000,
    date: "2026-06-15",
  },
  {
    id: "MC-9321",
    patient: "Vikram Malhotra",
    hospital: "Max Super Speciality Hospital",
    treatment: "CT Scan",
    paymentStatus: "Paid",
    amount: 5400,
    date: "2026-06-14",
  },
  {
    id: "MC-4821",
    patient: "Priya Patel",
    hospital: "Manipal City Hospital",
    treatment: "Full Body Health Checkup",
    paymentStatus: "Paid",
    amount: 4100,
    date: "2026-06-14",
  },
  {
    id: "MC-5921",
    patient: "Rohan Das",
    hospital: "Kokilaben Dhirubhai Ambani Hospital",
    treatment: "Blood Test Panel",
    paymentStatus: "Paid",
    amount: 850,
    date: "2026-06-13",
  },
  {
    id: "MC-6712",
    patient: "Neha Gupta",
    hospital: "Medanta The Medicity",
    treatment: "Orthopedic Consultation",
    paymentStatus: "Paid",
    amount: 1100,
    date: "2026-06-13",
  },
  {
    id: "MC-3290",
    patient: "Suresh Kumar",
    hospital: "Care Hospitals, Banjara Hills",
    treatment: "Ultrasound",
    paymentStatus: "Paid",
    amount: 1200,
    date: "2026-06-12",
  },
  {
    id: "MC-2841",
    patient: "Karan Johar",
    hospital: "Continental Hospitals",
    treatment: "Endoscopy",
    paymentStatus: "Paid",
    amount: 5800,
    date: "2026-06-12",
  },
  {
    id: "MC-1049",
    patient: "Ananya Panday",
    hospital: "Fortis Hospital, Bannerghatta Road",
    treatment: "Full Body Health Checkup",
    paymentStatus: "Paid",
    amount: 4300,
    date: "2026-06-11",
  },
  {
    id: "MC-0951",
    patient: "Ishaan Khatter",
    hospital: "Apollo Specialty Hospital, OMR",
    treatment: "Cardiac Consultation",
    paymentStatus: "Refunded",
    amount: 1100,
    date: "2026-06-10",
  },
];

const chartData = {
  daily: [
    { name: "Mon", bookings: 42 },
    { name: "Tue", bookings: 48 },
    { name: "Wed", bookings: 51 },
    { name: "Thu", bookings: 45 },
    { name: "Fri", bookings: 49 },
    { name: "Sat", bookings: 55 },
    { name: "Sun", bookings: 58 },
  ],
  weekly: [
    { name: "Wk 21", bookings: 280 },
    { name: "Wk 22", bookings: 310 },
    { name: "Wk 23", bookings: 295 },
    { name: "Wk 24", bookings: 320 },
    { name: "Wk 25", bookings: 340 },
    { name: "Wk 26", bookings: 365 },
  ],
  monthly: [
    { name: "Jan", bookings: 1120 },
    { name: "Feb", bookings: 1240 },
    { name: "Mar", bookings: 1180 },
    { name: "Apr", bookings: 1350 },
    { name: "May", bookings: 1480 },
    { name: "Jun", bookings: 1590 },
  ],
};

const mostViewedHospitals = [
  {
    id: "max-superspecialty",
    name: "Max Super Speciality Hospital",
    city: "New Delhi",
    views: "8.4k",
    rating: 4.9,
  },
  {
    id: "apollo-central",
    name: "Apollo Specialty Hospital",
    city: "Bengaluru",
    views: "7.2k",
    rating: 4.8,
  },
  {
    id: "kokilaben",
    name: "Kokilaben Dhirubhai Ambani Hospital",
    city: "Mumbai",
    views: "6.8k",
    rating: 4.8,
  },
  {
    id: "fortis-greens",
    name: "Fortis Greens Medical Center",
    city: "Noida",
    views: "5.9k",
    rating: 4.7,
  },
  { id: "medanta", name: "Medanta The Medicity", city: "Gurugram", views: "5.5k", rating: 4.7 },
];

const mostBookedHospitals = [
  {
    id: "max-superspecialty",
    name: "Max Super Speciality Hospital",
    city: "New Delhi",
    bookings: 642,
    rating: 4.9,
  },
  {
    id: "apollo-central",
    name: "Apollo Specialty Hospital",
    city: "Bengaluru",
    bookings: 580,
    rating: 4.8,
  },
  {
    id: "manipal-city",
    name: "Manipal City Hospital",
    city: "Bengaluru",
    bookings: 490,
    rating: 4.6,
  },
  {
    id: "fortis-greens",
    name: "Fortis Greens Medical Center",
    city: "Noida",
    bookings: 430,
    rating: 4.7,
  },
  {
    id: "kokilaben",
    name: "Kokilaben Dhirubhai Ambani Hospital",
    city: "Mumbai",
    bookings: 385,
    rating: 4.8,
  },
];

function Dashboard() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: hospitalsList = [], isLoading: loadingHospitals } = useHospitals();

  const bookingsRef = useRef<HTMLDivElement>(null);

  // Authenticate user & role check
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

  // States
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartTab, setChartTab] = useState<"daily" | "weekly" | "monthly">("daily");

  // Table state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add Hospital Dialog states
  const [isAddHospitalOpen, setIsAddHospitalOpen] = useState(false);
  const [newHospName, setNewHospName] = useState("");
  const [newHospCity, setNewHospCity] = useState("Bengaluru");
  const [newHospType, setNewHospType] = useState("General Hospital");
  const [newHospPhone, setNewHospPhone] = useState("");
  const [newHospAddress, setNewHospAddress] = useState("");
  const [newHospDesc, setNewHospDesc] = useState("");

  const [currentDate, setCurrentDate] = useState(() =>
    new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  );

  // Load bookings from Supabase
  const fetchDbBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDbBookings(data || []);
    } catch (err) {
      console.warn("Supabase bookings query failed. Using offline fallbacks.", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user?.role === "Patient") {
      fetchDbBookings();
    }
  }, [isLoggedIn, user?.role]);

  if (!isLoggedIn || user?.role !== "Patient") {
    return null;
  }

  // Refresh dashboard data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    );
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["hospitals"] }),
      fetchDbBookings(),
    ]);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Dashboard refreshed successfully.");
    }, 600);
  };

  // Add Hospital submit handler
  const handleAddHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospName || !newHospAddress) {
      toast.error("Please enter a name and address for the hospital.");
      return;
    }

    const newHospId = `hosp-${Date.now()}`;
    const newHospital = {
      id: newHospId,
      name: newHospName,
      city: newHospCity,
      type: newHospType,
      rating: 4.8,
      image_url:
        "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80",
      description:
        newHospDesc || "A modern healthcare facility delivering top-tier healthcare programs.",
      address: newHospAddress,
      phone: newHospPhone || "+91 80 9876 5432",
    };

    try {
      const { error } = await supabase.from("hospitals").insert([newHospital]);
      if (error) throw error;
      toast.success("Hospital listed in database!");
    } catch (err) {
      console.warn(
        "Failed to write to database (RLS restricts writes). Writing to local sandbox environment.",
        err,
      );
      // Fallback
      const cached = getItemSafe<any[]>("medicompare_hospitals_cache", []);
      setItemSafe("medicompare_hospitals_cache", [newHospital, ...cached]);
      toast.success("Hospital successfully listed in local sandbox!");
    } finally {
      setNewHospName("");
      setNewHospPhone("");
      setNewHospAddress("");
      setNewHospDesc("");
      setIsAddHospitalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Booking ID", "Patient", "Hospital", "Treatment", "Status", "Date", "Amount"];
    const rows = allBookings.map((b) => [
      b.id,
      b.patient,
      b.hospital,
      b.treatment,
      b.paymentStatus,
      b.date,
      `INR ${b.amount}`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `medicompare_bookings_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded.");
  };

  // Scroll smooth to bookings table
  const handleScrollViewBookings = () => {
    bookingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Prepare bookings list
  const dbBookingsMapped = dbBookings.map((b: any) => ({
    id: b.id,
    patient: b.user_name || "Anonymous Patient",
    hospital: b.hospital_name || "Hospital",
    treatment: b.service_name || "Consultation",
    paymentStatus: b.payment_status || "Paid",
    amount: b.amount || 1500,
    date: b.booking_date || new Date(b.created_at).toISOString().slice(0, 10),
  }));

  const allBookings = [...dbBookingsMapped, ...platformMockBookings];

  // Stats computation
  const totalBookingsCount = 1248 + dbBookings.length;
  const dbBookingsRevenue = dbBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalRevenue = 5624000 + dbBookingsRevenue;
  const activeHospitalsCount = hospitalsList.length > 0 ? hospitalsList.length : 11;
  const conversionRate = "4.2%";

  // Filter Bookings Table
  const filteredBookings = allBookings.filter((b) => {
    const query = searchTerm.toLowerCase();
    return (
      b.patient.toLowerCase().includes(query) ||
      b.hospital.toLowerCase().includes(query) ||
      b.treatment.toLowerCase().includes(query)
    );
  });

  // Paginated bookings
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const authUser = {
    name: user?.name ?? "Patient",
    role: "Patient Dashboard",
    avatar: user?.avatar ?? "https://i.pravatar.cc/120?img=25",
  };

  return (
    <DashboardShell items={navItems} label="Operations" user={authUser}>
      <div className="flex flex-col gap-6">
        {/* SECTION 1 — HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5 order-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              Welcome back, Ansh
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Here's what's happening on MediCompare today.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1.5 rounded-full border border-border">
              {currentDate}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border border-border bg-card shadow-soft text-xs"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* SECTION 2 — KPI GRID */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 order-2">
          {/* Card 1 */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between h-[135px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Total Bookings
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
                <CalendarCheck className="h-4.5 w-4.5" />
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground mt-2">
                {totalBookingsCount.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-success">
                <TrendingUp className="h-3 w-3" />
                <span>+12.4% this month</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between h-[135px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Revenue Generated
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/5 text-success">
                <Wallet className="h-4.5 w-4.5" />
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground mt-2">
                ₹{totalRevenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-success">
                <TrendingUp className="h-3 w-3" />
                <span>+8.2% this month</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between h-[135px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Hospitals Listed
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                <Building className="h-4.5 w-4.5" />
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground mt-2">{activeHospitalsCount}</p>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success inline-block"></span>
                <span>Active & Verified</span>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between h-[135px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Conversion Rate
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
                <Activity className="h-4.5 w-4.5" />
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground mt-2">{conversionRate}</p>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-success">
                <TrendingUp className="h-3 w-3" />
                <span>+0.3% vs last week</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — BOOKINGS OVERVIEW */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft order-6 md:order-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-foreground">Bookings Overview</h2>
              <p className="text-xs text-muted-foreground">Total platform bookings over time.</p>
            </div>
            <div className="flex rounded-lg bg-secondary p-1 text-xs font-medium self-start sm:self-auto">
              {(["daily", "weekly", "monthly"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChartTab(tab)}
                  className={`rounded-md px-3 py-1.5 transition-all uppercase tracking-wider text-[10px] ${
                    chartTab === tab
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData[chartTab]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    fontSize: 12,
                  }}
                  formatter={(value: any) => [`${value} bookings`, "Volume"]}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fill="url(#primaryGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION 4 — RECENT BOOKINGS */}
        <div
          ref={bookingsRef}
          className="rounded-2xl border border-border bg-card p-6 shadow-soft order-4 md:order-4 scroll-mt-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-foreground">Recent Bookings</h2>
              <p className="text-xs text-muted-foreground">
                Monitor platform booking traffic in real time.
              </p>
            </div>
            <div className="flex items-center gap-3 max-w-sm w-full sm:w-72">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary border border-border text-muted-foreground shrink-0">
                <SearchIcon className="h-4 w-4" />
              </span>
              <Input
                type="text"
                placeholder="Search patient, hospital, treatment..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page
                }}
                className="h-9 rounded-xl border-border bg-card text-xs focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl">
            <Table>
              <TableHeader className="bg-secondary/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Patient
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Hospital
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Treatment
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Booking Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Payment Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBookings.length > 0 ? (
                  paginatedBookings.map((b, i) => (
                    <TableRow
                      key={b.id + "-" + i}
                      className="hover:bg-secondary/20 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground text-xs py-3.5">
                        {b.patient}
                      </TableCell>
                      <TableCell className="text-xs text-foreground py-3.5">{b.hospital}</TableCell>
                      <TableCell className="text-xs text-muted-foreground py-3.5">
                        {b.treatment}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-3.5 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {b.date}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                            b.paymentStatus === "Paid"
                              ? "bg-success/5 text-success border-success/20"
                              : b.paymentStatus === "Refunded"
                                ? "bg-muted text-muted-foreground border-border"
                                : "bg-warning/5 text-warning border-warning/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              b.paymentStatus === "Paid"
                                ? "bg-success"
                                : b.paymentStatus === "Refunded"
                                  ? "bg-muted-foreground"
                                  : "bg-warning"
                            }`}
                          />
                          {b.paymentStatus}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-xs text-muted-foreground py-8"
                    >
                      No matching bookings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4 mt-4 text-xs">
              <span className="text-muted-foreground">
                Showing {Math.min(filteredBookings.length, (currentPage - 1) * itemsPerPage + 1)}-
                {Math.min(filteredBookings.length, currentPage * itemsPerPage)} of{" "}
                {filteredBookings.length} records
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5 — HOSPITAL PERFORMANCE */}
        <div className="grid gap-6 md:grid-cols-2 order-5 md:order-5">
          {/* Left Column: Views */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4">
              <h2 className="text-base font-bold text-foreground">Most Viewed Hospitals</h2>
              <p className="text-xs text-muted-foreground">
                Most visited hospital profiles this month.
              </p>
            </div>
            <div className="divide-y divide-border">
              {mostViewedHospitals.map((h, index) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold font-mono text-muted-foreground bg-secondary w-7 h-7 flex items-center justify-center rounded-lg">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {h.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {h.city} · ★ {h.rating}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="rounded-full text-[10px] px-2.5 py-0.5">
                    {h.views} views
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Bookings */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4">
              <h2 className="text-base font-bold text-foreground">Most Booked Hospitals</h2>
              <p className="text-xs text-muted-foreground">
                Providers securing highest appointment counts.
              </p>
            </div>
            <div className="divide-y divide-border">
              {mostBookedHospitals.map((h, index) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold font-mono text-muted-foreground bg-secondary w-7 h-7 flex items-center justify-center rounded-lg">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {h.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {h.city} · ★ {h.rating}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary/5 border border-primary/10 text-primary rounded-full text-[10px] px-2.5 py-0.5 hover:bg-primary/10">
                    {h.bookings} bookings
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 6 — SEARCH INSIGHTS */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft order-3 md:order-6">
          <div className="mb-6">
            <h2 className="text-base font-bold text-foreground">Search Insights</h2>
            <p className="text-xs text-muted-foreground">
              Most frequent user query topics and regions.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Treatments */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block"></span>
                Treatments
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "MRI Scan", count: "1.2k" },
                  { name: "Full Body Checkup", count: "980" },
                  { name: "Blood Test Panel", count: "850" },
                  { name: "CT Scan", count: "720" },
                  { name: "Cardiac Consultation", count: "610" },
                ].map((item) => (
                  <span
                    key={item.name}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 text-secondary-foreground border border-border/80 px-2.5 py-1 text-[11px] font-medium"
                  >
                    {item.name}
                    <span className="text-[10px] text-muted-foreground bg-card border border-border px-1.5 py-0.2 rounded-md">
                      {item.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Cities */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success inline-block"></span>
                Cities
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Bengaluru", count: "2.4k" },
                  { name: "Mumbai", count: "1.9k" },
                  { name: "New Delhi", count: "1.6k" },
                  { name: "Hyderabad", count: "1.1k" },
                  { name: "Chennai", count: "950" },
                ].map((item) => (
                  <span
                    key={item.name}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 text-secondary-foreground border border-border/80 px-2.5 py-1 text-[11px] font-medium"
                  >
                    {item.name}
                    <span className="text-[10px] text-muted-foreground bg-card border border-border px-1.5 py-0.2 rounded-md">
                      {item.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-warning inline-block"></span>
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Cardiology", count: "1.5k" },
                  { name: "Oncology", count: "1.2k" },
                  { name: "Neurology", count: "980" },
                  { name: "Orthopedics", count: "850" },
                  { name: "Pediatrics", count: "720" },
                ].map((item) => (
                  <span
                    key={item.name}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 text-secondary-foreground border border-border/80 px-2.5 py-1 text-[11px] font-medium"
                  >
                    {item.name}
                    <span className="text-[10px] text-muted-foreground bg-card border border-border px-1.5 py-0.2 rounded-md">
                      {item.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 7 — QUICK ACTIONS */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft order-7">
          <div className="mb-4">
            <h2 className="text-base font-bold text-foreground">Quick Actions</h2>
            <p className="text-xs text-muted-foreground">
              Standard operational quick utilities for the platform.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-11 rounded-xl border border-border bg-card hover:bg-secondary/40 text-xs font-semibold text-foreground flex items-center justify-center gap-2 shadow-soft transition-all duration-200 hover:-translate-y-0.5"
              onClick={() => setIsAddHospitalOpen(true)}
            >
              <Plus className="h-4 w-4 text-primary" />
              Add Hospital
            </Button>

            <Button
              variant="outline"
              className="h-11 rounded-xl border border-border bg-card hover:bg-secondary/40 text-xs font-semibold text-foreground flex items-center justify-center gap-2 shadow-soft transition-all duration-200 hover:-translate-y-0.5"
              onClick={handleScrollViewBookings}
            >
              <Sliders className="h-4 w-4 text-muted-foreground" />
              View Bookings
            </Button>

            <Button
              variant="outline"
              asChild
              className="h-11 rounded-xl border border-border bg-card hover:bg-secondary/40 text-xs font-semibold text-foreground flex items-center justify-center gap-2 shadow-soft transition-all duration-200 hover:-translate-y-0.5"
            >
              <Link to="/dashboard/reviews">
                <Star className="h-4 w-4 text-warning" />
                Manage Reviews
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-11 rounded-xl border border-border bg-card hover:bg-secondary/40 text-xs font-semibold text-foreground flex items-center justify-center gap-2 shadow-soft transition-all duration-200 hover:-translate-y-0.5"
              onClick={handleExportCSV}
            >
              <Download className="h-4 w-4 text-success" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* Add Hospital Modal */}
      <Dialog open={isAddHospitalOpen} onOpenChange={setIsAddHospitalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl border border-border bg-card shadow-elevated">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-display text-foreground">
              Add Hospital
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Add a new hospital profile to the platform registry. Fill out the operational details
              below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddHospitalSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="hosp-name" className="text-xs font-semibold">
                Hospital Name
              </Label>
              <Input
                id="hosp-name"
                value={newHospName}
                onChange={(e) => setNewHospName(e.target.value)}
                placeholder="e.g. Apollo Super Specialty Hospital"
                className="h-10 rounded-xl border border-input text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="hosp-city" className="text-xs font-semibold">
                  City
                </Label>
                <select
                  id="hosp-city"
                  value={newHospCity}
                  onChange={(e) => setNewHospCity(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {[
                    "Bengaluru",
                    "Mumbai",
                    "New Delhi",
                    "Gurugram",
                    "Noida",
                    "Hyderabad",
                    "Chennai",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="hosp-type" className="text-xs font-semibold">
                  Hospital Type
                </Label>
                <select
                  id="hosp-type"
                  value={newHospType}
                  onChange={(e) => setNewHospType(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {["General Hospital", "Specialty Hospital", "Super Speciality"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="hosp-phone" className="text-xs font-semibold">
                Phone Number
              </Label>
              <Input
                id="hosp-phone"
                value={newHospPhone}
                onChange={(e) => setNewHospPhone(e.target.value)}
                placeholder="e.g. +91 80 4567 8900"
                className="h-10 rounded-xl border border-input text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="hosp-address" className="text-xs font-semibold">
                Address
              </Label>
              <Input
                id="hosp-address"
                value={newHospAddress}
                onChange={(e) => setNewHospAddress(e.target.value)}
                placeholder="e.g. MG Road, Indiranagar, Bengaluru"
                className="h-10 rounded-xl border border-input text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="hosp-desc" className="text-xs font-semibold">
                Description
              </Label>
              <Textarea
                id="hosp-desc"
                value={newHospDesc}
                onChange={(e) => setNewHospDesc(e.target.value)}
                placeholder="Brief information about specialties, facilities, etc."
                className="rounded-xl border border-input text-xs min-h-[72px]"
              />
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full text-xs"
                onClick={() => setIsAddHospitalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-full text-xs">
                List Hospital
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
