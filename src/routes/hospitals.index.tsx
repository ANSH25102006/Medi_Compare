import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { HospitalCard } from "@/components/site/HospitalCard";
import { hospitals } from "@/lib/mock-data";

export const Route = createFileRoute("/hospitals/")({
  head: () => ({
    meta: [
      { title: "Hospitals — MediCompare" },
      { name: "description", content: "Browse trusted hospitals on the MediCompare network." },
    ],
  }),
  component: HospitalsPage,
});

function HospitalsPage() {
  return (
    <SiteShell>
      <section className="border-b border-border bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold md:text-4xl">Trusted hospitals</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Discover JCI- and NABH-accredited hospitals across India, all verified and reviewed by real patients.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((h) => (
            <HospitalCard key={h.id} hospital={h} />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
