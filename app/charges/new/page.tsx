"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  member_number: number;
  english_first_name: string;
  english_surname: string;
};

type ChargeItem = {
  id: string;
  name_en: string;
  name_he: string | null;
  default_amount: number | null;
  due_days: number;
  charge_category_groups: {
    name_en: string;
    name_he: string | null;
  } | null;
};

function addDays(dateString: string, days: number) {
  if (!dateString) return "";
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export default function NewChargePage() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [chargeItems, setChargeItems] = useState<ChargeItem[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    member_id: "",
    entry_date: new Date().toISOString().split("T")[0],
    due_date: "",
    charge_category_id: "",
    debit_amount: "",
    public_note: "",
    internal_note: "",
  });

  useEffect(() => {
    async function loadData() {
      const { data: memberData } = await supabase
        .from("members")
        .select("id, member_number, english_first_name, english_surname")
        .order("english_surname");

      const { data: categoryData } = await supabase
        .from("charge_categories")
        .select("id, name_en, name_he, default_amount, due_days, charge_category_groups(name_en, name_he)")
        .eq("active", true)
        .order("sort_order");

      setMembers(memberData || []);
      setChargeItems((categoryData as unknown as ChargeItem[]) || []);
    }

    loadData();
  }, []);

  const selectedCharge = chargeItems.find(
    (item) => item.id === form.charge_category_id
  );

  const description = selectedCharge
    ? `${selectedCharge.charge_category_groups?.name_en || ""} - ${selectedCharge.name_en}`
    : "";

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "charge_category_id") {
      const item = chargeItems.find((c) => c.id === value);
      setForm({
        ...form,
        charge_category_id: value,
        debit_amount: item?.default_amount ? String(item.default_amount) : "",
        due_date: addDays(form.entry_date, item?.due_days || 0),
      });
      return;
    }

    if (name === "entry_date") {
      setForm({
        ...form,
        entry_date: value,
        due_date: selectedCharge ? addDays(value, selectedCharge.due_days || 0) : "",
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.member_id || !form.entry_date || !form.charge_category_id || !form.debit_amount) {
      alert("Please fill in member, date, charge item and amount.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("ledger_entries").insert([
      {
        member_id: form.member_id,
        entry_date: form.entry_date,
        entry_type: "charge",
        charge_category_id: form.charge_category_id,
        description,
        debit_amount: Number(form.debit_amount),
        credit_amount: 0,
        due_date: form.due_date || null,
        public_note: form.public_note,
        internal_note: form.internal_note,
        status: "posted",
      },
    ]);

    setSaving(false);

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
        <p>Post a charge to a member statement using your charge categories.</p>
      </section>

      <section className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field full">
            <label>Member *</label>
            <select name="member_id" value={form.member_id} onChange={handleChange} required>
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  M{m.member_number} - {m.english_first_name} {m.english_surname}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field full">
            <label>Charge item *</label>
            <select
              name="charge_category_id"
              value={form.charge_category_id}
              onChange={handleChange}
              required
            >
              <option value="">Search/select charge item</option>
              {chargeItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.charge_category_groups?.name_en} - {item.name_en}
                  {item.default_amount ? ` | £${item.default_amount}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Charge date *</label>
            <input name="entry_date" type="date" value={form.entry_date} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Due date</label>
            <input name="due_date" type="date" value={form.due_date} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Amount *</label>
            <input name="debit_amount" type="number" min="0.01" step="0.01" value={form.debit_amount} onChange={handleChange} required />
          </div>

          <div className="form-field full">
            <label>Description</label>
            <input value={description} readOnly />
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
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Charge"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
