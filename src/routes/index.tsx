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
import { AIRecommendation } from "@/components/site/AIRecommendation";
import { NearbyMap } from "@/components/site/NearbyMap";
import { HospitalNetworkTrust } from "@/components/site/HospitalNetworkTrust";
import { HealthcareEcosystemMarquee } from "@/components/site/HealthcareEcosystemMarquee";
import { HeroHealthcareCollage } from "@/components/site/HeroHealthcareCollage";
import { HeroInteractiveDashboard } from "@/components/site/HeroInteractiveDashboard";
import { HealthcareDiscovery } from "@/components/site/HealthcareDiscovery";
import { hospitals, testimonials, faqs } from "@/lib/mock-data";
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

const features = [
  {
    icon: Scale,
    title: "Price Transparency",
    desc: "See verified pricing for every service across hospitals.",
  },
  {
    icon: Stethoscope,
    title: "Hospital Comparison",
    desc: "Compare specialties, doctors, and facilities side by side.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Reviews",
    desc: "Every review is tied to a confirmed appointment.",
  },
  {
    icon: CalendarCheck,
    title: "Instant Booking",
    desc: "Reserve appointment slots in seconds, 24/7.",
  },
  {
    icon: MapPin,
    title: "Nearby Hospitals",
    desc: "Find quality providers within minutes of you.",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    desc: "Personalized matches based on your needs and history.",
  },
];

