export default function PaymentSuccessPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f4f8fb", padding: 24, display: "grid", placeItems: "center" }}>
      <section style={{ background: "white", border: "1px solid #d9e4ec", borderRadius: 18, padding: 32, maxWidth: 620, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 54 }}>✅</div>
        <h1 style={{ marginBottom: 10 }}>Payment Received</h1>
        <p style={{ color: "#64748b" }}>
          Thank you. Your card payment was successfully processed.
        </p>
        <p style={{ color: "#64748b" }}>
          Your account statement will update after payment processing is completed.
        </p>
        <a href="/portal" style={{ display: "inline-flex", marginTop: 18, padding: "12px 16px", borderRadius: 10, background: "#2563eb", color: "white", fontWeight: 800 }}>
          Return to Portal
        </a>
      </section>
    </main>
  );
}
