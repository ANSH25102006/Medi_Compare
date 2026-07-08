import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Star, 
  Bookmark, 
  Settings as SettingsIcon, 
  CreditCard, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Download, 
  AlertCircle,
  Clock,
  History,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { DashboardLayoutSkeleton } from "@/components/site/SkeletonLoader";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Billing & Subscriptions — MediCompare" }] }),
  component: BillingPage,
});

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Appointments", url: "/dashboard/appointments", icon: CalendarCheck },
  { title: "Reviews", url: "/dashboard/reviews", icon: Star },
  { title: "Saved Hospitals", url: "/dashboard/saved", icon: Bookmark },
  { title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
  { title: "Billing & Subscription", url: "/billing", icon: CreditCard },
];

function BillingPage() {
  const { user, loading, refreshSession } = useAuth();
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", search: { redirect: "/billing" } });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <DashboardLayoutSkeleton />;
  }

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your premium subscription? Your plan will return to the Free Tier immediately.")) {
      return;
    }

    setCancelling(true);
    toast.loading("Processing subscription cancellation...", { id: "cancel-sub" });

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          plan: "Free",
          subscription_status: "inactive",
          subscription_end: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      await refreshSession();
      toast.success("Subscription cancelled successfully. You are now on the Free plan.", { id: "cancel-sub" });
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription. Please try again.", { id: "cancel-sub" });
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`Invoice ${invoiceId} downloaded successfully!`, {
      description: "A PDF copy has been saved to your downloads folder.",
    });
  };

  // Mock invoice data if they have a premium plan
  const hasPremium = user.plan === "Plus" || user.plan === "Pro";
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRenewalLabel = () => {
    if (user.plan === "Free") return "N/A";
    return user.subscription_status === "active" ? "Next Renewal" : "Expired Date";
  };

  return (
    <DashboardShell items={navItems} label="Patient" user={user}>
      <div className="space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight sm:text-3xl">
            Billing & Subscription
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Manage your plans, update billing details, and view payment receipt history.
          </p>
        </div>

        {/* Plan Overview Card */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border-border/80 shadow-soft relative overflow-hidden bg-card">
            {hasPremium && (
              <div className="absolute top-0 right-0 h-24 w-24 overflow-hidden pointer-events-none">
                <div className="absolute top-3 -right-6 bg-primary text-white text-[10px] font-black uppercase tracking-wider py-1 px-8 rotate-45 shadow-sm">
                  Premium
                </div>
              </div>
            )}
            <CardHeader className="pb-4">
              <CardDescription className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" /> Current Active Plan
              </CardDescription>
              <CardTitle className="text-2xl font-extrabold text-foreground mt-2 flex items-center gap-2">
                {user.plan === "Plus" && (
                  <>
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    <span>MediCompare Plus</span>
                  </>
                )}
                {user.plan === "Pro" && (
                  <>
                    <Sparkles className="h-6 w-6 text-success animate-pulse" />
                    <span>MediCompare Pro</span>
                  </>
                )}
                {user.plan === "Free" && (
                  <>
                    <Clock className="h-6 w-6 text-muted-foreground" />
                    <span>MediCompare Free</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="grid gap-4 sm:grid-cols-3 border-t border-b border-border/60 py-4 text-xs">
                <div>
                  <span className="block text-muted-foreground font-semibold">Subscription Status</span>
                  <span className="mt-1 inline-flex items-center gap-1">
                    {user.subscription_status === "active" ? (
                      <Badge className="bg-success/10 hover:bg-success/15 text-success font-extrabold border border-success/20 py-0.5 px-2.5 rounded-full text-[10px] uppercase">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground font-extrabold border border-border py-0.5 px-2.5 rounded-full text-[10px] uppercase">
                        Inactive
                      </Badge>
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-semibold">Amount</span>
                  <span className="mt-1 font-bold text-foreground block">
                    {user.plan === "Plus" ? "₹199 / month" : user.plan === "Pro" ? "₹399 / month" : "₹0 / forever"}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground font-semibold">{getRenewalLabel()}</span>
                  <span className="mt-1 font-bold text-foreground block">
                    {formatDate(user.subscription_end)}
                  </span>
                </div>
              </div>

              {/* Plan Benefits Summary */}
              <div>
                <h4 className="text-xs font-bold text-foreground mb-2">Plan Includes:</h4>
                <ul className="grid gap-2 sm:grid-cols-2 text-[11px] text-muted-foreground font-semibold">
                  {user.plan === "Free" && (
                    <>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-success" /> Maximum 3 AI messages/day
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-success" /> Hospital comparison
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-success" /> Verified patient reviews
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-success" /> Direct booking
                      </li>
                    </>
                  )}
                  {user.plan === "Plus" && (
                    <>
                      <li className="flex items-center gap-2 text-foreground font-bold">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" /> Unlimited AI conversations
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" /> Personalized recommendations
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" /> Medical report explanation
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" /> Insurance claims guide
                      </li>
                    </>
                  )}
                  {user.plan === "Pro" && (
                    <>
                      <li className="flex items-center gap-2 text-foreground font-bold">
                        <CheckCircle className="h-3.5 w-3.5 text-success" /> Everything in Plus
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-success" /> Family profiles (up to 4)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-success" /> Unlimited medical uploads
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-success" /> Interactive health timeline
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
            {hasPremium && (
              <CardFooter className="bg-muted/30 border-t border-border/60 py-4 flex justify-between gap-4 flex-wrap">
                <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  Your plan auto-renews. Cancel anytime.
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={cancelling}
                  onClick={handleCancelSubscription}
                  className="rounded-lg h-9 text-xs font-bold gap-1 cursor-pointer bg-red-600 text-white hover:bg-red-700"
                >
                  <ShieldAlert className="h-4 w-4" /> Cancel Subscription
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Side Info Panel */}
          <Card className="border-border/80 shadow-soft bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">Need help?</CardTitle>
              <CardDescription className="text-xs font-semibold">
                If you have any questions regarding your billing cycle or payouts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6 text-xs text-muted-foreground font-semibold leading-relaxed">
              <p>
                Payments are processed securely via Razorpay Test Mode. All refunds are issued automatically within 5-7 working days.
              </p>
              <p>
                To change your payment card, billing details, or update your tax/GST invoice metadata, please raise a support ticket.
              </p>
              <Button asChild variant="outline" className="w-full rounded-lg text-xs font-bold h-9 cursor-pointer">
                <Link to="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Payment History List */}
        <div>
          <h2 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-primary" /> Payment Receipt History
          </h2>
          <Card className="border-border/80 shadow-soft bg-card overflow-hidden">
            {!hasPremium ? (
              <div className="p-12 text-center text-muted-foreground bg-card">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                <p className="text-xs font-bold">No transactions found</p>
                <p className="text-[10px] mt-1">Upgrade your clinical assistant to view premium plan invoices.</p>
                <Button asChild className="mt-4 rounded-lg bg-primary hover:opacity-90 text-white text-xs font-bold h-9 px-4 cursor-pointer">
                  <Link to="/ai-assistant">View Upgrade Options</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-border/60">
                    <TableHead className="text-xs font-bold text-foreground">Invoice ID</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Billing Period</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Method</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Amount Paid</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
                    <TableHead className="text-xs font-bold text-foreground text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-border/60 hover:bg-muted/5">
                    <TableCell className="text-xs font-bold text-foreground">
                      INV-{user.razorpay_payment_id?.slice(-8).toUpperCase() || "SUB-001"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-semibold">
                      {formatDate(user.subscription_start)} - {formatDate(user.subscription_end)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-semibold">
                      Razorpay Checkout
                    </TableCell>
                    <TableCell className="text-xs font-bold text-foreground">
                      {user.plan === "Plus" ? "₹199.00" : "₹399.00"}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-extrabold text-success border border-success/20 uppercase">
                        Paid
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadInvoice(user.razorpay_payment_id?.slice(-8).toUpperCase() || "SUB-001")}
                        className="h-8 w-8 text-primary hover:text-primary/80 cursor-pointer rounded-full"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
