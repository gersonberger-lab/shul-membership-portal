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

type ChargeRow = {
  tempId: string;
  charge_category_id: string;
  chargeName: string;
  amount: string;
  descriptionExtra: string;
};

function addDays(dateString: string, days: number) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function memberName(member: Member) {
  return `${member.hebrew_first_name || ""} ${member.hebrew_surname || ""}`.trim() || member.email || "-";
}

function chargeName(item: ChargeItem) {
  const group = item.charge_category_groups?.[0]?.name_he?.trim();
  const name = item.name_he?.trim() || "";
  return group ? `${group} - ${name}` : name;
}

function rowDescription(row: ChargeRow) {
  const extra = row.descriptionExtra.trim();
  return extra ? `${row.chargeName} - ${extra}` : row.chargeName;
}

function blankRow(): ChargeRow {
  return {
    tempId: crypto.randomUUID(),
    charge_category_id: "",
    chargeName: "",
    amount: "",
    descriptionExtra: "",
  };
}

export default function BatchChargePage() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [chargeItems, setChargeItems] = useState<ChargeItem[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberOpen, setMemberOpen] = useState(false);
  const [activeChargeRow, setActiveChargeRow] = useState<string | null>(null);
  const [chargeSearch, setChargeSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const [memberId, setMemberId] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [rows, setRows] = useState<ChargeRow[]>([blankRow(), blankRow(), blankRow()]);

  useEffect(() => {
    async function loadData() {
      const { data: memberData } = await supabase
        .from("members")
        .select("id, hebrew_first_name, hebrew_surname, email")
        .order("hebrew_surname");

      const { data: chargeData } = await supabase
        .from("charge_categories")
        .select("id, name_he, search_terms, default_amount, due_days, charge_category_groups(name_he)")
        .eq("active", true)
        .order("sort_order");

      setMembers(memberData || []);
      setChargeItems((chargeData as unknown as ChargeItem[]) || []);
    }

    loadData();
  }, []);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim();
    return members
      .filter((member) => !q || memberName(member).includes(q) || (member.email || "").toLowerCase().includes(q.toLowerCase()))
      .slice(0, 10);
  }, [members, memberSearch]);

  const filteredChargeItems = useMemo(() => {
    const q = chargeSearch.trim();
    return chargeItems
      .filter((item) => !q || chargeName(item).includes(q) || (item.search_terms || "").includes(q))
      .slice(0, 10);
  }, [chargeItems, chargeSearch]);

  const selectedMember = members.find((member) => member.id === memberId);
  const validRows = rows.filter((row) => row.charge_category_id && Number(row.amount || 0) > 0);
  const total = validRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const updateRow = (tempId: string, changes: Partial<ChargeRow>) => {
    setRows((current) => current.map((row) => row.tempId === tempId ? { ...row, ...changes } : row));
  };

  const selectMember = (member: Member) => {
    setMemberId(member.id);
    setMemberSearch(memberName(member));
    setMemberOpen(false);
  };

  const selectCharge = (rowId: string, item: ChargeItem) => {
    updateRow(rowId, {
      charge_category_id: item.id,
      chargeName: chargeName(item),
      amount: item.default_amount ? String(item.default_amount) : "",
    });
    setActiveChargeRow(null);
    setChargeSearch("");
  };

  const addRow = () => setRows((current) => [...current, blankRow()]);
  const removeRow = (rowId: string) => setRows((current) => current.length <= 1 ? current : current.filter((row) => row.tempId !== rowId));

  const postCharges = async () => {
    if (!memberId || !entryDate || !validRows.length) {
      alert("Please select a member, date and at least one charge.");
      return;
    }

    setSaving(true);

    const entries = validRows.map((row) => {
      const item = chargeItems.find((charge) => charge.id === row.charge_category_id);
      return {
        member_id: memberId,
        entry_date: entryDate,
        entry_type: "charge",
        charge_category_id: row.charge_category_id,
        description: rowDescription(row),
        description_he: rowDescription(row),
        debit_amount: Number(row.amount),
        credit_amount: 0,
        due_date: item ? addDays(entryDate, item.due_days || 0) : null,
        status: "posted",
      };
    });

    const { error } = await supabase.from("ledger_entries").insert(entries);

    setSaving(false);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    router.push(`/members/${memberId}`);
  };

  return (
    <>
      <section className="hero compact-hero">
        <span className="eyebrow">Fast Entry</span>
        <h1>Add Charge</h1>
        <p>Add one or more Hebrew charges to a member quickly.</p>
      </section>

      <section className="card batch-entry-card">
        <div className="batch-topbar">
          <div className="batch-member-search" style={{ position: "relative" }}>
            <label>Member</label>
            <input
              value={memberSearch}
              dir="rtl"
              placeholder="Search Hebrew member name"
              onFocus={() => setMemberOpen(true)}
              onChange={(event) => {
                setMemberSearch(event.target.value);
                setMemberId("");
                setMemberOpen(true);
              }}
            />

            {memberOpen && (
              <div className="search-results">
                {filteredMembers.map((member) => (
                  <button key={member.id} type="button" className="search-result" onMouseDown={() => selectMember(member)}>
                    <strong dir="rtl">{memberName(member)}</strong>
                    <span>{member.email || ""}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="batch-date">
            <label>Date</label>
            <input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} />
          </div>

          <div className="batch-total-box">
            <span>Total</span>
            <strong>£{total.toFixed(2)}</strong>
          </div>
        </div>

        {selectedMember && (
          <div className="batch-selected-member">
            Posting to <strong dir="rtl">{memberName(selectedMember)}</strong>
          </div>
        )}

        <div className="batch-table batch-table-with-description">
          <div className="batch-table-head">
            <div>#</div>
            <div>Charge</div>
            <div>Amount</div>
            <div>Hebrew description</div>
            <div></div>
          </div>

          {rows.map((row, index) => (
            <div className="batch-table-row" key={row.tempId}>
              <div className="batch-row-number">{index + 1}</div>

              <div style={{ position: "relative" }}>
                <input
                  value={row.chargeName}
                  dir="rtl"
                  placeholder="Type Hebrew charge"
                  onFocus={() => {
                    setActiveChargeRow(row.tempId);
                    setChargeSearch(row.chargeName);
                  }}
                  onChange={(event) => {
                    updateRow(row.tempId, { chargeName: event.target.value, charge_category_id: "" });
                    setActiveChargeRow(row.tempId);
                    setChargeSearch(event.target.value);
                  }}
                />

                {activeChargeRow === row.tempId && (
                  <div className="search-results">
                    {filteredChargeItems.map((item) => (
                      <button key={item.id} type="button" className="search-result" onMouseDown={() => selectCharge(row.tempId, item)}>
                        <strong dir="rtl">{chargeName(item)}</strong>
                        <span>{item.default_amount ? `£${item.default_amount}` : "No default"}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                className="batch-money-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={row.amount}
                onChange={(event) => updateRow(row.tempId, { amount: event.target.value })}
              />

              <input
                value={row.descriptionExtra}
                dir="rtl"
                placeholder="Optional Hebrew description"
                onChange={(event) => updateRow(row.tempId, { descriptionExtra: event.target.value })}
              />

              <button type="button" className="button secondary compact" onClick={() => removeRow(row.tempId)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="batch-actions">
          <button type="button" className="button secondary" onClick={addRow}>Add Row</button>
          <button type="button" onClick={postCharges} disabled={saving}>
            {saving ? "Posting..." : `Post ${validRows.length} Charges`}
          </button>
        </div>
      </section>
    </>
  );
}
