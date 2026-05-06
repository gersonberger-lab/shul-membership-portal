"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  member_number: number;
  english_first_name: string;
  english_surname: string;
  hebrew_first_name: string | null;
  hebrew_surname: string | null;
};

type ChargeItem = {
  id: string;
  name_en: string;
  name_he: string | null;
  search_terms: string | null;
  default_amount: number | null;
  due_days: number;
  charge_category_groups: {
    name_en: string;
    name_he: string | null;
  }[] | null;
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

  const [memberSearch, setMemberSearch] = useState("");
  const [chargeSearch, setChargeSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState<"member" | "charge" | null>(null);
  const [presetMemberId, setPresetMemberId] = useState<string | null>(null);

  const [form, setForm] = useState({
    member_id: "",
    entry_date: new Date().toISOString().split("T")[0],
    due_date: "",
    charge_category_id: "",
    amount: "",
    description_extra: "",
    public_note: "",
    internal_note: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPresetMemberId(params.get("member"));
  }, []);

  useEffect(() => {
    async function loadData() {
      const { data: memberData } = await supabase
        .from("members")
        .select("id, member_number, english_first_name, english_surname, hebrew_first_name, hebrew_surname")
        .order("english_surname");

      const { data: categoryData } = await supabase
        .from("charge_categories")
        .select("id, name_en, name_he, search_terms, default_amount, due_days, charge_category_groups(name_en, name_he)")
        .eq("active", true)
        .order("sort_order");

      setMembers(memberData || []);
      setChargeItems((categoryData as unknown as ChargeItem[]) || []);

      if (presetMemberId && memberData) {
        const presetMember = memberData.find((m) => m.id === presetMemberId);

        if (presetMember) {
          setMemberSearch(
            `M${presetMember.member_number} - ${presetMember.english_first_name} ${presetMember.english_surname}`
          );

          setForm((prev) => ({
            ...prev,
            member_id: presetMember.id,
          }));
        }
      }
    }

    loadData();
  }, [presetMemberId]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();

    return members
      .filter((m) => {
        const englishName = `${m.english_first_name} ${m.english_surname}`.toLowerCase();
        const hebrewName = `${m.hebrew_first_name || ""} ${m.hebrew_surname || ""}`;
        const memberNumber = `m${m.member_number}`;

        if (!q) return true;

        return (
          englishName.includes(q) ||
          hebrewName.includes(memberSearch.trim()) ||
          memberNumber.includes(q)
        );
      })
      .slice(0, 8);
  }, [memberSearch, members]);

  const filteredChargeItems = useMemo(() => {
    const q = chargeSearch.trim().toLowerCase();

    return chargeItems
      .filter((item) => {
        const group = item.charge_category_groups?.[0]?.name_en || "";
        const fullName = `${group} ${item.name_en}`.toLowerCase();
        const hebrewFullName = `${item.charge_category_groups?.[0]?.name_he || ""} ${item.name_he || ""}`;

        if (!q) return true;

        return (
          fullName.includes(q) ||
          (item.search_terms || "").toLowerCase().includes(q) ||
          hebrewFullName.includes(chargeSearch.trim())
        );
      })
      .slice(0, 8);
  }, [chargeSearch, chargeItems]);

  const selectedCharge = chargeItems.find(
    (item) => item.id === form.charge_category_id
  );

  const chargeItemName = selectedCharge
    ? `${selectedCharge.charge_category_groups?.[0]?.name_en || ""} - ${selectedCharge.name_en}`
    : "";

  const finalDescription = form.description_extra.trim()
    ? `${chargeItemName} — ${form.description_extra.trim()}`
    : chargeItemName;

  const selectMember = (member: Member) => {
    setMemberSearch(
      `M${member.member_number} - ${member.english_first_name} ${member.english_surname}`
    );
    setForm({ ...form, member_id: member.id });
    setActiveSearch(null);
  };

  const selectCharge = (item: ChargeItem) => {
    const name = `${item.charge_category_groups?.[0]?.name_en || ""} - ${item.name_en}`;

    setChargeSearch(name);
    setForm({
      ...form,
      charge_category_id: item.id,
      amount: item.default_amount ? String(item.default_amount) : "",
      due_date: addDays(form.entry_date, item.due_days || 0),
    });
    setActiveSearch(null);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

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

    if (!form.member_id || !form.entry_date || !form.charge_category_id || !form.amount) {
      alert("Please select a member, charge item, date and amount.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("ledger_entries").insert([
      {
        member_id: form.member_id,
        entry_date: form.entry_date,
        entry_type: "charge",
        charge_category_id: form.charge_category_id,
        description: finalDescription,
        debit_amount: Number(form.amount),
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
        <p>Search a member, choose a charge item, then post to the ledger.</p>
      </section>

      <section className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field full" style={{ position: "relative" }}>
            <label>Member *</label>
            <input
              value={memberSearch}
              placeholder="Start typing member name, Hebrew name, or M number"
              onFocus={() => setActiveSearch("member")}
              onChange={(e) => {
                setMemberSearch(e.target.value);
                setForm({ ...form, member_id: "" });
                setActiveSearch("member");
              }}
              required
            />

            {activeSearch === "member" && (
              <div className="search-results">
                {filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="search-result"
                    onMouseDown={() => selectMember(m)}
                  >
                    <strong>M{m.member_number} - {m.english_first_name} {m.english_surname}</strong>
                    <span dir="rtl">
                      {m.hebrew_first_name} {m.hebrew_surname}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-field full" style={{ position: "relative" }}>
            <label>Charge item *</label>
            <input
              value={chargeSearch}
              placeholder="Start typing e.g. shli, chamishi, membership"
              onFocus={() => setActiveSearch("charge")}
              onChange={(e) => {
                setChargeSearch(e.target.value);
                setForm({ ...form, charge_category_id: "" });
                setActiveSearch("charge");
              }}
              required
            />

            {activeSearch === "charge" && (
              <div className="search-results">
                {filteredChargeItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="search-result"
                    onMouseDown={() => selectCharge(item)}
                  >
                    <strong>
                      {item.charge_category_groups?.[0]?.name_en} - {item.name_en}
                    </strong>
                    <span>
                      {item.default_amount ? `Default £${item.default_amount}` : "No default amount"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-field">
            <label>Charge date *</label>
            <input
              name="entry_date"
              type="date"
              value={form.entry_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Due date</label>
            <input
              name="due_date"
              type="date"
              value={form.due_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Amount *</label>
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field full">
            <label>Extra description</label>
            <input
              name="description_extra"
              placeholder="Optional, e.g. Shabbos Bereishis"
              value={form.description_extra}
              onChange={handleChange}
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
              rows={3}
              value={form.public_note}
              onChange={handleChange}
            />
          </div>

          <div className="form-field full">
            <label>Internal note</label>
            <textarea
              name="internal_note"
              rows={3}
              value={form.internal_note}
              onChange={handleChange}
            />
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