import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Clock, MapPin, Phone, Sparkles, CheckCircle2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { z } from "zod";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Charles Osam's Birthday Party — RSVP" },
      { name: "description", content: "Join us at Casa 1715 on May 16th for Charles Osam's birthday celebration. Confirm your attendance." },
      { property: "og:title", content: "Charles Osam's Birthday Party — RSVP" },
      { property: "og:description", content: "An elegant evening at Casa 1715. RSVP by May 12, 2026." },
    ],
  }),
  component: RsvpPage,
});

const RSVP_DEADLINE = new Date("2026-05-12T23:59:59");

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(20)
    .regex(/^[+\d\s()-]+$/, "Phone number contains invalid characters"),
  attendance: z.enum(["yes", "no", "maybe"]),
  message: z.string().trim().max(500).optional(),
});

function RsvpPage() {
  const isClosed = new Date() > RSVP_DEADLINE;
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", attendance: "yes" as "yes" | "no" | "maybe", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isClosed) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const { data: exists } = await supabase.rpc("phone_exists", { _phone: parsed.data.phone });
      if (exists) {
        toast.error("This phone number has already RSVP'd.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.from("rsvps").insert({
        name: parsed.data.name,
        phone: parsed.data.phone,
        attendance: parsed.data.attendance,
        message: parsed.data.message || null,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" theme="dark" />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Elegant birthday celebration" width={1920} height={1280} className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto py-20">
          <div className="animate-fade-in flex items-center justify-center gap-2 text-gold text-sm tracking-[0.3em] uppercase mb-6">
            <Sparkles className="w-4 h-4" />
            <span>You're Invited</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="animate-fade-up font-display text-5xl md:text-7xl lg:text-8xl font-semibold leading-[1.05] mb-6">
            Charles Osam's
            <span className="block text-gradient-gold italic">Birthday Party</span>
          </h1>
          <div className="gold-divider w-32 mx-auto my-8 animate-fade-in delay-200" />
          <p className="animate-fade-up delay-200 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
            An elegant evening of celebration. Join us for a night to remember.
          </p>
          <div className="animate-fade-up delay-300 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm md:text-base mb-10">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gold" /> Saturday, May 16th</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> 8:00 PM</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold" /> Casa 1715</span>
          </div>
          <a href="#rsvp">
            <Button size="lg" className="animate-fade-up delay-500 bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold font-medium tracking-wide px-10 h-12 rounded-full">
              RSVP Now
            </Button>
          </a>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">The Details</p>
            <h2 className="font-display text-4xl md:text-5xl">A Night of Elegance</h2>
            <div className="gold-divider w-24 mx-auto mt-6" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Calendar, label: "Date", value: "Saturday, May 16th" },
              { icon: Clock, label: "Time", value: "8:00 PM onwards" },
              { icon: MapPin, label: "Venue", value: "Casa 1715" },
              { icon: Phone, label: "Contact", value: "0539 456 478" },
            ].map((item, i) => (
              <div key={item.label} className="animate-fade-up bg-card border border-border/50 rounded-xl p-6 text-center hover:border-gold/40 transition-all" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 text-gold mb-4">
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{item.label}</p>
                <p className="font-display text-lg">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center text-sm text-muted-foreground space-y-1">
            <p>Hosted by <span className="text-foreground">Lady Julia Konadu Osam</span></p>
            <p className="text-xs italic">Invite admits 1 only · RSVP by Tuesday, May 12th, 2026</p>
          </div>
        </div>
      </section>

      {/* RSVP Form */}
      <section id="rsvp" className="py-24 px-6 bg-card/30">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">RSVP</p>
            <h2 className="font-display text-4xl md:text-5xl">Confirm Attendance</h2>
            <div className="gold-divider w-24 mx-auto mt-6" />
          </div>

          {isClosed ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <h3 className="font-display text-2xl text-gold mb-2">RSVP is now closed</h3>
              <p className="text-muted-foreground">The deadline of May 12th, 2026 has passed.</p>
            </div>
          ) : submitted ? (
            <div className="animate-fade-up bg-card border border-gold/30 rounded-xl p-10 text-center shadow-elegant">
              <CheckCircle2 className="w-14 h-14 text-gold mx-auto mb-5" />
              <h3 className="font-display text-3xl mb-3">Thank you!</h3>
              <p className="text-muted-foreground">Your response has been recorded. We look forward to celebrating with you.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 md:p-10 space-y-6 shadow-elegant">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0539 456 478" required />
              </div>
              <div className="space-y-3">
                <Label>Will you attend? *</Label>
                <RadioGroup value={form.attendance} onValueChange={(v) => setForm({ ...form, attendance: v as "yes" | "no" | "maybe" })} className="grid gap-2">
                  {[
                    { v: "yes", label: "Yes, I will attend" },
                    { v: "maybe", label: "Maybe" },
                    { v: "no", label: "No, I cannot attend" },
                  ].map((opt) => (
                    <label key={opt.v} className="flex items-center gap-3 p-3 rounded-md border border-border hover:border-gold/50 cursor-pointer transition-colors">
                      <RadioGroupItem value={opt.v} id={opt.v} />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="A note for the host..." rows={3} maxLength={500} />
              </div>
              <Button type="submit" disabled={loading} size="lg" className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold font-medium tracking-wide h-12 rounded-full">
                {loading ? "Submitting..." : "Confirm Attendance"}
              </Button>
            </form>
          )}
        </div>
      </section>

      <footer className="py-10 text-center text-xs text-muted-foreground border-t border-border/50">
        <p>© 2026 Charles Osam's Birthday · <a href="/admin" className="hover:text-gold transition-colors">Admin</a></p>
      </footer>
    </div>
  );
}
