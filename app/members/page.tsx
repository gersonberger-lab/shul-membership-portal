"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Member = {
  id: string;
  member_number: number;
  english_first_name: string;
  english_surname: string;
  hebrew_first_name: string | null;
  hebrew_surname: string | null;
  email: string | null;
  ledger_entries?: {
    debit_amount: number | null;
    credit_amount: number | null;
  }[];
};

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
          english_first_name,
          english_surname,
          hebrew_first_name,
          hebrew_surname,
          email,
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

    if (!q) return members;

    return members.filter((m) => {
      const englishName = `${m.english_first_name} ${m.english_surname}`.toLowerCase();
      const hebrewName = `${m.hebrew_first_name || ""} ${m.hebrew_surname || ""}`;
      const memberNumber = `m${m.member_number}`;

      return (
        englishName.includes(q) ||
        hebrewName.includes(search.trim()) ||
        memberNumber.includes(q) ||
        (m.email || "").toLowerCase().includes(q)
      );
    });
  }, [search, members]);

  return (
    <>
      <section className="hero">
        <h1>Members</h1>
        <p>Search and manage member accounts.</p>

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
            placeholder="Type name, Hebrew name, member number, or email..."
          />
        </div>
      </section>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Hebrew</th>
              <th>Email</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            {filteredMembers.map((m) => {
              const balance =
                m.ledger_entries?.reduce((sum, entry) => {
                  return (
                    sum +
                    Number(entry.debit_amount || 0) -
                    Number(entry.credit_amount || 0)
                  );
                }, 0) || 0;

              return (
                <tr key={m.id}>
                  <td>M{m.member_number}</td>
                  <td>
                    <a href={`/members/${m.id}`}>
                      <strong>
                        {m.english_first_name} {m.english_surname}
                      </strong>
                    </a>
                  </td>
                  <td dir="rtl">
                    {m.hebrew_first_name} {m.hebrew_surname}
                  </td>
                  <td>{m.email || "-"}</td>
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