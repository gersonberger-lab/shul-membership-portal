export default function NewMemberPage() {
  return (
    <>
      <section className="hero">
        <h1>Add Member</h1>
        <p>Create a member record with English and Hebrew details.</p>
      </section>

      <section className="card form-card">
        <form className="form-grid">
          <div className="form-field">
            <label>English first name</label>
            <input placeholder="e.g. Moshe" />
          </div>

          <div className="form-field">
            <label>English surname</label>
            <input placeholder="e.g. Cohen" />
          </div>

          <div className="form-field">
            <label>Hebrew first name</label>
            <input placeholder="למשל משה" dir="rtl" lang="he" />
          </div>

          <div className="form-field">
            <label>Hebrew surname</label>
            <input placeholder="למשל כהן" dir="rtl" lang="he" />
          </div>

          <div className="form-field">
            <label>Father’s Hebrew first name</label>
            <input placeholder="למשל אברהם" dir="rtl" lang="he" />
          </div>

          <div className="form-field">
            <label>Phone</label>
            <input placeholder="07700 900000" inputMode="tel" />
          </div>

          <div className="form-field">
            <label>Email</label>
            <input placeholder="member@example.com" type="email" />
          </div>

          <div className="form-field">
            <label>Membership type</label>
            <select defaultValue="">
              <option value="" disabled>Select membership type</option>
              <option>Full</option>
              <option>Family</option>
              <option>Pensioner</option>
            </select>
          </div>

          <div className="form-field">
            <label>Preferred language</label>
            <select defaultValue="">
              <option value="" disabled>Select language</option>
              <option>English</option>
              <option>Hebrew</option>
            </select>
          </div>

          <div className="form-field">
            <label>Status</label>
            <select defaultValue="Active">
              <option>Active</option>
              <option>Inactive</option>
              <option>Resigned</option>
              <option>Deceased</option>
            </select>
          </div>

          <div className="form-field full">
            <label>Address</label>
            <textarea placeholder="Full address" rows={3} />
          </div>

          <div className="form-field full">
            <label>Notes</label>
            <textarea placeholder="Internal notes" rows={4} />
          </div>

          <div className="form-field full">
            <button type="submit">Save Member</button>
          </div>
        </form>
      </section>
    </>
  );
}
