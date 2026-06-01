import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, CalendarDays, Clock, FileText, PartyPopper } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hospitals } from "@/lib/mock-data";

type SearchParams = { hospital?: string; service?: string };

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    hospital: typeof s.hospital === "string" ? s.hospital : undefined,
    service: typeof s.service === "string" ? s.service : undefined,
  }),
  head: () => ({ meta: [{ title: "Book Appointment — MediCompare" }] }),
  component: BookPage,
});

const steps = ["Service", "Date", "Time", "Details", "Confirm"];

function BookPage() {
  const sp = Route.useSearch();
  const hospital = hospitals.find((h) => h.id === sp.hospital) ?? hospitals[0];
  const [step, setStep] = useState(0);
  const [service, setService] = useState(sp.service ?? hospital.services[0].name);
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [slot, setSlot] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const selectedService = hospital.services.find((s) => s.name === service)!;
  const total = steps.length;
  const progress = ((step + 1) / total) * 100;

  const next = () => setStep((s) => Math.min(s + 1, total - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Book appointment</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{hospital.name}</h1>
        </div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((label, i) => (
              <div key={label} className="flex flex-1 flex-col items-center text-center">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                  i < step ? "bg-success text-success-foreground" :
                  i === step ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary text-muted-foreground"
                }`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <p className={`mt-2 hidden text-xs sm:block ${i <= step ? "font-medium text-foreground" : "text-muted-foreground"}`}>{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary-gradient transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-7 shadow-elevated sm:p-10">
          {step === 0 && (
            <div className="animate-fade-in space-y-3">
              <h2 className="text-xl font-semibold">Select a service</h2>
              <p className="text-sm text-muted-foreground">Choose what you'd like to book.</p>
              <div className="mt-5 space-y-2">
                {hospital.services.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setService(s.name)}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${
                      service === s.name ? "border-primary bg-primary-soft/60 shadow-soft" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.duration}</p>
                    </div>
                    <p className="font-semibold text-primary">₹{s.price.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in space-y-3">
              <h2 className="text-xl font-semibold">Choose a date</h2>
              <p className="text-sm text-muted-foreground">When would you like to visit?</p>
              <div className="mt-5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Appointment date</Label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-base" />
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-primary-soft/50 p-3 text-sm text-muted-foreground">
                <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
                Free rescheduling available up to 4 hours before your appointment.
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in space-y-3">
              <h2 className="text-xl font-semibold">Pick a time slot</h2>
              <p className="text-sm text-muted-foreground">Available slots for {date}.</p>
              <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {hospital.slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={`rounded-xl border px-3 py-3 text-sm transition-all ${
                      slot === s ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in space-y-3">
              <h2 className="text-xl font-semibold">Your details</h2>
              <p className="text-sm text-muted-foreground">We'll send confirmation to your phone and email.</p>
              <div className="mt-5 grid gap-4">
                <div>
                  <Label>Full name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ananya Sharma" className="mt-1.5" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Phone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in space-y-5 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
                <PartyPopper className="h-7 w-7" />
              </span>
              <h2 className="text-2xl font-bold">Appointment confirmed!</h2>
              <p className="text-muted-foreground">A confirmation has been sent to your phone and email.</p>

              <div className="mx-auto mt-6 max-w-md rounded-2xl border border-border bg-secondary/40 p-6 text-left">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" /> Booking ID #MC-{Math.floor(Math.random() * 9000) + 1000}
                </div>
                <div className="mt-4 grid gap-2 text-sm">
                  <Row label="Hospital" value={hospital.name} />
                  <Row label="Service" value={selectedService.name} />
                  <Row label="Date" value={date} />
                  <Row label="Time" value={slot || "—"} />
                  <Row label="Total" value={`₹${selectedService.price.toLocaleString()}`} highlight />
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/dashboard">Go to dashboard</Link>
                </Button>
                <Button asChild className="rounded-full">
                  <Link to="/">Back home</Link>
                </Button>
              </div>
            </div>
          )}

          {step < 4 && (
            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <Button variant="ghost" onClick={back} disabled={step === 0}>Back</Button>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> Step {step + 1} of {total}
              </div>
              <Button onClick={next} disabled={step === 2 && !slot}>
                {step === 3 ? "Confirm booking" : "Continue"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "text-base font-bold text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}
