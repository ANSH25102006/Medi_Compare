import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { testimonials } from "@/lib/mock-data";

export const Route = createFileRoute("/reviews")({
  head: () => ({ meta: [{ title: "Patient Reviews — MediCompare" }] }),
  component: ReviewsPage,
});

const more = [
  { name: "Sneha R.", role: "Patient — Apollo", text: "Booking the cardiac consultation was so easy. The doctor was excellent and my appointment started right on time." },
  { name: "Vivek M.", role: "Patient — Fortis", text: "MediCompare helped me save significantly on my MRI scan. Quality of service was top-notch." },
  { name: "Lakshmi T.", role: "Patient — Manipal", text: "Comprehensive health checkup was thorough. Loved the digital reports being available the same day." },
  { name: "Aditya P.", role: "Patient — Medanta", text: "Trustworthy, transparent and seamless. This is how healthcare should work in 2026." },
];

function ReviewsPage() {
  return (
    <SiteShell>
      <section className="border-b border-border bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold md:text-4xl">Patient reviews</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every review on MediCompare is tied to a verified appointment booking.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...testimonials, ...more].map((t) => (
            <figure key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-1 text-warning">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed">"{t.text}"</blockquote>
              <figcaption className="mt-5 text-sm">
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
