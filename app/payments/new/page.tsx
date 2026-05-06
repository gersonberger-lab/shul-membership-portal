const paymentMethods = [
  "Cash",
  "Cheque",
  "Bank Transfer",
  "Card",
  "Direct Debit",
  "Standing Order",
  "AAC Voucher",
  "Tevini Voucher",
  "Other Charity Voucher",
];

export default function NewPaymentPage() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "750px" }}>
      <h1>Add Payment</h1>
      <p>Record a payment against a member statement.</p>

      <form style={{ display: "grid", gap: "16px", marginTop: "30px" }}>
        <input placeholder="Search member, e.g. Moshe Cohen" />

        <input placeholder="Payment amount" type="number" step="0.01" />

        <input placeholder="Payment date" type="date" />

        <select defaultValue="">
          <option value="" disabled>
            Payment method
          </option>
          {paymentMethods.map((method) => (
            <option key={method}>{method}</option>
          ))}
        </select>

        <input placeholder="Reference / voucher number / cheque number" />

        <textarea placeholder="Notes" rows={3} />

        <button type="submit" style={{ padding: "12px 18px" }}>
          Save Payment
        </button>
      </form>
    </main>
  );
}
