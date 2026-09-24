"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import ImageUpload from "../components/ImageUpload";
import RichEditor from "@/components/RichEditor";

const S = {
  Navy: "#151A54", Blue700: "#0140C1", Blue500: "#2090FF",
  Paper100: "#F4F6FB", Paper200: "#E8ECF7", Paper300: "#D3DAEC",
  White: "#FFFFFF", Slate500: "#747CA1", Slate600: "#4A62A0",
  Red: "#DC2626", Green: "#16A34A",
  label: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase" as const, display: "block", marginBottom: "6px", color: "#4A62A0" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "'Playfair Display', serif", fontSize: "15px", outline: "none", backgroundColor: "#FFFFFF" },
  btn: (bg: string, color: string) => ({ padding: "8px 16px", backgroundColor: bg, color, border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" as const }),
};

const emptyArticle = { title: "", slug: "", excerpt: "", body: "", coverImageUrl: "", author: "", categories: "", publishedAt: "", published: false };

export default function ArticlesEditor() {
  const [articles, setArticles] = useState<any[]>([]);
  const [form, setForm] = useState({ ...emptyArticle });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchArticles = async () => {
    const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"));
    const snap = await getDocs(q);
    setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchArticles(); }, []);

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...form,
        slug: form.slug || autoSlug(form.title),
        categories: form.categories.split(",").map(c => c.trim()).filter(Boolean),
        publishedAt: form.publishedAt || new Date().toISOString().split("T")[0],
      };
      if (editingId) {
        await updateDoc(doc(db, "articles", editingId), data);
        setMsg("Article updated ✓");
      } else {
        await addDoc(collection(db, "articles"), { ...data, createdAt: new Date() });
        setMsg("Article added ✓");
      }
      setForm({ ...emptyArticle });
      setEditingId(null);
      fetchArticles();
    } catch (err: any) { setMsg("Error: " + err.message); }
    setLoading(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleEdit = (a: any) => {
    setForm({ ...emptyArticle, ...a, categories: Array.isArray(a.categories) ? a.categories.join(", ") : "" });
    setEditingId(a.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await deleteDoc(doc(db, "articles", id));
    fetchArticles();
  };

  const togglePublish = async (a: any) => {
    await updateDoc(doc(db, "articles", a.id), { published: !a.published });
    fetchArticles();
  };

  const [importing, setImporting] = useState(false);
  const handleImportWP = async () => {
    if (!confirm("This will pull the latest articles from the WordPress feed. Continue?")) return;
    setImporting(true);
    setMsg("Fetching WordPress feed...");
    try {
      const res = await fetch("/api/wp-feed");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      let newCount = 0;
      for (const item of data.items) {
        // Skip if already imported
        const exists = articles.some(a => a.title === item.title);
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
      setMsg(`Imported ${newCount} new articles from WordPress.`);
      fetchArticles();
    } catch (err: any) {
      setMsg("WP Import Error: " + err.message);
    }
    setImporting(false);
    setTimeout(() => setMsg(""), 5000);
  };


  return (
    <div style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <Link href="/cms" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Blue500, textDecoration: "none" }}>← Dashboard</Link>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", color: S.Navy, margin: "8px 0 0" }}>Articles</h1>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: S.Slate500 }}>{articles.length} total · {articles.filter(a => a.published).length} published</span>
          <button onClick={handleImportWP} disabled={importing} style={S.btn(S.Paper200, S.Navy)}>
            {importing ? "Importing..." : "↓ Import from WordPress"}
          </button>
        </div>
      </div>

      {/* Form */}
      <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "28px", marginBottom: "40px" }}>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "18px", color: S.Navy, marginBottom: "24px" }}>
          {editingId ? "Edit Article" : "Add New Article"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[
              ["title", "Article Title *", "text", true],
              ["author", "Author *", "text", true],
              ["publishedAt", "Published Date", "date", false],
              ["categories", "Categories (comma-separated)", "text", false],
              ["coverImageUrl", "Cover Image URL", "url", false],
              ["slug", "Slug (auto-generated if blank)", "text", false],
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
            <label style={S.label}>Excerpt / Summary *</label>
            <input type="text" placeholder="One or two sentence summary..." value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} required style={S.input} />
          </div>

          <div style={{ marginTop: "12px" }}>
            <label style={S.label}>Full Article Body</label>
            <div style={{ marginTop: "8px" }}>
              <RichEditor value={form.body} onChange={(html) => setForm({ ...form, body: html })} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
            <input type="checkbox" id="pub" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
            <label htmlFor="pub" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: S.Slate600 }}>Published (visible on website)</label>
          </div>

          {msg && <p style={{ color: msg.startsWith("Error") ? S.Red : S.Green, fontFamily: "'Poppins', sans-serif", fontSize: "13px", marginTop: "12px" }}>{msg}</p>}

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button type="submit" disabled={loading} style={S.btn(S.Blue700, "#fff")}>{loading ? "Saving..." : editingId ? "Update Article" : "Add Article"}</button>
            {editingId && <button type="button" onClick={() => { setForm({ ...emptyArticle }); setEditingId(null); }} style={S.btn(S.Paper200, S.Navy)}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {articles.map(a => (
          <div key={a.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "center", backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "6px", padding: "16px 20px" }}>
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "15px", color: S.Navy }}>{a.title}</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Slate500, marginTop: "4px" }}>
                {a.author} · {a.publishedAt} {Array.isArray(a.categories) && a.categories.length > 0 && `· ${a.categories.join(", ")}`}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", padding: "3px 8px", borderRadius: "12px", backgroundColor: a.published ? "#DCFCE7" : S.Paper200, color: a.published ? S.Green : S.Slate500 }}>
                {a.published ? "Published" : "Draft"}
              </span>
              <button onClick={() => togglePublish(a)} style={S.btn(S.Paper200, S.Navy)}>{a.published ? "Unpublish" : "Publish"}</button>
              <button onClick={() => handleEdit(a)} style={S.btn(S.Paper200, S.Navy)}>Edit</button>
              <button onClick={() => handleDelete(a.id)} style={S.btn("#FEE2E2", S.Red)}>Delete</button>
            </div>
          </div>
        ))}
        {articles.length === 0 && <p style={{ fontFamily: "'Playfair Display', serif", color: S.Slate500, textAlign: "center", padding: "40px" }}>No articles yet. Add your first one above.</p>}
      </div>
    </div>
  );
}
