"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signup, setSignup] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const result = signup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    window.location.href = "/";
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Admin</span>
        <h1>{signup ? "Create Admin Account" : "Sign In"}</h1>

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
          {loading ? "Please wait..." : signup ? "Create Account" : "Sign In"}
        </button>

        <button
          type="button"
          className="button secondary"
          onClick={() => setSignup(!signup)}
        >
          {signup ? "Already have an account?" : "Create first admin account"}
        </button>
      </form>
    </div>
  );
}
