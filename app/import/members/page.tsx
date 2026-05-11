"use client";

import { useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type ImportRow = {
  english_first_name: string;
  english_surname: string;
  hebrew_first_name: string;
  hebrew_surname: string;
  email: string;
  phone: string;
  address: string;
  opening_balance: string;
};

const sampleCsv = `english_first_name,english_surname,hebrew_first_name,hebrew_surname,email,phone,address,opening_balance
Moshe,Cohen,משה,כהן,moshe@example.com,07700123456,"1 Example Road, London",125.00`;

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseCsv(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    return {
      english_first_name: row.english_first_name || "",
      english_surname: row.english_surname || "",
      hebrew_first_name: row.hebrew_first_name || "",
      hebrew_surname: row.hebrew_surname || "",
      email: row.email || "",
      phone: row.phone || "",
      address: row.address || "",
      opening_balance: row.opening_balance || "0",
    };
  });
}

export default function MemberImportPage() {
  const [csvText, setCsvText] = useState(sampleCsv);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState("");

  const rows = useMemo(() => parseCsv(csvText), [csvText]);

  const validRows = rows.filter((row) => row.english_first_name.trim() && row.english_surname.trim());
  const totalOpeningBalance = validRows.reduce((sum, row) => sum + Number(row.opening_balance || 0), 0);

  async function runImport() {
    if (!validRows.length) {
      alert("No valid rows to import.");
      return;
    }

    const confirmed = window.confirm(`Import ${validRows.length} members?`);
    if (!confirmed) return;

    setImporting(true);
    setResult("");

    let created = 0;
    let skipped = 0;
    let balances = 0;
    const errors: string[] = [];

    for (const row of validRows) {
      try {
        let existingMember = null;

        if (row.email.trim()) {
          const { data } = await supabase
            .from("members")
            .select("id")
            .ilike("email", row.email.trim())
            .maybeSingle();

          existingMember = data;
        }

        if (existingMember) {
          skipped++;
          continue;
        }

        const { data: memberData, error: memberError } = await supabase
          .from("members")
          .insert([
            {
              english_first_name: row.english_first_name.trim(),
              english_surname: row.english_surname.trim(),
              hebrew_first_name: row.hebrew_first_name.trim() || null,
              hebrew_surname: row.hebrew_surname.trim() || null,
              email: row.email.trim() || null,
              phone: row.phone.trim() || null,
              address: row.address.trim() || null,
            },
          ])
          .select("id")
          .single();

        if (memberError) {
          errors.push(`${row.english_first_name} ${row.english_surname}: ${memberError.message}`);
          continue;
        }

        created++;

        const openingBalance = Number(row.opening_balance || 0);

        if (openingBalance !== 0 && memberData?.id) {
          const isDebit = openingBalance > 0;

          const { error: ledgerError } = await supabase.from("ledger_entries").insert([
            {
              member_id: memberData.id,
              entry_date: new Date().toISOString().split("T")[0],
              entry_type: "opening_balance",
              description: "יתרת פתיחה",
              debit_amount: isDebit ? openingBalance : 0,
              credit_amount: isDebit ? 0 : Math.abs(openingBalance),
              status: "posted",
            },
          ]);

          if (ledgerError) {
            errors.push(`${row.english_first_name} ${row.english_surname}: opening balance failed - ${ledgerError.message}`);
          } else {
            balances++;
          }
        }
      } catch (error: any) {
        errors.push(`${row.english_first_name} ${row.english_surname}: ${error.message}`);
      }
    }

    setImporting(false);
    setResult(`Created: ${created}. Skipped existing: ${skipped}. Opening balances posted: ${balances}.${errors.length ? ` Errors: ${errors.join(" | ")}` : ""}`);
  }

  return (
    <>
      <section className="hero compact-hero">
        <span className="eyebrow">Import</span>
        <h1>Import Members</h1>
        <p>Paste CSV data to create members and post their opening balances.</p>
      </section>

      <section className="card" style={{ marginBottom: 22 }}>
        <h3 className="section-title">CSV format</h3>
        <p className="muted">Use these column headings exactly:</p>
        <div className="quick-links">
          <div>english_first_name</div>
          <div>english_surname</div>
          <div>hebrew_first_name</div>
          <div>hebrew_surname</div>
          <div>email</div>
          <div>phone</div>
          <div>address</div>
          <div>opening_balance</div>
        </div>
      </section>

      <section className="account-grid">
        <div className="card form-card">
          <h3 className="section-title">Paste CSV</h3>
          <div className="form-field">
            <label>CSV data</label>
            <textarea
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
              rows={16}
              spellCheck={false}
            />
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <button type="button" onClick={runImport} disabled={importing}>
              {importing ? "Importing..." : "Import Members"}
            </button>
            <button type="button" className="button secondary" onClick={() => setCsvText(sampleCsv)}>
              Load Sample
            </button>
          </div>

          {result && <p className="muted" style={{ marginTop: 16 }}>{result}</p>}
        </div>

        <div className="card">
          <h3 className="section-title">Preview</h3>
          <div className="detail-list">
            <div>
              <span>Rows found</span>
              <strong>{rows.length}</strong>
            </div>
            <div>
              <span>Valid members</span>
              <strong>{validRows.length}</strong>
            </div>
            <div>
              <span>Total opening balances</span>
              <strong>£{totalOpeningBalance.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="section-title">Preview rows</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Hebrew</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Opening Balance</th>
              </tr>
            </thead>
            <tbody>
              {validRows.slice(0, 50).map((row, index) => (
                <tr key={`${row.email}-${index}`}>
                  <td>{row.english_first_name} {row.english_surname}</td>
                  <td dir="rtl">{row.hebrew_first_name} {row.hebrew_surname}</td>
                  <td>{row.email}</td>
                  <td>{row.phone}</td>
                  <td>£{Number(row.opening_balance || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
