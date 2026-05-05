import { createFileRoute, useNavigate, useLocation, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Lock, ArrowLeft, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password" }, { name: "robots", content: "noindex" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Supabase puts recovery tokens in URL hash, parses on load,
    // and emits a PASSWORD_RECOVERY event.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && location.hash.includes("type=recovery"))) {
        setHasRecoverySession(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && location.hash.includes("type=recovery")) setHasRecoverySession(true);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [location.hash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (password.length < 6) { setErrorMsg("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setErrorMsg("Passwords do not match."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success("Password updated. You can sign in now.");
      await supabase.auth.signOut();
      setTimeout(() => navigate({ to: "/admin" }), 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      setErrorMsg(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Toaster position="top-center" theme="dark" />
      <div className="absolute inset-0 bg-spot pointer-events-none" />

      <header className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-gold mb-4 shadow-gold">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl">Choose a new password</h1>
            <p className="text-sm text-muted-foreground mt-2">Set a new password for your admin account.</p>
          </div>

          <div className="rounded-3xl bg-gradient-surface ring-border p-7 space-y-5 shadow-card animate-fade-up delay-100">
            {!ready ? (
              <p className="text-sm text-muted-foreground text-center">Loading…</p>
            ) : !hasRecoverySession ? (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="leading-relaxed">
                  This reset link is invalid or has expired. Please request a new password reset email from the sign-in page.
                </span>
              </div>
            ) : success ? (
              <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
                <span className="leading-relaxed">Password updated. Redirecting to sign in…</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                  <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{errorMsg}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">New password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pl-10 h-11 bg-surface-elevated border-border/60 rounded-xl focus-visible:ring-gold/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-xs uppercase tracking-widest text-muted-foreground">Confirm password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} className="pl-10 h-11 bg-surface-elevated border-border/60 rounded-xl focus-visible:ring-gold/50" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold h-11 rounded-xl font-medium">
                  {loading ? "Updating…" : "Update password"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
