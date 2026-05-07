export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="dashboard-hero">
          <div>
            <span className="eyebrow">Private beta</span>
            <h1>Shul Membership Portal</h1>
            <p>
              Manage members, donations, charges, payments and statements
              from one central system.
            </p>

            <div className="hero-actions">
              <a className="button" href="/members">
                Open Members
              </a>

              <a className="button secondary" href="/members/new">
                Add Member
              </a>
            </div>
          </div>

          <div className="dashboard-stat-grid">
            <div className="stat-card">
              <span>Members</span>
              <strong>Live</strong>
            </div>

            <div className="stat-card">
              <span>Ledger</span>
              <strong>Active</strong>
            </div>

            <div className="stat-card">
              <span>Statements</span>
              <strong>Ready</strong>
            </div>

            <div className="stat-card">
              <span>Mobile</span>
              <strong>Responsive</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="card">
          <h3 className="section-title">Membership Management</h3>
          <p className="muted">
            Full member records with Hebrew names, balances, statements and
            account history.
          </p>

          <div className="feature-list">
            <div>Member accounts</div>
            <div>Family linking</div>
            <div>Hebrew names</div>
            <div>Yahrzeit support</div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Financial Tracking</h3>
          <p className="muted">
            Charges, payments, recurring billing and donation tracking.
          </p>

          <div className="feature-list">
            <div>Charges</div>
            <div>Payments</div>
            <div>Statements</div>
            <div>Audit history</div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Quick Actions</h3>

          <div className="quick-links">
            <a href="/charges/new">Add Charge</a>
            <a href="/payments/new">Add Payment</a>
            <a href="/members">View Members</a>
            <a href="/members/new">New Member</a>
          </div>
        </div>
      </section>
    </>
  );
}
