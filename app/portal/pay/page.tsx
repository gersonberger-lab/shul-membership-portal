"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

function formatMoney(amount: number) {
  return `£${amount.toFixed(2)}`;
}

const defaultBankDetails = {
  accountName: "",
  bankName: "",
  sortCode: "",
  accountNumber: "",
  referenceText: "נא לציין את שמכם כאסמכתא לתשלום.",
  note: "תשלומים בהעברה בנקאית יעודכנו בחשבון לאחר התאמה במשרד.",
};

export default function PortalPayPage() {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [bankDetails, setBankDetails] = useState(defaultBankDetails);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 760);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function load() {
      const { data: settingsData } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "bank_details")
        .maybeSingle();

      if (settingsData?.value) {
        setBankDetails({ ...defaultBankDetails, ...(settingsData.value as any) });
      }

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
    return entries.reduce((sum, entry) => sum + Number(entry.debit_amount || 0) - Number(entry.credit_amount || 0), 0);
  }, [entries]);

  useEffect(() => {
    if (balance > 0 && !amount) {
      setAmount(balance.toFixed(2));
    }
  }, [balance, amount]);

  async function payByCard() {
    const paymentAmount = Number(amount || 0);

    if (!paymentAmount || paymentAmount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setRedirecting(true);

    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: paymentAmount,
        memberId: member?.id || "",
        memberName: member ? `${member.hebrew_first_name || ""} ${member.hebrew_surname || ""}`.trim() : "Member",
        memberEmail: email || "",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      setRedirecting(false);
      alert(data.error || "Could not start card payment.");
      return;
    }

    window.location.href = data.url;
  }

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f4f8fb",
    color: "#172033",
    padding: isMobile ? "14px" : "24px",
  };

  const wrapStyle: React.CSSProperties = { maxWidth: 980, margin: "0 auto" };
  const cardStyle: React.CSSProperties = {
    background: "white",
    border: "1px solid #d9e4ec",
    borderRadius: isMobile ? 14 : 18,
    boxShadow: "0 10px 26px rgba(15, 47, 70, 0.06)",
  };
  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    padding: isMobile ? "10px 12px" : "11px 16px",
    background: "#2563eb",
    color: "white",
    fontWeight: 800,
    border: 0,
    cursor: "pointer",
    width: isMobile ? "100%" : undefined,
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={wrapStyle}>
          <section style={{ ...cardStyle, padding: 22 }}>Loading payment options...</section>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={wrapStyle}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 12, marginBottom: 16, flexDirection: isMobile ? "column" : "row" }}>
          <a href="/portal" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#2563eb", color: "white", display: "grid", placeItems: "center", fontWeight: 900 }}>SP</div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 900 }}>Member Portal</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>Payment options</div>
            </div>
          </a>

          <a style={{ ...buttonStyle, background: "white", color: "#172033", border: "1px solid #d9e4ec" }} href="/portal">
            Back to Statement
          </a>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 300px", gap: 14, marginBottom: 16 }}>
          <div style={{ ...cardStyle, padding: isMobile ? 18 : 26 }}>
            <div style={{ color: "#2563eb", fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>Pay Your Charges</div>
            <h1 style={{ margin: "6px 0 0", fontSize: isMobile ? 28 : 38, lineHeight: 1.08 }}>
              Choose how to pay
            </h1>
            <p style={{ color: "#64748b", marginTop: 10 }}>
              Pay online by card, or use the bank transfer details below.
            </p>

            <div style={{ marginTop: 18 }}>
              <label style={{ display: "block", fontWeight: 800, marginBottom: 8 }}>Payment amount</label>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                step="0.01"
                min="0.01"
                style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: "1px solid #d9e4ec", fontSize: 16 }}
              />
            </div>
          </div>

          <aside style={{ ...cardStyle, padding: isMobile ? 18 : 22 }}>
            <div style={{ color: "#64748b", fontSize: 12, fontWeight: 900, textTransform: "uppercase" }}>Current Balance</div>
            <strong style={{ display: "block", marginTop: 6, fontSize: isMobile ? 30 : 38, color: "#1d4ed8" }}>
              {formatMoney(balance)}
            </strong>
            {member && (
              <p style={{ color: "#64748b" }} dir="rtl">
                משלם: {member.hebrew_first_name} {member.hebrew_surname}
              </p>
            )}
          </aside>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
          <div style={{ ...cardStyle, padding: 20 }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>Pay by Card</h2>
            <p style={{ color: "#64748b" }}>Pay securely by debit or credit card using Stripe.</p>
            <button style={buttonStyle} type="button" onClick={payByCard} disabled={redirecting}>
              {redirecting ? "Opening Stripe..." : "Pay by Card"}
            </button>
          </div>

          <div style={{ ...cardStyle, padding: 20 }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>Bank Transfer</h2>
            <p style={{ color: "#64748b" }}>Use these details if you prefer to pay by bank transfer.</p>
            <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
              <div><strong>Account name:</strong> {bankDetails.accountName || "Not set"}</div>
              <div><strong>Bank:</strong> {bankDetails.bankName || "Not set"}</div>
              <div><strong>Sort code:</strong> {bankDetails.sortCode || "Not set"}</div>
              <div><strong>Account number:</strong> {bankDetails.accountNumber || "Not set"}</div>
              <div dir="rtl"><strong>אסמכתא:</strong> {bankDetails.referenceText}</div>
            </div>
            <p style={{ color: "#64748b", marginTop: 14 }} dir="rtl">
              {bankDetails.note}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
