"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Mode = "admin" | "member";

export default function AuthGate({
  mode,
  children,
}: {
  mode: Mode;
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAccess() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        window.location.href = mode === "admin" ? "/admin/login" : "/portal/login";
        return;
      }

      if (mode === "admin") {
        const { data, error } = await supabase
          .from("app_users")
          .select("role, active")
          .eq("auth_user_id", session.user.id)
          .eq("role", "admin")
          .eq("active", true)
          .maybeSingle();

        if (error || !data) {
          setMessage("You do not have admin access.");
          setStatus("blocked");
          return;
        }
      }

      if (mode === "member") {
        const { data, error } = await supabase
          .from("members")
          .select("id")
          .eq("auth_user_id", session.user.id)
          .maybeSingle();

        if (error || !data) {
          setMessage("Your login is not linked to a member account yet.");
          setStatus("blocked");
          return;
        }
      }

      setStatus("allowed");
    }

    checkAccess();
  }, [mode]);

  if (status === "checking") {
    return (
      <div className="auth-screen">
        <div className="auth-card">Checking access...</div>
      </div>
    );
  }

  if (status === "blocked") {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1>Access blocked</h1>
          <p>{message}</p>
          <button type="button" onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/"))}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
