"use client";

import { useState } from "react";

type TemplateKey = "newCharge" | "statement" | "receipt" | "reminder";

type Template = {
  title: string;
  description: string;
  subject: string;
  body: string;
};

const defaultTemplates: Record<TemplateKey, Template> = {
  newCharge: {
    title: "New Charge Notice",
    description: "Sent when you want to notify a member about a newly added charge.",
    subject: "New item added to your shul account",
    body: "Dear {{member_name}},\n\nA new item has been added to your shul account:\n\n{{charge_description}}\nAmount: {{amount}}\n\nYour current balance is {{balance}}.\n\nYou can view your account or make a payment here:\n{{portal_link}}\n\nKind regards,\nThe Shul Office",
  },
  statement: {
    title: "Statement Email",
    description: "Sent when sending a member their account statement.",
    subject: "Your shul account statement",
    body: "Dear {{member_name}},\n\nPlease find below your current shul account summary.\n\nCurrent balance: {{balance}}\n\nYou can view your full statement and make a payment here:\n{{portal_link}}\n\nKind regards,\nThe Shul Office",
  },
  receipt: {
    title: "Payment Receipt",
    description: "Sent after a payment is received or confirmed.",
    subject: "Payment received - thank you",
    body: "Dear {{member_name}},\n\nThank you. We have received your payment of {{amount}}.\n\nYour updated balance is {{balance}}.\n\nKind regards,\nThe Shul Office",
  },
  reminder: {
    title: "Balance Reminder",
    description: "Sent as a gentle reminder where a balance remains outstanding.",
    subject: "Shul account balance reminder",
    body: "Dear {{member_name}},\n\nThis is a gentle reminder that your current shul account balance is {{balance}}.\n\nYou can view your statement and make a payment here:\n{{portal_link}}\n\nThank you,\nThe Shul Office",
  },
};

export default function CommunicationSettingsPage() {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [activeKey, setActiveKey] = useState<TemplateKey>("statement");
  const activeTemplate = templates[activeKey];

  function updateTemplate(field: keyof Template, value: string) {
    setTemplates((current) => ({
      ...current,
      [activeKey]: {
        ...current[activeKey],
        [field]: value,
      },
    }));
  }

  return (
    <>
      <section className="hero compact-hero">
        <span className="eyebrow">Communications</span>
        <h1>Communication Templates</h1>
        <p>Prepare standard wording for statements, reminders, receipts and charge notices.</p>
      </section>

      <section className="account-grid">
        <div className="card">
          <h3 className="section-title">Templates</h3>
          <div className="quick-links">
            {(Object.keys(templates) as TemplateKey[]).map((key) => (
              <button
                key={key}
                type="button"
                className={activeKey === key ? "button" : "button secondary"}
                onClick={() => setActiveKey(key)}
                style={{ justifyContent: "flex-start" }}
              >
                {templates[key].title}
              </button>
            ))}
          </div>
        </div>

        <div className="card form-card">
          <h3 className="section-title">{activeTemplate.title}</h3>
          <p className="muted">{activeTemplate.description}</p>

          <div className="form-grid" style={{ marginTop: 20 }}>
            <div className="form-field full">
              <label>Email subject</label>
              <input
                value={activeTemplate.subject}
                onChange={(event) => updateTemplate("subject", event.target.value)}
              />
            </div>

            <div className="form-field full">
              <label>Message body</label>
              <textarea
                value={activeTemplate.body}
                onChange={(event) => updateTemplate("body", event.target.value)}
                rows={14}
              />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <button type="button" onClick={() => alert("Saving templates to the database will be connected next.")}>Save Template</button>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="section-title">Available merge fields</h3>
        <p className="muted">These placeholders will later be replaced automatically when sending messages.</p>
        <div className="quick-links">
          <div>{"{{member_name}}"} - Member name</div>
          <div>{"{{balance}}"} - Current balance</div>
          <div>{"{{amount}}"} - Payment or charge amount</div>
          <div>{"{{charge_description}}"} - Charge description</div>
          <div>{"{{portal_link}}"} - Member portal link</div>
        </div>
      </section>
    </>
  );
}
