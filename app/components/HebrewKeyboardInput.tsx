"use client";

import { useState } from "react";

const rows = [
  ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"],
  ["י", "כ", "ך", "ל", "מ", "ם", "נ", "ן"],
  ["ס", "ע", "פ", "ף", "צ", "ץ", "ק", "ר"],
  ["ש", "ת"],
];

export default function HebrewKeyboardInput({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const addLetter = (letter: string) => {
    onChange(name, `${value}${letter}`);
  };

  const backspace = () => {
    onChange(name, value.slice(0, -1));
  };

  const addSpace = () => {
    onChange(name, `${value} `);
  };

  return (
    <div className="form-field hebrew-keyboard-field">
      <label>{label}</label>

      <div className="keyboard-input-wrap">
        <input
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          dir="rtl"
          lang="he"
        />

        <button
          type="button"
          className="keyboard-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Hebrew keyboard"
        >
          א
        </button>
      </div>

      {open && (
        <div className="hebrew-keyboard" dir="rtl">
          {rows.map((row, index) => (
            <div className="hebrew-keyboard-row" key={index}>
              {row.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  className="hebrew-key"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addLetter(letter);
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}

          <div className="hebrew-keyboard-row actions">
            <button
              type="button"
              className="hebrew-key wide"
              onMouseDown={(e) => {
                e.preventDefault();
                addSpace();
              }}
            >
              Space
            </button>

            <button
              type="button"
              className="hebrew-key wide"
              onMouseDown={(e) => {
                e.preventDefault();
                backspace();
              }}
            >
              Delete
            </button>

            <button
              type="button"
              className="hebrew-key wide"
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
