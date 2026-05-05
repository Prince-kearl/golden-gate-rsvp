import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Calendar, Clock, MapPin, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const searchSchema = z.object({
  name: z.string().optional(),
  attendance: z.enum(["yes", "no", "maybe"]).optional(),
});

export const Route = createFileRoute("/success")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Thank you — RSVP confirmed" }, { name: "robots", content: "noindex" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { name, attendance } = Route.useSearch();
  const isAttending = attendance !== "no";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-spot pointer-events-none" />

      <header className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-lg w-full text-center animate-fade-up">
          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 bg-gradient-gold blur-2xl opacity-40 rounded-full" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center animate-glow">
              <CheckCircle2 className="w-9 h-9 text-primary-foreground" strokeWidth={2.5} />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Confirmed
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4">
            Thank you{name ? `, ${name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            {isAttending
              ? "Your RSVP has been recorded. We can't wait to celebrate with you."
              : "We've recorded your response. You'll be missed — perhaps next time."}
          </p>

          {isAttending && (
            <div className="rounded-3xl bg-gradient-surface ring-border p-6 md:p-8 mb-8 text-left">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-5 text-center">Save the Date</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Calendar, label: "Date", value: "May 16" },
                  { icon: Clock, label: "Time", value: "8:00 PM" },
                  { icon: MapPin, label: "Venue", value: "Casa 1715" },
                ].map((d) => (
                  <div key={d.label} className="text-center">
                    <div className="inline-flex w-9 h-9 rounded-lg bg-gold/10 items-center justify-center mb-2">
                      <d.icon className="w-4 h-4 text-gold" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{d.label}</p>
                    <p className="text-sm font-medium">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link to="/">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full h-12 px-8 font-medium">
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
