"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const S = {
  Navy: "#151A54", Blue700: "#0140C1", Blue500: "#2090FF",
  Paper100: "#F4F6FB", Paper200: "#E8ECF7", Paper300: "#D3DAEC",
  White: "#FFFFFF", Slate500: "#747CA1", Slate600: "#4A62A0",
  Red: "#DC2626", Green: "#16A34A",
  label: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 as const, fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase" as const, display: "block", marginBottom: "6px", color: "#4A62A0" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "'Playfair Display', serif", fontSize: "15px", outline: "none", backgroundColor: "#FFFFFF", boxSizing: "border-box" as const },
  section: { backgroundColor: "#FFFFFF", border: "1px solid #D3DAEC", borderRadius: "8px", padding: "28px", marginBottom: "24px" },
  sectionTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 as const, fontSize: "16px", color: "#151A54", marginTop: 0, marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #E8ECF7" },
};

export default function ContactEditor() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/cms/contact").then(r => r.json()).then(setData);
  }, []);

  const update = (key: string, value: string) => setData((d: any) => ({ ...d, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      setMsg(json.ok ? "Saved ✓" : "Error: " + json.error);
    } catch (e: any) { setMsg("Error: " + e.message); }
    setSaving(false);
    setTimeout(() => setMsg(""), 3500);
  };

  if (!data) return <div style={{ padding: "48px", fontFamily: "'Poppins', sans-serif", color: "#747CA1" }}>Loading...</div>;

  const Field = ({ label, k, type = "text", placeholder = "" }: { label: string; k: string; type?: string; placeholder?: string }) => (
    <div style={{ marginBottom: "16px" }}>
      <label style={S.label}>{label}</label>
      <input type={type} style={S.input} value={data[k] || ""} onChange={e => update(k, e.target.value)} placeholder={placeholder} />
    </div>
  );

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/cms" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Blue700, textDecoration: "none", display: "block", marginBottom: "24px" }}>← Dashboard</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", color: S.Navy, margin: 0 }}>Contact & Campuses</h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: msg.startsWith("Error") ? S.Red : S.Green, fontWeight: 600 }}>{msg}</span>}
          <button onClick={save} disabled={saving} style={{ padding: "10px 24px", backgroundColor: S.Blue700, color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Jos Campus */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>🏠 Jos Headquarters</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <Field label="Phone" k="josPhone" placeholder="+234 816 797 6888" />
          <Field label="Email" k="josEmail" type="email" placeholder="thepublishershouse1@gmail.com" />
          <Field label="WhatsApp Link" k="josWhatsapp" placeholder="https://wa.link/..." />
          <Field label="Google Maps URL" k="josMapUrl" placeholder="https://maps.google.com/?q=..." />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={S.label}>Street Address</label>
          <textarea style={{ ...S.input, minHeight: "72px", resize: "vertical" }} value={data.josAddress || ""} onChange={e => update("josAddress", e.target.value)} placeholder="Full postal address..." />
        </div>
      </div>

      {/* Service Times */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>🕐 Service Times</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <Field label="Sunday Service" k="servicesSunday" placeholder="Sunday 9:00 AM WAT" />
          <Field label="Midweek Service" k="servicesThursday" placeholder="Thursday 5:00 PM WAT" />
        </div>
      </div>

      {/* Abuja Campus */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>📍 Abuja Campus</h2>
        <div style={{ marginBottom: "16px" }}>
          <label style={S.label}>Abuja Campus Info</label>
          <textarea style={{ ...S.input, minHeight: "72px", resize: "vertical" }} value={data.abujaInfo || ""} onChange={e => update("abujaInfo", e.target.value)} placeholder="Abuja campus details and schedule..." />
        </div>
      </div>

      {/* Prayer Hotlines */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>🙏 Prayer Hotlines</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <Field label="Primary Hotline" k="prayerHotline1" placeholder="+234 813 063 5386" />
          <Field label="Secondary Hotline" k="prayerHotline2" placeholder="Optional" />
        </div>
      </div>

      {/* Social Media */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>🔗 Social Media</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <Field label="YouTube" k="socialYoutube" placeholder="https://youtube.com/..." />
          <Field label="Instagram" k="socialInstagram" placeholder="https://instagram.com/..." />
          <Field label="Facebook" k="socialFacebook" placeholder="https://facebook.com/..." />
          <Field label="Twitter / X" k="socialTwitter" placeholder="https://x.com/..." />
        </div>
      </div>
    </div>
  );
}
