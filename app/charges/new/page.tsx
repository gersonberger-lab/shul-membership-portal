"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function NewChargePage() {
  const router = useRouter();

  const [members, setMembers] = useState<any[]>([]);
  const [form, setForm] = useState({
    member_id: "",
    entry_date: "",
    description: "",
    debit_amount: "",
    due_date: "",
    public_note: "",
    internal_note: "",
  });

  useEffect(() => {
    async function loadMembers() {
      const { data } = await supabase
        .from("members")
        .select("id, member_number, english_first_name, english_surname")
        .order("english_surname");

      setMembers(data || []);
    }

    loadMembers();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { error } = await supabase.from("ledger_entries").insert([
      {
        member_id: form.member_id,
        entry_date: form.entry_date,
        entry_type: "charge",
        description: form.description,
        debit_amount: Number(form.debit_amount),
        credit_amount: 0,
        due_date: form.due_date || null,
        public_note: form.public_note,
        internal_note: form.internal_note,
        status: "posted",
      },
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push(`/members/${form.member_id}`);
    }
  };

  return (
    <>
      <section className="hero">
        <h1>Add Charge</h1>
        <p>Post a charge to a member statement.</p>
      </section>

      <section className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field full">
            <label>Member</label>
            <select name="member_id" value={form.member_id} onChange={handleChange} required>
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  M{m.member_number} - {m.english_first_name} {m.english_surname}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Charge date</label>
            <input name="entry_date" type="date" value={form.entry_date} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Due date</label>
            <input name="due_date" type="date" value={form.due_date} onChange={handleChange} />
          </div>

          <div className="form-field full">
            <label>Description</label>
            <input name="description" placeholder="e.g. Aliyos - Shlishi" value={form.description} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Amount</label>
            <input name="debit_amount" type="number" step="0.01" value={form.debit_amount} onChange={handleChange} required />
          </div>

          <div className="form-field full">
            <label>Public note</label>
            <textarea name="public_note" rows={3} value={form.public_note} onChange={handleChange} />
          </div>

          <div className="form-field full">
            <label>Internal note</label>
            <textarea name="internal_note" rows={3} value={form.internal_note} onChange={handleChange} />
          </div>

          <div className="form-field full">
            <button type="submit">Save Charge</button>
          </div>
        </form>
      </section>
    </>
  );
}
