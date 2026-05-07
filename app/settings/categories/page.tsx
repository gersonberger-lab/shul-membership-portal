import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const { data: groups } = await supabase
    .from("charge_category_groups")
    .select(`
      id,
      name_en,
      name_he,
      charge_categories (
        id,
        name_en,
        name_he,
        default_amount,
        due_days,
        active
      )
    `)
    .order("name_en");

  return (
    <>
      <section className="hero">
        <span className="eyebrow">Settings</span>
        <h1>Charge Categories</h1>
        <p>Manage charge groups, charge items, default amounts and due dates.</p>

        <div className="hero-actions">
          <a className="button" href="/settings/categories/new-group">
            Add Group
          </a>

          <a className="button secondary" href="/settings/categories/new-item">
            Add Charge Item
          </a>
        </div>
      </section>

      <div style={{ display: "grid", gap: 22 }}>
        {groups?.map((group) => (
          <section key={group.id} className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div>
                <h3
                  className="section-title"
                  style={{
                    marginBottom: 0,
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span>{group.name_en}</span>

                  {!!group.name_he && (
                    <span
                      dir="rtl"
                      style={{
                        fontSize: "1em",
                        fontWeight: 800,
                        color: "#7a5a22",
                      }}
                    >
                      {group.name_he}
                    </span>
                  )}
                </h3>
              </div>
            </div>

            {!group.charge_categories?.length && (
              <p className="muted">No charge items yet.</p>
            )}

            {!!group.charge_categories?.length && (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Charge Item</th>
                      <th>Hebrew</th>
                      <th>Default Amount</th>
                      <th>Due Days</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {group.charge_categories.map((item: any) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name_en}</strong>
                        </td>

                        <td dir="rtl">{item.name_he || "-"}</td>

                        <td>
                          {item.default_amount
                            ? `£${Number(item.default_amount).toFixed(2)}`
                            : "-"}
                        </td>

                        <td>{item.due_days || 0}</td>

                        <td>
                          <span className="badge">
                            {item.active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <a
                            className="button secondary compact"
                            href={`/settings/categories/${item.id}/edit`}
                          >
                            Edit
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
