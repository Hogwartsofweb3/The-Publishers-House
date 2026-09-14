"use client";

import { useState } from "react";

export default function CopyableAccount({ currency, number }: { currency: string; number: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 800,
          fontSize: "24px",
          lineHeight: "1.2em",
          color: "#151A54",
          textTransform: "uppercase",
        }}
      >
        {currency} - {number}
      </span>
      <button
        onClick={handleCopy}
        style={{
          background: copied ? "#E8ECF7" : "transparent",
          border: `1px solid ${copied ? "#2090FF" : "#D3DAEC"}`,
          borderRadius: "4px",
          cursor: "pointer",
          color: copied ? "#2090FF" : "#4A62A0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px 8px",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          fontSize: "10px",
          transition: "all 0.2s",
        }}
        title={`Copy ${currency} account number`}
      >
        {copied ? "COPIED!" : "COPY"}
      </button>
    </div>
  );
}
