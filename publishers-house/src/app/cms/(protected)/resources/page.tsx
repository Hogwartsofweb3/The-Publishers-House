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
  btn: (bg: string, color: string) => ({ padding: "8px 16px", backgroundColor: bg, color, border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" as const }),
};

const TRACKS = [
  { slug: "how-to-preach-the-gospel", label: "How to Preach the Gospel" },
  { slug: "basic-prayer-classes", label: "Basic Prayer Classes" },
  { slug: "40-days-prayer-and-fasting", label: "40 Days Prayer & Fasting" },
  { slug: "the-doctrine-of-christ", label: "The Doctrine of Christ" },
  { slug: "work-and-increase", label: "Work & Increase" },
  { slug: "grace-for-grace", label: "Grace for Grace" },
];

const emptyMaterial = { title: "", type: "PDF", url: "", description: "" };

export default function ResourcesEditor() {
  const [activeTrack, setActiveTrack] = useState(TRACKS[0].slug);
  const [trackData, setTrackData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [addingMaterial, setAddingMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ ...emptyMaterial });

  useEffect(() => {
    fetch("/api/cms/resources")
      .then(r => r.json())
      .then(data => setTrackData(data.tracks || {}));
  }, []);

  const currentTrack = trackData[activeTrack] || { title: "", description: "", materials: [] };

  const updateField = (field: string, value: string) => {
    setTrackData(prev => ({
      ...prev,
      [activeTrack]: { ...currentTrack, [field]: value },
    }));
  };

  const addMaterial = () => {
    if (!newMaterial.title || !newMaterial.url) { setMsg("Title and URL are required"); return; }
    const updated = {
      ...currentTrack,
      materials: [...(currentTrack.materials || []), { ...newMaterial, id: Date.now().toString() }],
    };
    setTrackData(prev => ({ ...prev, [activeTrack]: updated }));
    setNewMaterial({ ...emptyMaterial });
    setAddingMaterial(false);
  };

  const removeMaterial = (idx: number) => {
    const mats = [...(currentTrack.materials || [])];
    mats.splice(idx, 1);
    setTrackData(prev => ({ ...prev, [activeTrack]: { ...currentTrack, materials: mats } }));
  };

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracks: trackData }),
      });
      const json = await res.json();
      setMsg(json.ok ? "Saved ✓" : "Error: " + json.error);
    } catch (e: any) { setMsg("Error: " + e.message); }
    setLoading(false);
    setTimeout(() => setMsg(""), 3500);
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/cms" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Blue700, textDecoration: "none", display: "block", marginBottom: "24px" }}>← Dashboard</Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", color: S.Navy, margin: 0 }}>Resources & Study Guides</h1>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Slate500, margin: "4px 0 0" }}>Manage study tracks and downloadable materials that appear on /resources</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: msg.startsWith("Error") ? S.Red : S.Green, fontWeight: 600 }}>{msg}</span>}
          <button onClick={save} disabled={loading} style={{ ...S.btn(S.Blue700, S.White), padding: "10px 24px", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "24px" }}>
        {/* Track Tabs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "220px" }}>
          {TRACKS.map(t => (
            <button
              key={t.slug}
              onClick={() => setActiveTrack(t.slug)}
              style={{
                ...S.btn(activeTrack === t.slug ? S.Blue700 : S.Paper200, activeTrack === t.slug ? S.White : S.Navy),
                textAlign: "left",
                padding: "10px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                letterSpacing: "0.05em",
                textTransform: "none" as const,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Track Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Track Info */}
          <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "24px" }}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px", color: S.Navy, margin: "0 0 20px" }}>
              {TRACKS.find(t => t.slug === activeTrack)?.label}
            </h2>
            <div style={{ marginBottom: "16px" }}>
              <label style={S.label}>Track Title (overrides default)</label>
              <input type="text" style={S.input} value={currentTrack.title || ""} onChange={e => updateField("title", e.target.value)} placeholder={TRACKS.find(t => t.slug === activeTrack)?.label || ""} />
            </div>
            <div>
              <label style={S.label}>Track Description</label>
              <textarea style={{ ...S.input, minHeight: "80px", resize: "vertical" }} value={currentTrack.description || ""} onChange={e => updateField("description", e.target.value)} placeholder="Short intro shown at the top of the study track page..." />
            </div>
          </div>

          {/* Materials */}
          <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "16px", color: S.Navy, margin: 0 }}>
                Downloadable Materials ({(currentTrack.materials || []).length})
              </h3>
              <button onClick={() => setAddingMaterial(!addingMaterial)} style={S.btn(S.Blue700, S.White)}>
                {addingMaterial ? "Cancel" : "+ Add Material"}
              </button>
            </div>

            {/* Add Material Form */}
            {addingMaterial && (
              <div style={{ backgroundColor: S.Paper100, border: `1px solid ${S.Paper300}`, borderRadius: "6px", padding: "16px", marginBottom: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={S.label}>Material Title *</label>
                    <input type="text" style={S.input} value={newMaterial.title} onChange={e => setNewMaterial(m => ({ ...m, title: e.target.value }))} placeholder="e.g. Week 1 Study Notes" />
                  </div>
                  <div>
                    <label style={S.label}>Type</label>
                    <select style={{ ...S.input, cursor: "pointer" }} value={newMaterial.type} onChange={e => setNewMaterial(m => ({ ...m, type: e.target.value }))}>
                      {["PDF", "Audio", "Video", "Slides", "Document", "Link"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={S.label}>URL / Link *</label>
                  <input type="url" style={S.input} value={newMaterial.url} onChange={e => setNewMaterial(m => ({ ...m, url: e.target.value }))} placeholder="https://..." />
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label style={S.label}>Description (optional)</label>
                  <input type="text" style={S.input} value={newMaterial.description} onChange={e => setNewMaterial(m => ({ ...m, description: e.target.value }))} placeholder="Short note about this material" />
                </div>
                {msg && <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Red, margin: "0 0 10px", fontWeight: 600 }}>{msg}</p>}
                <button onClick={addMaterial} style={S.btn(S.Green, S.White)}>Add to Track</button>
              </div>
            )}

            {/* Materials List */}
            {(currentTrack.materials || []).length === 0 ? (
              <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: S.Slate500, textAlign: "center", padding: "24px 0", margin: 0 }}>
                No materials yet. Add the first one above.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(currentTrack.materials || []).map((mat: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", backgroundColor: S.Paper100, borderRadius: "6px", border: `1px solid ${S.Paper300}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", backgroundColor: S.Paper200, color: S.Slate600, padding: "3px 8px", borderRadius: "3px", flexShrink: 0 }}>
                        {mat.type}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", fontWeight: 600, color: S.Navy }}>{mat.title}</div>
                        {mat.description && <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Slate500 }}>{mat.description}</div>}
                        <a href={mat.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Blue500, textDecoration: "none", wordBreak: "break-all" }}>
                          {mat.url.length > 60 ? mat.url.slice(0, 60) + "…" : mat.url}
                        </a>
                      </div>
                    </div>
                    <button onClick={() => removeMaterial(idx)} style={{ ...S.btn("#FEE2E2", S.Red), marginLeft: "12px", flexShrink: 0 }}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
