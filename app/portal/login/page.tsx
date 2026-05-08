"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function MemberPortalLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const sendLoginLink = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    setSending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/portal`,
      },
    });

    setSending(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSent(true);
  };

  return (
    <>
      <section className="hero compact-hero">
        <span className="eyebrow">Member Portal</span>
        <h1>Sign in to your account</h1>
        <p>Enter your email address and we’ll send you a secure login link.</p>
      </section>

      <section className="card form-card">
        {!sent ? (
          <form className="form-grid" onSubmit={sendLoginLink}>
            <div className="form-field full">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-field full">
              <button type="submit" disabled={sending}>
                {sending ? "Sending..." : "Send secure login link"}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h3 className="section-title">Check your email</h3>
            <p className="muted">
              A secure login link has been sent to {email}. Open the link from the same device to access your member account.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
