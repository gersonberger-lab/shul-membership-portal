import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MemberAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: memberId } = await params;

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", memberId)
    .single();

  const { data: ledgerEntries } = await supabase
    .from("ledger_entries")
    .select("*")
    .eq("member_id", memberId)
    .order("entry_date", { ascending: true })
    .order("created_at", { ascending: true });

  const totalCharges =
    ledgerEntries?.reduce((sum, e) => sum + Number(e.debit_amount || 0), 0) || 0;

  const totalPayments =
    ledgerEntries?.reduce((sum, e) => sum + Number(e.credit_amount || 0), 0) || 0;

  const balance = totalCharges - totalPayments;

  return (
    <>
      <section className="hero">
        <h1>
          {member?.english_first_name} {member?.english_surname}
        </h1>
        <p dir="rtl">
          {member?.hebrew_first_name} {member?.hebrew_surname}
        </p>

        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a className="button" href="/charges/new">Add Charge</a>
          <a className="button" href="/payments/new">Add Payment</a>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Member Details</h3>
          <p><strong>Member No:</strong> {member?.member_number}</p>
          <p><strong>Email:</strong> {member?.email || "-"}</p>
          <p><strong>Phone:</strong> {member?.phone || "-"}</p>
          <p><strong>Status:</strong> {member?.status || "-"}</p>
          <p><strong>Language:</strong> {member?.preferred_language || "-"}</p>
          <p><strong>Address:</strong><br />{member?.address || "-"}</p>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Account Summary</h3>
          <p style={{ fontSize: 34, fontWeight: 800, margin: 0 }}>
            £{balance.toFixed(2)}
          </p>
          <p style={{ color: "#64748b", marginTop: 8 }}>Outstanding Balance</p>

          <div style={{ display: "flex", gap: 24, marginTop: 22, flexWrap: "wrap" }}>
            <div>
              <strong>£{totalCharges.toFixed(2)}</strong>
              <p style={{ margin: "4px 0", color: "#64748b" }}>Total Charges</p>
            </div>
            <div>
              <strong>£{totalPayments.toFixed(2)}</strong>
              <p style={{ margin: "4px 0", color: "#64748b" }}>Total Payments</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Statement</h3>

        {!ledgerEntries?.length && <p>No ledger entries yet.</p>}

        {!!ledgerEntries?.length && (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Charge</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {ledgerEntries.map((entry) => {
                const debit = Number(entry.debit_amount || 0);
                const credit = Number(entry.credit_amount || 0);

                return (
                  <tr key={entry.id}>
                    <td>{entry.entry_date}</td>
                    <td>{entry.description}</td>
                    <td>{debit > 0 ? `£${debit.toFixed(2)}` : ""}</td>
                    <td>{credit > 0 ? `£${credit.toFixed(2)}` : ""}</td>
                    <td>
                      <a className="button" href={`/ledger/${entry.id}/edit`}>
                        Edit
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
