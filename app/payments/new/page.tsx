"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Member = {
  id: string;
  hebrew_first_name: string | null;
  hebrew_surname: string | null;
  email: string | null;
};

const paymentMethods = ["מזומן", "שיק", "העברה בנקאית", "כרטיס", "הוראת קבע", "אחר"];

function memberDisplayName(member: Member) {
  return `${member.hebrew_first_name || ""} ${member.hebrew_surname || ""}`.trim() || member.email || "-";
}

export default function NewPaymentPage() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState(false);
  const [presetMemberId, setPresetMemberId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    member_id: "",
    entry_date: new Date().toISOString().split("T")[0],
    amount: "",
    payment_method: "",
    reference: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPresetMemberId(params.get("member"));
  }, []);

  useEffect(() => {
    async function loadMembers() {
      const { data } = await supabase
        .from("members")
        .select("id, hebrew_first_name, hebrew_surname, email")
        .order("hebrew_surname");

      setMembers(data || []);

      if (presetMemberId && data) {
        const presetMember = data.find((member) => member.id === presetMemberId);
        if (presetMember) {
          setMemberSearch(memberDisplayName(presetMember));
          setForm((prev) => ({ ...prev, member_id: presetMember.id }));
        }
      }
    }

    loadMembers();
  }, [presetMemberId]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim();
    return members
      .filter((member) => {
        if (!q) return true;
        return memberDisplayName(member).includes(q) || (member.email || "").toLowerCase().includes(q.toLowerCase());
      })
      .slice(0, 8);
  }, [memberSearch, members]);

  const selectedMember = members.find((member) => member.id === form.member_id);
  const amountNumber = Number(form.amount || 0);

  const description = ["תשלום", form.payment_method || "", form.reference ? `אסמכתא: ${form.reference}` : ""]
    .filter(Boolean)
    .join(" - ");

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const selectMember = (member: Member) => {
    setMemberSearch(memberDisplayName(member));
    setForm({ ...form, member_id: member.id });
    setActiveSearch(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.member_id || !form.entry_date || !form.amount || !form.payment_method) {
      alert("Please select a member, date, amount and payment method.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("ledger_entries").insert([
      {
        member_id: form.member_id,
        entry_date: form.entry_date,
        entry_type: "payment",
        description,
        description_he: description,
        debit_amount: 0,
        credit_amount: amountNumber,
        status: "posted",
      },
    ]);

    setSaving(false);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    router.push(`/members/${form.member_id}`);
  };

  return (
    <>
      <section className="hero compact-hero">
        <span className="eyebrow">Simple Ledger</span>
        <h1>Add Payment</h1>
        <p>Post one payment as a credit against the member’s running balance.</p>
      </section>

      <section className="card payment-entry-card">
        <form className="payment-layout" onSubmit={handleSubmit}>
          <div className="payment-main">
            <div className="form-field full" style={{ position: "relative" }}>
              <label>Member *</label>
              <input
                value={memberSearch}
                dir="rtl"
                placeholder="Start typing Hebrew member name"
                onFocus={() => setActiveSearch(true)}
                onChange={(e) => {
                  setMemberSearch(e.target.value);
                  setForm({ ...form, member_id: "" });
                  setActiveSearch(true);
                }}
                required
              />

              {activeSearch && (
                <div className="search-results">
                  {filteredMembers.map((member) => (
                    <button key={member.id} type="button" className="search-result" onMouseDown={() => selectMember(member)}>
                      <strong dir="rtl">{memberDisplayName(member)}</strong>
                      <span>{member.email || ""}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="payment-grid">
              <div className="form-field">
                <label>Amount *</label>
                <input name="amount" type="number" step="0.01" min="0.01" value={form.amount} onChange={handleChange} placeholder="0.00" required />
              </div>

              <div className="form-field">
                <label>Date *</label>
                <input name="entry_date" type="date" value={form.entry_date} onChange={handleChange} required />
              </div>

              <div className="form-field">
                <label>Method *</label>
                <select name="payment_method" value={form.payment_method} onChange={handleChange} required>
                  <option value="">Select...</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Reference</label>
                <input name="reference" value={form.reference} onChange={handleChange} placeholder="Cheque / bank ref" />
              </div>
            </div>
          </div>

          <aside className="payment-summary-box">
            <span>Payment Total</span>
            <strong>£{amountNumber.toFixed(2)}</strong>

            {selectedMember && (
              <div className="payment-member-pill">
                <b dir="rtl">{memberDisplayName(selectedMember)}</b>
              </div>
            )}

            <div className="payment-description-preview" dir="rtl">
              {description || "תשלום"}
            </div>

            <button type="submit" disabled={saving}>{saving ? "Posting..." : "Post Payment"}</button>
            <a className="button secondary" href="/members">Cancel</a>
          </aside>
        </form>
      </section>
    </>
  );
}
