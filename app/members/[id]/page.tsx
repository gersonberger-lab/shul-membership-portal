import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function MemberStatementPage({
  params,
}: {
  params: { id: string };
}) {
  const memberId = params.id;

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
      </section>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            {ledgerEntries?.map((entry) => {
              runningBalance += Number(entry.debit_amount) - Number(entry.credit_amount);

              return (
                <tr key={entry.id}>
                  <td>{entry.entry_date}</td>
                  <td>{entry.description}</td>
                  <td>{entry.debit_amount ? `£${Number(entry.debit_amount).toFixed(2)}` : ""}</td>
                  <td>{entry.credit_amount ? `£${Number(entry.credit_amount).toFixed(2)}` : ""}</td>
                  <td className="balance">£{runningBalance.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: 24, fontSize: 22, fontWeight: 800 }}>
          Outstanding Balance: £{runningBalance.toFixed(2)}
        </div>
      </section>
    </>
  );
}
