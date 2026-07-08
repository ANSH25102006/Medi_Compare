import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Eye, Target, Compass, Award, Cpu, Calendar, Star, ArrowRight, ArrowUpRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { TrustMetricsBar } from "@/components/site/TrustMetricsBar";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — MediCompare" },
      { name: "description", content: "Learn about the mission, vision, and technology behind the MediCompare health comparison platform." },
    ],
  }),
  component: AboutPage,
});

const timelineEvents = [
  {
    year: "2024",
    title: "The Spark",
    desc: "MediCompare was conceptualized in Bengaluru to address the complete lack of outpatient diagnostic price transparency."
  },
  {
    year: "2025",
    title: "Partner Onboarding",
    desc: "Integrated core APIs with leading hospital networks (Apollo, Fortis, Manipal) to verify live chargemaster lists."
  },
  {
    year: "2026",
    title: "SaaS Launch",
    desc: "Launched our full comparing matrix, patient checkouts, and AI Assistant recommendations live across 50 cities."
  }
];

const roadmapItems = [
  {
    quarter: "Q3 2026",
    title: "Direct Cashless Claims",
    desc: "Enable direct insurance verification and pre-approval checkouts during booking."
  },
  {
    quarter: "Q4 2026",
    title: "Telehealth Pre-consults",
    desc: "Add instant online screening consults with medical practitioners before hospital visits."
  },
  {
    quarter: "Q1 2027",
    title: "Predictive Analytics",
    desc: "Incorporate machine learning models to forecast clinical wait times on seasonal schedules."
  }
];

const values = [
  {
    icon: Target,
    title: "Our Mission",
    desc: "To empower patients with verified healthcare cost and rating transparency, allowing individuals to make informed clinical decisions."
  },
  {
    icon: Eye,
    title: "Our Vision",
    desc: "To eliminate medical surprise billing entirely by bridging the info gap between patient users and local clinical centers."
  },
  {
    icon: Compass,
    title: "Our Values",
    desc: "Patient advocacy first, rigorous verified accuracy, data security compliance, and direct pricing transparency."
  }
];

function AboutPage() {
  return (
    <SiteShell>
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-hero-gradient py-20 border-b border-border/40">
        <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,oklch(0.55_0.22_260)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.55_0.22_260)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-4xl text-center px-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            COMPANY MISSION
          </p>
          <h1 className="mt-3 text-3xl font-extrabold md:text-5xl text-foreground tracking-tight">
            Healthcare, made transparent.
          </h1>
          <p className="mt-4 text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-semibold">
            MediCompare was founded to help patients compare local clinical packages, skip wait queues, and schedule care without billing surprise anxiety.
          </p>
        </div>
      </section>

      {/* 2. Our Story Timeline */}
      <section className="bg-[#F8FAFC] py-20 border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">CHRONOLOGY</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mt-2">Our Story</h2>
          </div>

          <div className="relative border-l border-border/50 pl-6 ml-4 space-y-12">
            {timelineEvents.map((e, idx) => (
              <ScrollReveal key={e.year} delay={idx * 80}>
                <div className="relative">
                  {/* Year bullet */}
                  <span className="absolute -left-[38px] top-1 flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border/70 text-[10px] font-bold text-primary shadow-sm">
                    {e.year}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{e.title}</h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-semibold">{e.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Animated Statistics */}
      <div className="bg-[#F1F5F9] py-16 border-b border-border">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">LIVE STATS</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mt-2">Platform Performance Metrics</h2>
        </div>
        <TrustMetricsBar />
      </div>

      {/* 4. Mission & Vision & Core Values */}
      <section className="bg-[#FFFFFF] py-20 border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">PHILOSOPHY</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mt-2">Core Foundations</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <ScrollReveal key={v.title} delay={idx * 60}>
                  <div className="rounded-xl border border-border/40 bg-card/65 p-6 shadow-sm hover:border-primary/20 transition-all duration-300 h-full flex flex-col justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary border border-primary/10 mb-4">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-sm font-bold text-foreground">{v.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-semibold flex-1">
                      {v.desc}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Future Roadmap */}
      <section className="bg-[#F8FAFC] py-20 border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">THE HORIZON</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mt-2">Future Roadmap</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {roadmapItems.map((r, idx) => (
              <ScrollReveal key={r.quarter} delay={idx * 80}>
                <div className="rounded-xl border border-border/40 bg-card/65 p-6 shadow-sm hover:border-primary/20 transition-all duration-300 h-full">
                  <span className="inline-block text-[9px] font-bold text-primary bg-primary-soft border border-primary/10 px-2 py-0.5 rounded-full mb-4">
                    {r.quarter}
                  </span>
                  <h3 className="text-sm font-bold text-foreground">{r.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-semibold">{r.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className="bg-[#FFFFFF] py-20 text-center">
        <div className="mx-auto max-w-5xl px-4">
          <div className="rounded-2xl bg-primary p-8 text-primary-foreground shadow-lg md:p-12 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <h2 className="text-2xl font-extrabold">Ready to compare local clinic prices?</h2>
              <p className="text-xs text-primary-foreground/80 font-medium">
                Join thousands of patient users finding accredited diagnostic labs and consultation bookings instantly.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button asChild size="sm" variant="secondary" className="rounded-lg h-9 px-4 font-bold cursor-pointer">
                  <Link to="/compare">
                    Compare Services <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
