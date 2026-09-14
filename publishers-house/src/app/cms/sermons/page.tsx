"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import Link from "next/link";

const S = {
  Navy: "#151A54", Blue700: "#0140C1", Blue500: "#2090FF",
  Paper100: "#F4F6FB", Paper200: "#E8ECF7", Paper300: "#D3DAEC",
  White: "#FFFFFF", Slate500: "#747CA1", Slate600: "#4A62A0",
  Red: "#DC2626", Green: "#16A34A",
  label: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase" as const, display: "block", marginBottom: "6px", color: "#4A62A0" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "'Playfair Display', serif", fontSize: "15px", outline: "none", backgroundColor: "#FFFFFF" },
  btn: (bg: string, color: string) => ({ padding: "8px 16px", backgroundColor: bg, color, border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" as const }),
};

const emptySermon = { title: "", speaker: "", date: "", series: "", videoUrl: "", audioUrl: "", studyGuideUrl: "", tags: "", published: false };

export default function SermonsEditor() {
  const [sermons, setSermons] = useState<any[]>([]);
  const [form, setForm] = useState({ ...emptySermon });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchSermons = async () => {
    const q = query(collection(db, "sermons"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    setSermons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchSermons(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
      if (editingId) {
        await updateDoc(doc(db, "sermons", editingId), data);
        setMsg("Sermon updated ✓");
      } else {
        await addDoc(collection(db, "sermons"), { ...data, createdAt: new Date() });
        setMsg("Sermon added ✓");
      }
      setForm({ ...emptySermon });
      setEditingId(null);
      fetchSermons();
    } catch (err: any) { setMsg("Error: " + err.message); }
    setLoading(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleEdit = (s: any) => {
    setForm({ ...s, tags: Array.isArray(s.tags) ? s.tags.join(", ") : "" });
    setEditingId(s.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this sermon?")) return;
    await deleteDoc(doc(db, "sermons", id));
    fetchSermons();
  };

  const togglePublish = async (s: any) => {
    await updateDoc(doc(db, "sermons", s.id), { published: !s.published });
    fetchSermons();
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <Link href="/cms" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Blue500, textDecoration: "none" }}>← Dashboard</Link>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", color: S.Navy, margin: "8px 0 0" }}>Sermons</h1>
        </div>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: S.Slate500 }}>{sermons.length} total · {sermons.filter(s => s.published).length} published</span>
      </div>

      {/* Form */}
      <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "28px", marginBottom: "40px" }}>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "18px", color: S.Navy, marginBottom: "24px" }}>
          {editingId ? "Edit Sermon" : "Add New Sermon"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[
              ["title", "Sermon Title *", "text", true],
              ["speaker", "Speaker *", "text", true],
              ["date", "Date *", "date", true],
              ["series", "Series / Programme", "text", false],
              ["videoUrl", "YouTube / Video URL", "url", false],
              ["audioUrl", "Audio URL", "url", false],
              ["studyGuideUrl", "Study Guide URL", "url", false],
              ["tags", "Tags (comma-separated)", "text", false],
            ].map(([field, label, type, required]) => (
              <div key={String(field)}>
                <label style={S.label}>{String(label)}</label>
                <input
                  type={String(type)}
                  placeholder={String(label)}
                  value={(form as any)[String(field)]}
                  onChange={e => setForm({ ...form, [String(field)]: e.target.value })}
                  required={!!required}
                  style={S.input}
                />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
            <input type="checkbox" id="pub" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
            <label htmlFor="pub" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: S.Slate600 }}>Published (visible on website)</label>
          </div>

          {msg && <p style={{ color: msg.startsWith("Error") ? S.Red : S.Green, fontFamily: "'Poppins', sans-serif", fontSize: "13px", marginTop: "12px" }}>{msg}</p>}

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button type="submit" disabled={loading} style={S.btn(S.Blue700, "#fff")}>{loading ? "Saving..." : editingId ? "Update Sermon" : "Add Sermon"}</button>
            {editingId && <button type="button" onClick={() => { setForm({ ...emptySermon }); setEditingId(null); }} style={S.btn(S.Paper200, S.Navy)}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {sermons.map(s => (
          <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "center", backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "6px", padding: "16px 20px" }}>
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "15px", color: S.Navy }}>{s.title}</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Slate500, marginTop: "4px" }}>
                {s.speaker} · {s.date} {s.series && `· ${s.series}`}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", padding: "3px 8px", borderRadius: "12px", backgroundColor: s.published ? "#DCFCE7" : S.Paper200, color: s.published ? S.Green : S.Slate500 }}>
                {s.published ? "Published" : "Draft"}
              </span>
              <button onClick={() => togglePublish(s)} style={S.btn(S.Paper200, S.Navy)}>{s.published ? "Unpublish" : "Publish"}</button>
              <button onClick={() => handleEdit(s)} style={S.btn(S.Paper200, S.Navy)}>Edit</button>
              <button onClick={() => handleDelete(s.id)} style={S.btn("#FEE2E2", S.Red)}>Delete</button>
            </div>
          </div>
        ))}
        {sermons.length === 0 && <p style={{ fontFamily: "'Playfair Display', serif", color: S.Slate500, textAlign: "center", padding: "40px" }}>No sermons yet. Add your first one above.</p>}
      </div>
    </div>
  );
}
