import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock, MapPin, ArrowUpRight, Sparkles, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";
import { MotionBackground } from "@/components/MotionBackground";
import { EnvelopeIntro } from "@/components/EnvelopeIntro";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Charles Osam's Birthday Party — RSVP" },
      { name: "description", content: "An elegant evening at Casa 1715. RSVP by May 12, 2026." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("envelope-intro-seen");
    if (!seen) setShowIntro(true);
  }, []);

  const handleIntroComplete = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("envelope-intro-seen", "1");
    }
  };

  return (
    <>
      {showIntro && <EnvelopeIntro onComplete={handleIntroComplete} />}
      <div className="min-h-screen text-foreground relative overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.08 0 0) 0%, oklch(0.22 0 0) 50%, oklch(0.05 0 0) 100%)" }}>
      {/* Ambient backdrop */}
      <div className="absolute inset-0 bg-spot pointer-events-none" />
      <MotionBackground />
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      {/* Nav */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold text-sm">CO</div>
          <span className="font-medium tracking-tight">Charles Osam</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#event" className="hover:text-foreground transition">Event</a>
          <a href="#details" className="hover:text-foreground transition">Details</a>
          <Link to="/admin" className="hover:text-foreground transition">Admin</Link>
        </nav>
        <Link to="/rsvp">
          <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-5">
            RSVP <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </header>

      {/* Hero — split */}
      <section id="event" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-12 lg:pt-20 pb-24 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 animate-fade-up">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold mb-8">
            <Sparkles className="w-3.5 h-3.5" /> Private Invitation · 2026
          </div>
          <h1 className="text-display text-[clamp(3rem,8vw,7.5rem)] mb-6">
            CHARLES <br />
            OSAM'S<span className="text-gold">.</span>
            <br />
            <span className="font-display italic font-normal text-gradient-gold tracking-normal">birthday</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-md mb-10 leading-relaxed">
            An elegant evening of celebration. Join us for a night to remember at Casa 1715.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-10 text-sm">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface ring-border">
              <Calendar className="w-3.5 h-3.5 text-gold" /> Saturday, May 16
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface ring-border">
              <Clock className="w-3.5 h-3.5 text-gold" /> 8:00 PM
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface ring-border">
              <MapPin className="w-3.5 h-3.5 text-gold" /> Casa 1715
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link to="/rsvp">
              <Button size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold rounded-full h-12 px-8 font-medium">
                RSVP Now <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <a href="#details" className="text-sm text-muted-foreground hover:text-foreground transition inline-flex items-center gap-1">
              View details
            </a>
          </div>
        </div>

        {/* Right card */}
        <div className="lg:col-span-5 animate-fade-up delay-200">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-gold opacity-20 blur-3xl rounded-full" />
            <div className="relative glass rounded-3xl p-3 shadow-elegant">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
                <img src={heroImg} alt="Charles Osam birthday" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Hosted by</p>
                      <p className="font-display text-xl">Lady Julia Konadu Osam</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gold/20 backdrop-blur flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-gold" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 p-3">
                <div className="rounded-xl bg-surface-elevated p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Day</p>
                  <p className="font-display text-lg mt-1">16</p>
                </div>
                <div className="rounded-xl bg-surface-elevated p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Month</p>
                  <p className="font-display text-lg mt-1">May</p>
                </div>
                <div className="rounded-xl bg-surface-elevated p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Time</p>
                  <p className="font-display text-lg mt-1">8 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details strip */}
      <section id="details" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: "Date", value: "Saturday, May 16" },
            { icon: Clock, label: "Time", value: "8:00 PM onwards" },
            { icon: MapPin, label: "Venue", value: "Casa 1715" },
            { icon: Phone, label: "Contact", value: "0539 456 478" },
          ].map((item, i) => (
            <div key={item.label} className="group rounded-2xl bg-surface ring-border p-5 hover:bg-surface-elevated transition-all animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between mb-6">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-gold" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-gold group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{item.label}</p>
              <p className="font-medium">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="mt-10 rounded-3xl overflow-hidden ring-border bg-surface">
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-gold mb-3">Location</p>
                <h3 className="font-display text-2xl md:text-3xl mb-3">Casa 1715</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Find us on the map. Parking is available on-site. Arrive a few minutes early to settle in.
                </p>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Casa+1715+Accra"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gold hover:text-foreground transition w-fit"
              >
                Open in Google Maps <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
            <div className="md:col-span-3 min-h-[280px] md:min-h-[360px]">
              <iframe
                title="Casa 1715 location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-0.2200%2C5.5600%2C-0.1400%2C5.6300&layer=mapnik&marker=5.5950,-0.1800"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-gradient-surface ring-border p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold mb-3">RSVP by May 12, 2026</p>
            <h2 className="font-display text-3xl md:text-4xl mb-2">Ready to celebrate?</h2>
            <p className="text-sm text-muted-foreground">Invite admits 1 only. Confirm your attendance now.</p>
          </div>
          <Link to="/rsvp">
            <Button size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold rounded-full h-12 px-8 font-medium">
              Confirm Attendance <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        © 2026 Charles Osam · <Link to="/admin" className="hover:text-gold transition">Admin</Link>
      </footer>
    </div>
  );
}
