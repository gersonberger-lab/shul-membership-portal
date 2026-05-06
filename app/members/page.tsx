const members = [
  {
    id: 1,
    memberId: "M001",
    englishName: "Moshe Cohen",
    hebrewName: "משה כהן",
    phone: "07700 900001",
    email: "moshe@example.com",
    membershipType: "Full",
    balance: 350,
    status: "Active",
  },
  {
    id: 2,
    memberId: "M002",
    englishName: "Yaakov Levy",
    hebrewName: "יעקב לוי",
    phone: "07700 900002",
    email: "yaakov@example.com",
    membershipType: "Family",
    balance: 120,
    status: "Active",
  },
];

export default function MembersPage() {
  return (
    <>
      <section className="hero">
        <h1>Members</h1>
        <p>Manage members, balances, contact details and portal access.</p>

        <div className="actions">
          <a className="button" href="/members/new">Add Member</a>
          <a className="button secondary" href="/charges/new">Add Charge</a>
        </div>
      </section>

      <section className="stats">
        <div className="stat-card">
          <div className="stat-label">Active Members</div>
          <div className="stat-value">2</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Outstanding</div>
          <div className="stat-value">£470</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Portal Users</div>
          <div className="stat-value">0</div>
        </div>
      </section>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Name</th>
              <th>Hebrew Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Type</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.memberId}</td>
                <td>
                  <a href={`/members/${m.id}`}>
                    <strong>{m.englishName}</strong>
                  </a>
                </td>
                <td className="hebrew" dir="rtl">{m.hebrewName}</td>
                <td>{m.phone}</td>
                <td>{m.email}</td>
                <td>{m.membershipType}</td>
                <td className="balance">£{m.balance.toFixed(2)}</td>
                <td><span className="badge">{m.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
