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
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <h1>
              {member?.english_first_name} {member?.english_surname}
            </h1>

            <p className="hebrew-title" dir="rtl">
              {member?.hebrew_first_name} {member?.hebrew_surname}
            </p>

            <p>Member No. {member?.member_number}</p>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
            <a className="button secondary" href={`/members/${memberId}/edit`}>
              Edit Member
            </a>
            <a className="button" href={`/charges/new?member=${memberId}`}>
              Add Charge
            </a>
            <a className="button" href={`/payments/new?member=${memberId}`}>
              Add Payment
            </a>
          </div>
        </div>
      </section>

      <section className="account-grid">
        <div className="card">
          <h3 className="section-title">Member Details</h3>

          <div className="detail-list">
            <div>
              <span>Email</span>
              <strong>{member?.email || "-"}</strong>
            </div>
            <div>
              <span>Phone</span>
              <strong>{member?.phone || "-"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{member?.status || "-"}</strong>
            </div>
            <div>
              <span>Preferred Language</span>
              <strong>{member?.preferred_language || "-"}</strong>
            </div>
            <div>
              <span>Father’s Hebrew Name</span>
              <strong dir="rtl">{member?.fathers_hebrew_first_name || "-"}</strong>
            </div>
            <div>
              <span>Address</span>
              <strong>{member?.address || "-"}</strong>
            </div>
          </div>
        </div>

        <div className="card summary-card">
          <h3 className="section-title">Account Summary</h3>

          <div className="big-balance">£{balance.toFixed(2)}</div>
          <p className="muted">Outstanding Balance</p>

          <div className="summary-row">
            <div>
              <span>Total Charges</span>
              <strong>£{totalCharges.toFixed(2)}</strong>
            </div>
            <div>
              <span>Total Payments</span>
              <strong>£{totalPayments.toFixed(2)}</strong>
            </div>
            <div>
              <span>Entries</span>
              <strong>{ledgerEntries?.length || 0}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="statement-header">
          <div>
            <h3 className="section-title">Statement</h3>
            <p className="muted">Charges and payments posted to this account.</p>
          </div>
        </div>

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
                      <a className="button secondary" href={`/ledger/${entry.id}/edit`}>
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
