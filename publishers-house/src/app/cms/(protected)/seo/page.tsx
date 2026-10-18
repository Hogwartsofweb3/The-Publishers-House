"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const S = {
  Navy: "#151A54", Blue700: "#0140C1",
  Paper300: "#D3DAEC", White: "#FFFFFF",
  Slate500: "#747CA1", Slate600: "#4A62A0",
  Red: "#DC2626", Green: "#16A34A",
  label: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 as const, fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase" as const, display: "block", marginBottom: "6px", color: "#4A62A0" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "'Playfair Display', serif", fontSize: "15px", outline: "none", backgroundColor: "#FFFFFF", boxSizing: "border-box" as const },
};

export default function SEOEditor() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/cms/seo").then(r => r.json()).then(setData);
  }, []);

  const update = (k: string, v: string) => setData((d: any) => ({ ...d, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/seo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      setMsg(json.ok ? "Saved ✓" : "Error: " + json.error);
    } catch (e: any) { setMsg("Error: " + e.message); }
    setSaving(false);
    setTimeout(() => setMsg(""), 3500);
  };

  if (!data) return <div style={{ padding: "48px", fontFamily: "'Poppins', sans-serif", color: "#747CA1" }}>Loading...</div>;

  const Field = ({ label, k, type = "text", placeholder = "", hint = "" }: { label: string; k: string; type?: string; placeholder?: string; hint?: string }) => (
    <div style={{ marginBottom: "20px" }}>
      <label style={S.label}>{label}</label>
      {hint && <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Slate500, margin: "0 0 6px" }}>{hint}</p>}
      <input type={type} style={S.input} value={data[k] || ""} onChange={e => update(k, e.target.value)} placeholder={placeholder} />
    </div>
  );

  const charColor = (v: string, soft: number, hard: number) => v.length > hard ? S.Red : v.length > soft ? "#B45309" : S.Green;

  return (
    <div style={{ maxWidth: "820px", margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/cms" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Blue700, textDecoration: "none", display: "block", marginBottom: "24px" }}>← Dashboard</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", color: S.Navy, margin: 0 }}>SEO & Social Share</h1>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Slate500, margin: "6px 0 0" }}>Controls what appears when church links are shared on WhatsApp, Facebook, Twitter, and Google</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: msg.startsWith("Error") ? S.Red : S.Green, fontWeight: 600 }}>{msg}</span>}
          <button onClick={save} disabled={saving} style={{ padding: "10px 24px", backgroundColor: S.Blue700, color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* OG Preview Card */}
      <div style={{ backgroundColor: "#1E1E2E", borderRadius: "10px", padding: "20px", marginBottom: "32px", color: S.White }}>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5, marginTop: 0, marginBottom: "14px" }}>Social Share Preview</p>
        <div style={{ backgroundColor: "#2A2A3E", borderRadius: "6px", overflow: "hidden", maxWidth: "480px" }}>
          {data.ogImageUrl && <div style={{ height: "200px", backgroundImage: `url(${data.ogImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />}
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>{data.siteUrl || "thepublishershouse.org"}</div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "14px", color: S.White, marginBottom: "4px" }}>{data.siteTitle || "The Publishers House"}</div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{(data.siteDescription || "").slice(0, 120)}{(data.siteDescription || "").length > 120 ? "..." : ""}</div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "28px" }}>
        <Field label="Site Title" k="siteTitle" placeholder="The Publishers House" hint="Used in browser tabs and bookmarks" />
        <Field label="Site Tagline" k="siteTagline" placeholder="Raising Believers Whose Lives Publish Christ" />

        <div style={{ marginBottom: "20px" }}>
          <label style={S.label}>Meta Description</label>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Slate500, margin: "0 0 6px" }}>Ideal: 120–160 characters · Current: <span style={{ color: charColor(data.siteDescription || "", 120, 160), fontWeight: 600 }}>{(data.siteDescription || "").length}</span></p>
          <textarea style={{ ...S.input, minHeight: "80px", resize: "vertical" }} value={data.siteDescription || ""} onChange={e => update("siteDescription", e.target.value)} placeholder="Short description shown in Google search results..." />
        </div>

        <Field label="Site URL" k="siteUrl" type="url" placeholder="https://www.thepublishershouse.org" />
        <Field label="OG Image URL (1200×630px recommended)" k="ogImageUrl" placeholder="/og-image.jpg or https://..." hint="The preview image shown when links are shared on social media" />
        <Field label="Twitter/X Handle" k="twitterHandle" placeholder="@thepublishershouse" />
        <Field label="Google Site Verification Code" k="googleVerification" placeholder="Paste from Google Search Console" />
      </div>
    </div>
  );
}
