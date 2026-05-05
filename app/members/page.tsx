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
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>Members</h1>
      <p>Admin member list.</p>

      <button style={{ margin: "20px 0", padding: "10px 16px" }}>
        Add Member
      </button>

      <table border={1} cellPadding={10} cellSpacing={0}>
        <thead>
          <tr>
            <th>Member ID</th>
            <th>English Name</th>
            <th>Hebrew Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Membership Type</th>
            <th>Balance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.memberId}</td>
              <td>{member.englishName}</td>
              <td dir="rtl">{member.hebrewName}</td>
              <td>{member.phone}</td>
              <td>{member.email}</td>
              <td>{member.membershipType}</td>
              <td>£{member.balance.toFixed(2)}</td>
              <td>{member.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
