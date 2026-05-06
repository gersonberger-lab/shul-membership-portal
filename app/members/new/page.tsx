"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function NewMemberPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    english_first_name: "",
    english_surname: "",
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

    const { error } = await supabase.from("members").insert([
      {
        ...form,
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
      </section>

      <section className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>English first name</label>
            <input name="english_first_name" onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>English surname</label>
            <input name="english_surname" onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Hebrew first name</label>
            <input name="hebrew_first_name" dir="rtl" onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Hebrew surname</label>
            <input name="hebrew_surname" dir="rtl" onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Father’s Hebrew name</label>
            <input name="fathers_hebrew_first_name" dir="rtl" onChange={handleChange} />
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
