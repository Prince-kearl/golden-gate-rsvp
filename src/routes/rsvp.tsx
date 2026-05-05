import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, X, HelpCircle, Sparkles, User, Phone, MessageSquare, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { z } from "zod";

export const Route = createFileRoute("/rsvp")({
  head: () => ({
    meta: [
      { title: "RSVP — Charles Osam's Birthday" },
      { name: "description", content: "Confirm your attendance for Charles Osam's birthday party." },
    ],
  }),
  component: RsvpPage,
});

const RSVP_DEADLINE = new Date("2026-05-12T23:59:59");
const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(20).regex(/^[+\d\s()-]+$/, "Phone number contains invalid characters"),
  attendance: z.enum(["yes", "no", "maybe"]),
  message: z.string().trim().max(500).optional(),
});

const options = [
  { v: "yes", label: "Attending", icon: Check, accent: "text-gold" },
  { v: "maybe", label: "Maybe", icon: HelpCircle, accent: "text-lime" },
  { v: "no", label: "Not attending", icon: X, accent: "text-destructive" },
] as const;

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, expired: diff === 0 };
}

function RsvpPage() {
  const navigate = useNavigate();
  const countdown = useCountdown(RSVP_DEADLINE);
  const isClosed = countdown.expired;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", attendance: "yes" as "yes" | "no" | "maybe", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isClosed) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      const { data: exists } = await supabase.rpc("phone_exists", { _phone: parsed.data.phone });
      if (exists) { toast.error("This phone number has already RSVP'd."); setLoading(false); return; }
      const { error } = await supabase.from("rsvps").insert({
        name: parsed.data.name, phone: parsed.data.phone, attendance: parsed.data.attendance, message: parsed.data.message || null,
      });
      if (error) throw error;
      navigate({ to: "/success", search: { name: parsed.data.name, attendance: parsed.data.attendance } });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Toaster position="top-center" theme="dark" />
      <div className="absolute inset-0 bg-spot pointer-events-none" />

      <header className="relative z-10 max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold text-sm">CO</div>
          <span className="font-medium text-sm tracking-tight">Charles Osam</span>
        </div>
      </header>

      <main className="relative z-10 max-w-xl mx-auto px-6 py-10 md:py-16">
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold mb-5">
            <Sparkles className="w-3.5 h-3.5" /> RSVP
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-3">Confirm Your Attendance</h1>
          <p className="text-sm text-muted-foreground">Saturday, May 16 · 8:00 PM · Casa 1715</p>
        </div>

        {!isClosed && (
          <div className="mb-8 rounded-2xl bg-gradient-surface ring-border p-5 animate-fade-up delay-75">
            <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
              <Clock className="w-3 h-3 text-gold" /> RSVP closes in
            </div>
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {[
                { v: countdown.days, l: "Days" },
                { v: countdown.hours, l: "Hours" },
                { v: countdown.minutes, l: "Min" },
                { v: countdown.seconds, l: "Sec" },
              ].map((u) => (
                <div key={u.l} className="rounded-xl bg-surface-elevated/60 py-3 text-center">
                  <p className="font-display text-2xl md:text-3xl text-gold tabular-nums">{String(u.v).padStart(2, "0")}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{u.l}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isClosed ? (
          <div className="rounded-3xl bg-gradient-surface ring-border p-10 text-center shadow-card animate-fade-up">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 text-gold mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-display text-2xl text-gold mb-2">RSVP is now closed</h3>
            <p className="text-sm text-muted-foreground">The deadline of May 12, 2026 has passed. Please contact the host directly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl bg-gradient-surface ring-border p-6 md:p-8 space-y-6 shadow-card animate-fade-up delay-100">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required className="pl-10 h-12 bg-surface-elevated border-border/60 rounded-xl focus-visible:ring-gold/50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-muted-foreground">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0539 456 478" required className="pl-10 h-12 bg-surface-elevated border-border/60 rounded-xl focus-visible:ring-gold/50" />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Attendance</Label>
              <div className="grid grid-cols-3 gap-2">
                {options.map((opt) => {
                  const active = form.attendance === opt.v;
                  return (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setForm({ ...form, attendance: opt.v })}
                      className={`group relative rounded-xl p-3.5 border transition-all ${
                        active
                          ? "border-gold bg-gold/10 shadow-[0_0_0_3px_oklch(0.82_0.13_84/0.1)]"
                          : "border-border/60 bg-surface-elevated hover:border-border"
                      }`}
                    >
                      <opt.icon className={`w-4 h-4 mb-2 ${active ? opt.accent : "text-muted-foreground"}`} />
                      <p className={`text-sm font-medium text-left ${active ? "text-foreground" : "text-muted-foreground"}`}>{opt.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-xs uppercase tracking-widest text-muted-foreground">Message <span className="normal-case text-[10px]">(optional)</span></Label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="A note for the host..." rows={3} maxLength={500} className="pl-10 pt-3 bg-surface-elevated border-border/60 rounded-xl focus-visible:ring-gold/50 resize-none" />
              </div>
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold h-12 rounded-xl font-medium tracking-wide transition-all hover:scale-[1.01]">
              {loading ? "Submitting..." : "Confirm Attendance"}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">RSVP by May 12, 2026 · Invite admits 1 only</p>
          </form>
        )}
      </main>
    </div>
  );
}
