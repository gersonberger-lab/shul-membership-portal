import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const { data: members, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <section className="hero">
        <h1>Members</h1>
        <p>Live data from database</p>

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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {members?.map((m) => (
              <tr key={m.id}>
                <td>{m.member_number}</td>
                <td>
                  {m.english_first_name} {m.english_surname}
                </td>
                <td dir="rtl">
                  {m.hebrew_first_name} {m.hebrew_surname}
                </td>
                <td>{m.email}</td>
                <td className="balance">£0.00</td>
                <td>
                  <a className="button" href={`/ledger/${entry.id}/edit`}>
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
