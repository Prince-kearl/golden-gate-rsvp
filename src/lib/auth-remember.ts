import { supabase } from "@/integrations/supabase/client";

const REMEMBER_KEY = "co_auth_remember";
const ALIVE_KEY = "co_auth_alive";

export function markRemember(remember: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMEMBER_KEY, remember ? "true" : "false");
  sessionStorage.setItem(ALIVE_KEY, "1");
}

/** If user opted out of "Remember me" and the browser was fully closed
 *  (sessionStorage cleared), sign them out. Call on app/admin route mount. */
export async function enforceRememberPolicy(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const remember = localStorage.getItem(REMEMBER_KEY);
  const alive = sessionStorage.getItem(ALIVE_KEY);
  if (remember === "false" && !alive) {
    await supabase.auth.signOut();
    localStorage.removeItem(REMEMBER_KEY);
    return true;
  }
  if (alive === null) sessionStorage.setItem(ALIVE_KEY, "1");
  return false;
}

export function clearRemember() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem(ALIVE_KEY);
}
