import { createFileRoute, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Check,
  CalendarDays,
  Clock,
  FileText,
  PartyPopper,
  CreditCard,
  Loader2,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hospitals, userAppointments } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { getItemSafe, setItemSafe } from "@/lib/storage";

type SearchParams = { hospital?: string; service?: string; date?: string; slot?: string };

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    hospital: typeof s.hospital === "string" ? s.hospital : undefined,
    service: typeof s.service === "string" ? s.service : undefined,
    date: typeof s.date === "string" ? s.date : undefined,
    slot: typeof s.slot === "string" ? s.slot : undefined,
  }),
  head: () => ({ meta: [{ title: "Book Appointment — MediCompare" }] }),
  component: BookPage,
});

const steps = ["Service", "Date", "Time", "Details", "Payment", "Confirm"];

function BookPage() {
  const sp = Route.useSearch();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hospital = hospitals.find((h) => h.id === sp.hospital) ?? hospitals[0];

  const [step, setStep] = useState(() => (sp.date && sp.slot ? 3 : 0));
  const [service, setService] = useState(sp.service ?? hospital.services[0].name);
  const [date, setDate] = useState(
    sp.date ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  );
  const [slot, setSlot] = useState<string>(sp.slot ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");

  // Payment mock states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState(user?.name ?? "");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [bookingId, setBookingId] = useState("");

  // Sync user values if they load asynchronously
  useEffect(() => {
    if (user) {
      setName(prev => prev || user.name || "");
      setEmail(prev => prev || user.email || "");
      setCardHolder(prev => prev || user.name || "");
    }
  }, [user]);

  // Validate query parameter/state: date must not be in the past
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (date < todayStr) {
      const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      setDate(tomorrowStr);
      toast.warning("Past date detected. Resetting to tomorrow's date.");
    }
  }, [date]);

  // Validate query parameter/state: slot must exist in hospital slots
  useEffect(() => {
    if (slot && !hospital.slots.includes(slot)) {
      setSlot("");
      toast.warning("Selected time slot is unavailable. Please choose another.");
    }
  }, [slot, hospital.slots]);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please sign in to book an appointment.");
      navigate({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  }, [isLoggedIn, navigate, location]);

  const selectedService = hospital.services.find((s) => s.name === service)!;
  const total = steps.length;
  const progress = ((step + 1) / total) * 100;

  const next = () => setStep((s) => Math.min(s + 1, total - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Book appointment
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{hospital.name}</h1>
        </div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((label, i) => (
              <div key={label} className="flex flex-1 flex-col items-center text-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                    i < step
                      ? "bg-success text-success-foreground"
                      : i === step
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <p
                  className={`mt-2 hidden text-xs sm:block ${i <= step ? "font-medium text-foreground" : "text-muted-foreground"}`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary-gradient transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
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
                      service === s.name
                        ? "border-primary bg-primary-soft/60 shadow-soft"
                        : "border-border hover:border-primary/40"
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
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Appointment date
                </Label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-base"
                />
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
                      slot === s
                        ? "border-primary bg-primary text-primary-foreground shadow-soft"
                        : "border-border bg-background hover:border-primary/40"
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
              <p className="text-sm text-muted-foreground">
                We'll send confirmation to your phone and email.
              </p>
              <div className="mt-5 grid gap-4">
                <div>
                  <Label htmlFor="book-name">Full name</Label>
                  <Input
                    id="book-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ananya Sharma"
                    className="mt-1.5"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="book-phone">Phone</Label>
                    <Input
                      id="book-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="book-email">Email</Label>
                    <Input
                      id="book-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Payment details
              </h2>
              <p className="text-sm text-muted-foreground">
                Secure your appointment booking with a safe mock payment.
              </p>

              <div className="rounded-2xl border border-border bg-secondary/20 p-5 mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Order Summary
                </p>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="font-medium">{hospital.name}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1.5 mt-1">
                    <span className="font-semibold">Total amount</span>
                    <span className="font-bold text-primary">
                      ₹{selectedService.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4">
                <div>
                  <Label htmlFor="card-number">Card number</Label>
                  <Input
                    id="card-number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    placeholder="4111 2222 3333 4444"
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="card-expiry">Expiry date</Label>
                    <Input
                      id="card-expiry"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                      placeholder="MM/YY"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="card-cvv">CVV</Label>
                    <Input
                      id="card-cvv"
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      placeholder="•••"
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="card-holder">Cardholder name</Label>
                  <Input
                    id="card-holder"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Ananya Sharma"
                    className="mt-1.5"
                  />
                </div>

                <label className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-3 text-xs cursor-pointer hover:bg-destructive/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="h-4 w-4 accent-destructive rounded"
                  />
                  <div>
                    <p className="font-semibold text-destructive">
                      Simulate transaction failure (QA Testing)
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      Test how the platform handles payment processing errors.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-in space-y-5 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
                <PartyPopper className="h-7 w-7" />
              </span>
              <h2 className="text-2xl font-bold">Appointment confirmed!</h2>
              <p className="text-muted-foreground">
                A confirmation has been sent to your phone and email.
              </p>

              <div className="mx-auto mt-6 max-w-md rounded-2xl border border-border bg-secondary/40 p-6 text-left">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" /> Booking ID #{bookingId}
                </div>
                <div className="mt-4 grid gap-2 text-sm">
                  <Row label="Hospital" value={hospital.name} />
                  <Row label="Service" value={selectedService.name} />
                  <Row label="Date" value={date} />
                  <Row label="Time" value={slot || "—"} />
                  <Row
                    label="Total"
                    value={`₹${selectedService.price.toLocaleString()}`}
                    highlight
                  />
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

          {step < 5 && (
            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <Button variant="ghost" onClick={back} disabled={step === 0 || isPaying}>
                Back
              </Button>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> Step {step + 1} of {total}
              </div>
              {step === 4 ? (
                <Button
                  onClick={() => {
                    if (cardNumber.length !== 16) {
                      toast.error("Please enter a valid 16-digit card number.");
                      return;
                    }
                    if (!cardExpiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
                      toast.error("Please enter a valid expiry date (MM/YY).");
                      return;
                    }
                    if (cardCvv.length !== 3) {
                      toast.error("Please enter a valid 3-digit CVV.");
                      return;
                    }
                    if (!cardHolder.trim()) {
                      toast.error("Cardholder name is required.");
                      return;
                    }

                    // Check for duplicate booking before paying
                    try {
                      const currentList = getItemSafe<any[]>("medicompare_appointments", userAppointments);
                      const isDuplicate = currentList.some(
                        (a: { hospital: string; service: string; date: string; status: string }) =>
                          a.hospital === hospital.name &&
                          a.service === service &&
                          a.date === date &&
                          (a.status === "Upcoming" || a.status === "Confirmed"),
                      );
                      if (isDuplicate) {
                        toast.error(
                          "You already have an active appointment for this service and date at this hospital.",
                        );
                        return;
                      }
                    } catch (e) {
                      // ignore
                    }

                    setIsPaying(true);
                    setTimeout(() => {
                      if (simulateFailure) {
                        setIsPaying(false);
                        toast.error(
                          "Transaction declined by the bank. Appointment booking cancelled. Please try again.",
                        );
                      } else {
                        const id = `MC-${Math.floor(Math.random() * 9000) + 1000}`;
                        setBookingId(id);

                        try {
                          const currentList = getItemSafe<any[]>("medicompare_appointments", userAppointments);
                          const newAppt = {
                            id,
                            date,
                            hospital: hospital.name,
                            service: selectedService.name,
                            status: "Upcoming",
                          };
                          setItemSafe("medicompare_appointments", [newAppt, ...currentList]);
                        } catch (e) {
                          // ignore
                        }

                        setIsPaying(false);
                        toast.success("Payment completed successfully!");
                        next();
                      }
                    }, 1500);
                  }}
                  disabled={isPaying}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Pay & Confirm"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (step === 3) {
                      if (!name.trim()) {
                        toast.error("Full name is required.");
                        return;
                      }
                      if (phone.trim().length < 10) {
                        toast.error("Please enter a valid phone number.");
                        return;
                      }
                      if (!email.trim() || !email.includes("@")) {
                        toast.error("Please enter a valid email address.");
                        return;
                      }

                      // Check for duplicate booking before proceeding to payment
                      try {
                        const currentList = getItemSafe<any[]>("medicompare_appointments", userAppointments);
                        const isDuplicate = currentList.some(
                          (a: {
                            hospital: string;
                            service: string;
                            date: string;
                            status: string;
                          }) =>
                            a.hospital === hospital.name &&
                            a.service === service &&
                            a.date === date &&
                            (a.status === "Upcoming" || a.status === "Confirmed"),
                        );
                        if (isDuplicate) {
                          toast.error(
                            "You already have an active appointment for this service and date at this hospital.",
                          );
                          return;
                        }
                      } catch (e) {
                        // ignore
                      }
                    }
                    next();
                  }}
                  disabled={step === 2 && !slot}
                >
                  {step === 3 ? "Proceed to Payment" : "Continue"}
                </Button>
              )}
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
      <span className={highlight ? "text-base font-bold text-primary" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
