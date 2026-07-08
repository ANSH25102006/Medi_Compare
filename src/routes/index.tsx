import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  MapPin,
  ShieldCheck,
  Scale,
  Star,
  CalendarCheck,
  Stethoscope,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteShell } from "@/components/site/SiteShell";
import { HospitalCard } from "@/components/site/HospitalCard";
import { PopularServices } from "@/components/site/PopularServices";
import { HospitalNetworkTrust } from "@/components/site/HospitalNetworkTrust";

import { HeroInteractiveDashboard } from "@/components/site/HeroInteractiveDashboard";
import { testimonials, faqs } from "@/lib/mock-data";
import { useHospitals } from "@/hooks/use-hospitals";
import { CardSkeleton } from "@/components/site/SkeletonLoader";
import { useState, useEffect, useRef } from "react";
import { ComparisonDemo } from "@/components/site/ComparisonDemo";
import { TrustMetricsBar } from "@/components/site/TrustMetricsBar";
import { ScrollReveal } from "@/components/site/ScrollReveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediCompare — Find Quality Healthcare at the Right Price" },
      {
        name: "description",
        content:
          "Compare medical service costs, discover trusted hospitals, and book appointments instantly.",
      },
    ],
  }),
  component: Landing,
});

export const features = [
  {
    icon: Scale,
    title: "Price Transparency",
    desc: "See verified pricing for every service across hospitals.",
    colorClass: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Stethoscope,
    title: "Hospital Comparison",
    desc: "Compare specialties, doctors, and facilities side by side.",
    colorClass: "bg-indigo-500/10 text-indigo-600",
  },
  {
    icon: ShieldCheck,
    title: "Verified Reviews",
    desc: "Every review is tied to a confirmed appointment.",
    colorClass: "bg-teal-500/10 text-teal-600",
  },
  {
    icon: CalendarCheck,
    title: "Instant Booking",
    desc: "Reserve appointment slots in seconds, 24/7.",
    colorClass: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: MapPin,
    title: "Nearby Hospitals",
    desc: "Find quality providers within minutes of you.",
    colorClass: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    desc: "Personalized matches based on your needs and history.",
    colorClass: "bg-indigo-500/10 text-indigo-600",
  },
];

export const stepsData = [
  {
    n: "01",
    title: "Search a service",
    desc: "Tell us what you need — from MRI scans to specialty doctor consultations.",
    journey: 'Search "MRI Scan"',
    outcome: "See prices from 12 hospitals",
    icon: Search,
  },
  {
    n: "02",
    title: "Compare options",
    desc: "Browse verified hospital prices, patient reviews, and distance side-by-side.",
    journey: "Compare prices & ratings",
    outcome: "Identify ₹3,300 savings",
    icon: Scale,
  },
  {
    n: "03",
    title: "Choose a provider",
    desc: "Read verified patient experiences and check real-time slot availability.",
    journey: "Select top hospital",
    outcome: "View reviews & availability",
    icon: ShieldCheck,
  },
  {
    n: "04",
    title: "Book instantly",
    desc: "Confirm your appointment slot in a few clicks with no hidden fees.",
    journey: "Confirm slot instantly",
    outcome: "Receive booking confirmation",
    icon: CalendarCheck,
  },
];

const homeTestimonials = [
  {
    name: "Ananya Sharma",
    avatar: "https://i.pravatar.cc/120?img=25",
    text: "MediCompare saved me 40% on my MRI scan. The booking process was effortless and the hospital was top-notch.",
    treatment: "MRI Brain Scan",
    hospital: "Apollo Specialty Hospital",
    rating: 5,
    verified: true,
  },
  {
    name: "Rahul Verma",
    avatar: "https://i.pravatar.cc/120?img=11",
    text: "Finally a transparent way to compare hospital prices. I trusted the reviews and had a great experience.",
    treatment: "Full Body Checkup",
    hospital: "Fortis Greens Medical Center",
    rating: 5,
    verified: true,
  },
  {
    name: "Priyanshu Mehta",
    avatar: "https://i.pravatar.cc/120?img=33",
    text: "Compare and book instantly! Saved over ₹3,000 on my cardiac checkup. Incredible customer service too.",
    treatment: "Cardiac Consultation",
    hospital: "Max Super Speciality Hospital",
    rating: 5,
    verified: true,
  },
];

