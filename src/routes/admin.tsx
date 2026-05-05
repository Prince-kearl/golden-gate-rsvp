import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowLeft, Mail, KeyRound, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Login" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const friendlyError = (raw: string): string => {
    const m = raw.toLowerCase();
    if (m.includes("invalid login credentials")) return "Incorrect email or password. Please double-check and try again.";
    if (m.includes("email not confirmed")) return "Please confirm your email address before signing in.";
    if (m.includes("user already registered")) return "An account with this email already exists. Try signing in instead.";
    if (m.includes("password should be") || m.includes("weak password")) return "Password is too weak. Use at least 6 characters.";
    if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a moment and try again.";
    if (m.includes("network") || m.includes("fetch")) return "Network error. Check your connection and try again.";
    return raw;
  };

  const checkAdminAccess = async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin");
    if (error) return false;
    return !!data && data.length > 0;
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/admin/dashboard" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin/dashboard" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin/dashboard` },
        });
        if (error) throw error;
        toast.success("Account created. Ask the system owner to grant admin access.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.session) throw new Error("Sign in failed. Please try again.");

        const isAdmin = await checkAdminAccess(data.session.user.id);
        if (!isAdmin) {
          await supabase.auth.signOut();
          setErrorMsg("This account doesn't have admin access. Please contact the event owner to be granted permission.");
          toast.error("Admin access required");
          return;
        }
        navigate({ to: "/admin/dashboard" });
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Authentication failed";
      const friendly = friendlyError(raw);
      setErrorMsg(friendly);
      toast.error(friendly);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Toaster position="top-center" theme="dark" />
      <div className="absolute inset-0 bg-spot pointer-events-none" />

      <header className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-gold mb-4 shadow-gold">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-2">Charles Osam's Birthday RSVP</p>
          </div>
          <form onSubmit={handleSubmit} className="rounded-3xl bg-gradient-surface ring-border p-7 space-y-5 shadow-card animate-fade-up delay-100">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 h-11 bg-surface-elevated border-border/60 rounded-xl focus-visible:ring-gold/50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pl-10 h-11 bg-surface-elevated border-border/60 rounded-xl focus-visible:ring-gold/50" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold h-11 rounded-xl font-medium">
              {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
            <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="block w-full text-center text-xs text-muted-foreground hover:text-gold transition-colors">
              {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
