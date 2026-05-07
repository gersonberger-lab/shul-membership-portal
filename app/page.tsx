import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

function formatMoney(amount: number) {
  return `£${amount.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "2-digit",
  });
}

function buildMonths(monthCount: number) {
  const months: string[] = [];
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthCount + 1, 1);

  for (let i = 0; i < monthCount; i++) {
    const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
    months.push(monthKey(date));
  }

  return months;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const range = resolvedSearchParams.range || "12";
  const monthCount = range === "6" ? 6 : 12;

  const months = buildMonths(monthCount);
  const firstMonth = months[0];
  const startDate = `${firstMonth}-01`;

  const { data: entries } = await supabase
    .from("ledger_entries")
    .select("entry_date, debit_amount, credit_amount, entry_type")
    .gte("entry_date", startDate)
    .order("entry_date", { ascending: true });

  const monthly = months.map((key) => ({
    key,
    label: monthLabel(key),
    invoiced: 0,
    paid: 0,
  }));

  entries?.forEach((entry) => {
    if (!entry.entry_date) return;

    const key = String(entry.entry_date).slice(0, 7);
    const month = monthly.find((m) => m.key === key);
    if (!month) return;

    month.invoiced += Number(entry.debit_amount || 0);
    month.paid += Number(entry.credit_amount || 0);
  });

  const totalInvoiced = monthly.reduce((sum, month) => sum + month.invoiced, 0);
  const totalPaid = monthly.reduce((sum, month) => sum + month.paid, 0);
  const outstanding = totalInvoiced - totalPaid;
  const maxInvoiced = Math.max(...monthly.map((month) => month.invoiced), 1);

  return (
    <>
      <section className="hero">
        <span className="eyebrow">Dashboard</span>
        <h1>Invoicing Overview</h1>
        <p>Track charges raised, payments received and outstanding movement over time.</p>

        <div className="hero-actions">
          <a className={range === "6" ? "button" : "button secondary"} href="/?range=6">
            6 Months
          </a>
          <a className={range !== "6" ? "button" : "button secondary"} href="/?range=12">
            12 Months
          </a>
        </div>
      </section>

      <section className="dashboard-stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <span>Total Invoiced</span>
          <strong>{formatMoney(totalInvoiced)}</strong>
        </div>

        <div className="stat-card">
          <span>Payments Received</span>
          <strong>{formatMoney(totalPaid)}</strong>
        </div>

        <div className="stat-card">
          <span>Net Outstanding</span>
          <strong>{formatMoney(outstanding)}</strong>
        </div>

        <div className="stat-card">
          <span>Timeline</span>
          <strong>{monthCount} months</strong>
        </div>
      </section>

      <section className="card">
        <div className="statement-header">
          <div>
            <h3 className="section-title">Monthly Invoicing</h3>
            <p className="muted">Charges raised by month for the selected period.</p>
          </div>
        </div>

        <div className="invoice-chart" aria-label="Monthly invoicing chart">
          {monthly.map((month) => {
            const height = Math.max((month.invoiced / maxInvoiced) * 180, month.invoiced ? 16 : 4);

            return (
              <div className="invoice-chart-column" key={month.key}>
                <div className="invoice-chart-value">
                  {month.invoiced ? formatMoney(month.invoiced) : "£0"}
                </div>
                <div className="invoice-chart-bar-wrap">
                  <div
                    className="invoice-chart-bar"
                    style={{ height: `${height}px` }}
                  />
                </div>
                <div className="invoice-chart-label">{month.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card">
          <h3 className="section-title">Quick Actions</h3>
          <div className="quick-links">
            <a href="/members">Open Members</a>
            <a href="/charges/new">Add Charge</a>
            <a href="/payments/new">Add Payment</a>
            <a href="/settings/categories">Manage Categories</a>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Diary</h3>
          <p className="muted">Yahrzeits will be linked to member family records and calculated from Hebrew dates.</p>
        </div>

        <div className="card">
          <h3 className="section-title">Next</h3>
          <p className="muted">Upcoming work: category editing, recurring charges, yahrzeit diary and statement exports.</p>
        </div>
      </section>
    </>
  );
}