function Landing() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const { data: hospitalsList = [], isLoading, error } = useHospitals();


  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-[#F8FAFC] min-h-[660px] md:min-h-[760px] flex items-center">
        {/* Layered Lighting & Blurred Ambient Elements */}
        <div className="absolute -left-1/4 -top-1/4 w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.04)_0%,transparent_70%)] blur-3xl pointer-events-none" />
        <div className="absolute -right-1/4 -bottom-1/4 w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.04)_0%,transparent_70%)] blur-3xl pointer-events-none" />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.02] bg-[linear-gradient(to_right,oklch(0.55_0.22_260)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.55_0.22_260)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 md:py-32 lg:grid-cols-2 lg:px-8 w-full items-center">
          {/* Left Side Content */}
          <div className="animate-fade-in flex flex-col justify-center relative">
            <div className="flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-bold text-primary backdrop-blur-md shadow-sm transition-all relative z-10">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              Empowering 50,000+ patients
            </div>

            <h1 className="mt-8 text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-[4.2rem] relative z-10">
              Compare healthcare before you choose.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground font-medium sm:text-lg relative z-10 text-balance">
              Compare local hospital pricing, doctor availability, patient ratings, and insurance networks. Book verified slots instantly with full financial transparency.
            </p>

            {/* Premium Search Experience */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/compare", search: { q, city } });
              }}
              className="mt-8 flex flex-col gap-2 rounded-[24px] border border-border bg-card p-3 shadow-soft sm:flex-row sm:items-center relative z-25"
            >
              <div className="flex flex-1 items-center gap-2 px-3 py-2.5">
                <Search className="h-4 w-4 text-primary shrink-0 opacity-80" />
                <Input
                  id="search-query-input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search scans, consultations, doctors..."
                  className="h-auto border-0 bg-transparent p-0 text-xs font-semibold shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 text-foreground"
                />
              </div>
              <div className="hidden h-6 w-px bg-border/45 sm:block" />
              <div className="flex flex-1 items-center gap-2 px-3 py-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 opacity-80" />
                <Input
                  id="search-city-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Your City"
                  className="h-auto border-0 bg-transparent p-0 text-xs font-semibold shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 text-foreground"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="rounded-lg h-10 px-6 font-bold text-xs bg-primary hover:shadow-[0_4px_12px_rgba(var(--ring),0.2)] text-primary-foreground transition-all duration-200 cursor-pointer shadow-sm btn-interactive"
              >
                Search
              </Button>
            </form>

            {/* Popular Searches for One-Click Population */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 relative z-20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Popular:</span>
              {[
                "MRI Scan",
                "CT Scan",
                "Blood Test",
                "Ultrasound",
                "Dental Care",
                "Cardiac Checkup",
              ].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQ(term);
                    const inputEl = document.getElementById("search-query-input");
                    if (inputEl) {
                      inputEl.focus();
                    }
                  }}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-primary-soft hover:text-primary hover:border-primary/20 transition-all duration-150 cursor-pointer shadow-sm active:scale-95 btn-interactive"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Redesigned Trust Badges */}
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 border-t border-border/40 pt-8 relative z-10">
              {[
                { label: "500+ Hospitals", desc: "Verified network" },
                { label: "50+ Cities", desc: "Pan-India coverage" },
                { label: "NABL Verified", desc: "Accredited labs" },
                { label: "50k+ Bookings", desc: "Completed appointments" },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <span className="text-xs font-bold text-foreground">{badge.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 ml-5.5 font-medium leading-tight">
                    {badge.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side Experience (Healthcare Interactive Dashboard Loop) */}
          <div className="relative animate-slide-up lg:ml-8 flex items-center justify-center w-full group">
            {/* Floating glass stats widgets */}
            <div className="absolute -top-6 -left-6 z-30 rounded-3xl border border-border bg-card p-4 shadow-soft hover:scale-105 transition-transform animate-bounce duration-[6000ms]">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Star className="h-4.5 w-4.5 fill-current" />
                </span>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Patient Rating</p>
                  <p className="text-xs font-black text-foreground">★ 4.9 (12k reviews)</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 z-30 rounded-3xl border border-border bg-card p-4 shadow-soft hover:scale-105 transition-transform animate-bounce duration-[8000ms]">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-success/10 text-success">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold text-success uppercase">Instant Savings</p>
                  <p className="text-xs font-black text-foreground">₹3,200 Average</p>
                </div>
              </div>
            </div>

            <HeroInteractiveDashboard />
          </div>
        </div>
      </section>

      <div className="bg-[#FFFFFF] py-24 relative z-20">
        <TrustMetricsBar />
        <HospitalNetworkTrust />
      </div>

      <div className="bg-[#F8FAFC] py-24">
        <ComparisonDemo />
      </div>

      {/* Why Choose MediCompare */}
      <section className="bg-[#FFFFFF] py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            {/* Left aligned header info */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Why MediCompare
              </p>
              <h2 className="mt-4 text-3xl font-extrabold text-foreground tracking-tight md:text-4xl text-balance leading-tight">
                Healthcare decisions, made transparent.
              </h2>
              <p className="mt-5 text-muted-foreground text-xs leading-relaxed font-semibold">
                Everything you need to choose the right hospital and the right price — in one calm, well-designed workspace.
              </p>
            </div>

            {/* Right side features grid */}
            <div className="lg:col-span-8 grid gap-6 sm:grid-cols-2">
              {features.map((f, idx) => (
                <ScrollReveal key={f.title} delay={idx * 80}>
                  <div className="group rounded-3xl border border-border bg-card p-6 shadow-sm hover:border-primary/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-md h-full">
                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${f.colorClass}`}>
                      <f.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80 font-semibold">{f.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured hospitals */}
      <div className="bg-[#F8FAFC] py-24 md:py-28">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-primary">Top rated</p>
              <h2 className="mt-4 text-3xl font-bold md:text-4xl">Featured hospitals</h2>
            </div>
            <Button
              asChild
              className="rounded-full border border-primary bg-card text-primary hover:bg-primary-soft hover:text-primary btn-interactive shadow-sm h-9 px-4 text-xs font-semibold"
            >
              <Link to="/compare">
                View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            ) : error ? (
              <div className="col-span-full rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
                <p className="font-bold">Failed to load featured hospitals</p>
                <p className="text-xs mt-1">
                  Please check your internet connection or database configuration.
                </p>
              </div>
            ) : hospitalsList.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="font-bold text-muted-foreground">No hospitals available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  There are no hospitals registered in the database yet.
                </p>
              </div>
            ) : (
              hospitalsList.slice(0, 3).map((h) => <HospitalCard key={h.id} hospital={h} />)
            )}
          </div>
        </section>
      </div>

      <div className="bg-[#FFFFFF] py-24 md:py-28">
        <PopularServices />
      </div>

      {/* Trust / testimonials */}
      <section className="bg-[#F8FAFC] py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Loved by patients
            </p>
            <h2 className="mt-4 text-3.5xl font-extrabold md:text-4xl text-balance tracking-tight">
              Real stories from our community
            </h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {homeTestimonials.map((t, idx) => (
              <ScrollReveal key={t.name} delay={idx * 80}>
                <figure className="rounded-3xl border border-border/80 bg-card/65 backdrop-blur-sm p-8 shadow-soft relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/15 h-full">
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1 text-warning">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      {t.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-[9px] font-bold text-success">
                          ✓ Verified Patient
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-primary mt-4">
                      {t.treatment} <span className="text-muted-foreground font-normal">at</span>{" "}
                      {t.hospital}
                    </p>

                    <blockquote className="mt-4 text-sm leading-relaxed text-foreground italic">
                      "{t.text}"
                    </blockquote>
                  </div>

                  <figcaption className="mt-6 flex items-center gap-3 border-t border-border/40 pt-4">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">Patient</p>
                    </div>
                  </figcaption>
                </figure>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#FFFFFF] py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-secondary p-12 text-white shadow-elevated md:p-20">
            {/* Subtle overlay blur */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            
            {/* Subtle SVG dot pattern overlay */}
            <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

            <div className="relative grid items-center gap-8 md:grid-cols-2 z-10">
              <div>
                <h2 className="text-3xl font-extrabold leading-tight md:text-4xl text-balance tracking-tight text-white">
                  Ready to take control of your healthcare?
                </h2>
                <p className="mt-3 max-w-md text-white/80 font-medium text-sm leading-relaxed">
                  Join thousands of patients who book smarter, save more, and care better.
                </p>

                {/* Mini Trust Stats */}
                <div className="mt-8 border-t border-white/10 pt-6 grid grid-cols-3 gap-2 text-left">
                  {[
                    { label: "₹0 Fees", desc: "Direct pricing" },
                    { label: "Verified Rates", desc: "NABH network" },
                    { label: "Instant Slot", desc: "No wait times" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-xs font-black text-white">{stat.label}</p>
                      <p className="text-[9px] text-white/60 font-semibold mt-0.5 leading-tight">{stat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-primary hover:opacity-95 text-white font-bold transition-all duration-200 cursor-pointer shadow-md btn-interactive border-0"
                >
                  <Link to="/signup">Create free account</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="rounded-full border border-primary bg-card text-primary hover:bg-primary-soft hover:text-primary btn-interactive shadow-sm font-semibold"
                >
                  <Link to="/compare">Compare hospitals</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
