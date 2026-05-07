"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";
import HebrewKeyboardInput from "../../../../components/HebrewKeyboardInput";

export default function EditChargeItemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name_en: "",
    name_he: "",
    default_amount: "",
    due_days: "0",
    active: true,
  });

  useEffect(() => {
    async function loadItem() {
      const { data } = await supabase
        .from("charge_categories")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setForm({
          name_en: data.name_en || "",
          name_he: data.name_he || "",
          default_amount: data.default_amount?.toString() || "",
          due_days: data.due_days?.toString() || "0",
          active: !!data.active,
        });
      }

      setLoading(false);
    }

    loadItem();
  }, [id]);

  const setField = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const save = async (e: any) => {
    e.preventDefault();

    setSaving(true);

    const { error } = await supabase
      .from("charge_categories")
      .update({
        name_en: form.name_en,
        name_he: form.name_he || null,
        default_amount: form.default_amount
          ? Number(form.default_amount)
          : null,
        due_days: Number(form.due_days || 0),
        active: form.active,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/settings/categories");
  };

  const deleteItem = async () => {
    const confirmed = confirm("Delete this charge item?");

    if (!confirmed) return;

    const { error } = await supabase
      .from("charge_categories")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/settings/categories");
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <>
      <section className="hero">
        <span className="eyebrow">Settings</span>
        <h1>Edit Charge Item</h1>
      </section>

      <section className="card form-card">
        <form className="form-grid" onSubmit={save}>
          <div className="form-field">
            <label>English Name</label>
            <input
              value={form.name_en}
              onChange={(e) => setField("name_en", e.target.value)}
            />
          </div>

          <HebrewKeyboardInput
            label="Hebrew Name"
            name="name_he"
            value={form.name_he}
            onChange={setField}
          />

          <div className="form-field">
            <label>Default Amount</label>
            <input
              type="number"
              step="0.01"
              value={form.default_amount}
              onChange={(e) => setField("default_amount", e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Due Days</label>
            <input
              type="number"
              value={form.due_days}
              onChange={(e) => setField("due_days", e.target.value)}
            />
          </div>

          <div className="form-field full">
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setField("active", e.target.checked)}
              />
              Active
            </label>
          </div>

          <div className="form-field full" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              className="button secondary"
              onClick={deleteItem}
            >
              Delete Item
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
