import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock, MapPin, ArrowUpRight, Phone, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EnvelopeIntro } from "@/components/EnvelopeIntro";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Charles Osam's Birthday — RSVP" },
      { name: "description", content: "An elegant evening at Casa 1715. RSVP by May 12, 2026." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen text-foreground" style={{ background: "radial-gradient(ellipse at top, oklch(0.22 0.01 260) 0%, oklch(0.13 0.003 60) 60%, oklch(0.10 0.003 60) 100%)" }}>
      <EnvelopeIntro />
      {/* Nav */}
      <header className="max-w-6xl mx-auto px-6 lg:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gradient-silver text-ink font-display font-bold text-sm flex items-center justify-center shadow-silver">co</div>
          <span className="text-xs uppercase tracking-mono text-silver-muted">Charles Osam</span>
        </div>
        <nav className="flex items-center gap-4 md:gap-8 text-[10px] md:text-xs uppercase tracking-mono text-muted-foreground">
          <a href="#event" className="hover:text-foreground transition">Event</a>
          <a href="#details" className="hover:text-foreground transition">Details</a>
          <Link to="/admin" className="hover:text-foreground transition">Sign In</Link>
        </nav>
        <Link to="/rsvp">
          <Button size="sm" className="bg-ink text-card-foreground hover:bg-ink/90 rounded-md px-5 text-xs uppercase tracking-mono">
            RSVP
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section id="event" className="max-w-6xl mx-auto px-6 lg:px-10 pt-10 lg:pt-16 pb-20 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 animate-fade-up">
          <p className="text-xs uppercase tracking-mono text-silver-muted mb-6">Private Invitation · 2026</p>
          <h1 className="text-[clamp(3.5rem,9vw,7rem)] leading-[0.95] mb-6 italic text-gradient-silver" style={{ fontFamily: "'Great Vibes', cursive", fontWeight: 400 }}>
            Charles Osam<span className="text-silver">.</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-md mb-10 leading-relaxed">
            An elegant evening of celebration. Join us for a night to remember at Casa 1715.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/rsvp">
              <Button size="lg" className="bg-ink text-card-foreground hover:bg-ink/90 rounded-md h-12 px-8 text-xs uppercase tracking-mono">
                RSVP Now <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#details" className="text-xs uppercase tracking-mono text-muted-foreground hover:text-foreground transition">
              View details
            </a>
          </div>
        </div>

        {/* Business cards */}
        <div className="lg:col-span-6 relative animate-fade-up delay-200">
          <div className="relative aspect-square max-w-[520px] mx-auto">
            {/* Back card */}
            <div
              className="absolute right-0 top-0 w-[68%] aspect-square rounded-[28px] bg-ink text-card-foreground p-8 shadow-card ring-silver animate-float-tilt"
              style={{ ['--tilt' as any]: '6deg', transform: 'rotate(6deg)' }}
            >
              <div className="h-full flex flex-col items-end text-right">
                <p className="font-display text-xl tracking-wide text-gradient-silver">CHARLES OSAM</p>
                <p className="text-[10px] uppercase tracking-mono text-silver-muted mt-1">Birthday Soirée</p>
                <div className="mt-6 text-[11px] leading-relaxed text-silver/90 space-y-0.5">
                  <p>+233 539 456 478</p>
                  <p>casa1715.events</p>
                  <p>@charles.osam</p>
                </div>
                <p className="mt-auto text-[11px] text-silver-muted">Casa 1715 · Accra</p>
                <div className="mt-3 grid grid-cols-5 grid-rows-5 gap-[3px] w-20 h-20">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-silver rounded-[1px]"
                      style={{ opacity: ((i * 13 + 7) % 5) > 1 ? 0.9 : 0 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Front card */}
            <div
              className="absolute left-0 bottom-0 w-[72%] aspect-square rounded-[28px] bg-ink text-card-foreground p-8 shadow-card ring-silver animate-float-tilt"
              style={{ ['--tilt' as any]: '-7deg', transform: 'rotate(-7deg)', animationDelay: '1.2s' }}
            >
              <div className="h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                  <span className="font-display text-[9rem] leading-none -tracking-[0.04em] text-gradient-silver">co</span>
                </div>
                <div>
                  <p className="font-display text-base tracking-wide">CHARLES OSAM</p>
                  <p className="text-[10px] uppercase tracking-mono text-card-foreground/70 mt-1">Sat · May 16 · 8 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section id="details" className="max-w-6xl mx-auto px-6 lg:px-10 pb-20">
        <DetailsStrip />

        {/* Location card */}
        <div className="mt-8 rounded-2xl bg-ink text-card-foreground overflow-hidden shadow-soft">
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-between gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-mono text-card-foreground/60 mb-3">Location</p>
                <h3 className="font-display text-3xl mb-3">Casa 1715</h3>
                <p className="text-sm text-card-foreground/70 leading-relaxed">
                  Find us on the map. Parking is available on-site. Arrive a few minutes early to settle in.
                </p>
              </div>
              <p className="text-[10px] uppercase tracking-mono text-card-foreground/50">Accra · Ghana</p>
            </div>
            <div className="md:col-span-3 min-h-[280px] md:min-h-[340px] relative bg-card-foreground/5">
              <div className="absolute inset-0 [background-image:linear-gradient(var(--color-card-foreground)/0.08_1px,transparent_1px),linear-gradient(90deg,var(--color-card-foreground)/0.08_1px,transparent_1px)] [background-size:32px_32px]" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-card-foreground text-ink flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="rounded-md bg-card-foreground text-ink px-4 py-2">
                  <p className="font-display text-base">Casa 1715</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-2xl bg-ink text-card-foreground p-8 md:p-12 flex flex-col items-center text-center gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-mono text-card-foreground/60 mb-3">RSVP by May 12, 2026</p>
            <h2 className="font-display text-3xl md:text-4xl mb-2">Ready to celebrate?</h2>
            <p className="text-sm text-card-foreground/70">Invite admits 1 only. Confirm your attendance now.</p>
          </div>
          <Link to="/rsvp">
            <Button size="lg" className="bg-card-foreground text-ink hover:bg-card-foreground/90 rounded-md h-12 px-8 text-xs uppercase tracking-mono">
              Confirm Attendance <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-[10px] uppercase tracking-mono text-muted-foreground">
        © 2026 Charles Osam · <Link to="/admin" className="hover:text-foreground transition">Sign In</Link>
      </footer>
    </div>
  );
}

