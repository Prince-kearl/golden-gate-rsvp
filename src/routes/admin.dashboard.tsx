import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search, Download, LogOut, Users, Check, X, ArrowUpDown, ShieldAlert } from "lucide-react";
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

function Dashboard() {
  const navigate = useNavigate();
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "yes" | "no" | "maybe">("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate({ to: "/admin" });
        return;
      }
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sessionData.session.user.id)
        .eq("role", "admin");
      const admin = !!roleRows && roleRows.length > 0;
      if (!mounted) return;
      setIsAdmin(admin);
      if (!admin) { setLoading(false); return; }

      const { data, error } = await supabase.from("rsvps").select("*").order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      else setRsvps(data || []);
      setLoading(false);
    };
    init();

    const channel = supabase
      .channel("rsvps-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, (payload) => {
        setRsvps((prev) => {
          if (payload.eventType === "INSERT") return [payload.new as Rsvp, ...prev];
          if (payload.eventType === "UPDATE") return prev.map((r) => (r.id === (payload.new as Rsvp).id ? (payload.new as Rsvp) : r));
          if (payload.eventType === "DELETE") return prev.filter((r) => r.id !== (payload.old as Rsvp).id);
          return prev;
        });
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, [navigate]);

  const filtered = useMemo(() => {
    let r = rsvps;
    if (filter !== "all") r = r.filter((x) => x.attendance === filter);
    if (search.trim()) {
      const s = search.toLowerCase();
      r = r.filter((x) => x.name.toLowerCase().includes(s) || x.phone.includes(s));
    }
    r = [...r].sort((a, b) => {
      const cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDesc ? -cmp : cmp;
    });
    return r;
  }, [rsvps, filter, search, sortDesc]);

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
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvps-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin" });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center bg-card border border-border rounded-xl p-10">
          <ShieldAlert className="w-12 h-12 text-gold mx-auto mb-4" />
          <h1 className="font-display text-2xl mb-2">Access Restricted</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your account doesn't have admin access yet. Ask the project owner to grant you the <code className="text-gold">admin</code> role in the backend.
          </p>
          <Button onClick={signOut} variant="outline">Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" theme="dark" />
      <header className="border-b border-border/50 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-gradient-gold">RSVP Dashboard</h1>
          <p className="text-xs text-muted-foreground">Charles Osam's Birthday Party</p>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}><LogOut className="w-4 h-4 mr-2" />Sign out</Button>
      </header>

      <main className="px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Responses", value: stats.total, icon: Users },
            { label: "Attending", value: stats.yes, icon: Check },
            { label: "Not Attending", value: stats.no, icon: X },
            { label: "Checked In", value: stats.checkedIn, icon: Check },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <s.icon className="w-4 h-4 text-gold" />
              </div>
              <p className="font-display text-3xl text-gradient-gold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="flex flex-1 gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or phone..." className="pl-9" />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {(["all", "yes", "maybe", "no"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className={filter === f ? "bg-gradient-gold text-primary-foreground" : ""}>
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={exportCsv}><Download className="w-4 h-4 mr-2" />Export</Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Phone</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Message</th>
                  <th className="text-left px-4 py-3 font-medium">
                    <button onClick={() => setSortDesc(!sortDesc)} className="flex items-center gap-1 hover:text-gold">
                      Submitted <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Checked In</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No responses yet.</td></tr>
                ) : filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.attendance === "yes" ? "bg-gold/20 text-gold" :
                        r.attendance === "no" ? "bg-destructive/20 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {r.attendance}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{r.message || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3"><Switch checked={r.checked_in} onCheckedChange={(c) => toggleCheckIn(r.id, c)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
