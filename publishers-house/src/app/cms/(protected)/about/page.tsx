"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DEFAULT_ABOUT_DATA } from "@/lib/cmsDefaults";

const S = {
  Navy: "#151A54",
  Blue700: "#0140C1",
  Blue500: "#2090FF",
  Paper100: "#F4F6FB",
  Paper200: "#E8ECF7",
  Paper300: "#D3DAEC",
  White: "#FFFFFF",
  Slate500: "#747CA1",
  Slate600: "#4A62A0",
  Red: "#DC2626",
  Green: "#16A34A",
  label: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    display: "block",
    marginBottom: "6px",
    color: "#4A62A0",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #D3DAEC",
    borderRadius: "4px",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "13.5px",
    outline: "none",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box" as const,
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #D3DAEC",
    borderRadius: "4px",
    fontFamily: "'Playfair Display', serif",
    fontSize: "15px",
    lineHeight: "1.6em",
    outline: "none",
    backgroundColor: "#FFFFFF",
    minHeight: "90px",
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
  },
  btn: (bg: string, color: string) => ({
    padding: "8px 18px",
    backgroundColor: bg,
    color,
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
  }),
};

export default function AboutEditor() {
  const [data, setData] = useState({ ...DEFAULT_ABOUT_DATA });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/cms/about")
      .then((r) => r.json())
      .then((res) => {
        if (res) setData({ ...DEFAULT_ABOUT_DATA, ...res });
      })
      .catch((e) => console.error("Error loading about page data:", e))
      .finally(() => setFetching(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/cms/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save about configuration");
      setMsg("About page and Tenets of Faith saved successfully ✓");
      setTimeout(() => setMsg(""), 3500);
    } catch (err: any) {
      setMsg("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBelief = (index: number, field: string, val: string) => {
    const next = [...data.beliefs];
    next[index] = { ...next[index], [field]: val };
    setData({ ...data, beliefs: next });
  };

  const addBelief = () => {
    setData({
      ...data,
      beliefs: [...data.beliefs, { title: "New Core Belief", scripture: "Scripture Ref", body: "Description of belief..." }],
    });
  };

  const removeBelief = (index: number) => {
    setData({
      ...data,
      beliefs: data.beliefs.filter((_, i) => i !== index),
    });
  };

  if (fetching) {
    return <div style={{ padding: "40px", textAlign: "center", fontFamily: "'Poppins', sans-serif" }}>Loading about page content...</div>;
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/cms" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Blue700, textDecoration: "none", display: "block", marginBottom: "24px" }}>
        ← Dashboard
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", color: S.Navy, margin: 0 }}>
            About Page & Tenets of Faith Editor
          </h1>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: S.Slate600, marginTop: "6px" }}>
            Edit ministry Vision, Mission, History, and Core Beliefs (Tenets of Faith).
          </p>
        </div>
        {msg && <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: msg.includes("Error") ? S.Red : S.Green, fontWeight: 700 }}>{msg}</span>}
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Hero Section */}
        <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "28px" }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "17px", color: S.Navy, marginTop: 0, marginBottom: "16px" }}>
            Hero Header
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={S.label}>Hero Eyebrow / Kicker</label>
              <input style={S.input} value={data.heroEyebrow} onChange={(e) => setData({ ...data, heroEyebrow: e.target.value })} />
            </div>
            <div>
              <label style={S.label}>Headline</label>
              <input style={S.input} value={data.heroHeadline} onChange={(e) => setData({ ...data, heroHeadline: e.target.value })} />
            </div>
            <div>
              <label style={S.label}>Lede Paragraph</label>
              <textarea style={S.textarea} value={data.heroLede} onChange={(e) => setData({ ...data, heroLede: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "28px" }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "17px", color: S.Navy, marginTop: 0, marginBottom: "16px" }}>
            Vision, Mission & History
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={S.label}>Vision Statement</label>
              <textarea style={S.textarea} value={data.vision} onChange={(e) => setData({ ...data, vision: e.target.value })} />
            </div>
            <div>
              <label style={S.label}>Mission Statement</label>
              <textarea style={S.textarea} value={data.mission} onChange={(e) => setData({ ...data, mission: e.target.value })} />
            </div>
            <div>
              <label style={S.label}>Ministry History / Story</label>
              <textarea style={{ ...S.textarea, minHeight: "120px" }} value={data.history} onChange={(e) => setData({ ...data, history: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Tenets of Faith (Core Beliefs) */}
        <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "17px", color: S.Navy, margin: 0 }}>
                Tenets of Faith (Core Beliefs)
              </h2>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Slate500 }}>
                {data.beliefs.length} Articles of Faith
              </span>
            </div>
            <button type="button" onClick={addBelief} style={S.btn(S.Paper200, S.Navy)}>+ Add Belief</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {data.beliefs.map((belief, i) => (
              <div key={i} style={{ border: `1px solid ${S.Paper300}`, borderRadius: "6px", padding: "20px", backgroundColor: S.Paper100 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "13px", color: S.Navy }}>
                    Article {i + 1}
                  </span>
                  <button type="button" onClick={() => removeBelief(i)} style={S.btn("#FEE2E2", S.Red)}>Remove</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={S.label}>Doctrine / Title</label>
                    <input style={S.input} value={belief.title} onChange={(e) => updateBelief(i, "title", e.target.value)} />
                  </div>
                  <div>
                    <label style={S.label}>Scripture Reference</label>
                    <input style={S.input} value={belief.scripture} onChange={(e) => updateBelief(i, "scripture", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={S.label}>Exposition / Theological Statement</label>
                  <textarea style={S.textarea} value={belief.body} onChange={(e) => updateBelief(i, "body", e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button type="submit" disabled={loading} style={{ ...S.btn(S.Blue700, S.White), padding: "14px 28px", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Saving..." : "Save About Page Content"}
          </button>
        </div>
      </form>
    </div>
  );
}
