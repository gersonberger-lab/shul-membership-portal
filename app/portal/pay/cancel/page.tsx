export default function PaymentCancelPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f4f8fb", padding: 24, display: "grid", placeItems: "center" }}>
      <section style={{ background: "white", border: "1px solid #d9e4ec", borderRadius: 18, padding: 32, maxWidth: 620, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 54 }}>⚠️</div>
        <h1 style={{ marginBottom: 10 }}>Payment Cancelled</h1>
        <p style={{ color: "#64748b" }}>
          Your card payment was cancelled before completion.
        </p>
        <a href="/portal/pay" style={{ display: "inline-flex", marginTop: 18, padding: "12px 16px", borderRadius: 10, background: "#2563eb", color: "white", fontWeight: 800 }}>
          Try Again
        </a>
      </section>
    </main>
  );
}
