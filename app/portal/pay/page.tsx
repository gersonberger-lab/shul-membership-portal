"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

function formatMoney(amount: number) {
  return `£${amount.toFixed(2)}`;
}

export default function PortalPayPage() {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const userEmail = sessionData.session?.user?.email || null;
      setEmail(userEmail);

      if (!userEmail) {
        setLoading(false);
        return;
      }

      const { data: memberData } = await supabase
        .from("members")
        .select("*")
        .ilike("email", userEmail)
        .single();

      setMember(memberData || null);

      if (memberData) {
        const { data: ledgerData } = await supabase
          .from("ledger_entries")
          .select("debit_amount, credit_amount")
          .eq("member_id", memberData.id);

        setEntries(ledgerData || []);
      }

      setLoading(false);
    }

    load();
  }, []);

  const balance = useMemo(() => {
    return entries.reduce(
      (sum, entry) => sum + Number(entry.debit_amount || 0) - Number(entry.credit_amount || 0),
      0
    );
  }, [entries]);

  useEffect(() => {
    if (balance > 0 && !amount) {
      setAmount(balance.toFixed(2));
    }
  }, [balance, amount]);

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #eaf7f7 0%, #f7fbfc 100%)",
    color: "#12313a",
    padding: "22px",
  };

  const wrapStyle: React.CSSProperties = {
    maxWidth: 980,
    margin: "0 auto",
  };

  const cardStyle: React.CSSProperties = {
    background: "white",
    border: "1px solid #cfe5e7",
    borderRadius: 24,
    boxShadow: "0 18px 38px rgba(16, 71, 84, 0.08)",
  };

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    padding: "12px 18px",
    background: "linear-gradient(135deg, #0f8b8d, #0f6470)",
    color: "white",
    fontWeight: 900,
    border: 0,
    cursor: "pointer",
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={wrapStyle}>
          <section style={{ ...cardStyle, padding: 24 }}>Loading payment options...</section>
        </div>
      </main>
    );
  }

  if (!email) {
    return (
      <main style={pageStyle}>
        <div style={wrapStyle}>
          <section style={{ ...cardStyle, padding: 28, maxWidth: 560, margin: "80px auto" }}>
            <h1 style={{ margin: 0, fontSize: 34, letterSpacing: "-0.05em" }}>Sign in required</h1>
            <p style={{ color: "#55727a" }}>Please sign in before making a payment.</p>
            <a style={buttonStyle} href="/portal/login">Sign In</a>
          </section>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main style={pageStyle}>
        <div style={wrapStyle}>
          <section style={{ ...cardStyle, padding: 28, maxWidth: 620, margin: "80px auto" }}>
            <h1 style={{ margin: 0, fontSize: 34, letterSpacing: "-0.05em" }}>Account not linked</h1>
            <p style={{ color: "#55727a" }}>We could not find a member account matching {email}.</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={wrapStyle}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
          <a href="/portal" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 16, background: "linear-gradient(135deg, #0f8b8d, #0f6470)", color: "white", display: "grid", placeItems: "center", fontWeight: 900 }}>SP</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em" }}>Member Portal</div>
              <div style={{ color: "#55727a", fontSize: 13, fontWeight: 700 }}>Payment options</div>
            </div>
          </a>

          <a style={{ ...buttonStyle, background: "white", color: "#12313a", border: "1px solid #cfe5e7" }} href="/portal">
            Back to Statement
          </a>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 20 }}>
          <div style={{ ...cardStyle, padding: 28 }}>
            <div style={{ color: "#0f8b8d", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" }}>Make a Payment</div>
            <h1 style={{ margin: "8px 0 0", fontSize: 38, lineHeight: 1.05, letterSpacing: "-0.06em" }}>
              Choose how you would like to pay
            </h1>
            <p style={{ color: "#55727a", marginTop: 14 }}>
              Payments are processed securely by the selected provider. Your shul account will be updated after payment confirmation.
            </p>

            <div style={{ marginTop: 22 }}>
              <label style={{ display: "block", fontWeight: 900, marginBottom: 8 }}>Payment amount</label>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                step="0.01"
                min="0.01"
                style={{ width: "100%", maxWidth: 260, padding: "14px 16px", borderRadius: 14, border: "1px solid #cfe5e7", fontSize: 16 }}
              />
            </div>
          </div>

          <aside style={{ ...cardStyle, padding: 24 }}>
            <div style={{ color: "#55727a", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".06em" }}>Current Balance</div>
            <strong style={{ display: "block", marginTop: 8, fontSize: 42, color: "#0f6470", lineHeight: 1, letterSpacing: "-0.06em" }}>
              {formatMoney(balance)}
            </strong>
            <p style={{ color: "#55727a" }}>
              Paying as {member.english_first_name} {member.english_surname}
            </p>
          </aside>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <div style={{ ...cardStyle, padding: 22 }}>
            <h2 style={{ margin: 0 }}>Card Payment</h2>
            <p style={{ color: "#55727a" }}>Pay securely by debit or credit card.</p>
            <button style={buttonStyle} type="button" onClick={() => alert("Stripe integration will be connected next.")}>Pay by Card</button>
          </div>

          <div style={{ ...cardStyle, padding: 22 }}>
            <h2 style={{ margin: 0 }}>AAC</h2>
            <p style={{ color: "#55727a" }}>Continue to AAC to make your payment.</p>
            <button style={buttonStyle} type="button" onClick={() => alert("AAC payment link will be connected next.")}>Pay with AAC</button>
          </div>

          <div style={{ ...cardStyle, padding: 22 }}>
            <h2 style={{ margin: 0 }}>Tevini</h2>
            <p style={{ color: "#55727a" }}>Continue to Tevini to make your payment.</p>
            <button style={buttonStyle} type="button" onClick={() => alert("Tevini payment link will be connected next.")}>Pay with Tevini</button>
          </div>
        </section>
      </div>
    </main>
  );
}
