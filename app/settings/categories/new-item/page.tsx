"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

type Group = {
  id: string;
  name_en: string;
  name_he: string | null;
};

export default function NewChargeItemPage() {
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    charge_category_group_id: "",
    name_en: "",
    name_he: "",
    default_amount: "",
    due_days: "0",
    search_terms: "",
  });

  useEffect(() => {
    async function loadGroups() {
      const { data } = await supabase
        .from("charge_category_groups")
        .select("id, name_en, name_he")
        .eq("active", true)
        .order("name_en");

      setGroups(data || []);
    }

    loadGroups();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.charge_category_group_id || !form.name_en.trim()) {
      alert("Please complete the required fields.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("charge_categories").insert([
      {
        charge_category_group_id: form.charge_category_group_id,
        name_en: form.name_en.trim(),
        name_he: form.name_he.trim() || null,
        default_amount: form.default_amount
          ? Number(form.default_amount)
          : null,
        due_days: Number(form.due_days || 0),
        search_terms: form.search_terms.trim() || null,
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
        <h1>Add Charge Item</h1>
        <p>Create a charge item that can later be selected when posting charges.</p>
      </section>

      <section className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field full">
            <label>Category group *</label>
            <select
              name="charge_category_group_id"
              value={form.charge_category_group_id}
              onChange={handleChange}
              required
            >
              <option value="">Select group...</option>

              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>English charge item *</label>
            <input
              name="name_en"
              value={form.name_en}
              onChange={handleChange}
              placeholder="e.g. Shlishi"
              required
            />
          </div>

          <div className="form-field">
            <label>Hebrew charge item</label>
            <input
              name="name_he"
              value={form.name_he}
              onChange={handleChange}
              placeholder="e.g. שלישי"
              dir="rtl"
              lang="he"
            />
          </div>

          <div className="form-field">
            <label>Default amount</label>
            <input
              name="default_amount"
              type="number"
              step="0.01"
              min="0"
              value={form.default_amount}
              onChange={handleChange}
              placeholder="e.g. 180"
            />
          </div>

          <div className="form-field">
            <label>Due days</label>
            <input
              name="due_days"
              type="number"
              value={form.due_days}
              onChange={handleChange}
            />
          </div>

          <div className="form-field full">
            <label>Search terms</label>
            <input
              name="search_terms"
              value={form.search_terms}
              onChange={handleChange}
              placeholder="e.g. aliyah aliya עליה shlishi"
            />
          </div>

          <div className="form-field full" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Charge Item"}
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
