import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Search, Download, LogOut, Users, Check, X, HelpCircle, ShieldAlert,
  LayoutDashboard, UsersRound, FileDown, Sparkles, ArrowUpRight, ShieldCheck, Trash2, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

type Rsvp = {
  id: string;
  name: string;
  phone: string;
  attendance: string;
  message: string | null;
  checked_in: boolean;
  created_at: string;
};

type View = "overview" | "guests" | "admins";

type AdminRow = { id: string; user_id: string; email: string };

function Dashboard() {
  const navigate = useNavigate();
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "yes" | "no" | "maybe">("all");
  const [view, setView] = useState<View>("overview");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { navigate({ to: "/admin" }); return; }
      setUserEmail(sessionData.session.user.email || "");
      const { data: roleRows } = await supabase.from("user_roles").select("role")
        .eq("user_id", sessionData.session.user.id).eq("role", "admin");
      const admin = !!roleRows && roleRows.length > 0;
      if (!mounted) return;
      setIsAdmin(admin);
      if (!admin) { setLoading(false); return; }

      const { data, error } = await supabase.from("rsvps").select("*").order("created_at", { ascending: false });
      if (error) toast.error(error.message); else setRsvps(data || []);
      setLoading(false);
    };
    init();

    const channel = supabase.channel("rsvps-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, (payload) => {
        setRsvps((prev) => {
          if (payload.eventType === "INSERT") return [payload.new as Rsvp, ...prev];
          if (payload.eventType === "UPDATE") return prev.map((r) => (r.id === (payload.new as Rsvp).id ? (payload.new as Rsvp) : r));
          if (payload.eventType === "DELETE") return prev.filter((r) => r.id !== (payload.old as Rsvp).id);
          return prev;
        });
      }).subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, [navigate]);

  const filtered = useMemo(() => {
    let r = rsvps;
    if (filter !== "all") r = r.filter((x) => x.attendance === filter);
    if (search.trim()) {
      const s = search.toLowerCase();
      r = r.filter((x) => x.name.toLowerCase().includes(s) || x.phone.includes(s));
    }
    return r;
  }, [rsvps, filter, search]);

  const stats = useMemo(() => ({
    total: rsvps.length,
    yes: rsvps.filter((r) => r.attendance === "yes").length,
    no: rsvps.filter((r) => r.attendance === "no").length,
    maybe: rsvps.filter((r) => r.attendance === "maybe").length,
    checkedIn: rsvps.filter((r) => r.checked_in).length,
  }), [rsvps]);

  const toggleCheckIn = async (id: string, checked: boolean) => {
    const { error } = await supabase.from("rsvps").update({ checked_in: checked }).eq("id", id);
    if (error) toast.error(error.message);
  };

  const exportCsv = () => {
    const headers = ["Name", "Phone", "Attendance", "Message", "Checked In", "Submitted"];
    const rows = filtered.map((r) => [r.name, r.phone, r.attendance, r.message || "", r.checked_in ? "Yes" : "No", new Date(r.created_at).toLocaleString()]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `rsvps-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Export ready");
  };

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/admin" }); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground bg-background">
      <div className="animate-pulse">Loading dashboard...</div>
    </div>
  );

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="max-w-md text-center bg-gradient-surface ring-border rounded-3xl p-10 shadow-card">
          <ShieldAlert className="w-12 h-12 text-gold mx-auto mb-4" />
          <h1 className="font-display text-2xl mb-2">Access Restricted</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your account doesn't have admin access yet. Ask the project owner to grant you the <code className="text-gold">admin</code> role.
          </p>
          <Button onClick={signOut} variant="outline" className="rounded-full">Sign out</Button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { id: "guests" as const, label: "Guests", icon: UsersRound },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Toaster position="top-center" theme="dark" />
      <div className="absolute inset-0 bg-spot pointer-events-none" />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 border-r border-border/50 flex-col p-5 bg-surface/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-10 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold text-sm">CO</div>
            <div>
              <p className="text-sm font-medium tracking-tight">Charles Osam</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  view === item.id
                    ? "bg-gold/10 text-gold ring-1 ring-gold/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <button
              onClick={exportCsv}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
            >
              <FileDown className="w-4 h-4" /> Export CSV
            </button>
          </nav>

          <div className="rounded-2xl bg-gradient-surface ring-border p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <p className="text-xs font-medium">Live Updates</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Dashboard reflects new RSVPs in real time.</p>
          </div>

          <div className="flex items-center justify-between gap-2 px-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs truncate">{userEmail}</p>
              <p className="text-[10px] text-muted-foreground">Admin</p>
            </div>
            <button onClick={signOut} className="p-2 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground transition" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <header className="px-6 lg:px-10 py-6 flex items-center justify-between border-b border-border/50">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{view === "overview" ? "Dashboard" : "Guests"}</p>
              <h1 className="font-display text-2xl md:text-3xl">
                {view === "overview" ? "RSVP Overview" : "Guest List"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-surface ring-border text-xs">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                <span className="text-muted-foreground">Live</span>
              </div>
              <Button variant="outline" size="sm" onClick={exportCsv} className="rounded-full">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button variant="outline" size="sm" onClick={signOut} className="rounded-full lg:hidden">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </header>

          <div className="px-6 lg:px-10 py-8 space-y-8">
            {view === "overview" && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Responses", value: stats.total, icon: Users, accent: "text-foreground", bar: "bg-foreground/30" },
                    { label: "Attending", value: stats.yes, icon: Check, accent: "text-gold", bar: "bg-gold" },
                    { label: "Maybe", value: stats.maybe, icon: HelpCircle, accent: "text-lime", bar: "bg-lime" },
                    { label: "Not Attending", value: stats.no, icon: X, accent: "text-destructive", bar: "bg-destructive" },
                  ].map((s, i) => {
                    const pct = stats.total ? Math.round((Number(s.value) / stats.total) * 100) : 0;
                    return (
                      <div key={s.label} className="group rounded-2xl bg-gradient-surface ring-border p-5 hover:shadow-card transition-all animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="flex items-center justify-between mb-6">
                          <div className={`w-9 h-9 rounded-lg bg-surface-elevated flex items-center justify-center ${s.accent}`}>
                            <s.icon className="w-4 h-4" />
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition" />
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{s.label}</p>
                        <div className="flex items-baseline justify-between mb-3">
                          <p className={`text-display text-4xl ${s.accent}`}>{s.value}</p>
                          {s.label !== "Total Responses" && <p className="text-xs text-muted-foreground">{pct}%</p>}
                        </div>
                        {s.label !== "Total Responses" && (
                          <div className="h-1 rounded-full bg-surface-elevated overflow-hidden">
                            <div className={`h-full ${s.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Recent activity */}
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 rounded-2xl bg-gradient-surface ring-border p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="font-display text-xl mb-1">Recent Responses</h2>
                        <p className="text-xs text-muted-foreground">Latest 5 guests who responded</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setView("guests")} className="text-xs hover:text-gold">
                        View all <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {rsvps.slice(0, 5).map((r) => (
                        <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/50 hover:bg-surface-elevated transition">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gold/10 text-gold flex items-center justify-center text-sm font-medium shrink-0">
                              {r.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{r.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{r.phone}</p>
                            </div>
                          </div>
                          <StatusBadge status={r.attendance} />
                        </div>
                      ))}
                      {rsvps.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No responses yet.</p>}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-surface ring-border p-6">
                    <h2 className="font-display text-xl mb-1">Check-ins</h2>
                    <p className="text-xs text-muted-foreground mb-6">Guests checked in at venue</p>
                    <div className="text-center py-4">
                      <p className="text-display text-6xl text-gradient-gold mb-2">{stats.checkedIn}</p>
                      <p className="text-xs text-muted-foreground">of {stats.yes} attending</p>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-surface-elevated overflow-hidden">
                      <div className="h-full bg-gradient-gold transition-all duration-700" style={{ width: `${stats.yes ? (stats.checkedIn / stats.yes) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {view === "guests" && (
              <>
                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or phone..." className="pl-10 h-10 bg-surface border-border/60 rounded-xl" />
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    {(["all", "yes", "maybe", "no"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          filter === f
                            ? "bg-foreground text-background"
                            : "bg-surface ring-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-2xl bg-gradient-surface ring-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border/50">
                        <tr>
                          <th className="text-left px-5 py-4 font-medium">Guest</th>
                          <th className="text-left px-5 py-4 font-medium">Phone</th>
                          <th className="text-left px-5 py-4 font-medium">Status</th>
                          <th className="text-left px-5 py-4 font-medium">Message</th>
                          <th className="text-left px-5 py-4 font-medium whitespace-nowrap">Submitted</th>
                          <th className="text-left px-5 py-4 font-medium">Checked In</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.length === 0 ? (
                          <tr><td colSpan={6} className="text-center py-16 text-muted-foreground">No responses match your filters.</td></tr>
                        ) : filtered.map((r, i) => (
                          <tr key={r.id} className={`border-t border-border/30 hover:bg-surface-elevated/40 transition ${i % 2 === 0 ? "" : "bg-surface-elevated/20"}`}>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center text-xs font-medium shrink-0">
                                  {r.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium">{r.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-muted-foreground">{r.phone}</td>
                            <td className="px-5 py-4"><StatusBadge status={r.attendance} /></td>
                            <td className="px-5 py-4 text-muted-foreground max-w-xs truncate">{r.message || "—"}</td>
                            <td className="px-5 py-4 text-muted-foreground whitespace-nowrap text-xs">{new Date(r.created_at).toLocaleString()}</td>
                            <td className="px-5 py-4"><Switch checked={r.checked_in} onCheckedChange={(c) => toggleCheckIn(r.id, c)} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    yes: "bg-gold/15 text-gold ring-1 ring-gold/30",
    no: "bg-destructive/15 text-destructive ring-1 ring-destructive/30",
    maybe: "bg-lime/15 text-lime ring-1 ring-lime/30",
  };
  const label = status === "yes" ? "Attending" : status === "no" ? "Not Attending" : "Maybe";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${styles[status] || "bg-muted text-muted-foreground"}`}>
      {label}
    </span>
  );
}
