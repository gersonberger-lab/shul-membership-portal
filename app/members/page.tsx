export default function MembersPage() {
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

  return (
    <div className="page">
      <div className="header-row">
        <div>
          <h1>Members</h1>
          <p className="muted">Manage shul members</p>
        </div>

        <a href="/members/new">
          <button>Add Member</button>
        </a>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Name</th>
              <th>Hebrew</th>
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
                <td>{m.englishName}</td>
                <td dir="rtl">{m.hebrewName}</td>
                <td>{m.phone}</td>
                <td>{m.email}</td>
                <td>{m.membershipType}</td>
                <td className="balance">£{m.balance}</td>
                <td>{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
