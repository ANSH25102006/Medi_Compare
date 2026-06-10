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
import { hospitals, testimonials, faqs } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediCompare — Find Quality Healthcare at the Right Price" },
      { name: "description", content: "Compare medical service costs, discover trusted hospitals, and book appointments instantly." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Scale, title: "Price Transparency", desc: "See verified pricing for every service across hospitals." },
  { icon: Stethoscope, title: "Hospital Comparison", desc: "Compare specialties, doctors, and facilities side by side." },
  { icon: ShieldCheck, title: "Verified Reviews", desc: "Every review is tied to a confirmed appointment." },
  { icon: CalendarCheck, title: "Instant Booking", desc: "Reserve appointment slots in seconds, 24/7." },
  { icon: MapPin, title: "Nearby Hospitals", desc: "Find quality providers within minutes of you." },
  { icon: Sparkles, title: "AI Recommendations", desc: "Personalized matches based on your needs and history." },
];

const steps = [
  { n: "01", title: "Search a service", desc: "Tell us what you need — from MRI to consultation." },
  { n: "02", title: "Compare options", desc: "Browse verified hospitals, prices, and ratings." },
  { n: "03", title: "Choose a provider", desc: "Read reviews and check availability." },
  { n: "04", title: "Book instantly", desc: "Confirm your slot in a few taps." },
];

function Landing() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 -z-0 opacity-40 [background:radial-gradient(60%_50%_at_20%_20%,oklch(0.85_0.08_220/.6),transparent),radial-gradient(50%_40%_at_85%_30%,oklch(0.80_0.10_250/.5),transparent)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2 lg:px-8">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <Sparkles className="h-3 w-3" /> Trusted by 50,000+ patients
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-balance md:text-6xl">
              Find quality healthcare at the <span className="text-primary">right price</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground text-balance">
              Compare medical service costs, discover trusted hospitals, and book appointments instantly — all in one place.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/compare", search: { q, city } });
              }}
              className="mt-8 glass flex flex-col gap-2 rounded-2xl p-2 shadow-elevated sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search medical service…"
                  className="h-10 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-3 py-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Location"
                  className="h-10 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" size="lg" className="rounded-xl">
                Search
              </Button>
            </form>

            <dl className="mt-10 grid grid-cols-3 gap-6 sm:max-w-md">
              {[
                ["500+", "Hospitals"],
                ["50K+", "Patients"],
                ["10K+", "Appointments"],
              ].map(([k, v]) => (
                <div key={v}>
                  <dt className="text-2xl font-bold text-foreground md:text-3xl">{k}</dt>
                  <dd className="text-xs text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative animate-slide-up">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-primary/10 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80"
                  alt="Doctor consultation"
                  className="h-48 w-full rounded-2xl object-cover shadow-elevated"
                />
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Appointment confirmed</p>
                      <p className="text-xs text-muted-foreground">Apollo • Tomorrow, 10:30 AM</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-10 space-y-4">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">MRI Scan</p>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-primary">₹7,200</span>
                    <span className="text-xs text-success">Save 25%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-secondary">
                    <div className="h-2 w-2/3 rounded-full bg-primary-gradient" />
                  </div>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80"
                  alt="Modern hospital"
                  className="h-56 w-full rounded-2xl object-cover shadow-elevated"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <HospitalNetworkTrust />
      <HealthcareEcosystemMarquee />

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Why MediCompare</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl text-balance">
            Healthcare decisions, made transparent.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to choose the right hospital and the right price — in one calm, well-designed place.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular services */}
      <PopularServices />

      {/* AI Recommendation */}
      <AIRecommendation />

      {/* Hospitals near you */}
      <NearbyMap />



      {/* How it works */}
      <section className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">How it works</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl text-balance">Book your appointment in four steps</h2>
          </div>

          <ol className="relative mt-14 grid gap-6 md:grid-cols-4">
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />
            {steps.map((s) => (
              <li key={s.n} className="relative rounded-2xl border border-border bg-card p-6 shadow-soft">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-gradient text-base font-bold text-primary-foreground shadow-soft">
                  {s.n}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured hospitals */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
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
      <section className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Loved by patients</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl text-balance">Real stories from our community</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
                <div className="flex items-center gap-1 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-foreground">"{t.text}"</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
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
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
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
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                <Link to="/compare">Compare hospitals</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
