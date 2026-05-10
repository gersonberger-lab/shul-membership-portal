"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

function money(amount: number) {
  return `£${amount.toFixed(2)}`;
}

export default function MemberPortalPage() {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 760);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email || null;
      setSessionEmail(email);

      if (!email) {
        setLoading(false);
        return;
      }

      const { data: memberData } = await supabase
        .from("members")
        .select("*")
        .ilike("email", email)
        .single();

      setMember(memberData || null);

      if (memberData) {
        const { data: ledgerData } = await supabase
          .from("ledger_entries")
          .select("*")
          .eq("member_id", memberData.id)
          .order("entry_date", { ascending: false })
          .limit(100);

        setEntries(ledgerData || []);
      }

      setLoading(false);
    }

    load();
  }, []);

  const totals = useMemo(() => {
    const charges = entries.reduce((sum, entry) => sum + Number(entry.debit_amount || 0), 0);
    const payments = entries.reduce((sum, entry) => sum + Number(entry.credit_amount || 0), 0);
    return { charges, payments, balance: charges - payments };
  }, [entries]);

  const page: React.CSSProperties = { minHeight: "100vh", background: "#f4f8fb", padding: isMobile ? "14px" : "24px", color: "#172033" };
  const wrap: React.CSSProperties = { maxWidth: 1080, margin: "0 auto" };
  const panel: React.CSSProperties = { background: "white", border: "1px solid #d9e4ec", borderRadius: isMobile ? 14 : 18, boxShadow: "0 10px 26px rgba(15, 47, 70, 0.06)" };
  const primary: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "10px 12px" : "11px 16px", borderRadius: 10, background: "#2563eb", color: "white", fontWeight: 800, width: isMobile ? "100%" : undefined };

  if (loading) {
    return <main style={page}><div style={wrap}><section style={{ ...panel, padding: 22 }}>Loading your account...</section></div></main>;
  }

  if (!sessionEmail) {
    return (
      <main style={page}>
        <div style={wrap}>
          <section style={{ ...panel, padding: isMobile ? 20 : 28, maxWidth: 520, margin: isMobile ? "30px auto" : "70px auto" }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? 26 : 30 }}>Member Portal</h1>
            <p style={{ color: "#64748b" }}>Please sign in to view your statement and payments.</p>
            <a style={primary} href="/portal/login">Sign In</a>
          </section>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main style={page}>
        <div style={wrap}>
          <section style={{ ...panel, padding: isMobile ? 20 : 28, maxWidth: 620, margin: isMobile ? "30px auto" : "70px auto" }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? 26 : 30 }}>Account not linked</h1>
            <p style={{ color: "#64748b" }}>We could not find a member account matching {sessionEmail}.</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={wrap}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 12, marginBottom: 16, flexDirection: isMobile ? "column" : "row" }}>
          <a href="/portal" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#2563eb", color: "white", display: "grid", placeItems: "center", fontWeight: 900, flexShrink: 0 }}>SP</div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 900 }}>Member Portal</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>Statement and payments</div>
            </div>
          </a>
          <nav style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "auto auto", gap: 8, width: isMobile ? "100%" : undefined }}>
            <a style={{ ...primary, background: "white", color: "#172033", border: "1px solid #d9e4ec" }} href="/portal">Statement</a>
            <a style={primary} href="/portal/pay">Pay</a>
          </nav>
        </header>

        <section style={{ ...panel, padding: isMobile ? 18 : 26, marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 240px", gap: isMobile ? 14 : 20, alignItems: "start" }}>
            <div>
              <div style={{ color: "#2563eb", fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>Your Account</div>
              <h1 style={{ margin: "6px 0 0", fontSize: isMobile ? 27 : 34, lineHeight: 1.1 }}>
                {member.english_first_name} {member.english_surname}
              </h1>
              {(member.hebrew_first_name || member.hebrew_surname) && (
                <div dir="rtl" style={{ marginTop: 6, color: "#334155", fontSize: isMobile ? 22 : 26, fontWeight: 800 }}>
                  {member.hebrew_first_name} {member.hebrew_surname}
                </div>
              )}
            </div>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: 16 }}>
              <div style={{ color: "#64748b", fontSize: 12, fontWeight: 900, textTransform: "uppercase" }}>Current Balance</div>
              <strong style={{ display: "block", marginTop: 5, fontSize: isMobile ? 30 : 34, color: "#1d4ed8" }}>{money(totals.balance)}</strong>
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 14 }}>
          <div style={{ ...panel, padding: 16 }}><div style={{ color: "#64748b", fontSize: 12, fontWeight: 900 }}>TOTAL CHARGES</div><strong style={{ fontSize: 21 }}>{money(totals.charges)}</strong></div>
          <div style={{ ...panel, padding: 16 }}><div style={{ color: "#64748b", fontSize: 12, fontWeight: 900 }}>PAYMENTS</div><strong style={{ fontSize: 21 }}>{money(totals.payments)}</strong></div>
          <div style={{ ...panel, padding: 16 }}><div style={{ color: "#64748b", fontSize: 12, fontWeight: 900 }}>ENTRIES</div><strong style={{ fontSize: 21 }}>{entries.length}</strong></div>
        </section>

        <section style={{ ...panel, padding: isMobile ? 16 : 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14, flexDirection: isMobile ? "column" : "row" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22 }}>Statement</h2>
              <p style={{ color: "#64748b", margin: "4px 0 0" }}>Recent charges and payments on your account.</p>
            </div>
            <a style={primary} href="/portal/pay">Make Payment</a>
          </div>

          <div style={{ overflowX: "auto", border: "1px solid #d9e4ec", borderRadius: 12, WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", minWidth: isMobile ? 540 : 620, borderCollapse: "collapse", background: "white" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", color: "#475569", fontSize: 12, textTransform: "uppercase" }}>
                  <th style={{ textAlign: "left", padding: isMobile ? 10 : 12 }}>Date</th>
                  <th style={{ textAlign: "left", padding: isMobile ? 10 : 12 }}>Description</th>
                  <th style={{ textAlign: "right", padding: isMobile ? 10 : 12 }}>Charge</th>
                  <th style={{ textAlign: "right", padding: isMobile ? 10 : 12 }}>Payment</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                    <td style={{ padding: isMobile ? 10 : 12 }}>{entry.entry_date}</td>
                    <td style={{ padding: isMobile ? 10 : 12 }}>{entry.description}</td>
                    <td style={{ padding: isMobile ? 10 : 12, textAlign: "right", color: "#b45309", fontWeight: 800 }}>{entry.debit_amount ? money(Number(entry.debit_amount)) : ""}</td>
                    <td style={{ padding: isMobile ? 10 : 12, textAlign: "right", color: "#047857", fontWeight: 800 }}>{entry.credit_amount ? money(Number(entry.credit_amount)) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
