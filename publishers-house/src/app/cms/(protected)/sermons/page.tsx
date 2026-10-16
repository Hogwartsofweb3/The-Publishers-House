"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import Link from "next/link";

const S = {
  Navy: "#151A54",
  Blue700: "#0140C1",
  Blue500: "#2090FF",
  Paper100: "#F4F6FB",
  Paper200: "#E8ECF7",
  Paper300: "#D3DAEC",
  Paper400: "#C0C9E0",
  White: "#FFFFFF",
  Slate500: "#747CA1",
  Slate600: "#4A62A0",
  Red: "#DC2626",
  Green: "#16A34A",
  label: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "11px",
    letterSpacing: "0.16em",
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
    fontFamily: "'Playfair Display', serif",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box" as const,
  },
  btn: (bg: string, color: string) => ({
    padding: "8px 16px",
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
    transition: "opacity 0.15s ease",
  }),
};

const emptySermon = {
  title: "",
  speaker: "Dr. Joshua Agunbiade",
  date: new Date().toISOString().split("T")[0],
  series: "",
  scripture: "",
  duration: "",
  videoUrl: "",
  audioUrl: "",
  studyGuideUrl: "",
  tags: "",
  coverImageUrl: "",
  summary: "",
  published: true,
};

function isGenericOverview(summary?: string): boolean {
  if (!summary || !summary.trim()) return true;
  const lower = summary.toLowerCase();
  return (
    lower.includes("expect accurate bible doctrine") ||
    lower.includes("hit the subscribe button") ||
    lower.includes("the house of bread") ||
    lower.includes("korinjoh ho") ||
    lower.includes("feel free to worship with us") ||
    lower.length < 40
  );
}

