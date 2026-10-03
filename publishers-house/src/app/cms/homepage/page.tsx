"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, getDoc, setDoc,
} from "firebase/firestore";
import Link from "next/link";

/* ─────────────────────────────── tokens ──────────────────────────────── */
const Navy   = "#151A54";
const Blue700 = "#0140C1";
const Blue500 = "#2090FF";
const Paper100 = "#F4F6FB";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const White   = "#FFFFFF";
const Slate500 = "#747CA1";
const Green   = "#16A34A";
const Red     = "#DC2626";

const lbl: React.CSSProperties = {
  fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px",
  letterSpacing: "0.16em", textTransform: "uppercase", display: "block",
  marginBottom: "6px", color: "#4A62A0",
};
const inp: React.CSSProperties = {
  width: "100%", padding: "10px 12px", border: `1px solid ${Paper300}`,
  borderRadius: "4px", fontFamily: "'Playfair Display', serif",
  fontSize: "15px", outline: "none", backgroundColor: White,
  boxSizing: "border-box",
};
const btn = (bg: string, color: string): React.CSSProperties => ({
  padding: "8px 16px", backgroundColor: bg, color, border: "none",
  borderRadius: "4px", cursor: "pointer", fontFamily: "'Poppins', sans-serif",
  fontWeight: 600, fontSize: "11px", letterSpacing: "0.14em",
  textTransform: "uppercase",
});
const card: React.CSSProperties = {
  backgroundColor: White, border: `1px solid ${Paper300}`,
  borderRadius: "8px", padding: "28px", marginBottom: "24px",
};

/* ──────────────────────── empty gathering template ───────────────────── */
const emptyG = {
  day: "", date: "", month: "", title: "", desc: "", scripture: "",
  time: "", city: "Jos", theme: "", speaker: "Rev. Joshua Agunbiade",
  flierUrl: "", order: 0, published: true,
};

/* ──────────────────────── empty homepage settings ────────────────────── */
const defaultSettings = {
  setmanHeading: "Welcome Message\nfrom the Setman",
  setmanSubtext: "What Paul asks of anyone who handles Scripture in public, and why accuracy is a matter of love before it is a matter of scholarship.",
  setmanButtonLabel: "Read More About Us",
  setmanButtonUrl: "/about",
  setmanPhotoUrl: "/images/rja-setman.jpg",
  gatheringsHeading: "This Week at the House",
  gatheringsLabel: "Next Gatherings",
};

