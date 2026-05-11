"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function NewMemberPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    hebrew_first_name: "",
    hebrew_surname: "",
    fathers_hebrew_first_name: "",
    email: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.hebrew_first_name.trim() || !form.hebrew_surname.trim()) {
      alert("Please enter Hebrew first name and surname.");
      return;
    }

    const { error } = await supabase.from("members").insert([
      {
        ...form,
        english_first_name: form.hebrew_first_name.trim(),
        english_surname: form.hebrew_surname.trim(),
        status: "active",
      },
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push("/members");
    }
  };

  return (
    <>
      <section className="hero">
        <h1>Add Member</h1>
        <p>Enter the member name in Hebrew only.</p>
      </section>

      <section className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Hebrew first name *</label>
            <input name="hebrew_first_name" dir="rtl" lang="he" onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Hebrew surname *</label>
            <input name="hebrew_surname" dir="rtl" lang="he" onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Father’s Hebrew name</label>
            <input name="fathers_hebrew_first_name" dir="rtl" lang="he" onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Email</label>
            <input name="email" type="email" onChange={handleChange} />
          </div>

          <div className="form-field full">
            <button type="submit">Save Member</button>
          </div>
        </form>
      </section>
    </>
  );
}
