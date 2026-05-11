"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Member = {
  id: string;
  member_number: number;
  hebrew_first_name: string | null;
  hebrew_surname: string | null;
  email: string | null;
  phone?: string | null;
  ledger_entries?: {
    debit_amount: number | null;
    credit_amount: number | null;
  }[];
};

function hebrewName(member: Member) {
  return `${member.hebrew_first_name || ""} ${member.hebrew_surname || ""}`.trim() || "-";
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadMembers() {
      const { data, error } = await supabase
        .from("members")
        .select(`
          id,
          member_number,
          hebrew_first_name,
          hebrew_surname,
          email,
          phone,
          ledger_entries (
            debit_amount,
            credit_amount
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
        return;
      }

      setMembers(data || []);
    }

    loadMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const raw = search.trim();

    if (!q) return members;

    return members.filter((member) => {
      const name = hebrewName(member);
      return name.includes(raw) || (member.email || "").toLowerCase().includes(q) || (member.phone || "").includes(raw);
    });
  }, [search, members]);

  return (
    <>
      <section className="hero">
        <h1>Members</h1>
        <p>Search and manage member accounts using Hebrew names.</p>

        <div style={{ marginTop: 20 }}>
          <a className="button" href="/members/new">Add Member</a>
        </div>
      </section>

      <section className="card" style={{ marginBottom: 24 }}>
        <div className="form-field">
          <label>Search members</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type Hebrew name, email, or phone..."
          />
        </div>
      </section>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Hebrew Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            {filteredMembers.map((member) => {
              const balance = member.ledger_entries?.reduce((sum, entry) => {
                return sum + Number(entry.debit_amount || 0) - Number(entry.credit_amount || 0);
              }, 0) || 0;

              return (
                <tr key={member.id}>
                  <td dir="rtl">
                    <a href={`/members/${member.id}`}>
                      <strong>{hebrewName(member)}</strong>
                    </a>
                  </td>
                  <td>{member.email || "-"}</td>
                  <td>{member.phone || "-"}</td>
                  <td className="balance">£{balance.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}