export default function HomepageEditor() {
  /* ---- state ---- */
  const [tab, setTab] = useState<"settings" | "gatherings">("gatherings");
  const [settings, setSettings] = useState({ ...defaultSettings });
  const [gatherings, setGatherings] = useState<any[]>([]);
  const [form, setForm] = useState({ ...emptyG });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);

  /* ---- fetch ---- */
  const fetchGatherings = async () => {
    const q = query(collection(db, "gatherings"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    setGatherings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchSettings = async () => {
    const ref = doc(db, "homeSettings", "main");
    const snap = await getDoc(ref);
    if (snap.exists()) setSettings({ ...defaultSettings, ...snap.data() });
  };

  useEffect(() => { fetchGatherings(); fetchSettings(); }, []);

  /* ---- helpers ---- */
  const F = (field: string, val: any) => setForm((f) => ({ ...f, [field]: val }));
  const S = (field: string, val: string) => setSettings((s) => ({ ...s, [field]: val }));
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3500); };

  /* ---- save settings ---- */
  const saveSettings = async () => {
    setSettingsSaving(true);
    await setDoc(doc(db, "homeSettings", "main"), settings, { merge: true });
    flash("Homepage settings saved ✓");
    setSettingsSaving(false);
  };

  /* ---- save gathering ---- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { flash("Title is required"); return; }
    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "gatherings", editingId), { ...form, order: Number(form.order) });
        flash("Gathering updated ✓");
      } else {
        await addDoc(collection(db, "gatherings"), { ...form, order: Number(form.order), createdAt: new Date() });
        flash("Gathering added ✓");
      }
      setForm({ ...emptyG });
      setEditingId(null);
      fetchGatherings();
    } catch (err: any) { flash("Error: " + err.message); }
    setLoading(false);
  };

  const handleEdit = (g: any) => {
    setForm({ ...emptyG, ...g });
    setEditingId(g.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this gathering?")) return;
    await deleteDoc(doc(db, "gatherings", id));
    fetchGatherings();
  };

  const togglePublish = async (g: any) => {
    await updateDoc(doc(db, "gatherings", g.id), { published: !g.published });
    fetchGatherings();
  };

  /* ────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px" }}>
      {/* Back */}
      <Link href="/cms" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: Blue700, textDecoration: "none", display: "block", marginBottom: "24px" }}>
        ← Dashboard
      </Link>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", color: Navy, margin: 0 }}>
          Homepage Editor
        </h1>
        {msg && <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: msg.startsWith("Error") ? Red : Green }}>{msg}</span>}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "32px", borderBottom: `1px solid ${Paper300}` }}>
        {(["gatherings", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 24px", border: "none", borderBottom: tab === t ? `2px solid ${Blue700}` : "2px solid transparent",
              background: "none", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontWeight: 600,
              fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase",
              color: tab === t ? Blue700 : Slate500, marginBottom: "-1px",
            }}
          >
            {t === "gatherings" ? "Next Gatherings" : "Welcome Message"}
          </button>
        ))}
      </div>

      {/* ─── TAB: GATHERINGS ─────────────────────────────────────────── */}
      {tab === "gatherings" && (
        <>
          {/* Form */}
          <div style={card}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px", color: Navy, margin: "0 0 24px" }}>
              {editingId ? "Edit Gathering" : "Add New Gathering"}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Row 1: title + theme */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={lbl}>Event Title *</label>
                  <input style={inp} value={form.title} onChange={(e) => F("title", e.target.value)} placeholder="e.g. The Time of the Word" required />
                </div>
                <div>
                  <label style={lbl}>Theme / Series Name</label>
                  <input style={inp} value={form.theme} onChange={(e) => F("theme", e.target.value)} placeholder="e.g. The Time of the Word — Part 6" />
                </div>
              </div>

              {/* Row 2: date fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={lbl}>Day Abbr (e.g. SUN)</label>
                  <input style={inp} value={form.day} onChange={(e) => F("day", e.target.value.toUpperCase())} placeholder="SUN" maxLength={3} />
                </div>
                <div>
                  <label style={lbl}>Day Number</label>
                  <input style={inp} value={form.date} onChange={(e) => F("date", e.target.value)} placeholder="04" maxLength={2} />
                </div>
                <div>
                  <label style={lbl}>Month Abbr (e.g. OCT)</label>
                  <input style={inp} value={form.month} onChange={(e) => F("month", e.target.value.toUpperCase())} placeholder="OCT" maxLength={3} />
                </div>
                <div>
                  <label style={lbl}>Time</label>
                  <input style={inp} value={form.time} onChange={(e) => F("time", e.target.value)} placeholder="9:00 AM" />
                </div>
              </div>

              {/* Row 3: desc */}
              <div>
                <label style={lbl}>Description</label>
                <textarea style={{ ...inp, minHeight: "72px", resize: "vertical" }} value={form.desc} onChange={(e) => F("desc", e.target.value)} placeholder="What can attendees expect..." />
              </div>

              {/* Row 4: speaker, scripture, city */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={lbl}>Speaker</label>
                  <input style={inp} value={form.speaker} onChange={(e) => F("speaker", e.target.value)} placeholder="Rev. Joshua Agunbiade" />
                </div>
                <div>
                  <label style={lbl}>Scripture / Key Verse</label>
                  <input style={inp} value={form.scripture} onChange={(e) => F("scripture", e.target.value)} placeholder="Isaiah 60:1" />
                </div>
                <div>
                  <label style={lbl}>City / Location</label>
                  <input style={inp} value={form.city} onChange={(e) => F("city", e.target.value)} placeholder="Jos" />
                </div>
              </div>

              {/* Row 5: flier + order */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
                <div>
                  <label style={lbl}>Flier Image URL (optional)</label>
                  <input style={inp} value={form.flierUrl} onChange={(e) => F("flierUrl", e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <label style={lbl}>Display Order (1 = first)</label>
                  <input type="number" style={inp} value={form.order} onChange={(e) => F("order", e.target.value)} min={0} />
                </div>
              </div>

              {/* Published toggle */}
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: Navy, cursor: "pointer" }}>
                <input type="checkbox" checked={form.published} onChange={(e) => F("published", e.target.checked)} />
                Show on homepage
              </label>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="submit" disabled={loading} style={{ ...btn(Blue700, White), opacity: loading ? 0.6 : 1 }}>
                  {loading ? "Saving..." : editingId ? "Update Gathering" : "Add Gathering"}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setForm({ ...emptyG }); setEditingId(null); }} style={btn(Paper200, Navy)}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Gatherings list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {gatherings.length === 0 && (
              <p style={{ fontFamily: "'Poppins', sans-serif", color: Slate500, textAlign: "center", padding: "40px 0" }}>
                No gatherings yet. Add your first one above.
              </p>
            )}
            {gatherings.map((g) => (
              <div
                key={g.id}
                style={{ backgroundColor: White, border: `1px solid ${Paper300}`, borderRadius: "8px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {/* Date badge */}
                  <div style={{ textAlign: "center", minWidth: "48px", backgroundColor: Paper100, borderRadius: "4px", padding: "6px 8px" }}>
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: Slate500 }}>{g.day}</div>
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "22px", color: Navy, lineHeight: 1 }}>{g.date}</div>
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: Slate500 }}>{g.month}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "15px", color: Navy }}>{g.title}</div>
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: Slate500, marginTop: "3px" }}>
                      {g.time} · {g.city}{g.scripture ? ` · ${g.scripture}` : ""}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                  <span style={{ ...btn(g.published ? "#DCFCE7" : Paper200, g.published ? Green : Slate500), cursor: "default", padding: "4px 10px" }}>
                    {g.published ? "Showing" : "Hidden"}
                  </span>
                  <button onClick={() => togglePublish(g)} style={btn(Paper200, Navy)}>{g.published ? "Hide" : "Show"}</button>
                  <button onClick={() => handleEdit(g)} style={btn(Paper200, Navy)}>Edit</button>
                  <button onClick={() => handleDelete(g.id)} style={btn("#FEE2E2", Red)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ─── TAB: WELCOME SETTINGS ───────────────────────────────────── */}
      {tab === "settings" && (
        <div style={card}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px", color: Navy, margin: "0 0 24px" }}>
            Welcome Message from the Setman
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={lbl}>Heading</label>
              <textarea style={{ ...inp, minHeight: "60px", resize: "vertical" }} value={settings.setmanHeading} onChange={(e) => S("setmanHeading", e.target.value)} placeholder="Welcome Message&#10;from the Setman" />
            </div>
            <div>
              <label style={lbl}>Subtext / Body</label>
              <textarea style={{ ...inp, minHeight: "80px", resize: "vertical" }} value={settings.setmanSubtext} onChange={(e) => S("setmanSubtext", e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={lbl}>Button Label</label>
                <input style={inp} value={settings.setmanButtonLabel} onChange={(e) => S("setmanButtonLabel", e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Button URL</label>
                <input style={inp} value={settings.setmanButtonUrl} onChange={(e) => S("setmanButtonUrl", e.target.value)} placeholder="/about" />
              </div>
            </div>
            <div>
              <label style={lbl}>Setman Photo URL</label>
              <input style={inp} value={settings.setmanPhotoUrl} onChange={(e) => S("setmanPhotoUrl", e.target.value)} placeholder="/images/rja-setman.jpg or https://..." />
            </div>

            <hr style={{ border: "none", borderTop: `1px solid ${Paper300}`, margin: "8px 0" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={lbl}>Gatherings Section Label (eyebrow)</label>
                <input style={inp} value={settings.gatheringsLabel} onChange={(e) => S("gatheringsLabel", e.target.value)} placeholder="Next Gatherings" />
              </div>
              <div>
                <label style={lbl}>Gatherings Section Heading</label>
                <input style={inp} value={settings.gatheringsHeading} onChange={(e) => S("gatheringsHeading", e.target.value)} placeholder="This Week at the House" />
              </div>
            </div>

            <button onClick={saveSettings} disabled={settingsSaving} style={{ ...btn(Blue700, White), width: "fit-content", opacity: settingsSaving ? 0.6 : 1 }}>
              {settingsSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
