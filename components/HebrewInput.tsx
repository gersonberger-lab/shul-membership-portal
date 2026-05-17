"use client";

import { useEffect, useState } from "react";

type HebrewInputProps = {
  name?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  onChange?: (event: any) => void;
};

const letters = [
  ["ק", "ר", "א", "ט", "ו", "ן", "ם", "פ"],
  ["ש", "ד", "ג", "כ", "ע", "י", "ח", "ל", "ך", "ף"],
  ["ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת", "ץ"],
];

export default function HebrewInput({ name, value = "", placeholder, required, rows, onChange }: HebrewInputProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
      setIsMobile(window.innerWidth < 760 || Boolean(coarsePointer));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  function emitChange(nextValue: string) {
    onChange?.({ target: { name, value: nextValue } });
  }

  function addLetter(letter: string) {
    emitChange(`${value || ""}${letter}`);
  }

  function backspace() {
    emitChange((value || "").slice(0, -1));
  }

  function space() {
    emitChange(`${value || ""} `);
  }

  const sharedProps = {
    name,
    value,
    placeholder,
    required,
    dir: "rtl" as const,
    lang: "he-IL",
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "none",
    spellCheck: false,
    inputMode: "text" as const,
    onFocus: () => setFocused(true),
    onBlur: () => setTimeout(() => setFocused(false), 180),
    onChange,
  };

  return (
    <div>
      {rows ? <textarea {...sharedProps} rows={rows} /> : <input {...sharedProps} />}

      {focused && (
        <div
          onMouseDown={(event) => event.preventDefault()}
          style={{
            marginTop: 8,
            padding: isMobile ? 8 : 10,
            border: "1px solid #d9e4ec",
            borderRadius: 12,
            background: "#f8fafc",
            display: "grid",
            gap: 7,
            direction: "rtl",
          }}
        >
          {letters.map((row, index) => (
            <div key={index} style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
              {row.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addLetter(letter)}
                  style={{
                    minWidth: isMobile ? 38 : 34,
                    height: isMobile ? 38 : 34,
                    borderRadius: 9,
                    border: "1px solid #cbd5e1",
                    background: "white",
                    fontSize: isMobile ? 20 : 18,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}

          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={space} style={{ padding: "8px 26px", borderRadius: 9, border: "1px solid #cbd5e1", background: "white" }}>רווח</button>
            <button type="button" onClick={backspace} style={{ padding: "8px 16px", borderRadius: 9, border: "1px solid #cbd5e1", background: "white" }}>מחיקה</button>
          </div>
        </div>
      )}
    </div>
  );
}
