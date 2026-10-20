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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [ytPasteUrl, setYtPasteUrl] = useState("");
  const [ytFetching, setYtFetching] = useState(false);
  const [ytMsg, setYtMsg] = useState("");


  // Search, Filter & Pagination controls
  const [search, setSearch] = useState("");
  const [overviewFilter, setOverviewFilter] = useState<"all" | "needs_overview" | "has_overview">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | "all">(50);

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

  // Reset to page 1 whenever search, filter, or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, overviewFilter, pageSize]);

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

  // ── YouTube Quick-Paste Auto-fill ──────────────────────────────────────
  const handleYtAutoFill = async () => {
    const url = ytPasteUrl.trim();
    if (!url) return;
    setYtFetching(true);
    setYtMsg("");
    try {
      const match = url.match(/(?:v=|youtu\.be\/|\/embed\/)([A-Za-z0-9_-]{11})/);
      const videoId = match?.[1];
      if (!videoId) throw new Error("Could not extract YouTube video ID from URL");

      const res = await fetch(`/api/sync-sermons/yt-meta?videoId=${videoId}`);
      if (!res.ok) throw new Error("YouTube metadata fetch failed");
      const meta = await res.json();

      setForm((prev: any) => ({
        ...prev,
        title: meta.title || prev.title,
        coverImageUrl: meta.thumbnailUrl || prev.coverImageUrl,
        duration: meta.duration || prev.duration,
        date: meta.publishedAt ? meta.publishedAt.split("T")[0] : prev.date,
        summary: (!isGenericOverview(meta.description) && meta.description)
          ? meta.description.slice(0, 800)
          : prev.summary,
        videoUrl: url,
      }));
      setYtMsg("✓ Auto-filled from YouTube");
      setYtPasteUrl("");
    } catch (e: any) {
      setYtMsg("Error: " + e.message);
    }
    setYtFetching(false);
    setTimeout(() => setYtMsg(""), 5000);
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
      setIsDrawerOpen(false);
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
    setIsDrawerOpen(true);
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

  // Filtered sermons list (checks title, series, speaker, date, scripture, summary)
  const filteredSermons = useMemo(() => {
    return sermons.filter((s) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.series && s.series.toLowerCase().includes(q)) ||
        (s.speaker && s.speaker.toLowerCase().includes(q)) ||
        (s.date && s.date.includes(q)) ||
        (s.scripture && s.scripture.toLowerCase().includes(q)) ||
        (s.summary && s.summary.toLowerCase().includes(q));

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

  // Pagination calculations
  const totalItems = filteredSermons.length;
  const totalPages = pageSize === "all" ? 1 : Math.max(1, Math.ceil(totalItems / (pageSize as number)));
  const effectiveCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = pageSize === "all" ? 0 : (effectiveCurrentPage - 1) * (pageSize as number);
  const endIndex = pageSize === "all" ? totalItems : Math.min(startIndex + (pageSize as number), totalItems);
  const paginatedSermons = filteredSermons.slice(startIndex, endIndex);

  const goToPage = (p: number) => {
    const target = Math.max(1, Math.min(p, totalPages));
    setCurrentPage(target);
    const el = document.getElementById("sermons-list-anchor");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
            onClick={() => {
              setForm({ ...emptySermon });
              setEditingId(null);
              setIsDrawerOpen(true);
            }}
            style={{
              ...S.btn(S.Blue700, S.White),
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            + Add New Sermon
          </button>
          <button
            onClick={handleManualSync}
            disabled={syncing}
            style={{
              ...S.btn(S.Paper200, S.Navy),
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

      {/* ── Slide-Over Drawer (Comes from the left side, preserving list scroll) ── */}
      {isDrawerOpen && (
        <>
          {/* Backdrop overlay (click to close) */}
          <div
            onClick={() => {
              setIsDrawerOpen(false);
              setEditingId(null);
            }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(14, 21, 86, 0.65)",
              backdropFilter: "blur(3px)",
              zIndex: 9998,
            }}
          />

          {/* Left Slide-over Drawer Panel */}
          <aside
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "min(680px, 92vw)",
              backgroundColor: S.White,
              zIndex: 9999,
              boxShadow: "8px 0 36px rgba(0, 0, 0, 0.28)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "sermonDrawerIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <style>{`
              @keyframes sermonDrawerIn {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
              }
            `}</style>

            {/* Drawer Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 28px",
                borderBottom: `1px solid ${S.Paper300}`,
                backgroundColor: "#FFFFFF",
                position: "sticky",
                top: 0,
                zIndex: 2,
              }}
            >
              <div style={{ minWidth: 0, flex: 1, paddingRight: "16px" }}>
                <h2
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: "19px",
                    color: S.Navy,
                    margin: 0,
                  }}
                >
                  {editingId ? "Edit Sermon & Overview" : "Add New Sermon"}
                </h2>
                {editingId && form.title && (
                  <p
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "13px",
                      color: S.Slate600,
                      margin: "3px 0 0",
                      fontStyle: "italic",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Editing: &ldquo;{form.title}&rdquo;
                  </p>
                )}
              </div>

              {/* Hamburger / Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setEditingId(null);
                }}
                style={{
                  background: S.Paper100,
                  border: `1px solid ${S.Paper300}`,
                  borderRadius: "8px",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: S.Navy,
                  fontSize: "18px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
                title="Close Drawer (Esc / Click Outside)"
                aria-label="Close Drawer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* ── YouTube Quick-Paste Auto-fill ─────────────────────────────── */}
                {!editingId && (
                  <div style={{ padding: "16px 20px", backgroundColor: "#F0F7FF", border: "1px solid #B8D4F8", borderRadius: "6px" }}>
                    <label style={{ ...S.label, color: S.Blue700, marginBottom: "8px" }}>⚡ YouTube Quick-Paste Auto-fill</label>
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Slate600, margin: "0 0 10px", lineHeight: "1.5em" }}>
                      Paste a YouTube video URL below and click <strong>Auto-fill</strong> — the title, thumbnail, date, duration, and video URL will be imported automatically.
                    </p>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={ytPasteUrl}
                        onChange={e => setYtPasteUrl(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleYtAutoFill())}
                        style={{ ...S.input, flex: 1, border: "1px solid #B8D4F8", backgroundColor: "#FFFFFF" }}
                      />
                      <button
                        type="button"
                        onClick={handleYtAutoFill}
                        disabled={ytFetching || !ytPasteUrl.trim()}
                        style={{ ...S.btn(S.Blue700, S.White), opacity: (ytFetching || !ytPasteUrl.trim()) ? 0.6 : 1, whiteSpace: "nowrap" }}
                      >
                        {ytFetching ? "Fetching..." : "Auto-fill →"}
                      </button>
                    </div>
                    {ytMsg && (
                      <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: ytMsg.startsWith("✓") ? S.Green : S.Red, margin: "8px 0 0", fontWeight: 600 }}>
                        {ytMsg}
                      </p>
                    )}
                  </div>
                )}

                {/* Row 1: Title & Speaker */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
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
                    padding: "18px",
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
                      fontSize: "11.5px",
                      color: S.Slate600,
                      margin: "0 0 10px",
                      lineHeight: "1.5em",
                    }}
                  >
                    Write a unique, concise synopsis for this teaching. This overview appears on the{" "}
                    <strong>sermon card</strong> and on the <strong>sermon detail page</strong>.
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
                      lineHeight: "1.65em",
                      padding: "12px",
                      fontSize: "14px",
                      fontFamily: "'Playfair Display', Georgia, serif",
                      color: S.Navy,
                    }}
                  />
                </div>

                {/* Row 4: URLs */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={S.label}>Audio URL (MP3 / Podcast)</label>
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
                </div>

                {/* Row 5: Tags & Published Toggle */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", alignItems: "center" }}>
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
                  <div style={{ paddingTop: "18px" }}>
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
                        Published
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

                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ ...S.btn(S.Blue700, "#fff"), opacity: loading ? 0.6 : 1 }}
                  >
                    {loading ? "Saving..." : editingId ? "Update Sermon & Overview" : "Add Sermon"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...emptySermon });
                      setEditingId(null);
                      setIsDrawerOpen(false);
                    }}
                    style={S.btn(S.Paper200, S.Navy)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </aside>
        </>
      )}

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
          placeholder="Search by sermon title, series, speaker, date, scripture, or keywords in overview..."
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

        {/* ── Top Pagination Bar ── */}
        {totalItems > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              backgroundColor: S.White,
              border: `1px solid ${S.Paper300}`,
              borderRadius: "8px",
              padding: "14px 20px",
              marginTop: "16px",
            }}
          >
            {/* Left: Summary & Per-page toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "12px",
                  color: S.Slate500,
                  fontWeight: 500,
                }}
              >
                Showing <strong style={{ color: S.Navy }}>{totalItems === 0 ? 0 : startIndex + 1}–{endIndex}</strong> of{" "}
                <strong style={{ color: S.Navy }}>{totalItems}</strong> sermons
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Slate500 }}>
                  Per page:
                </span>
                {([50, 100, "all"] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setPageSize(sz)}
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: "4px",
                      border: `1px solid ${pageSize === sz ? S.Blue700 : S.Paper300}`,
                      backgroundColor: pageSize === sz ? S.Blue700 : S.Paper100,
                      color: pageSize === sz ? S.White : S.Navy,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {sz === "all" ? `All (${totalItems})` : sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Page navigation pills */}
            {pageSize !== "all" && totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  disabled={effectiveCurrentPage <= 1}
                  onClick={() => goToPage(1)}
                  style={{
                    ...S.btn(
                      effectiveCurrentPage <= 1 ? S.Paper100 : S.Paper200,
                      effectiveCurrentPage <= 1 ? S.Paper400 : S.Navy
                    ),
                    padding: "6px 10px",
                    cursor: effectiveCurrentPage <= 1 ? "not-allowed" : "pointer",
                    opacity: effectiveCurrentPage <= 1 ? 0.6 : 1,
                  }}
                  title="First page"
                >
                  « First
                </button>
                <button
                  type="button"
                  disabled={effectiveCurrentPage <= 1}
                  onClick={() => goToPage(effectiveCurrentPage - 1)}
                  style={{
                    ...S.btn(
                      effectiveCurrentPage <= 1 ? S.Paper100 : S.Paper200,
                      effectiveCurrentPage <= 1 ? S.Paper400 : S.Navy
                    ),
                    padding: "6px 10px",
                    cursor: effectiveCurrentPage <= 1 ? "not-allowed" : "pointer",
                    opacity: effectiveCurrentPage <= 1 ? 0.6 : 1,
                  }}
                  title="Previous page"
                >
                  ‹ Prev
                </button>

                {/* Page numbers */}
                {(() => {
                  if (totalPages <= 7) {
                    return Array.from({ length: totalPages }, (_, i) => i + 1);
                  }
                  const pages: (number | string)[] = [];
                  if (effectiveCurrentPage <= 4) {
                    pages.push(1, 2, 3, 4, 5, "...", totalPages);
                  } else if (effectiveCurrentPage >= totalPages - 3) {
                    pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(1, "...", effectiveCurrentPage - 1, effectiveCurrentPage, effectiveCurrentPage + 1, "...", totalPages);
                  }
                  return pages;
                })().map((num, idx) => {
                  if (num === "...") {
                    return (
                      <span key={`dots-top-${idx}`} style={{ padding: "0 4px", color: S.Slate500, fontSize: "12px" }}>
                        …
                      </span>
                    );
                  }
                  const isCurrent = num === effectiveCurrentPage;
                  return (
                    <button
                      key={`page-top-${num}`}
                      type="button"
                      onClick={() => goToPage(num as number)}
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "12px",
                        fontWeight: 600,
                        minWidth: "32px",
                        height: "32px",
                        padding: "0 6px",
                        borderRadius: "4px",
                        border: isCurrent ? `1px solid ${S.Blue700}` : `1px solid ${S.Paper300}`,
                        backgroundColor: isCurrent ? S.Blue700 : S.White,
                        color: isCurrent ? S.White : S.Navy,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {num}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={effectiveCurrentPage >= totalPages}
                  onClick={() => goToPage(effectiveCurrentPage + 1)}
                  style={{
                    ...S.btn(
                      effectiveCurrentPage >= totalPages ? S.Paper100 : S.Paper200,
                      effectiveCurrentPage >= totalPages ? S.Paper400 : S.Navy
                    ),
                    padding: "6px 10px",
                    cursor: effectiveCurrentPage >= totalPages ? "not-allowed" : "pointer",
                    opacity: effectiveCurrentPage >= totalPages ? 0.6 : 1,
                  }}
                  title="Next page"
                >
                  Next ›
                </button>
                <button
                  type="button"
                  disabled={effectiveCurrentPage >= totalPages}
                  onClick={() => goToPage(totalPages)}
                  style={{
                    ...S.btn(
                      effectiveCurrentPage >= totalPages ? S.Paper100 : S.Paper200,
                      effectiveCurrentPage >= totalPages ? S.Paper400 : S.Navy
                    ),
                    padding: "6px 10px",
                    cursor: effectiveCurrentPage >= totalPages ? "not-allowed" : "pointer",
                    opacity: effectiveCurrentPage >= totalPages ? 0.6 : 1,
                  }}
                  title="Last page"
                >
                  Last »
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Anchor for smooth scroll on page change */}
      <div id="sermons-list-anchor" style={{ scrollMarginTop: "24px" }} />

      {/* ── Sermons List ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {paginatedSermons.map((s) => {
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
                  {s.scripture && ` · Scripture: ${s.scripture}`}
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

        {/* ── Bottom Pagination Bar ── */}
        {totalItems > 0 && pageSize !== "all" && totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              backgroundColor: S.White,
              border: `1px solid ${S.Paper300}`,
              borderRadius: "8px",
              padding: "16px 20px",
              marginTop: "20px",
            }}
          >
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "12px",
                color: S.Slate500,
              }}
            >
              Page <strong style={{ color: S.Navy }}>{effectiveCurrentPage}</strong> of{" "}
              <strong style={{ color: S.Navy }}>{totalPages}</strong> ({totalItems} total sermons)
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
              <button
                type="button"
                disabled={effectiveCurrentPage <= 1}
                onClick={() => goToPage(1)}
                style={{
                  ...S.btn(
                    effectiveCurrentPage <= 1 ? S.Paper100 : S.Paper200,
                    effectiveCurrentPage <= 1 ? S.Paper400 : S.Navy
                  ),
                  padding: "6px 12px",
                  cursor: effectiveCurrentPage <= 1 ? "not-allowed" : "pointer",
                  opacity: effectiveCurrentPage <= 1 ? 0.6 : 1,
                }}
              >
                « First
              </button>
              <button
                type="button"
                disabled={effectiveCurrentPage <= 1}
                onClick={() => goToPage(effectiveCurrentPage - 1)}
                style={{
                  ...S.btn(
                    effectiveCurrentPage <= 1 ? S.Paper100 : S.Paper200,
                    effectiveCurrentPage <= 1 ? S.Paper400 : S.Navy
                  ),
                  padding: "6px 12px",
                  cursor: effectiveCurrentPage <= 1 ? "not-allowed" : "pointer",
                  opacity: effectiveCurrentPage <= 1 ? 0.6 : 1,
                }}
              >
                ‹ Previous
              </button>
              <button
                type="button"
                disabled={effectiveCurrentPage >= totalPages}
                onClick={() => goToPage(effectiveCurrentPage + 1)}
                style={{
                  ...S.btn(
                    effectiveCurrentPage >= totalPages ? S.Paper100 : S.Paper200,
                    effectiveCurrentPage >= totalPages ? S.Paper400 : S.Navy
                  ),
                  padding: "6px 12px",
                  cursor: effectiveCurrentPage >= totalPages ? "not-allowed" : "pointer",
                  opacity: effectiveCurrentPage >= totalPages ? 0.6 : 1,
                }}
              >
                Next ›
              </button>
              <button
                type="button"
                disabled={effectiveCurrentPage >= totalPages}
                onClick={() => goToPage(totalPages)}
                style={{
                  ...S.btn(
                    effectiveCurrentPage >= totalPages ? S.Paper100 : S.Paper200,
                    effectiveCurrentPage >= totalPages ? S.Paper400 : S.Navy
                  ),
                  padding: "6px 12px",
                  cursor: effectiveCurrentPage >= totalPages ? "not-allowed" : "pointer",
                  opacity: effectiveCurrentPage >= totalPages ? 0.6 : 1,
                }}
              >
                Last »
              </button>
            </div>
          </div>
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
