import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Lock, ArrowLeft, Mail, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { markRemember, enforceRememberPolicy } from "@/lib/auth-remember";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Login" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot password dialog
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

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
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin");
    if (error) return false;
    return !!data && data.length > 0;
  };

  useEffect(() => {
    let signedOut = false;
    enforceRememberPolicy().then((didSignOut) => { signedOut = didSignOut; });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session && !signedOut) navigate({ to: "/admin/dashboard" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !signedOut) navigate({ to: "/admin/dashboard" });
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
        markRemember(remember);
        navigate({ to: "/admin/dashboard" });
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Authentication failed";
      const friendly = friendlyError(raw);
      setErrorMsg(friendly);
      toast.error(friendly);
    } finally { setLoading(false); }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    const target = (resetEmail || email).trim();
    if (!target) { setResetError("Enter your email address."); return; }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(target, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
      toast.success("Password reset email sent");
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Failed to send reset email";
      const friendly = friendlyError(raw);
      setResetError(friendly);
      toast.error(friendly);
    } finally { setResetLoading(false); }
  };

  const openReset = () => {
    setResetEmail(email);
    setResetSent(false);
    setResetError(null);
    setResetOpen(true);
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
            {errorMsg && (
              <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-up">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 h-11 bg-surface-elevated border-border/60 rounded-xl focus-visible:ring-gold/50" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
                {mode === "signin" && (
                  <button type="button" onClick={openReset} className="text-xs text-gold hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pl-10 h-11 bg-surface-elevated border-border/60 rounded-xl focus-visible:ring-gold/50" />
              </div>
            </div>

            {mode === "signin" && (
              <div className="flex items-center gap-2.5 pt-1">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                  className="data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-primary-foreground"
                />
                <Label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
                  Remember me on this device
                </Label>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold h-11 rounded-xl font-medium">
              {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
            <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErrorMsg(null); }} className="block w-full text-center text-xs text-muted-foreground hover:text-gold transition-colors">
              {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
          </form>
        </div>
      </main>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="bg-gradient-surface ring-border rounded-3xl border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Reset your password</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {resetSent
                ? "Check your inbox for a reset link. It may take a minute to arrive."
                : "Enter the email associated with your admin account and we'll send a reset link."}
            </DialogDescription>
          </DialogHeader>

          {resetSent ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
                <span className="leading-relaxed">Reset email sent to <strong>{(resetEmail || email).trim()}</strong>.</span>
              </div>
              <DialogFooter>
                <Button onClick={() => setResetOpen(false)} className="bg-gradient-gold text-primary-foreground hover:opacity-90 rounded-xl">Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              {resetError && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{resetError}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="pl-10 h-11 bg-surface-elevated border-border/60 rounded-xl focus-visible:ring-gold/50"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button type="button" variant="outline" onClick={() => setResetOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={resetLoading} className="bg-gradient-gold text-primary-foreground hover:opacity-90 rounded-xl">
                  {resetLoading ? "Sending…" : "Send reset link"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
