import { createFileRoute, Link } from "@tanstack/react-router";
import { Scale, Stethoscope, ShieldCheck, CalendarCheck, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/site/ScrollReveal";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Core Features — MediCompare" },
      { name: "description", content: "Explore the features that bring full pricing transparency to healthcare." },
    ],
  }),
  component: FeaturesPage,
});

const featuresDetails = [
  {
    icon: Scale,
    title: "Price Transparency",
    headline: "Compare real procedure costs side by side.",
    explanation: "Tired of surprise medical bills? We verify pricing directly with hospital chargemasters and billing departments. Compare procedures, scans, consultations, and packages before booking so you can save up to 30%.",
    benefits: [
      "No surprise hospital hidden fees",
      "Verified pricing direct from providers",
      "Detailed billing breakdown comparison"
    ],
    cta: "Compare Prices",
    ctaLink: "/compare",
  },
  {
    icon: Stethoscope,
    title: "Hospital Comparison",
    headline: "Compare specialties, doctors, and facilities.",
    explanation: "Every hospital has unique strengths. Compare accreditation levels (NABH/JCI), ICU bed counts, specialized operating theaters, resident medical team experience, and patient ratings side-by-side to make the right choice.",
    benefits: [
      "Compare up to 4 hospitals simultaneously",
      "Filter by specialty and doctor experience",
      "Check NABH/JCI accreditation metrics"
    ],
    cta: "Search Hospitals",
    ctaLink: "/hospitals",
  },
  {
    icon: ShieldCheck,
    title: "Verified Reviews",
    headline: "Read honest patient feedback you can trust.",
    explanation: "Unlike generic review platforms, every testimonial on MediCompare is tied directly to a confirmed patient booking. Read about real waiting times, nursing staff friendliness, and overall experience from verified checkout reports.",
    benefits: [
      "100% verified booking patient feedback",
      "No fake or commercially promoted ratings",
      "Granular ratings for doctors, wait times, & cleanliness"
    ],
    cta: "Read Testimonials",
    ctaLink: "/reviews",
  },
  {
    icon: CalendarCheck,
    title: "Instant Booking",
    headline: "Confirm appointment slots securely in seconds.",
    explanation: "Skip the endless phone calls and waiting lines. Select from real-time available time slots, confirm patient details, and pay securely using Razorpay or select local sandbox card checkout parameters.",
    benefits: [
      "Real-time calendar slot integration",
      "Instant confirmation details sent to SMS/email",
      "Reschedule or cancel freely up to 4 hrs before"
    ],
    cta: "Book a Slot Now",
    ctaLink: "/compare",
  },
  {
    icon: MapPin,
    title: "Nearby Hospitals",
    headline: "Locate trusted providers nearest to you.",
    explanation: "In healthcare, distance matters. Find qualified providers and clinics within a 1km to 20km radius of your current location. Integrated mapping allows you to visually map routes and calculate travel times.",
    benefits: [
      "Filter directory lists by custom distance radius",
      "Integrated maps visualization for quick navigation",
      "Check emergency and ambulance availability status"
    ],
    cta: "Explore Map Directory",
    ctaLink: "/compare",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    headline: "Personalized suggestions tailored to your needs.",
    explanation: "Confused about which hospital best matches your insurance network, budget, and specialty needs? Our intelligent recommendations model aggregates pricing averages, distance, and rating scores to highlight optimal choices.",
    benefits: [
      "Custom prompt recommendations matching",
      "Calculated overall value index scores",
      "Instant filtering based on specific diagnostic requests"
    ],
    cta: "Ask AI Assistant",
    ctaLink: "/ai-assistant",
  },
];

function FeaturesPage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-hero-gradient py-16 border-b border-border/40">
        <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,oklch(0.55_0.22_260)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.55_0.22_260)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-4xl text-center px-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Platform Capabilities
          </p>
          <h1 className="mt-3 text-3xl font-extrabold md:text-5xl text-foreground tracking-tight">
            Healthcare decisions, made transparent.
          </h1>
          <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Everything you need to compare prices, verify accreditations, and book slots in one unified workspace.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-24">
        {featuresDetails.map((f, idx) => {
          const Icon = f.icon;
          const isEven = idx % 2 === 0;

          return (
            <ScrollReveal key={f.title} delay={100}>
              <div className={`grid gap-12 lg:grid-cols-2 items-center ${isEven ? "" : "lg:flex-row-reverse"}`}>
                <div className={isEven ? "lg:order-1" : "lg:order-2"}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary border border-primary/10 mb-6">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">{f.title}</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    {f.headline}
                  </h2>
                  <p className="mt-4 text-xs md:text-sm leading-relaxed text-muted-foreground font-medium">
                    {f.explanation}
                  </p>

                  <ul className="mt-6 space-y-2.5">
                    {f.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Button asChild size="sm" className="rounded-lg h-9 px-4 text-xs font-bold gap-1 cursor-pointer">
                      <Link to={f.ctaLink as any}>
                        {f.cta} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className={`rounded-2xl border border-border/40 bg-secondary/10 p-8 shadow-inner flex items-center justify-center min-h-[280px] ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                  <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm max-w-sm w-full relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Preview Widget</span>
                      </div>
                      <span className="text-[9px] font-bold text-success bg-success/8 border border-success/15 px-2 py-0.5 rounded-full">ACTIVE</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-2/3 bg-secondary/50 rounded animate-pulse" />
                      <div className="h-3 w-full bg-secondary/30 rounded animate-pulse" />
                      <div className="h-7 w-1/3 bg-primary/10 rounded border border-primary/10" />
                      <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
                        <span>Verified cost comparison</span>
                        <span className="text-primary font-bold">100% True</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </section>
    </SiteShell>
  );
}
