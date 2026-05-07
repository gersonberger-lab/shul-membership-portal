"use client";

import { useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function NewCategoryGroupPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name_en: "",
    name_he: "",
    sort_order: "0",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.name_en.trim()) {
      alert("Please enter a group name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("charge_category_groups").insert([
      {
        name_en: form.name_en.trim(),
        name_he: form.name_he.trim() || null,
        sort_order: Number(form.sort_order || 0),
        active: true,
      },
    ]);

    setSaving(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push("/settings/categories");
    }
  };

  return (
    <>
      <section className="hero">
        <span className="eyebrow">Settings</span>
        <h1>Add Category Group</h1>
        <p>Examples: Membership, Aliyos, Seats, Building Fund.</p>
      </section>

      <section className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>English group name *</label>
            <input
              name="name_en"
              value={form.name_en}
              onChange={handleChange}
              placeholder="e.g. Aliyos"
              required
            />
          </div>

          <div className="form-field">
            <label>Hebrew group name</label>
            <input
              name="name_he"
              value={form.name_he}
              onChange={handleChange}
              placeholder="e.g. עליות"
              dir="rtl"
              lang="he"
            />
          </div>

          <div className="form-field">
            <label>Sort order</label>
            <input
              name="sort_order"
              type="number"
              value={form.sort_order}
              onChange={handleChange}
            />
          </div>

          <div className="form-field full" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Group"}
            </button>

            <a className="button secondary" href="/settings/categories">
              Cancel
            </a>
          </div>
        </form>
      </section>
    </>
  );
}
