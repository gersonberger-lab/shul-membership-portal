import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MembersPage() {
  const { data: members, error } = await supabase
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

  return (
    <>
      <section className="hero">
        <h1>Members</h1>
        <p>Live members and balances</p>

        <div style={{ marginTop: 20 }}>
          <a className="button" href="/members/new">Add Member</a>
        </div>
      </section>

      <section className="card">
        {error && (
          <pre style={{ color: "red" }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        )}

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
            {members?.map((m) => {
              const balance =
                m.ledger_entries?.reduce((sum: number, entry: any) => {
                  return sum + Number(entry.debit_amount || 0) - Number(entry.credit_amount || 0);
                }, 0) || 0;

              return (
                <tr key={m.id}>
                  <td>{m.member_number}</td>
                  <td>
                    <a href={`/members/${m.id}`}>
                      {m.english_first_name} {m.english_surname}
                    </a>
                  </td>
                  <td dir="rtl">
                    {m.hebrew_first_name} {m.hebrew_surname}
                  </td>
                  <td>{m.email}</td>
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
