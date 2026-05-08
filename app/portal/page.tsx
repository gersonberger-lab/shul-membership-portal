"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function MemberPortalPage() {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const email = session?.user?.email || null;
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

  const balance = useMemo(() => {
    return entries.reduce((sum, entry) => {
      return sum + Number(entry.debit_amount || 0) - Number(entry.credit_amount || 0);
    }, 0);
  }, [entries]);

  if (loading) {
    return (
      <section className="card">
        <p>Loading portal...</p>
      </section>
    );
  }

  if (!sessionEmail) {
    return (
      <section className="card">
        <h3 className="section-title">Not signed in</h3>
        <p className="muted">Please sign in to access your member portal.</p>
        <a className="button" href="/portal/login">
          Sign In
        </a>
      </section>
    );
  }

  if (!member) {
    return (
      <section className="card">
        <h3 className="section-title">Member account not linked</h3>
        <p className="muted">
          We could not find a member account matching {sessionEmail}.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="hero compact-hero">
        <span className="eyebrow">Member Portal</span>
        <h1>
          {member.english_first_name} {member.english_surname}
        </h1>
        {(member.hebrew_first_name || member.hebrew_surname) && (
          <div className="hebrew-title" dir="rtl">
            {member.hebrew_first_name} {member.hebrew_surname}
          </div>
        )}
      </section>

      <section className="dashboard-stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <span>Current Balance</span>
          <strong>£{balance.toFixed(2)}</strong>
        </div>

        <div className="stat-card">
          <span>Entries</span>
          <strong>{entries.length}</strong>
        </div>
      </section>

      <section className="card">
        <div className="statement-header">
          <div>
            <h3 className="section-title">Recent Activity</h3>
            <p className="muted">Your recent charges and payments.</p>
          </div>

          <a className="button" href="/payments/new">
            Make Payment
          </a>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Charges</th>
                <th>Payments</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.entry_date}</td>
                  <td>{entry.description}</td>
                  <td>
                    {entry.debit_amount
                      ? `£${Number(entry.debit_amount).toFixed(2)}`
                      : ""}
                  </td>
                  <td>
                    {entry.credit_amount
                      ? `£${Number(entry.credit_amount).toFixed(2)}`
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
