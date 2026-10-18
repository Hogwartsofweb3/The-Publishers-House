"use client";

import { useState, useEffect, useMemo } from "react";
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

const CATEGORIES = ["Banners & Covers", "Event Flyers", "Gallery / Photos", "Leadership Portraits", "Sermon Thumbnails", "Social Media", "Other"];

const emptyItem = { url: "", altText: "", category: "Other", tags: "", caption: "" };

export default function MediaLibrary() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ ...emptyItem });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchItems = async () => {
    const res = await fetch("/api/cms/media");
    const data = await res.json();
    setItems(data.items || []);
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = useMemo(() => {
    return items.filter(item => {
      const q = search.toLowerCase();
      const matchesSearch = !q || (item.url || "").toLowerCase().includes(q) || (item.altText || "").toLowerCase().includes(q) || (item.tags || "").toLowerCase().includes(q);
      const matchesCat = catFilter === "All" || item.category === catFilter;
      return matchesSearch && matchesCat;
    });
  }, [items, search, catFilter]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url.trim()) { setMsg("Image URL is required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/cms/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", data: { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) } }),
      });
      const json = await res.json();
      if (json.ok) { setMsg("Image added ✓"); setForm({ ...emptyItem }); setShowAddForm(false); fetchItems(); }
      else setMsg("Error: " + json.error);
    } catch (e: any) { setMsg("Error: " + e.message); }
    setLoading(false);
    setTimeout(() => setMsg(""), 3500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this image from the library?")) return;
    await fetch("/api/cms/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    fetchItems();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected image(s)?`)) return;
    for (const id of selectedIds) {
      await fetch("/api/cms/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    }
    setSelectedIds(new Set());
    fetchItems();
  };

  const copyUrl = (url: string) => { navigator.clipboard.writeText(url); };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/cms" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Blue700, textDecoration: "none", display: "block", marginBottom: "24px" }}>← Dashboard</Link>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", color: S.Navy, margin: 0 }}>Media Library</h1>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Slate500, margin: "4px 0 0" }}>
            {items.length} images · {filtered.length} shown · Paste an image URL to add it to the library
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {selectedIds.size > 0 && (
            <button onClick={handleBulkDelete} style={S.btn("#FEE2E2", S.Red)}>
              Delete {selectedIds.size} Selected
            </button>
          )}
          {msg && <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: msg.startsWith("Error") ? S.Red : S.Green, fontWeight: 600 }}>{msg}</span>}
          <button onClick={() => setShowAddForm(!showAddForm)} style={S.btn(S.Blue700, S.White)}>
            {showAddForm ? "Cancel" : "+ Add Image"}
          </button>
        </div>
      </div>

      {/* Add Image Form */}
      {showAddForm && (
        <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "24px", marginBottom: "28px" }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px", color: S.Navy, margin: "0 0 20px" }}>Add Image to Library</h2>
          <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={S.label}>Image URL *</label>
              <input type="url" style={S.input} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://... (paste a direct image URL)" required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={S.label}>Alt Text / Description</label>
                <input type="text" style={S.input} value={form.altText} onChange={e => setForm(f => ({ ...f, altText: e.target.value }))} placeholder="Descriptive alt text" />
              </div>
              <div>
                <label style={S.label}>Category</label>
                <select style={{ ...S.input, cursor: "pointer" }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={S.label}>Tags (comma-separated)</label>
                <input type="text" style={S.input} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g. fol, 2026, event" />
              </div>
              <div>
                <label style={S.label}>Caption (optional)</label>
                <input type="text" style={S.input} value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="Short caption" />
              </div>
            </div>
            {/* Preview */}
            {form.url && (
              <div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px", backgroundColor: S.Paper100, borderRadius: "4px" }}>
                <img src={form.url} alt="Preview" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }} onError={e => (e.currentTarget.style.display = "none")} />
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Slate600 }}>Image preview</span>
              </div>
            )}
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" disabled={loading} style={{ ...S.btn(S.Blue700, S.White), opacity: loading ? 0.6 : 1 }}>{loading ? "Adding..." : "Add to Library"}</button>
              <button type="button" onClick={() => { setForm({ ...emptyItem }); setShowAddForm(false); }} style={S.btn(S.Paper200, S.Navy)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by URL, alt text, or tags..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...S.input, maxWidth: "360px", flex: 1 }}
        />
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["All", ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              style={{
                ...S.btn(catFilter === cat ? S.Blue700 : S.Paper200, catFilter === cat ? S.White : S.Navy),
                padding: "6px 12px",
                fontSize: "10px",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "'Poppins', sans-serif", color: S.Slate500 }}>
          {items.length === 0 ? "No images yet. Add your first one above." : "No images match your search."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {filtered.map((item: any) => (
            <div
              key={item.id}
              style={{
                backgroundColor: S.White,
                border: `2px solid ${selectedIds.has(item.id) ? S.Blue700 : S.Paper300}`,
                borderRadius: "8px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "border-color 0.15s",
              }}
            >
              {/* Image */}
              <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden", cursor: "pointer" }} onClick={() => toggleSelect(item.id)}>
                <img src={item.url} alt={item.altText || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {selectedIds.has(item.id) && (
                  <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(1,64,193,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "24px" }}>✓</span>
                  </div>
                )}
                {item.category && (
                  <div style={{ position: "absolute", top: "8px", left: "8px", backgroundColor: "rgba(21,26,84,0.75)", color: "#fff", fontFamily: "'Poppins', sans-serif", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 7px", borderRadius: "3px" }}>
                    {item.category}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                {item.altText && (
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Navy, margin: 0, fontWeight: 500, lineHeight: "1.4em" }}>
                    {item.altText.length > 50 ? item.altText.slice(0, 50) + "…" : item.altText}
                  </p>
                )}
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", color: S.Slate500, margin: 0, wordBreak: "break-all" }}>
                  {item.url.length > 50 ? item.url.slice(0, 50) + "…" : item.url}
                </p>
                <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                  <button onClick={() => copyUrl(item.url)} style={{ ...S.btn(S.Paper200, S.Navy), fontSize: "9px", padding: "4px 8px", flex: 1 }}>Copy URL</button>
                  <button onClick={() => handleDelete(item.id)} style={{ ...S.btn("#FEE2E2", S.Red), fontSize: "9px", padding: "4px 8px" }}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
