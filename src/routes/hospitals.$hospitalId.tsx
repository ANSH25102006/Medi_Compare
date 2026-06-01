import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Star, MapPin, Phone, ShieldCheck, Award, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hospitals } from "@/lib/mock-data";

export const Route = createFileRoute("/hospitals/$hospitalId")({
  loader: ({ params }) => {
    const hospital = hospitals.find((h) => h.id === params.hospitalId);
    if (!hospital) throw notFound();
    return hospital;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Hospital"} — MediCompare` },
      { name: "description", content: loaderData?.about ?? "Hospital details on MediCompare." },
      { property: "og:image", content: loaderData?.image },
    ],
  }),
  component: HospitalDetails,
});

function HospitalDetails() {
  const hospital = Route.useLoaderData();
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState<string | null>(null);

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative h-80 w-full overflow-hidden md:h-96">
        <img src={hospital.image} alt={hospital.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </section>

      <section className="mx-auto -mt-32 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-7 shadow-elevated">
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex-1 min-w-[260px]">
              <div className="flex flex-wrap gap-1.5">
                {hospital.specialties.map((s) => (
                  <Badge key={s} variant="secondary" className="rounded-full font-normal">{s}</Badge>
                ))}
              </div>
              <h1 className="mt-3 text-3xl font-bold md:text-4xl">{hospital.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-warning text-warning" /> <strong className="text-foreground">{hospital.rating}</strong> ({hospital.reviews} reviews)</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {hospital.address}</span>
                <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {hospital.phone}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-full">Save</Button>
              <Button asChild className="rounded-full">
                <Link to="/book" search={{ hospital: hospital.id, service: hospital.services[0].name }}>
                  Book Appointment
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 border-t border-border pt-6 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: "NABH Accredited" },
              { icon: Award, label: "Top 1% network rating" },
              { icon: Calendar, label: "Avg. wait under 15 min" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-3 rounded-xl bg-primary-soft/50 p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-primary">
                  <b.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-7xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <Tabs defaultValue="overview">
            <TabsList className="rounded-full">
              <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
              <TabsTrigger value="services" className="rounded-full">Services</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-full">Reviews</TabsTrigger>
              <TabsTrigger value="doctors" className="rounded-full">Doctors</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-7 shadow-soft">
              <h2 className="text-xl font-semibold">About {hospital.name}</h2>
              <p className="text-muted-foreground">{hospital.about}</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Beds", "420+"],
                  ["Specialties", "30+"],
                  ["Doctors", "180+"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-secondary/60 p-4">
                    <p className="text-2xl font-bold">{v}</p>
                    <p className="text-xs text-muted-foreground">{k}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="services" className="mt-6 rounded-2xl border border-border bg-card p-2 shadow-soft sm:p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-40 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospital.services.map((s) => (
                    <TableRow key={s.name}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">{s.duration}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">₹{s.price.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline" className="rounded-full">
                          <Link to="/book" search={{ hospital: hospital.id, service: s.name }}>Book</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-7 shadow-soft">
              {[
                { name: "Pooja S.", text: "Quick admission, professional staff and the surgery was a complete success.", rating: 5 },
                { name: "Arjun K.", text: "Pricing was clear from MediCompare and matched what the hospital charged.", rating: 5 },
                { name: "Meera D.", text: "Very clean facility and the consultation was thorough.", rating: 4 },
              ].map((r) => (
                <div key={r.name} className="rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{r.name}</p>
                    <div className="flex text-warning">
                      {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="doctors" className="mt-6 grid gap-4 sm:grid-cols-2">
              {hospital.doctors.map((d) => (
                <div key={d.name} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <img src={d.avatar} alt={d.name} className="h-14 w-14 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-sm text-muted-foreground">{d.specialty}</p>
                    <p className="text-xs text-muted-foreground">{d.experience} yrs experience</p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking sidebar */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-20">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Book quickly</p>
          <h3 className="mt-1 text-xl font-semibold">Reserve a slot</h3>

          <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
          />

          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Time slot</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {hospital.slots.map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={`rounded-xl border px-2 py-2 text-sm transition-all ${
                  slot === s
                    ? "border-primary bg-primary text-primary-foreground shadow-soft"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <Button
            className="mt-6 w-full rounded-full"
            disabled={!slot}
            onClick={() => toast.success(`Slot ${slot} on ${date} reserved`, { description: hospital.name })}
          >
            Book Appointment
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Free cancellation up to 4 hrs before</p>
        </aside>
      </section>
    </SiteShell>
  );
}
