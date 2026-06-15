import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { HospitalCard } from "@/components/site/HospitalCard";
import { useHospitals } from "@/hooks/use-hospitals";
import { CardSkeleton } from "@/components/site/SkeletonLoader";

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
  const { data: hospitalsList = [], isLoading, error } = useHospitals();

  return (
    <SiteShell>
      <section className="border-b border-border bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold md:text-4xl">Trusted hospitals</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Discover JCI- and NABH-accredited hospitals across India, all verified and reviewed by
            real patients.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))
          ) : error ? (
            <div className="col-span-full rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive">
              <p className="font-bold">Failed to load hospitals list</p>
              <p className="text-sm mt-1">Please verify your environment credentials or internet connection.</p>
            </div>
          ) : hospitalsList.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="font-bold text-muted-foreground text-lg">No hospitals registered</p>
              <p className="text-sm text-muted-foreground mt-1">
                There are currently no hospitals in our database.
              </p>
            </div>
          ) : (
            hospitalsList.map((h) => (
              <HospitalCard key={h.id} hospital={h} />
            ))
          )}
        </div>
      </section>
    </SiteShell>
  );
}

