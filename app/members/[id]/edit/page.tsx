"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    english_first_name: "",
    english_surname: "",
    hebrew_first_name: "",
    hebrew_surname: "",
    fathers_hebrew_first_name: "",
    address: "",
    phone: "",
    email: "",
    preferred_language: "english",
    status: "active",
    notes: "",
  });

  useEffect(() => {
    async function loadMember() {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", memberId)
        .single();

      if (error) {
        alert("Error loading member: " + error.message);
        return;
      }

      setForm({
        english_first_name: data.english_first_name || "",
        english_surname: data.english_surname || "",
        hebrew_first_name: data.hebrew_first_name || "",
        hebrew_surname: data.hebrew_surname || "",
        fathers_hebrew_first_name: data.fathers_hebrew_first_name || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        preferred_language: data.preferred_language || "english",
        status: data.status || "active",
        notes: data.notes || "",
      });
    }

    if (memberId) loadMember();
  }, [memberId]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: any) => {
    e.preventDefault();

    if (!form.english_first_name.trim() || !form.english_surname.trim()) {
      alert("Please enter English first name and surname.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("members")
      .update({
        ...form,
        english_first_name: form.english_first_name.trim(),
        english_surname: form.english_surname.trim(),
        email: form.email.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId);

    setSaving(false);

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      router.push(`/members/${memberId}`);
    }
  };

  return (
    <>
      <section className="hero">
        <h1>Edit Member</h1>
        <p>Update member personal and Hebrew details.</p>
      </section>

      <section className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="form-field">
            <label>English first name *</label>
            <input name="english_first_name" value={form.english_first_name} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>English surname *</label>
            <input name="english_surname" value={form.english_surname} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Hebrew first name</label>
            <input name="hebrew_first_name" value={form.hebrew_first_name} dir="rtl" lang="he" onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Hebrew surname</label>
            <input name="hebrew_surname" value={form.hebrew_surname} dir="rtl" lang="he" onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Father’s Hebrew first name</label>
            <input name="fathers_hebrew_first_name" value={form.fathers_hebrew_first_name} dir="rtl" lang="he" onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Phone</label>
            <input name="phone" value={form.phone} inputMode="tel" onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Preferred language</label>
            <select name="preferred_language" value={form.preferred_language} onChange={handleChange}>
              <option value="english">English</option>
              <option value="hebrew">Hebrew</option>
            </select>
          </div>

          <div className="form-field">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="resigned">Resigned</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>

          <div className="form-field full">
            <label>Address</label>
            <textarea name="address" value={form.address} rows={3} onChange={handleChange} />
          </div>

          <div className="form-field full">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} rows={4} onChange={handleChange} />
          </div>

          <div className="form-field full" style={{ display: "flex", gap: 12 }}>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Member"}
            </button>

            <a className="button" href={`/members/${memberId}`}>
              Cancel
            </a>
          </div>
        </form>
      </section>
    </>
  );
}