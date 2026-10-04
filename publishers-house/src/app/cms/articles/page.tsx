"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy,
} from "firebase/firestore";
import Link from "next/link";
import RichEditor from "@/components/RichEditor";

/* ── Design tokens ─────────────────────────────────────────── */
const BG = "transparent";
const CARD = "#FFFFFF";
const BORDER = "#D3DAEC";
const ACCENT = "#0140C1";
const GREEN = "#16A34A";
const RED = "#DC2626";
const DIM = "#747CA1";
const TEXT = "#151A54";
const SUBTEXT = "#4A62A0";

const pill = (bg: string, color: string) => ({
  padding: "6px 14px",
  backgroundColor: bg,
  color,
  border: "none",
  borderRadius: "20px",
  cursor: "pointer",
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 600,
  fontSize: "11px",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
});

const fieldStyle = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${BORDER}`,
  outline: "none",
  color: TEXT,
  fontFamily: "'Playfair Display', serif",
  paddingBottom: "8px",
  marginBottom: "4px",
};

const emptyArticle = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  coverImageUrl: "",
  author: "",
  categories: "",
  publishedAt: "",
  published: false,
};

export default function ArticlesEditor() {
  const [articles, setArticles] = useState<any[]>([]);
  const [form, setForm] = useState({ ...emptyArticle });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [view, setView] = useState<"list" | "editor">("list");
  const [importing, setImporting] = useState(false);

  const fetchArticles = async () => {
    const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"));
    const snap = await getDocs(q);
    setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchArticles(); }, []);

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").trim();

  const F = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setMsg("Title is required"); return; }
    setLoading(true);
    try {
      const data = {
        ...form,
        slug: form.slug || autoSlug(form.title),
        categories: form.categories.split(",").map((c: string) => c.trim()).filter(Boolean),
        publishedAt: form.publishedAt || new Date().toISOString().split("T")[0],
      };
      if (editingId) {
        await updateDoc(doc(db, "articles", editingId), data);
        setMsg("Saved ✓");
      } else {
        await addDoc(collection(db, "articles"), { ...data, createdAt: new Date() });
        setMsg("Published ✓");
      }
      setForm({ ...emptyArticle });
      setEditingId(null);
      setView("list");
      fetchArticles();
    } catch (err: any) { setMsg("Error: " + err.message); }
    setLoading(false);
    setTimeout(() => setMsg(""), 4000);
  };

  const handleEdit = (a: any) => {
    setForm({ ...emptyArticle, ...a, categories: Array.isArray(a.categories) ? a.categories.join(", ") : "" });
    setEditingId(a.id);
    setView("editor");
  };

  const handleNew = () => {
    setForm({ ...emptyArticle });
    setEditingId(null);
    setView("editor");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article permanently?")) return;
    await deleteDoc(doc(db, "articles", id));
    fetchArticles();
  };

  const togglePublish = async (a: any) => {
    await updateDoc(doc(db, "articles", a.id), { published: !a.published });
    fetchArticles();
  };

  const handleImportWP = async () => {
    if (!confirm("Pull latest articles from WordPress feed?")) return;
    setImporting(true);
    setMsg("Fetching...");
    try {
      const res = await fetch("/api/wp-feed");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      let newCount = 0;
      for (const item of data.items) {
        const exists = articles.some((a) => a.title === item.title);
        if (!exists) {
          await addDoc(collection(db, "articles"), {
            title: item.title,
            slug: autoSlug(item.title),
            excerpt: item.contentSnippet?.substring(0, 150) + "..." || "",
            body: item.content || item.contentSnippet || "",
            coverImageUrl: "",
            author: item.creator || "Ngbede Odeh",
            categories: item.categories || [],
            publishedAt: item.isoDate ? item.isoDate.split("T")[0] : new Date().toISOString().split("T")[0],
            published: true,
            createdAt: new Date(),
          });
          newCount++;
        }
      }
      setMsg(`Imported ${newCount} new articles.`);
      fetchArticles();
    } catch (err: any) { setMsg("WP Error: " + err.message); }
    setImporting(false);
    setTimeout(() => setMsg(""), 5000);
  };

  /* ── EDITOR VIEW ──────────────────────────────────────────── */
  if (view === "editor") {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 32px", background: CARD, borderBottom: `1px solid ${BORDER}`,
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => setView("list")} style={{ ...pill("transparent", DIM), border: `1px solid ${BORDER}` }}>
              ← Articles
            </button>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: DIM, letterSpacing: "0.1em" }}>
              {editingId ? "Editing" : "New Article"}
            </span>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {msg && (
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: msg.startsWith("Error") ? RED : GREEN }}>
                {msg}
              </span>
            )}
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: SUBTEXT }}>
              <input type="checkbox" checked={form.published} onChange={(e) => F("published", e.target.checked)} />
              Published
            </label>
            <button onClick={handleSubmit} disabled={loading} style={pill(ACCENT, "#FFFFFF")}>
              {loading ? "Saving..." : editingId ? "Save Changes" : "Publish"}
            </button>
          </div>
        </div>

        {/* Document area */}
        <div style={{ flex: 1, maxWidth: "760px", width: "100%", margin: "0 auto", padding: "48px 24px 96px" }}>

          {/* Cover image URL — subtle field */}
          <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: DIM, whiteSpace: "nowrap" }}>
              Cover image URL
            </span>
            <input
              value={form.coverImageUrl}
              onChange={(e) => F("coverImageUrl", e.target.value)}
              placeholder="https://..."
              style={{ ...fieldStyle, fontSize: "13px", fontFamily: "'Poppins', sans-serif", color: SUBTEXT }}
            />
          </div>

          {/* Title */}
          <textarea
            placeholder="Title"
            value={form.title}
            onChange={(e) => { F("title", e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
            rows={2}
            style={{
              width: "100%", background: "transparent", border: "none", outline: "none", resize: "none",
              fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(28px,4vw,40px)",
              lineHeight: "1.05em", letterSpacing: "-0.02em", textTransform: "uppercase",
              color: TEXT, marginBottom: "16px", overflow: "hidden",
            }}
          />

          {/* Excerpt / subtitle */}
          <textarea
            placeholder="Add a subtitle or excerpt…"
            value={form.excerpt}
            onChange={(e) => { F("excerpt", e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
            rows={2}
            style={{
              width: "100%", background: "transparent", border: "none", outline: "none", resize: "none",
              fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "18px", lineHeight: "1.55em",
              color: SUBTEXT, marginBottom: "24px", overflow: "hidden",
            }}
          />

          {/* Byline row */}
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", paddingBottom: "24px", borderBottom: `1px solid ${BORDER}`, marginBottom: "32px" }}>
            <input
              placeholder="Author name"
              value={form.author}
              onChange={(e) => F("author", e.target.value)}
              style={{ ...fieldStyle, flex: 1, minWidth: "180px", fontFamily: "'Poppins', sans-serif", fontSize: "13px" }}
            />
            <input
              type="date"
              value={form.publishedAt}
              onChange={(e) => F("publishedAt", e.target.value)}
              style={{ ...fieldStyle, flex: "0 0 160px", fontFamily: "'Poppins', sans-serif", fontSize: "13px" }}
            />
            <input
              placeholder="Categories (comma-separated)"
              value={form.categories}
              onChange={(e) => F("categories", e.target.value)}
              style={{ ...fieldStyle, flex: 1, minWidth: "200px", fontFamily: "'Poppins', sans-serif", fontSize: "13px" }}
            />
            <input
              placeholder="Slug (auto if blank)"
              value={form.slug}
              onChange={(e) => F("slug", e.target.value)}
              style={{ ...fieldStyle, flex: 1, minWidth: "160px", fontFamily: "'Poppins', sans-serif", fontSize: "13px" }}
            />
          </div>

          {/* Rich body editor */}
          <div style={{ color: TEXT }}>
            <RichEditor value={form.body} onChange={(html) => F("body", html)} />
          </div>
        </div>
      </div>
    );
  }

  /* ── LIST VIEW ────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: BG, padding: "40px 32px", maxWidth: "1100px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <Link href="/cms" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: DIM, textDecoration: "none" }}>
            ← Dashboard
          </Link>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", color: TEXT, margin: "8px 0 0" }}>
            Articles
          </h1>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: msg.startsWith("Error") ? RED : GREEN }}>{msg}</span>}
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: DIM }}>
            {articles.length} total · {articles.filter((a) => a.published).length} published
          </span>
          <button onClick={handleImportWP} disabled={importing} style={pill(CARD, SUBTEXT)}>
            {importing ? "Importing..." : "↓ Import WP"}
          </button>
          <button onClick={handleNew} style={pill(ACCENT, "#FFFFFF")}>
            + New Article
          </button>
        </div>
      </div>

      {/* Article list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {articles.length === 0 && (
          <p style={{ fontFamily: "'Playfair Display', serif", color: DIM, textAlign: "center", padding: "60px 0" }}>
            No articles yet. Hit &quot;+ New Article&quot; to write your first.
          </p>
        )}
        {articles.map((a) => (
          <div
            key={a.id}
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: "6px",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: TEXT,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {a.title}
              </div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: DIM, marginTop: "4px" }}>
                {a.author} · {a.publishedAt}
                {Array.isArray(a.categories) && a.categories.length > 0 && ` · ${a.categories.join(", ")}`}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
              <span style={{
                fontFamily: "'Poppins', sans-serif", fontSize: "10px", padding: "3px 10px",
                borderRadius: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                backgroundColor: a.published ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                color: a.published ? GREEN : DIM,
              }}>
                {a.published ? "Live" : "Draft"}
              </span>
              <button onClick={() => togglePublish(a)} style={pill(CARD, SUBTEXT)}>{a.published ? "Unpublish" : "Publish"}</button>
              <button onClick={() => handleEdit(a)} style={pill(ACCENT, "#FFFFFF")}>Edit</button>
              <button onClick={() => handleDelete(a.id)} style={pill("rgba(239,68,68,0.12)", RED)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
