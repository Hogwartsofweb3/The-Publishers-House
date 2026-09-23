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

const empty = { name: "", slug: "", summary: "", frequency: "", imageUrl: "", detailsUrl: "", published: false };

export default function ProgramsEditor() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ ...empty });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchData = async () => {
    const q = query(collection(db, "programs"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchData(); }, []);

  const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, slug: form.slug || slugify(form.name) };
      if (editingId) {
        await updateDoc(doc(db, "programs", editingId), data);
        setMsg("Program updated ✓");
      } else {
        await addDoc(collection(db, "programs"), { ...data, createdAt: new Date() });
        setMsg("Program added ✓");
      }
      setForm({ ...empty });
      setEditingId(null);
      fetchData();
    } catch (err: any) { setMsg("Error: " + err.message); }
    finally { setLoading(false); setTimeout(() => setMsg(""), 3000); }
  };

  const handleEdit = (item: any) => {
    setForm({ name: item.name || "", slug: item.slug || "", summary: item.summary || "", frequency: item.frequency || "", imageUrl: item.imageUrl || "", detailsUrl: item.detailsUrl || "", published: item.published || false });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this program?")) return;
    await deleteDoc(doc(db, "programs", id));
    fetchData();
  };

  const togglePublish = async (item: any) => {
    await updateDoc(doc(db, "programs", item.id), { published: !item.published });
    fetchData();
  };

  const F = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/cms" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Blue700, textDecoration: "none", display: "block", marginBottom: "24px" }}>← Dashboard</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", color: S.Navy, margin: 0 }}>Programs</h1>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Slate500 }}>{items.length} total · {items.filter(i => i.published).length} published</span>
      </div>

      <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "28px", marginBottom: "40px" }}>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px", color: S.Navy, marginTop: 0, marginBottom: "24px" }}>
          {editingId ? "Edit Program" : "Add New Program"}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div><label style={S.label}>Program Name *</label><input style={S.input} value={form.name} onChange={e => F("name", e.target.value)} placeholder="Program Name *" required /></div>
            <div><label style={S.label}>Slug (auto-generated if blank)</label><input style={S.input} value={form.slug} onChange={e => F("slug", e.target.value)} placeholder="e.g. festival-of-light" /></div>
          </div>
          <div><label style={S.label}>Summary</label><textarea style={{ ...S.input, minHeight: "80px", resize: "vertical" }} value={form.summary} onChange={e => F("summary", e.target.value)} placeholder="Short description of this program..." /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div><label style={S.label}>Frequency</label><input style={S.input} value={form.frequency} onChange={e => F("frequency", e.target.value)} placeholder="e.g. Annual, Monthly, Weekly" /></div>
            <div><label style={S.label}>Details / Info URL</label><input style={S.input} value={form.detailsUrl} onChange={e => F("detailsUrl", e.target.value)} placeholder="https://..." /></div>
          </div>
          <div><label style={S.label}>Image URL</label><input style={S.input} value={form.imageUrl} onChange={e => F("imageUrl", e.target.value)} placeholder="https://... (image for program card)" /></div>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: S.Navy, cursor: "pointer" }}>
            <input type="checkbox" checked={form.published} onChange={e => F("published", e.target.checked)} />
            Published (visible on website)
          </label>
          {msg && <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: msg.startsWith("Error") ? S.Red : S.Green, margin: 0 }}>{msg}</p>}
          <div style={{ display: "flex", gap: "12px" }}>
            <button type="submit" disabled={loading} style={{ ...S.btn(S.Blue700, S.White), opacity: loading ? 0.6 : 1 }}>{loading ? "Saving..." : editingId ? "Update Program" : "Add Program"}</button>
            {editingId && <button type="button" onClick={() => { setForm({ ...empty }); setEditingId(null); }} style={S.btn(S.Paper200, S.Navy)}>Cancel</button>}
          </div>
        </form>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {items.length === 0 && <p style={{ fontFamily: "'Poppins', sans-serif", color: S.Slate500, textAlign: "center", padding: "40px 0" }}>No programs yet. Add your first one above.</p>}
        {items.map(item => (
          <div key={item.id} style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "15px", color: S.Navy }}>{item.name}</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Slate500, marginTop: "4px" }}>/{item.slug} · {item.frequency}</div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ ...S.btn(item.published ? "#DCFCE7" : S.Paper200, item.published ? S.Green : S.Slate500), cursor: "default", padding: "4px 10px" }}>{item.published ? "Published" : "Draft"}</span>
              <button onClick={() => togglePublish(item)} style={S.btn(S.Paper200, S.Navy)}>{item.published ? "Unpublish" : "Publish"}</button>
              <button onClick={() => handleEdit(item)} style={S.btn(S.Paper200, S.Navy)}>Edit</button>
              <button onClick={() => handleDelete(item.id)} style={S.btn("#FEE2E2", S.Red)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
