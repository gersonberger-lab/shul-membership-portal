const chargeItems = [
  { id: 1, name: "Membership - Annual", defaultAmount: 500, dueDays: 30 },
  { id: 2, name: "Aliyos - Shlishi", defaultAmount: 50, dueDays: 0 },
  { id: 3, name: "Aliyos - Chamishi", defaultAmount: 50, dueDays: 0 },
  { id: 4, name: "Seats - Yamim Noraim", defaultAmount: 250, dueDays: 14 },
  { id: 5, name: "Building Fund - General", defaultAmount: 100, dueDays: 30 },
];

export default function NewChargePage() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "750px" }}>
      <h1>Add Charge</h1>
      <p>Post a new charge to a member statement.</p>

      <form style={{ display: "grid", gap: "16px", marginTop: "30px" }}>
        <input placeholder="Search member, e.g. Moshe Cohen" />

        <input
          placeholder="Search charge item, e.g. Shlishi"
          list="charge-items"
        />

        <datalist id="charge-items">
          {chargeItems.map((item) => (
            <option
              key={item.id}
              value={item.name}
              label={`Default GBP ${item.defaultAmount} | Due ${item.dueDays} days`}
            />
          ))}
        </datalist>

        <input placeholder="Amount" type="number" step="0.01" />
        <input placeholder="Charge date" type="date" />
        <input placeholder="Due date" type="date" />

        <textarea placeholder="Public note shown to member" rows={3} />
        <textarea placeholder="Internal note" rows={3} />

        <label>
          <input type="checkbox" defaultChecked /> Send email / statement update
        </label>

        <button type="submit" style={{ padding: "12px 18px" }}>
          Save Charge
        </button>
      </form>
    </main>
  );
}
