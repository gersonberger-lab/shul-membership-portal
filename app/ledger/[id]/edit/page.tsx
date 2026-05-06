"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function EditLedgerEntryPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  const [saving, setSaving] = useState(false);
  const [memberId, setMemberId] = useState("");

  const [form, setForm] = useState({
    entry_date: "",
    description: "",
    debit_amount: "",
    credit_amount: "",
    due_date: "",
    public_note: "",
    internal_note: "",
  });

  useEffect(() => {
    async function loadEntry() {
      const { data, error } = await supabase
        .from("ledger_entries")
        .select("*")
        .eq("id", entryId)
        .single();

      if (error) {
        alert("Error loading entry: " + error.message);
        return;
      }

      setMemberId(data.member_id);

      setForm({
        entry_date: data.entry_date || "",
        description: data.description || "",
        debit_amount: String(data.debit_amount || ""),
        credit_amount: String(data.credit_amount || ""),
        due_date: data.due_date || "",
        public_note: data.public_note || "",
        internal_note: data.internal_note || "",
      });
    }

    if (entryId) loadEntry();
  }, [entryId]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: any) => {
    e.preventDefault();

    if (!form.entry_date || !form.description) {
      alert("Please fill in date and description.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("ledger_entries")
      .update({
        entry_date: form.entry_date,
        description: form.description,
        debit_amount: Number(form.debit_amount || 0),
        credit_amount: Number(form.credit_amount || 0),
        due_date: form.due_date || null,
        public_note: form.public_note,
        internal_note: form.internal_note,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entryId);

    setSaving(false);

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      router.push(`/members/${memberId}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    const { error } = await supabase
      .from("ledger_entries")
      .delete()
      .eq("id", entryId);

    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      router.push(`/members/${memberId}`);
    }
  };

  return (
    <>
      <section className="hero">
        <h1>Edit Ledger Entry</h1>
        <p>Edit or delete this charge/payment line.</p>
      </section>

      <section className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="form-field">
            <label>Date *</label>
            <input name="entry_date" type="date" value={form.entry_date} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Due date</label>
            <input name="due_date" type="date" value={form.due_date} onChange={handleChange} />
          </div>

          <div className="form-field full">
            <label>Description *</label>
            <input name="description" value={form.description} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Charge / Debit</label>
            <input name="debit_amount" type="number" step="0.01" min="0" value={form.debit_amount} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Payment / Credit</label>
            <input name="credit_amount" type="number" step="0.01" min="0" value={form.credit_amount} onChange={handleChange} />
          </div>

          <div className="form-field full">
            <label>Public note</label>
            <textarea name="public_note" rows={3} value={form.public_note} onChange={handleChange} />
          </div>

          <div className="form-field full">
            <label>Internal note</label>
            <textarea name="internal_note" rows={3} value={form.internal_note} onChange={handleChange} />
          </div>

          <div className="form-field full" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button type="button" onClick={handleDelete} style={{ background: "#fee2e2", color: "#991b1b" }}>
              Delete Entry
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
