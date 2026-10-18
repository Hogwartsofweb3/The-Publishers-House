"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const S = {
  Navy: "#151A54", Blue700: "#0140C1",
  Paper100: "#F4F6FB", Paper300: "#D3DAEC",
  White: "#FFFFFF", Slate500: "#747CA1",
  Red: "#DC2626", Green: "#16A34A",
  label: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 as const, fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase" as const, display: "block", marginBottom: "6px", color: "#4A62A0" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "'Playfair Display', serif", fontSize: "15px", outline: "none", backgroundColor: "#FFFFFF", boxSizing: "border-box" as const },
};

export default function AnnouncementsEditor() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/cms/announcements").then(r => r.json()).then(setData);
  }, []);

  const update = (key: string, value: any) => setData((d: any) => ({ ...d, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      setMsg(json.ok ? "Saved ✓" : "Error: " + json.error);
    } catch (e: any) { setMsg("Error: " + e.message); }
    setSaving(false);
    setTimeout(() => setMsg(""), 3500);
  };

  if (!data) return <div style={{ padding: "48px", fontFamily: "'Poppins', sans-serif", color: "#747CA1" }}>Loading...</div>;

  const preview = data.enabled && data.text;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/cms" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Blue700, textDecoration: "none", display: "block", marginBottom: "24px" }}>← Dashboard</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", color: S.Navy, margin: 0 }}>Announcement Bar</h1>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Slate500, margin: "6px 0 0" }}>Controls the global pinned banner at the top of every page</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: msg.startsWith("Error") ? S.Red : S.Green, fontWeight: 600 }}>{msg}</span>}
          <button onClick={save} disabled={saving} style={{ padding: "10px 24px", backgroundColor: S.Blue700, color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Live Preview */}
      {preview && (
        <div style={{ backgroundColor: data.bgColor || "#0140C1", color: data.textColor || "#FFFFFF", padding: "12px 24px", borderRadius: "6px", marginBottom: "24px", fontFamily: "'Poppins', sans-serif", fontSize: "13px", display: "flex", justifyContent: "center", alignItems: "center", gap: "12px" }}>
          <span>{data.text}</span>
          {data.linkUrl && data.linkLabel && (
            <span style={{ textDecoration: "underline", fontWeight: 600, cursor: "pointer" }}>{data.linkLabel} →</span>
          )}
          <span style={{ marginLeft: "auto", opacity: 0.7, fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Preview</span>
        </div>
      )}

      <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
          <div
            onClick={() => update("enabled", !data.enabled)}
            style={{ width: "44px", height: "24px", borderRadius: "12px", backgroundColor: data.enabled ? S.Blue700 : S.Paper300, position: "relative", transition: "background 0.2s", cursor: "pointer", flexShrink: 0 }}
          >
            <div style={{ position: "absolute", top: "3px", left: data.enabled ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: S.White, transition: "left 0.2s" }} />
          </div>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "14px", color: S.Navy, fontWeight: data.enabled ? 700 : 400 }}>
            {data.enabled ? "🟢 Banner is LIVE on the website" : "⭕ Banner is hidden"}
          </span>
        </label>

        {/* Message Text */}
        <div>
          <label style={S.label}>Announcement Text *</label>
          <textarea
            style={{ ...S.input, minHeight: "80px", resize: "vertical" }}
            value={data.text || ""}
            onChange={e => update("text", e.target.value)}
            placeholder='e.g. 🔴 Live Now: Sunday 2nd Service streaming on YouTube & Mixlr'
          />
        </div>

        {/* Link */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
          <div>
            <label style={S.label}>Link URL (optional)</label>
            <input type="url" style={S.input} value={data.linkUrl || ""} onChange={e => update("linkUrl", e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div>
            <label style={S.label}>Link Label</label>
            <input type="text" style={S.input} value={data.linkLabel || ""} onChange={e => update("linkLabel", e.target.value)} placeholder="Watch Live" />
          </div>
        </div>

        {/* Colours */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={S.label}>Background Colour</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input type="color" value={data.bgColor || "#0140C1"} onChange={e => update("bgColor", e.target.value)} style={{ width: "40px", height: "40px", border: "none", borderRadius: "4px", cursor: "pointer", padding: 0 }} />
              <input type="text" style={{ ...S.input, flex: 1 }} value={data.bgColor || ""} onChange={e => update("bgColor", e.target.value)} placeholder="#0140C1" />
            </div>
          </div>
          <div>
            <label style={S.label}>Text Colour</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input type="color" value={data.textColor || "#FFFFFF"} onChange={e => update("textColor", e.target.value)} style={{ width: "40px", height: "40px", border: "none", borderRadius: "4px", cursor: "pointer", padding: 0 }} />
              <input type="text" style={{ ...S.input, flex: 1 }} value={data.textColor || ""} onChange={e => update("textColor", e.target.value)} placeholder="#FFFFFF" />
            </div>
          </div>
        </div>

        {/* Presets */}
        <div>
          <label style={S.label}>Quick Presets</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { label: "TPH Blue", bg: "#0140C1", text: "#FFFFFF" },
              { label: "TPH Navy", bg: "#151A54", text: "#FFFFFF" },
              { label: "Alert Red", bg: "#DC2626", text: "#FFFFFF" },
              { label: "Gold", bg: "#B45309", text: "#FFFFFF" },
              { label: "Green", bg: "#16A34A", text: "#FFFFFF" },
            ].map(p => (
              <button key={p.label} onClick={() => { update("bgColor", p.bg); update("textColor", p.text); }} style={{ padding: "6px 14px", backgroundColor: p.bg, color: p.text, border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 600 }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
