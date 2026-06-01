import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — MediCompare" }] }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteShell>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Talk to our team</h1>
          <p className="mt-3 text-muted-foreground">
            Have a question about pricing, booking, or partnering with MediCompare? We respond within one business day.
          </p>
          <div className="mt-8 space-y-4">
            {[
              { icon: Mail, label: "hello@medicompare.health" },
              { icon: Phone, label: "+91 80 1234 5678" },
              { icon: MapPin, label: "MG Road, Bengaluru 560001" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <b.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Message sent", { description: "We'll reach out within 24 hours." });
          }}
          className="rounded-3xl border border-border bg-card p-8 shadow-elevated"
        >
          <h2 className="text-xl font-semibold">Send us a message</h2>
          <div className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>First name</Label><Input className="mt-1.5" required /></div>
              <div><Label>Last name</Label><Input className="mt-1.5" required /></div>
            </div>
            <div><Label>Email</Label><Input type="email" className="mt-1.5" required /></div>
            <div><Label>Message</Label><Textarea rows={5} className="mt-1.5" required /></div>
            <Button type="submit" size="lg" className="w-full rounded-full">Send message</Button>
          </div>
        </form>
      </section>
    </SiteShell>
  );
}
