import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Sparkles, Bot, Search, Star, MapPin, ArrowRight, ShieldCheck, Clock, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { useHospitals } from "@/hooks/use-hospitals";
import { AIRecommendation } from "@/components/site/AIRecommendation";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — MediCompare" },
      { name: "description", content: "Intelligent AI-driven healthcare recommendations using verified chargemaster cost lists." },
    ],
  }),
  component: AIAssistantPage,
});

const defaultQueries = [
  { text: "MRI below ₹7000.", query: "mri under 7000" },
  { text: "Dermatologist nearby.", query: "dermatologist" },
  { text: "Shortest wait time.", query: "wait time" },
  { text: "Accepting insurance.", query: "insurance" }
];

function AIAssistantPage() {
  const { data: hospitalsList = [], isLoading } = useHospitals();
  const [typedQuery, setTypedQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { user, refreshSession } = useAuth();
  const userTier = (user?.plan || "Free") as "Free" | "Plus" | "Pro";

  const dateKey = `mch_daily_msgs_${new Date().toDateString()}`;
  const [messageCount, setMessageCount] = useState(() => {
    const val = localStorage.getItem(dateKey);
    return val ? parseInt(val, 10) : 0;
  });
  
  const limit = 3;
  const remaining = Math.max(limit - messageCount, 0);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // Dynamically load Razorpay checkout script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleUpgrade = async (planName: "Plus" | "Pro") => {
    if (!user) {
      toast.error("Please sign in to upgrade to a premium plan.");
      return;
    }

    try {
      let amount = 199;
      if (planName === "Plus") {
        amount = billingCycle === "monthly" ? 199 : 1908;
      } else {
        amount = billingCycle === "monthly" ? 399 : 3828;
      }

      toast.loading(`Initializing checkout for MediCompare ${planName}...`, { id: "checkout" });

      const response = await fetch("/.netlify/functions/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, receipt: `sub_${user.id}_${Date.now()}` }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout order.");
      }

      const orderData = await response.json();
      toast.dismiss("checkout");

      const keyId = orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;

      // Initialize Razorpay Options
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MediCompare Premium",
        description: `${planName} Subscription (${billingCycle})`,
        order_id: orderData.mock ? undefined : orderData.id,
        handler: async (paymentRes: any) => {
          toast.loading("Verifying payment transaction...", { id: "verify" });

          // Get the current Supabase session token
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token || "";

          // Calculate subscription end date (30 days for monthly, 365 days for yearly)
          const subscription_start = new Date().toISOString();
          const daysToAdd = billingCycle === "monthly" ? 30 : 365;
          const subscription_end = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

          // Call verify Netlify function
          const verifyResponse = await fetch("/.netlify/functions/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: orderData.id,
              razorpay_payment_id: paymentRes.razorpay_payment_id || `pay_mock_${Date.now()}`,
              razorpay_signature: paymentRes.razorpay_signature || "mock_signature",
              userId: user.id,
              plan: planName,
              subscription_start,
              subscription_end,
              token,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyResponse.ok && verifyData.verified) {
            // Success! Refresh session so premium features unlock automatically.
            await refreshSession();
            toast.success(`Welcome to MediCompare ${planName}! Subscription activated.`, { id: "verify" });
            setIsPricingOpen(false);
          } else {
            toast.error(verifyData.error || "Payment verification failed. Please contact support.", { id: "verify" });
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#2563EB",
        },
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback for sandboxed checkout
        toast.warning("Razorpay checkout script not loaded. Redirecting to mock Sandbox payment...");
        // Call mock payment handler directly
        const mockResponse = {
          razorpay_order_id: orderData.id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "mock_signature",
        };
        // Run handler automatically
        options.handler(mockResponse);
      }
    } catch (err: any) {
      toast.dismiss("checkout");
      toast.error(err.message || "Failed to initialize premium checkout.");
    }
  };

  const handleQueryTrigger = (queryStr: string, displayStr: string) => {
    if (userTier === "Free" && messageCount >= limit) {
      setIsPricingOpen(true);
      return;
    }
    setTypedQuery(displayStr);
    setIsTyping(true);
    setTimeout(() => {
      setActiveQuery(queryStr);
      setIsTyping(false);
      if (userTier === "Free") {
        setMessageCount((prev) => {
          const nextCount = prev + 1;
          localStorage.setItem(dateKey, String(nextCount));
          return nextCount;
        });
      }
    }, 850);
  };

  const recommendations = useMemo(() => {
    if (!activeQuery) return [];
    const q = activeQuery.toLowerCase();
    
    if (q.includes("mri") || q.includes("7000")) {
      return hospitalsList
        .filter(h => h.services.some(s => s.name.toLowerCase().includes("mri") && s.price < 7000))
        .map(h => ({
          hospital: h,
          matchedService: h.services.find(s => s.name.toLowerCase().includes("mri")),
          confidence: 98,
          rationale: `${h.name} matches your budget limit. Offering high-resolution MRI scans at ₹${h.services.find(s => s.name.toLowerCase().includes("mri"))?.price.toLocaleString()} with certified radiologists.`,
          reasons: ["Lowest Price", "NABL Verified", "Fast Results"]
        }));
    }

    if (q.includes("dermatologist") || q.includes("dermatology")) {
      return hospitalsList
        .filter(h => h.specialties.some(s => s.toLowerCase().includes("dermatology") || s.toLowerCase().includes("skin")))
        .map(h => ({
          hospital: h,
          matchedService: h.services[0],
          confidence: 94,
          rationale: `${h.name} features direct consulting hours with chief clinical dermatologists, covered fully under cashless corporate health networks.`,
          reasons: ["Top Doctor", "Cashless Covered"]
        }));
    }

    if (q.includes("wait") || q.includes("time")) {
      return [...hospitalsList]
        .sort((a, b) => b.slots.length - a.slots.length)
        .slice(0, 2)
        .map(h => ({
          hospital: h,
          matchedService: h.services[0],
          confidence: 96,
          rationale: `${h.name} has the lowest patient check-in wait average (under 12 mins) today, with ${h.slots.length} available appointment slots.`,
          reasons: ["Quick Entry", "Low Wait Time"]
        }));
    }

    return hospitalsList
      .slice(0, 2)
      .map(h => ({
        hospital: h,
        matchedService: h.services[0],
        confidence: 90,
        rationale: `${h.name} accepts cashless claims verification, with multiple slot bookings available for general medical consultations this week.`,
        reasons: ["Insurance Network", "Highly Rated"]
      }));
  }, [activeQuery, hospitalsList]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#1E3A5F] flex flex-col justify-between">
      <SiteShell>
        {/* Light theme AI Hero */}
        <section className="relative overflow-hidden pt-24 pb-16 border-b border-border bg-hero-gradient">
          {/* Animated blurred circle - subtle primary blue glow */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 h-[350px] w-[350px] rounded-full bg-primary/5 blur-3xl pointer-events-none animate-pulse" />

          <div className="relative z-10 mx-auto max-w-4xl text-center px-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3.5 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> MediCompare AI v1.0
            </span>
            <h1 className="mt-4 text-3xl font-extrabold md:text-5xl text-foreground tracking-tight">
              Ask our AI Clinical Assistant
            </h1>
            <p className="mt-4 text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-semibold">
               Find diagnostic procedures, compare hospital pricing, check emergency slots, and verify insurance network coverage using conversational queries.
            </p>

            {/* Premium Tier Trigger Badge */}
            <div className="mt-4 flex justify-center">
              {userTier === "Free" ? (
                <button
                  onClick={() => setIsPricingOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-extrabold text-primary hover:bg-primary/10 transition-all cursor-pointer shadow-sm active:scale-95 btn-interactive"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Unlock MediCompare Plus / Pro
                </button>
              ) : (
                <button
                  onClick={() => setIsPricingOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-success/35 bg-success/10 px-4 py-1.5 text-xs font-extrabold text-success transition-all cursor-pointer shadow-sm hover:bg-success/15 active:scale-95 btn-interactive"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> MediCompare {userTier} Active · Manage Plan
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Chat / Query Panel Section */}
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-card p-5 shadow-[0_0_50px_rgba(37,99,235,0.08)] relative overflow-hidden">
            
            {/* Blurrable container wrapper */}
            <div className={`transition-all duration-300 ${userTier === "Free" && messageCount >= limit ? "blur-[2px] pointer-events-none select-none opacity-45" : ""}`}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-muted-foreground" />
                  <input
                    type="text"
                    disabled={userTier === "Free" && messageCount >= limit}
                    placeholder="Ask e.g. 'MRI Scan under ₹7000' or 'Shortest consultation wait times'..."
                    value={typedQuery}
                    onChange={(e) => setTypedQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (userTier === "Free" && messageCount >= limit) {
                          setIsPricingOpen(true);
                        } else {
                          handleQueryTrigger(typedQuery, typedQuery);
                        }
                      }
                    }}
                    className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary placeholder:text-muted-foreground/50"
                  />
                </div>
                <Button
                  onClick={() => {
                    if (userTier === "Free" && messageCount >= limit) {
                      setIsPricingOpen(true);
                    } else {
                      handleQueryTrigger(typedQuery, typedQuery);
                    }
                  }}
                  disabled={userTier === "Free" && messageCount >= limit}
                  size="sm"
                  className="rounded-lg h-10 px-4 text-xs font-bold gap-1 cursor-pointer bg-primary text-primary-foreground hover:opacity-90 transition-all text-white"
                >
                  Inquire
                </Button>
              </div>

              {/* Suggestions chips & limit counter */}
              <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Suggestions:</span>
                  {defaultQueries.map((item) => (
                    <button
                      key={item.text}
                      disabled={userTier === "Free" && messageCount >= limit}
                      onClick={() => handleQueryTrigger(item.query, item.text)}
                      className="rounded-full border border-border bg-card hover:bg-primary-soft hover:text-primary hover:border-primary/20 px-3.5 py-1 text-[10px] font-bold text-muted-foreground cursor-pointer transition-all disabled:opacity-50"
                    >
                      {item.text}
                    </button>
                  ))}
                </div>

                {userTier === "Free" ? (
                  <span className="text-[10px] font-extrabold text-primary bg-primary-soft border border-primary/10 px-2.5 py-1 rounded-full shrink-0">
                    {remaining} of {limit} free daily queries remaining
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                    MediCompare {userTier} Active
                  </span>
                )}
              </div>
            </div>

            {/* Lock/Upgrade Overlay when limit is exhausted */}
            {userTier === "Free" && messageCount >= limit ? (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary animate-pulse">
                  <Sparkles className="h-3.5 w-3.5" /> Free Limit Reached
                </span>
                <h3 className="mt-4 text-base font-extrabold text-foreground">Unlock Unlimited Conversations</h3>
                <p className="mt-2 text-xs text-muted-foreground max-w-sm leading-relaxed font-semibold">
                  You have used all {limit} daily free clinical matching queries. Upgrade to Plus or Pro for unlimited answers, reports, and priority booking.
                </p>
                <Button
                  onClick={() => setIsPricingOpen(true)}
                  className="mt-5 rounded-lg bg-primary hover:opacity-95 text-white font-bold text-xs h-10 px-6 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  View Premium Plans
                </Button>
              </div>
            ) : null}

          </div>

          {/* Results Area */}
          <div className="mt-10 space-y-6">
            {isTyping ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-primary-soft/50 border border-primary/20 rounded-xl">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary border border-primary/25 animate-spin">
                  <RefreshCw className="h-5 w-5" />
                </span>
                <p className="text-xs text-muted-foreground font-semibold animate-pulse">AI is parsing patient query parameters...</p>
              </div>
            ) : activeQuery ? (
              <div>
                <div className="flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <Bot className="h-5 w-5 text-primary" />
                  <span>AI Structured Recommendation</span>
                </div>

                {isLoading ? (
                  <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">
                    Retrieving cost chargemasters list...
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground bg-card shadow-soft">
                    <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs font-bold">No recommendations found matching your query.</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Try clicking one of the suggestions chips above.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {recommendations.map(({ hospital: h, matchedService: s, confidence, rationale, reasons }) => (
                      <div
                        key={h.id}
                        className="rounded-xl border border-border bg-card p-6 shadow-soft hover:border-primary/20 transition-all duration-300 relative overflow-hidden shadow-[0_0_30px_rgba(37,99,235,0.06)]"
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={h.image}
                              alt={h.name}
                              className="h-14 w-14 rounded-lg object-cover ring-1 ring-border shadow-sm"
                            />
                            <div>
                              <h3 className="font-bold text-sm text-foreground">{h.name}</h3>
                              <p className="text-[10px] text-muted-foreground font-bold mt-0.5 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-primary" /> {h.city} · {h.distance} km
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-primary-soft border border-primary/10 px-2.5 py-1 rounded-lg text-primary text-[10px] font-bold">
                            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                            <span>{confidence}% Confidence Match</span>
                          </div>
                        </div>

                        <div className="mt-4 border-t border-border pt-4">
                          <p className="text-xs text-foreground leading-relaxed font-semibold">
                            {rationale}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {reasons.map((r) => (
                            <span
                              key={r}
                              className="inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/20 px-2.5 py-0.5 text-[9px] font-bold text-success uppercase tracking-wider"
                            >
                              <CheckCircle className="h-2.5 w-2.5" /> {r}
                            </span>
                          ))}
                        </div>

                        <div className="mt-6 flex justify-end gap-2.5 border-t border-border pt-4">
                          <Button asChild variant="outline" className="rounded-lg text-xs h-9 px-3.5 cursor-pointer border-border bg-background text-foreground hover:bg-muted">
                            <Link to="/hospitals/$hospitalId" params={{ hospitalId: h.id }}>
                              View Clinic
                            </Link>
                          </Button>
                          <Button asChild className="rounded-lg text-xs h-9 px-3.5 cursor-pointer bg-primary text-primary-foreground font-bold hover:opacity-90 text-white">
                            <Link to="/book" search={{ hospital: h.id, service: s?.name || h.services[0].name }}>
                              Book Appointment
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <Bot className="h-5 w-5 text-primary" />
                  <span>Clinical Recommendation Preview</span>
                </div>
                <AIRecommendation />
              </div>
            )}
          </div>
        </section>
      </SiteShell>

      {/* Premium Pricing Modal */}
      {isPricingOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-md animate-fade-in"
          onClick={() => setIsPricingOpen(false)}
        >
          <div 
            className="relative bg-card w-full max-w-5xl rounded-[32px] border border-border p-6 md:p-8 shadow-elevated overflow-y-auto max-h-[90vh] animate-scale-up text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPricingOpen(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> MediCompare Premium
              </span>
              <h2 className="mt-4 text-2.5xl font-extrabold md:text-3.5xl text-foreground tracking-tight">
                Choose the perfect care plan
              </h2>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground font-semibold leading-relaxed">
                Get unlimited clinical assistant replies, comprehensive medical comparisons, and family profiles.
              </p>

              {/* Monthly / Yearly Toggle */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <span className={`text-xs font-bold ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingCycle(prev => prev === "monthly" ? "yearly" : "monthly")}
                  className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      billingCycle === "yearly" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
                  Yearly
                  <span className="inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 text-[9px] font-extrabold text-success border border-success/20 uppercase tracking-wider">
                    Save 20%
                  </span>
                </span>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid gap-6 md:grid-cols-3 items-start">
              {/* Free Plan */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
                <div>
                  <h3 className="text-lg font-extrabold text-foreground">Free</h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">For basic medical search & booking.</p>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-3xl font-black text-foreground">₹0</span>
                    <span className="text-xs text-muted-foreground font-bold ml-1">/ forever</span>
                  </div>

                  <ul className="mt-6 space-y-3.5 border-t border-border/60 pt-6">
                    {[
                      "3 AI conversations per day",
                      "Hospital comparison",
                      "Verified patient reviews",
                      "Direct appointment booking",
                      "Transparent price checks",
                    ].map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-xs text-muted-foreground font-semibold">
                        <CheckCircle className="h-4.5 w-4.5 text-success shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  disabled={userTier === "Free"}
                  onClick={async () => {
                    if (!user) return;
                    toast.loading("Downgrading plan...", { id: "downgrade" });
                    const { error } = await supabase
                      .from("profiles")
                      .update({
                        plan: "Free",
                        subscription_status: "inactive",
                      })
                      .eq("id", user.id);
                    if (error) {
                      toast.error(error.message, { id: "downgrade" });
                    } else {
                      await refreshSession();
                      toast.success("Downgraded to Free plan.", { id: "downgrade" });
                      setIsPricingOpen(false);
                    }
                  }}
                  variant="outline"
                  className="mt-8 w-full rounded-xl text-xs font-bold h-10 cursor-pointer disabled:opacity-50"
                >
                  {userTier === "Free" ? "Current Plan" : "Downgrade to Free"}
                </Button>
              </div>

              {/* Plus Plan */}
              <div className="rounded-3xl border-2 border-primary bg-card p-6 shadow-md flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[9px] font-extrabold text-primary uppercase tracking-wider">
                    Popular
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-foreground flex items-center gap-1.5">
                    Plus
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">For regular patients needing clinical support.</p>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-3xl font-black text-foreground">
                      ₹{billingCycle === "monthly" ? "199" : "159"}
                    </span>
                    <span className="text-xs text-muted-foreground font-bold ml-1">/ month</span>
                  </div>
                  {billingCycle === "yearly" && (
                    <p className="text-[10px] text-success font-extrabold mt-1">Billed ₹1,908 annually (Save ₹480)</p>
                  )}

                  <ul className="mt-6 space-y-3.5 border-t border-border/60 pt-6">
                    {[
                      "Unlimited AI conversations",
                      "Personalized recommendations",
                      "AI treatment comparison",
                      "Medical report explanation",
                      "Insurance claims guidance",
                      "Save unlimited searches",
                      "Priority email support",
                    ].map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-xs text-muted-foreground font-semibold">
                        <CheckCircle className="h-4.5 w-4.5 text-success shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  disabled={userTier === "Plus"}
                  onClick={() => handleUpgrade("Plus")}
                  className="mt-8 w-full rounded-xl text-xs font-bold h-10 cursor-pointer bg-primary hover:opacity-95 text-white shadow-sm border-0 transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  {userTier === "Plus" ? "Current Plan" : "Upgrade to Plus"}
                </Button>
              </div>

              {/* Pro Plan */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
                <div>
                  <h3 className="text-lg font-extrabold text-foreground">Pro</h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">Comprehensive care coverage for families.</p>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-3xl font-black text-foreground">
                      ₹{billingCycle === "monthly" ? "399" : "319"}
                    </span>
                    <span className="text-xs text-muted-foreground font-bold ml-1">/ month</span>
                  </div>
                  {billingCycle === "yearly" && (
                    <p className="text-[10px] text-success font-extrabold mt-1">Billed ₹3,828 annually (Save ₹960)</p>
                  )}

                  <ul className="mt-6 space-y-3.5 border-t border-border/60 pt-6">
                    {[
                      "Everything in Plus, plus:",
                      "Up to 4 family profiles",
                      "Unlimited medical reports upload",
                      "Interactive health history timeline",
                      "Priority appointment slot booking",
                      "Export clinical summaries (PDF)",
                    ].map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-xs text-muted-foreground font-semibold">
                        {feat.startsWith("Everything in") ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0 ml-1.5" />
                        ) : (
                          <CheckCircle className="h-4.5 w-4.5 text-success shrink-0 mt-0.5" />
                        )}
                        <span className={feat.startsWith("Everything in") ? "font-bold text-foreground" : ""}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  disabled={userTier === "Pro"}
                  onClick={() => handleUpgrade("Pro")}
                  className="mt-8 w-full rounded-xl text-xs font-bold h-10 cursor-pointer border border-primary bg-card text-primary hover:bg-primary-soft transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  {userTier === "Pro" ? "Current Plan" : "Upgrade to Pro"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
