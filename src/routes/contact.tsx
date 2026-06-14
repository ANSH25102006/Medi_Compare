import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — MediCompare" }] }),
  component: ContactPage,
});

const contactInfo = [
  { icon: Mail, label: "hello@medicompare.health", href: "mailto:hello@medicompare.health" },
  { icon: Phone, label: "+91 80 1234 5678", href: "tel:+918012345678" },
  { icon: MapPin, label: "MG Road, Bengaluru 560001", href: "#" },
];

function ContactPage() {
  const { user } = useAuth();
  const nameParts = user?.name?.split(" ") ?? [];

  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Talk to our team</h1>
          <p className="mt-3 text-muted-foreground">
            Have a question about pricing, booking, or partnering with MediCompare? We respond
            within one business day.
          </p>
          <div className="mt-8 space-y-4">
            {contactInfo.map((b) => (
              <a
                key={b.label}
                href={b.href}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <b.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">{b.label}</span>
              </a>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Business hours
            </p>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Monday – Friday</span>
                <span className="font-medium">9:00 AM – 7:00 PM IST</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span className="font-medium">10:00 AM – 4:00 PM IST</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="text-muted-foreground">Closed</span>
              </div>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 shadow-elevated text-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h2 className="text-2xl font-bold">Message sent!</h2>
            <p className="text-muted-foreground max-w-xs">
              Thanks for reaching out. We'll get back to you within one business day.
            </p>
            <Button
              variant="outline"
              className="rounded-full mt-2"
              onClick={() => {
                setMessage("");
                setSubmitted(false);
              }}
            >
              Send another message
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-border bg-card p-8 shadow-elevated"
          >
            <h2 className="text-xl font-semibold">Send us a message</h2>
            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="contact-firstname">First name</Label>
                  <Input
                    id="contact-firstname"
                    className="mt-1.5"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ananya"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-lastname">Last name</Label>
                  <Input
                    id="contact-lastname"
                    className="mt-1.5"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sharma"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  className="mt-1.5"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  rows={5}
                  className="mt-1.5 resize-none"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help you…"
                />
              </div>
              <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />{" "}
                    Sending…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" /> Send message
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}
      </section>
    </SiteShell>
  );
}
