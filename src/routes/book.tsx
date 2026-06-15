import { createFileRoute, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
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
import { userAppointments } from "@/lib/mock-data";
import { useHospitals } from "@/hooks/use-hospitals";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { getItemSafe, setItemSafe } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

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
  const { data: hospitalsList = [], isLoading } = useHospitals();

  const hospital = useMemo(() => {
    return hospitalsList.find((h) => h.id === sp.hospital) ?? hospitalsList[0];
  }, [hospitalsList, sp.hospital]);

  const [step, setStep] = useState(() => (sp.date && sp.slot ? 3 : 0));
  const [service, setService] = useState(sp.service ?? "");

  useEffect(() => {
    if (!service && hospital?.services?.[0]?.name) {
      setService(hospital.services[0].name);
    }
  }, [hospital, service]);

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
  const [savedBooking, setSavedBooking] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "mock">("razorpay");

  // Dynamically load Razorpay checkout script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Synchronous redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please sign in to book an appointment.");
      navigate({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  }, [isLoggedIn, navigate, location]);

  // Handle loading skeletons before rendering core UI
  if (isLoading || !hospital) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </SiteShell>
    );
  }

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

  const selectedService = hospital?.services?.find((s) => s.name === service) ?? hospital?.services?.[0] ?? { name: "General Service", price: 0 };

  const saveBookingRecord = async (paymentId: string, paymentStatus: string, finalAmount: number) => {
    const id = `MC-${Math.floor(Math.random() * 9000) + 1000}`;
    setBookingId(id);

    const newAppt = {
      id,
      date,
      hospital: hospital.name,
      service: selectedService.name,
      status: "Upcoming" as const,
    };

    try {
      const currentList = getItemSafe<any[]>("medicompare_appointments", userAppointments);
      setItemSafe("medicompare_appointments", [newAppt, ...currentList]);
    } catch (e) {
      console.error("Local storage booking backup failed:", e);
    }

    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([
          {
            id,
            hospital_id: hospital.id,
            hospital_name: hospital.name,
            service_name: selectedService.name,
            booking_date: date,
            booking_time: slot || "—",
            amount: finalAmount,
            booking_status: "Confirmed",
            payment_id: paymentId,
            payment_status: paymentStatus,
            user_name: name.trim(),
            user_email: email.trim(),
            user_id: user?.email || user?.id || "anonymous",
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        setSavedBooking(data[0]);
      } else {
        setSavedBooking({
          id,
          hospital_name: hospital.name,
          service_name: selectedService.name,
          booking_date: date,
          booking_time: slot || "—",
          amount: finalAmount,
          booking_status: "Confirmed",
          payment_id: paymentId,
          payment_status: paymentStatus,
          user_name: name.trim(),
          user_email: email.trim(),
        });
      }
      toast.success("Appointment booked successfully!");

      // Trigger email confirmation asynchronously
      fetch("/.netlify/functions/send-booking-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: id,
          customerName: name.trim(),
          customerEmail: email.trim(),
          hospitalName: hospital.name,
          serviceName: selectedService.name,
          bookingDate: date,
          bookingTime: slot || "—",
          amountPaid: finalAmount,
          paymentStatus: "Paid",
        }),
      })
        .then((res) => {
          if (!res.ok) {
            console.error("Booking email API returned status:", res.status);
          } else {
            console.log("Booking email successfully sent/triggered.");
          }
        })
        .catch((err) => {
          console.error("Failed to trigger booking confirmation email:", err);
        });
    } catch (err) {
      console.error("Failed to save booking to Supabase:", err);
      setSavedBooking({
        id,
        hospital_name: hospital.name,
        service_name: selectedService.name,
        booking_date: date,
        booking_time: slot || "—",
        amount: finalAmount,
        booking_status: "Confirmed",
        payment_id: paymentId,
        payment_status: paymentStatus,
        user_name: name.trim(),
        user_email: email.trim(),
      });
      toast.success("Booking confirmed locally (Offline mode).");
    } finally {
      setIsPaying(false);
      next();
    }
  };

  const triggerMockPaymentFlow = () => {
    if (cardNumber.length !== 16) {
      toast.error("Please enter a valid 16-digit card number.");
      setIsPaying(false);
      return;
    }
    if (!cardExpiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
      toast.error("Please enter a valid expiry date (MM/YY).");
      setIsPaying(false);
      return;
    }
    if (cardCvv.length !== 3) {
      toast.error("Please enter a valid 3-digit CVV.");
      setIsPaying(false);
      return;
    }
    if (!cardHolder.trim()) {
      toast.error("Cardholder name is required.");
      setIsPaying(false);
      return;
    }

    setTimeout(async () => {
      if (simulateFailure) {
        setIsPaying(false);
        toast.error(
          "Transaction declined by the bank. Appointment booking cancelled. Please try again.",
        );
      } else {
        const mockPaymentId = `pay_mock_${Date.now()}`;
        await saveBookingRecord(mockPaymentId, "Paid", selectedService.price);
      }
    }, 1500);
  };

  const handlePayAndConfirm = async () => {
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

    if (paymentMethod === "mock") {
      triggerMockPaymentFlow();
      return;
    }

    try {
      const response = await fetch("/.netlify/functions/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedService.price,
          receipt: `receipt_${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error(`Order API returned status ${response.status}`);
      }

      const orderData = await response.json();
      const keyId = orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (orderData.mock || !(window as any).Razorpay || !keyId || keyId === "YOUR_RAZORPAY_KEY_ID_HERE") {
        console.warn("Razorpay keys or script not available. Falling back to mock card payment.");
        toast.warning("Razorpay Test Mode is not configured on the server/client. Switching to Mock Sandbox Card.");
        setPaymentMethod("mock");
        setIsPaying(false);
        return;
      }

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MediCompare",
        description: `Booking for ${selectedService.name} at ${hospital.name}`,
        order_id: orderData.id,
        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: phone.trim()
        },
        theme: {
          color: "#3B82F6"
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
            toast.error("Payment cancelled.");
          }
        },
        handler: async function (paymentRes: any) {
          try {
            const verifyResponse = await fetch("/.netlify/functions/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: paymentRes.razorpay_order_id,
                razorpay_payment_id: paymentRes.razorpay_payment_id,
                razorpay_signature: paymentRes.razorpay_signature
              })
            });

            if (!verifyResponse.ok) {
              throw new Error("Verification failed");
            }

            const verifyData = await verifyResponse.json();
            if (verifyData.verified) {
              await saveBookingRecord(paymentRes.razorpay_payment_id, "Paid", selectedService.price);
            } else {
              throw new Error("Verification signature invalid");
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            toast.error("Payment verification failed. Booking aborted.");
            setIsPaying(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        toast.error(`Payment failed: ${resp.error.description || "Unknown error"}`);
        setIsPaying(false);
      });
      rzp.open();
    } catch (error) {
      console.warn("Razorpay API not available, switching to local mock payment:", error);
      toast.warning("Razorpay connection issue. Switching to Mock Sandbox Card.");
      setPaymentMethod("mock");
      setIsPaying(false);
    }
  };
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
                Choose your payment option and secure your appointment.
              </p>

              {/* Tab Selector */}
              <div className="flex rounded-xl bg-secondary/50 p-1 mt-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    paymentMethod === "razorpay"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CreditCard className="h-4 w-4 text-primary" /> Razorpay Checkout
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mock")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    paymentMethod === "mock"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CreditCard className="h-4 w-4 text-muted-foreground" /> Mock Sandbox Card
                </button>
              </div>

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

              {paymentMethod === "razorpay" ? (
                <div className="rounded-2xl border border-border bg-primary-soft/30 p-6 text-center space-y-4 animate-fade-in mt-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Razorpay Checkout</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Pay securely via UPI, Cards, NetBanking, or Wallets using Razorpay Test Mode.
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground border-t border-border pt-4 mt-2">
                    Click <strong>Pay & Confirm</strong> below to open the secure payment checkout.
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-4 animate-fade-in">
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
              )}
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
                  <FileText className="h-4 w-4" /> Booking ID #{savedBooking?.id || bookingId}
                </div>
                <div className="mt-4 grid gap-2 text-sm">
                  <Row label="Hospital" value={savedBooking?.hospital_name || hospital.name} />
                  <Row label="Service" value={savedBooking?.service_name || selectedService.name} />
                  <Row label="Date" value={savedBooking?.booking_date || date} />
                  <Row label="Time" value={savedBooking?.booking_time || slot || "—"} />
                  {savedBooking?.payment_id && (
                    <Row label="Payment ID" value={savedBooking.payment_id} />
                  )}
                  {savedBooking?.payment_status && (
                    <Row label="Payment Status" value={savedBooking.payment_status} />
                  )}
                  <Row
                    label="Total"
                    value={`₹${(savedBooking?.amount || selectedService.price).toLocaleString()}`}
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
                  onClick={handlePayAndConfirm}
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
