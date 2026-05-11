"use client";

import { useState } from "react";

export default function BankDetailsSettingsPage() {
  const [details, setDetails] = useState({
    accountName: "",
    bankName: "",
    sortCode: "",
    accountNumber: "",
    referenceText: "Please use your name as the payment reference.",
    note: "Bank transfer payments may take a little time to appear on your account.",
  });

  function update(field: string, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
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
            <input value={details.referenceText} onChange={(event) => update("referenceText", event.target.value)} />
          </div>

          <div className="form-field full">
            <label>Extra note shown to members</label>
            <textarea value={details.note} onChange={(event) => update("note", event.target.value)} rows={4} />
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <button type="button" onClick={() => alert("Saving bank details to the database will be connected next.")}>Save Bank Details</button>
        </div>
      </section>
    </>
  );
}
