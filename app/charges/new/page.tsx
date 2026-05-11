"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  member_number: number;
  hebrew_first_name: string | null;
  hebrew_surname: string | null;
};

type ChargeItem = {
  id: string;
  name_he: string | null;
  search_terms: string | null;
  default_amount: number | null;
  due_days: number;
  charge_category_groups: {
    name_he: string | null;
  }[] | null;
};

function memberName(member: Member) {
  return `${member.hebrew_first_name || ""} ${member.hebrew_surname || ""}`.trim() || `M${member.member_number}`;
}

function chargeName(item: ChargeItem) {
  const group = item.charge_category_groups?.[0]?.name_he || "";
  const itemName = item.name_he || "";
  return [group, itemName].filter(Boolean).join(" - ");
}

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
        .select("id, member_number, hebrew_first_name, hebrew_surname")
        .order("hebrew_surname");

      const { data: categoryData } = await supabase
        .from("charge_categories")
        .select("id, name_he, search_terms, default_amount, due_days, charge_category_groups(name_he)")
        .eq("active", true)
        .order("sort_order");

      setMembers(memberData || []);
      setChargeItems((categoryData as unknown as ChargeItem[]) || []);

      if (presetMemberId && memberData) {
        const presetMember = memberData.find((m) => m.id === presetMemberId);
        if (presetMember) {
          setMemberSearch(memberName(presetMember));
          setForm((prev) => ({ ...prev, member_id: presetMember.id }));
        }
      }
    }

    loadData();
  }, [presetMemberId]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim();
    return members
      .filter((member) => {
        if (!q) return true;
        return memberName(member).includes(q) || `M${member.member_number}`.toLowerCase().includes(q.toLowerCase());
      })
      .slice(0, 8);
  }, [memberSearch, members]);

  const filteredChargeItems = useMemo(() => {
    const q = chargeSearch.trim();
    return chargeItems
      .filter((item) => {
        if (!q) return true;
        return chargeName(item).includes(q) || (item.search_terms || "").includes(q);
      })
      .slice(0, 8);
  }, [chargeSearch, chargeItems]);

  const selectedCharge = chargeItems.find((item) => item.id === form.charge_category_id);
  const selectedChargeName = selectedCharge ? chargeName(selectedCharge) : "";
  const finalDescription = form.description_extra.trim()
    ? `${selectedChargeName} - ${form.description_extra.trim()}`
    : selectedChargeName;

  const selectMember = (member: Member) => {
    setMemberSearch(memberName(member));
    setForm({ ...form, member_id: member.id });
    setActiveSearch(null);
  };

  const selectCharge = (item: ChargeItem) => {
    const name = chargeName(item);
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
        description_he: finalDescription,
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
        <p>Search a Hebrew member name and post a Hebrew charge description.</p>
      </section>

      <section className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field full" style={{ position: "relative" }}>
            <label>Member *</label>
            <input
              value={memberSearch}
              dir="rtl"
              placeholder="Start typing Hebrew member name"
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
                {filteredMembers.map((member) => (
                  <button key={member.id} type="button" className="search-result" onMouseDown={() => selectMember(member)}>
                    <strong dir="rtl">{memberName(member)}</strong>
                    <span>M{member.member_number}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-field full" style={{ position: "relative" }}>
            <label>Charge item *</label>
            <input
              value={chargeSearch}
              dir="rtl"
              placeholder="Start typing Hebrew charge name"
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
                  <button key={item.id} type="button" className="search-result" onMouseDown={() => selectCharge(item)}>
                    <strong dir="rtl">{chargeName(item)}</strong>
                    <span>{item.default_amount ? `Default £${item.default_amount}` : "No default amount"}</span>
                  </button>
                ))}
              </div>
            )}
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
            <input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={handleChange} required />
          </div>

          <div className="form-field full">
            <label>Extra Hebrew description</label>
            <input name="description_extra" dir="rtl" value={form.description_extra} onChange={handleChange} />
          </div>

          <div className="form-field full">
            <label>Final statement line</label>
            <input value={finalDescription} dir="rtl" readOnly />
          </div>

          <div className="form-field full">
            <label>Public note</label>
            <textarea name="public_note" dir="rtl" rows={3} value={form.public_note} onChange={handleChange} />
          </div>

          <div className="form-field full">
            <label>Internal note</label>
            <textarea name="internal_note" rows={3} value={form.internal_note} onChange={handleChange} />
          </div>

          <div className="form-field full">
            <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Charge"}</button>
          </div>
        </form>
      </section>
    </>
  );
}