export default function SermonsEditor() {
  const [sermons, setSermons] = useState<any[]>([]);
  const [form, setForm] = useState({ ...emptySermon });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  // Search & Filter controls
  const [search, setSearch] = useState("");
  const [overviewFilter, setOverviewFilter] = useState<"all" | "needs_overview" | "has_overview">("all");

  const fetchSermons = async () => {
    try {
      const q = query(collection(db, "sermons"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      setSermons(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e: any) {
      console.error("Error fetching sermons:", e);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync-sermons?key=tph-cron-2026-secure");
      const data = await res.json();
      if (data.success) {
        let text = `✓ Sync finished: ${data.added} new sermons added, ${data.skipped} existing up-to-date`;
        if (data.notes && data.notes.length > 0) {
          text += ` (${data.notes.join("; ")})`;
        }
        setSyncResult(text);
        fetchSermons();
      } else {
        setSyncResult(`Sync error: ${data.error || "Failed"}`);
      }
    } catch (e: any) {
      setSyncResult(`Sync error: ${e.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(null), 12000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        updatedAt: new Date().toISOString(),
      };
      if (editingId) {
        await updateDoc(doc(db, "sermons", editingId), data);
        setMsg("Sermon updated successfully ✓");
      } else {
        await addDoc(collection(db, "sermons"), {
          ...data,
          createdAt: new Date().toISOString(),
        });
        setMsg("Sermon added successfully ✓");
      }
      setForm({ ...emptySermon });
      setEditingId(null);
      fetchSermons();
    } catch (err: any) {
      setMsg("Error: " + err.message);
    }
    setLoading(false);
    setTimeout(() => setMsg(""), 4000);
  };

  const handleEdit = (s: any) => {
    setForm({
      title: s.title || "",
      speaker: s.speaker || "Dr. Joshua Agunbiade",
      date: s.date || "",
      series: s.series || "",
      scripture: s.scripture || "",
      duration: s.duration || "",
      videoUrl: s.videoUrl || "",
      audioUrl: s.audioUrl || "",
      studyGuideUrl: s.studyGuideUrl || "",
      tags: Array.isArray(s.tags) ? s.tags.join(", ") : s.tags || "",
      coverImageUrl: s.coverImageUrl || "",
      summary: s.summary || "",
      published: s.published !== false,
    });
    setEditingId(s.id);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sermon?")) return;
    await deleteDoc(doc(db, "sermons", id));
    fetchSermons();
  };

  const togglePublish = async (s: any) => {
    await updateDoc(doc(db, "sermons", s.id), { published: !s.published });
    fetchSermons();
  };

  // Filtered sermons list
  const filteredSermons = useMemo(() => {
    return sermons.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.series && s.series.toLowerCase().includes(q)) ||
        (s.speaker && s.speaker.toLowerCase().includes(q)) ||
        (s.date && s.date.includes(q));

      if (!matchesSearch) return false;

      const isGeneric = isGenericOverview(s.summary);
      if (overviewFilter === "needs_overview") return isGeneric;
      if (overviewFilter === "has_overview") return !isGeneric;
      return true;
    });
  }, [sermons, search, overviewFilter]);

  const needsOverviewCount = useMemo(() => {
    return sermons.filter((s) => isGenericOverview(s.summary)).length;
  }, [sermons]);

  const customOverviewCount = sermons.length - needsOverviewCount;

  return (
    <div style={{ padding: "32px", maxWidth: "1160px", margin: "0 auto" }}>
      {/* ── Top Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <Link
            href="/cms"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "12px",
              color: S.Blue500,
              textDecoration: "none",
            }}
          >
            ← Dashboard
          </Link>
          <h1
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: "30px",
              color: S.Navy,
              margin: "6px 0 0",
              letterSpacing: "-0.01em",
            }}
          >
            Sermons & Overviews
          </h1>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {syncResult && (
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "12px",
                color: syncResult.startsWith("✓") ? S.Green : S.Red,
                fontWeight: 600,
              }}
            >
              {syncResult}
            </span>
          )}
          <button
            onClick={handleManualSync}
            disabled={syncing}
            style={{
              ...S.btn(S.Blue700, S.White),
              opacity: syncing ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {syncing ? "Syncing..." : "🔄 Sync From YouTube"}
          </button>
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "12px",
              color: S.Slate500,
            }}
          >
            {sermons.length} total · {sermons.filter((s) => s.published).length} published
          </span>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div
        style={{
          backgroundColor: S.White,
          border: `1px solid ${S.Paper300}`,
          borderRadius: "8px",
          padding: "32px",
          marginBottom: "40px",
          boxShadow: "0 2px 8px rgba(21, 26, 84, 0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: "20px",
                color: S.Navy,
                margin: 0,
              }}
            >
              {editingId ? "Edit Sermon & Overview" : "Add New Sermon"}
            </h2>
            {editingId && (
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "13px",
                  color: S.Slate600,
                  margin: "4px 0 0",
                  fontStyle: "italic",
                }}
              >
                Currently editing: &ldquo;{form.title}&rdquo;
              </p>
            )}
          </div>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm({ ...emptySermon });
                setEditingId(null);
              }}
              style={S.btn(S.Paper200, S.Navy)}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Row 1: Title & Speaker */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={S.label}>Sermon Title *</label>
              <input
                type="text"
                placeholder="e.g. THE RAIN OF WORDS"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                style={S.input}
              />
            </div>
            <div>
              <label style={S.label}>Speaker *</label>
              <input
                type="text"
                placeholder="e.g. Dr. Joshua Agunbiade"
                value={form.speaker}
                onChange={(e) => setForm({ ...form, speaker: e.target.value })}
                required
                style={S.input}
              />
            </div>
          </div>

          {/* Row 2: Date, Series, Scripture, Duration */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            <div>
              <label style={S.label}>Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                style={S.input}
              />
            </div>
            <div>
              <label style={S.label}>Series / Programme</label>
              <input
                type="text"
                placeholder="e.g. The Latter Rain"
                value={form.series}
                onChange={(e) => setForm({ ...form, series: e.target.value })}
                style={S.input}
              />
            </div>
            <div>
              <label style={S.label}>Scripture Reference</label>
              <input
                type="text"
                placeholder="e.g. 2 TIMOTHY 2:15"
                value={form.scripture}
                onChange={(e) => setForm({ ...form, scripture: e.target.value })}
                style={S.input}
              />
            </div>
            <div>
              <label style={S.label}>Duration</label>
              <input
                type="text"
                placeholder="e.g. 1:24:56"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                style={S.input}
              />
            </div>
          </div>

          {/* ── OVERVIEW / SYNOPSIS (HIGH IMPORTANCE SECTION) ── */}
          <div
            style={{
              padding: "20px",
              backgroundColor: S.Paper100,
              border: `1px solid ${S.Paper300}`,
              borderRadius: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
              <label style={{ ...S.label, color: S.Blue700, fontSize: "12px", marginBottom: 0 }}>
                ★ Overview / Message Synopsis
              </label>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Slate500 }}>
                {form.summary ? `${form.summary.length} characters` : "Empty"}
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "12px",
                color: S.Slate600,
                margin: "0 0 10px",
                lineHeight: "1.5em",
              }}
            >
              Write a unique, concise synopsis for this teaching. This overview appears on the{" "}
              <strong>sermon card</strong>, on the <strong>sermon detail page</strong>, and on the{" "}
              <strong>homepage</strong> when featured as &ldquo;The Latest Teaching&rdquo;.
            </p>
            <textarea
              placeholder="e.g. In this teaching, Dr. Joshua Agunbiade expounds on the divine provisions of the Latter Rain, highlighting how believers are spiritually equipped for harvest..."
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              rows={4}
              style={{
                ...S.input,
                minHeight: "110px",
                resize: "vertical",
                lineHeight: "1.68em",
                padding: "12px",
                fontSize: "15px",
                fontFamily: "'Playfair Display', Georgia, serif",
                color: S.Navy,
              }}
            />
          </div>

          {/* Row 4: URLs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div>
              <label style={S.label}>YouTube / Video URL</label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                style={S.input}
              />
            </div>
            <div>
              <label style={S.label}>Audio URL (MP3 / Podcast Link)</label>
              <input
                type="url"
                placeholder="https://... (Direct audio stream)"
                value={form.audioUrl}
                onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                style={S.input}
              />
            </div>
            <div>
              <label style={S.label}>Study Guide URL</label>
              <input
                type="url"
                placeholder="https://... (PDF Study Guide)"
                value={form.studyGuideUrl}
                onChange={(e) => setForm({ ...form, studyGuideUrl: e.target.value })}
                style={S.input}
              />
            </div>
          </div>

          {/* Row 5: Tags & Published Toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", alignItems: "center" }}>
            <div>
              <label style={S.label}>Tags (Comma-Separated)</label>
              <input
                type="text"
                placeholder="Faith, Grace, Righteousness, Camp 2026"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                style={S.input}
              />
            </div>
            <div style={{ paddingTop: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  id="pub"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: S.Blue700 }}
                />
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: S.Navy,
                  }}
                >
                  Published on Website
                </span>
              </label>
            </div>
          </div>

          {msg && (
            <p
              style={{
                color: msg.startsWith("Error") ? S.Red : S.Green,
                fontFamily: "'Poppins', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                margin: 0,
              }}
            >
              {msg}
            </p>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{ ...S.btn(S.Blue700, "#fff"), opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Saving..." : editingId ? "Update Sermon & Overview" : "Add Sermon"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm({ ...emptySermon });
                  setEditingId(null);
                }}
                style={S.btn(S.Paper200, S.Navy)}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Search & Filter Section ── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <div>
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: "20px",
                color: S.Navy,
                margin: 0,
              }}
            >
              All Sermons List
            </h2>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "13px",
                color: S.Slate500,
                margin: "4px 0 0",
              }}
            >
              Showing {filteredSermons.length} of {sermons.length} sermons
            </p>
          </div>

          {/* Quick Filter Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setOverviewFilter("all")}
              style={{
                ...S.btn(
                  overviewFilter === "all" ? S.Blue700 : S.Paper200,
                  overviewFilter === "all" ? S.White : S.Navy
                ),
                padding: "6px 14px",
              }}
            >
              All ({sermons.length})
            </button>
            <button
              type="button"
              onClick={() => setOverviewFilter("needs_overview")}
              style={{
                ...S.btn(
                  overviewFilter === "needs_overview" ? "#D97706" : S.Paper200,
                  overviewFilter === "needs_overview" ? S.White : "#92400E"
                ),
                padding: "6px 14px",
              }}
            >
              ⚠️ Needs Unique Overview ({needsOverviewCount})
            </button>
            <button
              type="button"
              onClick={() => setOverviewFilter("has_overview")}
              style={{
                ...S.btn(
                  overviewFilter === "has_overview" ? S.Green : S.Paper200,
                  overviewFilter === "has_overview" ? S.White : "#166534"
                ),
                padding: "6px 14px",
              }}
            >
              ✓ Has Custom Overview ({customOverviewCount})
            </button>
          </div>
        </div>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search by sermon title, series, speaker, or date (e.g. Latter Rain, 2026-10)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...S.input,
            padding: "12px 16px",
            fontSize: "14px",
            fontFamily: "'Poppins', sans-serif",
            border: `1px solid ${S.Paper400}`,
          }}
        />
      </div>

      {/* ── Sermons List ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {filteredSermons.slice(0, 50).map((s) => {
          const isGeneric = isGenericOverview(s.summary);
          return (
            <div
              key={s.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "20px",
                alignItems: "center",
                backgroundColor: S.White,
                border: `1px solid ${editingId === s.id ? S.Blue500 : S.Paper300}`,
                borderRadius: "8px",
                padding: "18px 24px",
                boxShadow: editingId === s.id ? "0 0 0 2px rgba(32, 144, 255, 0.2)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ minWidth: 0 }}>
                {/* Title and badges */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <div
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 700,
                      fontSize: "16px",
                      color: S.Navy,
                    }}
                  >
                    {s.title}
                  </div>
                  {isGeneric ? (
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "10px",
                        backgroundColor: "#FEF3C7",
                        color: "#92400E",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      ⚠️ Needs Overview
                    </span>
                  ) : (
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "10px",
                        backgroundColor: "#DCFCE7",
                        color: "#166534",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      ✓ Custom Overview
                    </span>
                  )}
                </div>

                {/* Subtitle meta */}
                <div
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "12px",
                    color: S.Slate500,
                    marginBottom: "8px",
                  }}
                >
                  {s.speaker || "Dr. Joshua Agunbiade"} · {s.date}{" "}
                  {s.series && `· Series: ${s.series}`}
                  {s.duration && ` · Duration: ${s.duration}`}
                </div>

                {/* Overview preview snippet */}
                <p
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "13.5px",
                    lineHeight: "1.6em",
                    color: isGeneric ? S.Slate500 : S.Slate600,
                    margin: 0,
                    fontStyle: isGeneric ? "italic" : "normal",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {s.summary || "(No overview provided yet)"}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "11px",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    backgroundColor: s.published ? "#DCFCE7" : S.Paper200,
                    color: s.published ? S.Green : S.Slate500,
                    fontWeight: 600,
                  }}
                >
                  {s.published ? "Published" : "Draft"}
                </span>
                <button
                  type="button"
                  onClick={() => togglePublish(s)}
                  style={S.btn(S.Paper200, S.Navy)}
                  title="Toggle visibility"
                >
                  {s.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(s)}
                  style={S.btn(S.Blue700, S.White)}
                  title="Edit sermon & overview"
                >
                  Edit Overview
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  style={S.btn("#FEE2E2", S.Red)}
                  title="Delete sermon"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {filteredSermons.length > 50 && (
          <p
            style={{
              textAlign: "center",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "12px",
              color: S.Slate500,
              padding: "16px 0",
            }}
          >
            Showing first 50 results. Use the search bar above to narrow down to any specific sermon.
          </p>
        )}

        {filteredSermons.length === 0 && (
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              color: S.Slate500,
              textAlign: "center",
              padding: "60px 0",
              fontSize: "15px",
            }}
          >
            No sermons match your search criteria.
          </p>
        )}
      </div>
    </div>
  );
}
