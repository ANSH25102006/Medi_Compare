import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Star,
  Bookmark,
  Settings as SettingsIcon,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — MediCompare" }] }),
  component: SettingsPage,
});

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Appointments", url: "/dashboard/appointments", icon: CalendarCheck },
  { title: "Reviews", url: "/dashboard/reviews", icon: Star },
  { title: "Saved Hospitals", url: "/dashboard/saved", icon: Bookmark },
  { title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
];

function SettingsPage() {
  const { user, isLoggedIn, loading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      navigate({ to: "/login", search: { redirect: "/dashboard/settings" } });
      return;
    }
    if (user?.role === "Admin") {
      navigate({ to: "/admin" });
    } else if (user?.role === "Doctor") {
      navigate({ to: "/doctor" });
    }
  }, [isLoggedIn, user, navigate, loading]);

  const authUser = {
    name: user?.name ?? "Patient",
    role: user?.role ?? "Patient",
    avatar: user?.avatar ?? "https://i.pravatar.cc/120?img=25",
  };

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);

  if (loading) {
    return null;
  }

  if (!isLoggedIn || user?.role !== "Patient") {
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    try {
      await updateProfile(name.trim(), email.trim());
      toast.success("Settings saved successfully.");
    } catch {
      toast.error("Failed to save settings.");
    }
  };

  const handleDeleteAccount = () => {
    logout();
    toast.success("Account deleted. We're sorry to see you go.");
    navigate({ to: "/" });
  };

  return (
    <DashboardShell items={navItems} label="Patient" user={authUser}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold">Profile information</h2>
          <p className="mt-1 text-sm text-muted-foreground">Update your personal details.</p>
          <div className="mt-5 flex items-center gap-4">
            <img
              src={authUser.avatar}
              alt={authUser.name}
              className="h-16 w-16 rounded-full object-cover"
            />
            <Button variant="outline" size="sm" className="rounded-full" type="button">
              Change photo
            </Button>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="settings-name">Full name</Label>
              <Input
                id="settings-name"
                className="mt-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="settings-email">Email address</Label>
              <Input
                id="settings-email"
                type="email"
                className="mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="rounded-full">
              Save changes
            </Button>
          </div>
        </form>

        {/* Notifications */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="mt-1 text-sm text-muted-foreground">Control how we contact you.</p>
          <div className="mt-5 space-y-4">
            {[
              {
                id: "notif-appt",
                label: "Appointment reminders",
                desc: "Get reminders 24h and 1h before appointments.",
                checked: notifications,
                onChange: setNotifications,
              },
              {
                id: "notif-marketing",
                label: "Promotions & tips",
                desc: "Health tips, new hospital listings, and savings alerts.",
                checked: marketing,
                onChange: setMarketing,
              },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-border p-4 cursor-pointer hover:bg-secondary/40 transition-colors"
              >
                <input
                  id={item.id}
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => {
                    item.onChange(e.target.checked);
                    toast.success("Preference updated.");
                  }}
                  className="mt-0.5 h-4 w-4 rounded accent-primary"
                />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Security</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your password and account security.
          </p>
          <div className="mt-5 space-y-3">
            <Button
              variant="outline"
              className="w-full rounded-full justify-start"
              onClick={() => toast.info("Password reset email sent.")}
            >
              Change password
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full justify-start"
              onClick={() => {
                logout();
                navigate({ to: "/" });
                toast.success("Signed out of all devices.");
              }}
            >
              Sign out all devices
            </Button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-destructive">Danger zone</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Irreversible actions — proceed with caution.
          </p>
          <Button variant="destructive" className="mt-5 rounded-full" onClick={handleDeleteAccount}>
            Delete account
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
