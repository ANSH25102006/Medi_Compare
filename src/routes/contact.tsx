import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Send, CheckCircle2, Sliders, Globe, Heart } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact Us — MediCompare" }] }),
  component: ContactPage,
});

const contactInfo = [
  { icon: Mail, label: "hello@medicompare.health", href: "mailto:hello@medicompare.health", subtitle: "Support & Partnerships" },
  { icon: Phone, label: "+91 80 1234 5678", href: "tel:+918012345678", subtitle: "Mon-Fri 9AM-7PM IST" },
  { icon: MapPin, label: "MG Road, Bengaluru 560001", href: "#", subtitle: "Corporate Office" },
];

const faqs = [
  {
    q: "How does MediCompare verify procedure prices?",
    a: "We collaborate directly with hospital billing teams and query active public chargemaster lists to ensure all listed rates are accurate and up to date."
  },
  {
    q: "Are reviews moderated?",
    a: "Every review must match a validated appointment confirmation ID in our database, protecting patients from false or promoted clinical feedback."
  },
  {
    q: "Can I reschedule my appointment?",
    a: "Yes. You can reschedule or cancel booked consultation slots without penalty up to 4 hours before the scheduled time directly from your dashboard."
  }
];

function ContactPage() {
  const { user } = useAuth();
  const nameParts = user?.name?.split(" ") ?? [];

  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [subject, setSubject] = useState("support");
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
      <section className="relative overflow-hidden bg-hero-gradient py-12 border-b border-border/40">
        <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,oklch(0.55_0.22_260)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.55_0.22_260)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-4xl text-center px-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Connect with us
          </p>
          <h1 className="mt-3 text-3xl font-extrabold md:text-5xl text-foreground tracking-tight">
            Talk to our team
          </h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Have questions about clinical listings, patient billing, or partnering with MediCompare? We are here to help.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">Contact Directory</h2>
          <p className="mt-2 text-xs text-muted-foreground">Select the optimal department pathway for immediate routing.</p>
          
          <div className="mt-8 space-y-4">
            {contactInfo.map((b) => (
              <a
                key={b.label}
                href={b.href}
                className="flex items-center gap-4 rounded-xl border border-border/40 bg-card/60 p-4 shadow-sm transition-all hover:border-primary/20"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary border border-primary/10">
                  <b.icon className="h-5 w-5" />
                </span>
                <div>
                  <span className="block text-xs font-bold text-foreground">{b.label}</span>
                  <span className="block text-[10px] text-muted-foreground font-semibold mt-0.5">{b.subtitle}</span>
                </div>
              </a>
            ))}
          </div>

          {/* Social Links */}
          <div className="mt-10 rounded-xl border border-border/40 bg-card/65 p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <Globe className="h-4 w-4" /> Follow our channels
            </h3>
            <div className="mt-4 flex gap-4 text-xs font-bold text-muted-foreground">
              <a href="#" className="hover:text-primary transition-all">Twitter / X</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-all">LinkedIn</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-all">GitHub</a>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card/65 p-8 shadow-sm text-center gap-4 min-h-[400px]">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h2 className="text-xl font-bold">Inquiry submitted</h2>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed font-semibold">
              Thank you for reaching out. A representative from the designated department will reply within one business day.
            </p>
            <Button
              variant="outline"
              className="rounded-lg text-xs font-bold mt-2"
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
            className="rounded-xl border border-border/40 bg-card/65 p-6 md:p-8 shadow-sm backdrop-blur-md"
          >
            <h2 className="text-base font-bold text-foreground">Send Message</h2>
            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="contact-firstname" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">First name</Label>
                  <Input
                    id="contact-firstname"
                    className="mt-1.5 rounded-lg border-border/70 bg-background/50 text-xs font-semibold focus-visible:ring-primary placeholder:text-muted-foreground/50 h-9"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ananya"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-lastname" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Last name</Label>
                  <Input
                    id="contact-lastname"
                    className="mt-1.5 rounded-lg border-border/70 bg-background/50 text-xs font-semibold focus-visible:ring-primary placeholder:text-muted-foreground/50 h-9"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sharma"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contact-email" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  className="mt-1.5 rounded-lg border-border/70 bg-background/50 text-xs font-semibold focus-visible:ring-primary placeholder:text-muted-foreground/50 h-9"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label htmlFor="contact-subject" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reason for inquiry</Label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border/70 bg-background/50 px-3 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-foreground"
                >
                  <option value="support">Patient Support & Care Help</option>
                  <option value="partnership">Hospital Partnership Request</option>
                  <option value="business">General Business Enquiry</option>
                  <option value="feedback">Product Feedback & Suggestion</option>
                </select>
              </div>
              <div>
                <Label htmlFor="contact-message" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Message</Label>
                <Textarea
                  id="contact-message"
                  rows={5}
                  className="mt-1.5 rounded-lg border-border/70 bg-background/50 text-xs font-semibold focus-visible:ring-primary placeholder:text-muted-foreground/50 resize-none"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help you…"
                />
              </div>
              <Button type="submit" size="sm" className="w-full rounded-lg h-10 font-bold" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />{" "}
                    Submitting…
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <Send className="h-4 w-4" /> Submit Inquiry
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* Frequently Asked Questions */}
      <section className="mx-auto max-w-3xl px-4 py-16 border-t border-border/40">
        <h2 className="text-center text-xl font-bold text-foreground">Frequently Asked Questions</h2>
        <p className="text-center text-xs text-muted-foreground mt-1">Quick reference guidelines for general contact inquiries.</p>
        
        <Accordion type="single" collapsible className="mt-8 space-y-2">
          {faqs.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`item-${i}`}
              className="rounded-2xl border border-border bg-card px-5 py-2 shadow-soft hover:border-primary/20 transition-all duration-300"
            >
              <AccordionTrigger className="text-left text-xs font-bold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs leading-relaxed text-muted-foreground font-semibold">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteShell>
  );
}