function DetailsStrip() {
  const phoneDisplay = "0539 456 478";
  const phoneRaw = "+233539456478";
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(phoneRaw);
      setCopied(true);
      toast.success("Phone number copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Try again.");
    }
  };

  const items = [
    { icon: Calendar, label: "Date", value: "Saturday, May 16", href: undefined as string | undefined },
    { icon: Clock, label: "Time", value: "8:00 PM onwards", href: undefined as string | undefined },
    { icon: Phone, label: "Contact", value: phoneDisplay, href: `tel:${phoneRaw}` },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {items.map((item, i) => {
        const isContact = item.label === "Contact";
        const Wrapper: any = item.href ? "a" : "div";
        const wrapperProps = item.href ? { href: item.href } : {};
        return (
          <Wrapper
            key={item.label}
            {...wrapperProps}
            className="group relative block rounded-2xl bg-ink text-card-foreground p-6 shadow-soft hover:bg-ink/90 transition-all animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <ArrowUpRight className="absolute top-5 right-5 w-4 h-4 text-card-foreground/60 group-hover:text-card-foreground transition" />
            <div className="flex items-center gap-5">
              <div className="shrink-0 w-12 h-12 rounded-lg bg-card-foreground/10 text-card-foreground flex items-center justify-center">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-mono text-card-foreground/50 mb-1.5">{item.label}</p>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-xl truncate">{item.value}</p>
                  {isContact && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      aria-label="Copy phone number"
                      className="relative z-10 inline-flex items-center gap-1.5 rounded-md bg-card-foreground/10 text-card-foreground hover:bg-card-foreground/20 text-[10px] uppercase tracking-mono px-3 py-1.5 transition"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
}