const stepsData = [
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

  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const howItWorksRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHowItWorksVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 },
    );
    const currentRef = howItWorksRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-hero-gradient min-h-[580px] md:min-h-[660px]">
        {/* Layered Lighting & Blurred Ambient Elements */}
        <div className="absolute -left-1/4 -top-1/4 w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] blur-3xl pointer-events-none" />
        <div className="absolute -right-1/4 -bottom-1/4 w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.08)_0%,transparent_70%)] blur-3xl pointer-events-none" />
        <div className="absolute left-[35%] top-[10%] w-[30%] h-[30%] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.06)_0%,transparent_60%)] blur-3xl pointer-events-none animate-pulse duration-[7000ms]" />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.02] bg-[linear-gradient(to_right,oklch(0.56_0.17_250)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.56_0.17_250)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2 lg:px-8">
          {/* Left Side Content */}
          <div className="animate-fade-in flex flex-col justify-center relative">
            <div className="flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[13px] font-bold text-primary backdrop-blur-md shadow-sm transition-all hover:bg-primary/10 hover:shadow-md cursor-default relative z-10">
              <Sparkles className="h-4 w-4 text-primary" />
              Trusted by 50,000+ patients
            </div>

            <h1 className="mt-7 text-[2.75rem] font-black leading-[1.05] tracking-tighter text-foreground md:text-6xl lg:text-[4.5rem] relative z-10">
              Compare Hospital Prices{" "}
              <span className="relative whitespace-nowrap">
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent pb-1">
                  Before You Pay
                </span>
                {/* Decorative underline */}
                <svg
                  className="absolute -bottom-1 left-0 w-full h-3 text-primary/20"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 8 Q 50 2 100 8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
              .
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground font-medium sm:text-xl relative z-10 text-balance">
              Compare prices across top hospitals. Save up to 30% on scans, treatments, and
              diagnostics. Book appointments instantly with 100% price transparency.
            </p>

            {/* Premium Search Experience */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/compare", search: { q, city } });
              }}
              className="mt-10 glass flex flex-col gap-2 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,72,206,0.08)] sm:flex-row sm:items-center relative z-20"
            >
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-4 py-3 shadow-inner">
                <Search className="h-5 w-5 text-primary/80" />
                <Input
                  id="search-query-input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search for MRI, CT Scan, Blood Test..."
                  className="h-auto border-0 bg-transparent p-0 text-[15px] font-medium shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
                />
              </div>
              <div className="hidden h-8 w-px bg-border sm:block" />
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-4 py-3 shadow-inner">
                <MapPin className="h-5 w-5 text-primary/80" />
                <Input
                  id="search-city-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Your City"
                  className="h-auto border-0 bg-transparent p-0 text-[15px] font-medium shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="rounded-xl h-[52px] px-8 font-bold text-base bg-primary-gradient hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                Search
              </Button>
            </form>

            {/* Popular Searches for One-Click Population */}
            <div className="mt-4 flex flex-wrap items-center gap-2 relative z-20">
              <span className="text-xs font-semibold text-muted-foreground">Popular:</span>
              {[
                "MRI Scan",
                "CT Scan",
                "Blood Test",
                "ECG",
                "Ultrasound",
                "Dental Care",
                "Full Body Checkup",
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
                  className="rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Redesigned Trust Badges */}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-border/50 pt-8 relative z-10">
              {[
                { label: "500+ Hospitals", desc: "Verified network" },
                { label: "50+ Cities", desc: "Pan-India coverage" },
                { label: "NABL Verified", desc: "Accredited providers" },
                { label: "50k+ Booked", desc: "Appointments saved" },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <span className="text-sm font-bold text-foreground">{badge.label}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-0.5 ml-5 font-medium leading-tight">
                    {badge.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side Experience (Healthcare Interactive Dashboard Loop) */}
          <div className="relative animate-slide-up lg:ml-8 flex items-center justify-center w-full">
            <HeroInteractiveDashboard />
          </div>
        </div>
      </section>

      <TrustMetricsBar />
      <HospitalNetworkTrust />
      <ComparisonDemo />

      {/* How it works */}
      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl text-balance">
              Book your appointment in four simple steps
            </h2>
            <p className="text-xs text-muted-foreground mt-2 max-w-lg mx-auto font-medium">
              We guide you from searching for pricing transparency to instant booking confirmation.
            </p>
          </div>

          <ol
            ref={howItWorksRef}
            className="relative mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-4"
          >
            {/* Desktop connecting animated flow line */}
            <div className="absolute left-[12%] right-[12%] top-12 hidden h-0.5 md:block bg-secondary overflow-hidden dark:bg-secondary/40">
              <div
                className="h-full bg-primary-gradient transition-all duration-[1000ms] ease-in-out"
                style={{ width: howItWorksVisible ? "100%" : "0%" }}
              />
            </div>
            {stepsData.map((s, idx) => (
              <ScrollReveal key={s.n} delay={idx * 80}>
                <li className="group relative rounded-3xl border border-border bg-card p-6 shadow-soft transition-all duration-[250ms] ease-out hover:-translate-y-[6px] hover:scale-[1.01] hover:shadow-elevated hover:border-primary/30 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary shadow-soft group-hover:scale-110 transition-transform duration-300 dark:bg-primary-soft/10">
                        <s.icon className="h-5 w-5" />
                      </span>
                      <span className="text-3xl font-black text-primary/10 tracking-tighter group-hover:text-primary/25 transition-colors">
                        {s.n}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-medium">
                      {s.desc}
                    </p>
                  </div>

                  {/* Example User Journey Box */}
                  <div className="mt-6 rounded-2xl bg-secondary/50 p-4 border border-border/40 group-hover:bg-primary/[0.02] group-hover:border-primary/10 transition-all duration-300">
                    <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                      Journey Step
                    </div>
                    <p className="mt-1 text-xs font-extrabold text-foreground">{s.journey}</p>
                    <div className="mt-2 flex items-center gap-1 text-[9px] font-extrabold text-success uppercase tracking-wide">
                      <span>↓</span> {s.outcome}
                    </div>
                  </div>
                </li>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </section>

      <HealthcareEcosystemMarquee />

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Why MediCompare
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl text-balance">
            Healthcare decisions, made transparent.
          </h2>
          <p className="mt-4 text-muted-foreground text-sm">
            Everything you need to choose the right hospital and the right price — in one calm,
            well-designed place.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, idx) => (
            <ScrollReveal key={f.title} delay={idx * 80}>
              <div className="group rounded-3xl border border-border bg-card p-8 shadow-soft transition-all duration-[250ms] ease-out hover:-translate-y-[6px] hover:scale-[1.01] hover:shadow-elevated hover:border-primary/30 h-full">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary dark:bg-primary-soft/10 group-hover:scale-105 transition-transform duration-300">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-6 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Popular services */}
      <PopularServices />

      {/* AI Recommendation */}
      <AIRecommendation />

      {/* Hospitals near you */}
      <NearbyMap />

      {/* Lightweight Healthcare Discovery Section */}
      <HealthcareDiscovery />

      {/* Featured hospitals */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Top rated</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Featured hospitals</h2>
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/compare">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hospitals.slice(0, 3).map((h) => (
            <HospitalCard key={h.id} hospital={h} />
          ))}
        </div>
      </section>

      {/* Trust / testimonials */}
      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Loved by patients
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl text-balance">
              Real stories from our community
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {homeTestimonials.map((t, idx) => (
              <ScrollReveal key={t.name} delay={idx * 80}>
                <figure className="rounded-3xl border border-border bg-card p-8 shadow-soft relative overflow-hidden flex flex-col justify-between hover:-translate-y-[6px] hover:scale-[1.01] hover:shadow-elevated hover:border-primary/30 transition-all duration-[250ms] ease-out h-full">
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

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl text-balance">Questions, answered</h2>
        </div>
        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`item-${i}`}
              className="rounded-2xl border border-border bg-card px-5 shadow-soft"
            >
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary-gradient p-10 text-primary-foreground shadow-elevated md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold leading-tight md:text-4xl text-balance">
                Ready to take control of your healthcare?
              </h2>
              <p className="mt-3 max-w-md text-primary-foreground/80">
                Join thousands of patients who book smarter, save more, and care better.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Button asChild size="lg" variant="secondary" className="rounded-full">
                <Link to="/signup">Create free account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <Link to="/compare">Compare hospitals</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
