import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MemberStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: memberId } = await params;

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("*")
    .eq("id", memberId)
    .single();

  const { data: ledgerEntries, error: ledgerError } = await supabase
    .from("ledger_entries")
    .select("*")
    .eq("member_id", memberId)
    .order("entry_date", { ascending: true })
    .order("created_at", { ascending: true });

  let runningBalance = 0;

  return (
    <>
      <section className="hero">
        <h1>
          {member?.english_first_name} {member?.english_surname}
        </h1>
        <p dir="rtl">
          {member?.hebrew_first_name} {member?.hebrew_surname}
        </p>
        <p>Member ID: {memberId}</p>
      </section>

      <section className="card">
        {memberError && <pre>{JSON.stringify(memberError, null, 2)}</pre>}
        {ledgerError && <pre>{JSON.stringify(ledgerError, null, 2)}</pre>}

        {!ledgerEntries?.length && (
          <p>No ledger entries found for this member yet.</p>
        )}

        {!!ledgerEntries?.length && (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Balance</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {ledgerEntries.map((entry) => {
                  const debit = Number(entry.debit_amount || 0);
                  const credit = Number(entry.credit_amount || 0);

                  runningBalance += debit - credit;

                  return (
                    <tr key={entry.id}>
                      <td>{entry.entry_date}</td>
                      <td>{entry.description}</td>
                      <td>{debit > 0 ? `£${debit.toFixed(2)}` : ""}</td>
                      <td>{credit > 0 ? `£${credit.toFixed(2)}` : ""}</td>
                      <td className="balance">£{runningBalance.toFixed(2)}</td>
                      <td><a className="button" href={`/ledger/${entry.id}/edit`}>Edit</a></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ marginTop: 24, fontSize: 22, fontWeight: 800 }}>
              Outstanding Balance: £{runningBalance.toFixed(2)}
            </div>
          </>
        )}
      </section>
    </>
  );
}
