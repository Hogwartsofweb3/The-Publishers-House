"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import ImageUpload from "../components/ImageUpload";

const S = {
  Navy: "#151A54", Blue700: "#0140C1", Blue500: "#2090FF",
  Paper100: "#F4F6FB", Paper200: "#E8ECF7", Paper300: "#D3DAEC",
  White: "#FFFFFF", Slate500: "#747CA1", Slate600: "#4A62A0",
  Red: "#DC2626", Green: "#16A34A",
  label: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase" as const, display: "block", marginBottom: "6px", color: "#4A62A0" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "'Playfair Display', serif", fontSize: "15px", outline: "none", backgroundColor: "#FFFFFF" },
  btn: (bg: string, color: string) => ({ padding: "8px 16px", backgroundColor: bg, color, border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" as const }),
};

const emptyEvent = { title: "", summary: "", description: "", startAt: "", endAt: "", location: "", imageUrl: "", registrationUrl: "", speaker: "", scripture: "", published: false };

export default function EventsEditor() {
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState({ ...emptyEvent });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchEvents = async () => {
    const q = query(collection(db, "events"), orderBy("startAt", "desc"));
    const snap = await getDocs(q);
    setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "events", editingId), form);
        setMsg("Event updated ✓");
      } else {
        await addDoc(collection(db, "events"), { ...form, createdAt: new Date() });
        setMsg("Event added ✓");
      }
      setForm({ ...emptyEvent });
      setEditingId(null);
      fetchEvents();
    } catch (err: any) { setMsg("Error: " + err.message); }
    setLoading(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleEdit = (ev: any) => {
    setForm({ ...emptyEvent, ...ev });
    setEditingId(ev.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await deleteDoc(doc(db, "events", id));
    fetchEvents();
  };

  const togglePublish = async (ev: any) => {
    await updateDoc(doc(db, "events", ev.id), { published: !ev.published });
    fetchEvents();
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <Link href="/cms" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Blue500, textDecoration: "none" }}>← Dashboard</Link>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", color: S.Navy, margin: "8px 0 0" }}>Events</h1>
        </div>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: S.Slate500 }}>{events.length} total · {events.filter(e => e.published).length} published</span>
      </div>

      {/* Form */}
      <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "28px", marginBottom: "40px" }}>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "18px", color: S.Navy, marginBottom: "24px" }}>
          {editingId ? "Edit Event" : "Add New Event"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[
              ["title", "Event Title *", "text", true],
              ["location", "Location *", "text", true],
              ["startAt", "Start Date & Time *", "datetime-local", true],
              ["endAt", "End Date & Time", "datetime-local", false],
              ["registrationUrl", "Registration URL", "url", false],
              ["speaker", "Speaker / Minister", "text", false],
              ["scripture", "Scripture Reference (e.g. Isaiah 60:1)", "text", false],
              ["imageUrl", "Cover Image URL", "url", false],
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

          <div style={{ marginTop: "16px" }}>
            <label style={S.label}>Short Summary</label>
            <input type="text" placeholder="One-line description..." value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} style={S.input} />
          </div>

          <div style={{ marginTop: "12px" }}>
            <label style={S.label}>Full Description</label>
            <textarea placeholder="Full event description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} style={{ ...S.input, resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
            <input type="checkbox" id="pub" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
            <label htmlFor="pub" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: S.Slate600 }}>Published (visible on website)</label>
          </div>

          {msg && <p style={{ color: msg.startsWith("Error") ? S.Red : S.Green, fontFamily: "'Poppins', sans-serif", fontSize: "13px", marginTop: "12px" }}>{msg}</p>}

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button type="submit" disabled={loading} style={S.btn(S.Blue700, "#fff")}>{loading ? "Saving..." : editingId ? "Update Event" : "Add Event"}</button>
            {editingId && <button type="button" onClick={() => { setForm({ ...emptyEvent }); setEditingId(null); }} style={S.btn(S.Paper200, S.Navy)}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {events.map(ev => (
          <div key={ev.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "center", backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "6px", padding: "16px 20px" }}>
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "15px", color: S.Navy }}>{ev.title}</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Slate500, marginTop: "4px" }}>
                {ev.startAt?.replace("T", " ")} · {ev.location}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", padding: "3px 8px", borderRadius: "12px", backgroundColor: ev.published ? "#DCFCE7" : S.Paper200, color: ev.published ? S.Green : S.Slate500 }}>
                {ev.published ? "Published" : "Draft"}
              </span>
              <button onClick={() => togglePublish(ev)} style={S.btn(S.Paper200, S.Navy)}>{ev.published ? "Unpublish" : "Publish"}</button>
              <button onClick={() => handleEdit(ev)} style={S.btn(S.Paper200, S.Navy)}>Edit</button>
              <button onClick={() => handleDelete(ev.id)} style={S.btn("#FEE2E2", S.Red)}>Delete</button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p style={{ fontFamily: "'Playfair Display', serif", color: S.Slate500, textAlign: "center", padding: "40px" }}>No events yet. Add your first one above.</p>}
      </div>
    </div>
  );
}
