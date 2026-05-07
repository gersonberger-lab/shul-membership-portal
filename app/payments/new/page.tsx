"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Member = {
  id: string;
  english_first_name: string;
  english_surname: string;
  hebrew_first_name: string | null;
  hebrew_surname: string | null;
  email: string | null;
};

const paymentMethods = [
  "Cash",
  "Cheque",
  "Bank Transfer",
  "Card",
  "Direct Debit",
  "Standing Order",
  "AAC Voucher",
  "Tevini Voucher",
  "Other Charity Voucher",
];

function memberDisplayName(member: Member) {
  return `${member.english_first_name} ${member.english_surname}`.trim();
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
    public_note: "",
    internal_note: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPresetMemberId(params.get("member"));
  }, []);

  useEffect(() => {
    async function loadMembers() {
      const { data } = await supabase
        .from("members")
        .select("id, english_first_name, english_surname, hebrew_first_name, hebrew_surname, email")
        .order("english_surname");

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
    const q = memberSearch.trim().toLowerCase();

    return members
      .filter((member) => {
        const englishName = memberDisplayName(member).toLowerCase();
        const hebrewName = `${member.hebrew_first_name || ""} ${member.hebrew_surname || ""}`;

        if (!q) return true;

        return (
          englishName.includes(q) ||
          hebrewName.includes(memberSearch.trim()) ||
          (member.email || "").toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [memberSearch, members]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const selectMember = (member: Member) => {
    setMemberSearch(memberDisplayName(member));
    setForm({ ...form, member_id: member.id });
    setActiveSearch(false);
  };

  const finalDescription = [
    "Payment received",
    form.payment_method ? `by ${form.payment_method}` : "",
    form.reference ? `Ref: ${form.reference}` : "",
  ]
    .filter(Boolean)
    .join(" - ");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.member_id || !form.entry_date || !form.amount || !form.payment_method) {
      alert("Please select a member, payment date, payment method and amount.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("ledger_entries").insert([
      {
        member_id: form.member_id,
        entry_date: form.entry_date,
        entry_type: "payment",
        description: finalDescription,
        debit_amount: 0,
        credit_amount: Number(form.amount),
        public_note: form.public_note,
        internal_note: form.internal_note,
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
      <section className="hero">
        <span className="eyebrow">Ledger</span>
        <h1>Add Payment</h1>
        <p>Record a payment against a member account.</p>
      </section>

      <section className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field full" style={{ position: "relative" }}>
            <label>Member *</label>
            <input
              value={memberSearch}
              placeholder="Start typing member name, Hebrew name, or email"
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
                  <button
                    key={member.id}
                    type="button"
                    className="search-result"
                    onMouseDown={() => selectMember(member)}
                  >
                    <strong>{memberDisplayName(member)}</strong>
                    <span dir="rtl">
                      {member.hebrew_first_name} {member.hebrew_surname}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-field">
            <label>Payment amount *</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="e.g. 180"
              required
            />
          </div>

          <div className="form-field">
            <label>Payment date *</label>
            <input
              name="entry_date"
              type="date"
              value={form.entry_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Payment method *</label>
            <select
              name="payment_method"
              value={form.payment_method}
              onChange={handleChange}
              required
            >
              <option value="">Select method...</option>

              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Reference</label>
            <input
              name="reference"
              value={form.reference}
              onChange={handleChange}
              placeholder="Cheque no, voucher no, bank ref..."
            />
          </div>

          <div className="form-field full">
            <label>Final statement line</label>
            <input value={finalDescription} readOnly />
          </div>

          <div className="form-field full">
            <label>Public note</label>
            <textarea
              name="public_note"
              value={form.public_note}
              onChange={handleChange}
              placeholder="Optional note visible on statements"
            />
          </div>

          <div className="form-field full">
            <label>Internal note</label>
            <textarea
              name="internal_note"
              value={form.internal_note}
              onChange={handleChange}
              placeholder="Internal office note"
            />
          </div>

          <div className="form-field full" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Payment"}
            </button>

            <a className="button secondary" href="/members">
              Cancel
            </a>
          </div>
        </form>
      </section>
    </>
  );
}
