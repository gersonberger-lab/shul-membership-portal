export default function SettingsPage() {
  return (
    <>
      <section className="hero">
        <span className="eyebrow">Admin settings</span>
        <h1>Settings</h1>
        <p>Manage the setup lists that control charges, payments and future diary features.</p>
      </section>

      <section className="dashboard-grid">
        <a className="card settings-card" href="/settings/categories">
          <h3 className="section-title">Charge Categories</h3>
          <p className="muted">Manage charge groups, items, default amounts and due dates.</p>
        </a>

        <a className="card settings-card" href="/settings/payment-methods">
          <h3 className="section-title">Payment Methods</h3>
          <p className="muted">Manage cash, bank transfer, card and voucher payment methods.</p>
        </a>

        <a className="card settings-card" href="/settings/bank-details">
          <h3 className="section-title">Bank Details</h3>
          <p className="muted">Manage the bank transfer details shown to members in the payment portal.</p>
        </a>

        <a className="card settings-card" href="/settings/communications">
          <h3 className="section-title">Communications</h3>
          <p className="muted">Prepare statement emails, reminders, receipts and member notifications.</p>
        </a>

        <a className="card settings-card" href="/diary">
          <h3 className="section-title">Diary & Yahrzeits</h3>
          <p className="muted">Set up Hebrew-date diary records and reminders.</p>
        </a>
      </section>
    </>
  );
}
