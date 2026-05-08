"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    window.location.href = "/";
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleLogin}>
        <span className="eyebrow">Admin</span>
        <h1>Sign In</h1>

        <div className="form-field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error ? <div className="auth-error">{error}</div> : null}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
