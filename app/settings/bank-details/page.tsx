"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const defaultDetails = {
  accountName: "",
  bankName: "",
  sortCode: "",
  accountNumber: "",
  referenceText: "נא לציין את שמכם כאסמכתא לתשלום.",
  note: "תשלומים בהעברה בנקאית יעודכנו בחשבון לאחר התאמה במשרד.",
};

export default function BankDetailsSettingsPage() {
  const [details, setDetails] = useState(defaultDetails);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDetails() {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "bank_details")
        .maybeSingle();

      if (data?.value) {
        setDetails({ ...defaultDetails, ...(data.value as any) });
      }
    }

    loadDetails();
  }, []);

  function update(field: string, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
  }

  async function saveDetails() {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "bank_details", value: details }, { onConflict: "key" });

    setSaving(false);

    if (error) {
      setMessage("Could not save. Please make sure the app_settings table exists.");
      return;
    }

    setMessage("Bank details saved.");
  }

  return (
    <>
      <section className="hero compact-hero">
        <span className="eyebrow">Payment settings</span>
        <h1>Bank Details</h1>
        <p>Set the bank transfer instructions shown to members in the payment portal.</p>
      </section>

      <section className="card form-card">
        <div className="form-grid">
          <div className="form-field">
            <label>Account name</label>
            <input value={details.accountName} onChange={(event) => update("accountName", event.target.value)} />
          </div>

          <div className="form-field">
            <label>Bank name</label>
            <input value={details.bankName} onChange={(event) => update("bankName", event.target.value)} />
          </div>

          <div className="form-field">
            <label>Sort code</label>
            <input value={details.sortCode} onChange={(event) => update("sortCode", event.target.value)} />
          </div>

          <div className="form-field">
            <label>Account number</label>
            <input value={details.accountNumber} onChange={(event) => update("accountNumber", event.target.value)} />
          </div>

          <div className="form-field full">
            <label>Payment reference instruction</label>
            <input dir="rtl" value={details.referenceText} onChange={(event) => update("referenceText", event.target.value)} />
          </div>

          <div className="form-field full">
            <label>Extra note shown to members</label>
            <textarea dir="rtl" value={details.note} onChange={(event) => update("note", event.target.value)} rows={4} />
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <button type="button" onClick={saveDetails} disabled={saving}>{saving ? "Saving..." : "Save Bank Details"}</button>
        </div>

        {message && <p className="muted" style={{ marginTop: 14 }}>{message}</p>}
      </section>

      <section className="card" style={{ marginTop: 22 }}>
        <h3 className="section-title">Database setup needed</h3>
        <p className="muted">If saving does not work yet, create this table in Supabase:</p>
        <pre style={{ whiteSpace: "pre-wrap", background: "#f8fafc", padding: 16, borderRadius: 12 }}>
{`create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);`}
        </pre>
      </section>
    </>
  );
}
