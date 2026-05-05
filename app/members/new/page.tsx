export default function NewMemberPage() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "700px" }}>
      <h1>Add Member</h1>
      <p>Create a new member record.</p>

      <form style={{ display: "grid", gap: "16px", marginTop: "30px" }}>
        <input placeholder="English first name" />
        <input placeholder="English surname" />
        <input placeholder="Hebrew first name" dir="rtl" />
        <input placeholder="Hebrew surname" dir="rtl" />
        <input placeholder="Father’s Hebrew first name" dir="rtl" />
        <input placeholder="Address" />
        <input placeholder="Phone" />
        <input placeholder="Email" />
        <select>
          <option>Membership Type</option>
          <option>Full</option>
          <option>Family</option>
          <option>Pensioner</option>
        </select>
        <select>
          <option>Preferred Language</option>
          <option>English</option>
          <option>Hebrew</option>
        </select>
        <select>
          <option>Status</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Resigned</option>
          <option>Deceased</option>
        </select>
        <textarea placeholder="Notes" rows={4} />
        <button type="submit" style={{ padding: "12px 18px" }}>
          Save Member
        </button>
      </form>
    </main>
  );
}
