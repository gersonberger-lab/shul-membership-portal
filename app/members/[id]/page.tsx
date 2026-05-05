const ledgerEntries = [
  {
    id: 1,
    date: "01/01/2026",
    description: "Membership - Annual",
    debit: 500,
    credit: 0,
  },
  {
    id: 2,
    date: "05/01/2026",
    description: "Bank transfer payment",
    debit: 0,
    credit: 200,
  },
  {
    id: 3,
    date: "10/01/2026",
    description: "Aliyos - Shlishi",
    debit: 50,
    credit: 0,
  },
];

export default function MemberStatementPage() {
  let runningBalance = 0;

  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>Member Statement</h1>

      <section style={{ marginBottom: "30px" }}>
        <h2>Moshe Cohen</h2>
        <p dir="rtl">משה כהן</p>
        <p>Member ID: M001</p>
      </section>

      <table border={1} cellPadding={10} cellSpacing={0}>
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
          {ledgerEntries.map((entry) => {
            runningBalance += entry.debit - entry.credit;

            return (
              <tr key={entry.id}>
                <td>{entry.date}</td>
                <td>{entry.description}</td>
                <td>{entry.debit ? `£${entry.debit.toFixed(2)}` : ""}</td>
                <td>{entry.credit ? `£${entry.credit.toFixed(2)}` : ""}</td>
                <td>£{runningBalance.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 style={{ marginTop: "30px" }}>
        Outstanding Balance: £{runningBalance.toFixed(2)}
      </h2>
    </main>
  );
}
