"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TRACK_DETAILS, type ResourceTrack } from "@/lib/cmsDefaults";

const S = {
  Navy: "#151A54",
  Blue700: "#0140C1",
  Blue500: "#2090FF",
  Paper100: "#F4F6FB",
  Paper200: "#E8ECF7",
  Paper300: "#D3DAEC",
  White: "#FFFFFF",
  Slate500: "#747CA1",
  Slate600: "#4A62A0",
  Red: "#DC2626",
  Green: "#16A34A",
  label: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600 as const,
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    display: "block",
    marginBottom: "6px",
    color: "#151A54",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    border: "1px solid #D3DAEC",
    borderRadius: "6px",
    fontFamily: "'Playfair Display', serif",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box" as const,
    color: "#151A54",
  },
  btn: (bg: string, color: string) => ({
    padding: "10px 20px",
    backgroundColor: bg,
    color,
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700 as const,
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  }),
};

const TRACK_LIST = [
  { slug: "how-to-preach-the-gospel", label: "How to Preach the Gospel" },
  { slug: "basic-prayer-classes", label: "Basic Prayer Classes" },
  { slug: "40-days-prayer-and-fasting", label: "40 Days Prayer & Fasting" },
  { slug: "the-doctrine-of-christ", label: "The Doctrine of Christ" },
  { slug: "work-and-increase", label: "Work & Increase" },
  { slug: "grace-for-grace", label: "Grace for Grace" },
];

export interface ResourceMaterial {
  id?: string;
  part: string;
  title: string;
  speaker: string;
  date?: string;
  scripture?: string;
  duration: string;
  overview?: string;
  description?: string;
  youtubeUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  tags?: string;
  published: boolean;
  type?: string;
  url?: string;
}

const emptyMaterial: ResourceMaterial = {
  part: "",
  title: "",
  speaker: "Dr. Joshua Agunbiade",
  date: new Date().toISOString().split("T")[0],
  scripture: "",
  duration: "",
  overview: "",
  youtubeUrl: "",
  audioUrl: "",
  pdfUrl: "",
  tags: "",
  published: true,
};

export default function ResourcesEditor() {
  const [activeTab, setActiveTab] = useState<"hub" | "tracks">("hub");
  const [activeTrack, setActiveTrack] = useState(TRACK_LIST[0].slug);
  const [trackData, setTrackData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Main /resources Hub State
  const [hubForm, setHubForm] = useState({
    heroEyebrow: "Equipping the Saints · Psalm 68:11",
    heroHeadline: "Resources & Study Guides",
    heroDescription:
      "Systematic teaching series, prayer class manuals, devotionals, and foundational apostolic courses designed to establish believers in Christ.",
    heroImage: "/images/teaching-and-resources.jpg",
    downloadables: [
      {
        title: "40 Days of Prayer & Fasting Devotional (PDF)",
        category: "Devotional",
        desc: "Complete 40-day scripture reading plan, prayer confessions, and fasting guidelines.",
        size: "4.2 MB · PDF",
        fileUrl: "",
      },
      {
        title: "How to Preach the Gospel: Evangelism Field Manual",
        category: "Apostolic Training",
        desc: "Practical steps, scriptures, and conviction points for witnessing on streets and campuses.",
        size: "2.1 MB · PDF",
        fileUrl: "",
      },
      {
        title: "The Doctrine of Christ Study Outline",
        category: "Theology & Foundations",
        desc: "Comprehensive expositional notes on Hebrews 6:1-2, baptisms, and eternal judgment.",
        size: "3.5 MB · PDF",
        fileUrl: "",
      },
      {
        title: "Daily Faith Confessions & Kingdom Decrees",
        category: "Spiritual Life",
        desc: "Scriptural confessions for health, wisdom, divine guidance, and financial increase.",
        size: "1.2 MB · PDF",
        fileUrl: "",
      },
    ],
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [materialForm, setMaterialForm] = useState<ResourceMaterial>({ ...emptyMaterial });

  // YouTube Quick-Paste State
  const [ytPasteUrl, setYtPasteUrl] = useState("");
  const [ytFetching, setYtFetching] = useState(false);
  const [ytMsg, setYtMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/cms/resources")
      .then((r) => r.json())
      .then((data) => {
        if (data.hub && data.hub.heroHeadline) {
          setHubForm((prev) => ({
            ...prev,
            heroEyebrow: data.hub.heroEyebrow || prev.heroEyebrow,
            heroHeadline: data.hub.heroHeadline || prev.heroHeadline,
            heroDescription: data.hub.heroDescription || prev.heroDescription,
            heroImage: data.hub.heroImage || prev.heroImage,
            downloadables:
              data.hub.downloadables && data.hub.downloadables.length > 0
                ? data.hub.downloadables
                : prev.downloadables,
          }));
        }

        const live = data.tracks || {};
        // Initialize with default materials if not set in Firestore
        const merged: Record<string, any> = {};
        for (const t of TRACK_LIST) {
          const defaultTrack = TRACK_DETAILS[t.slug];
          if (live[t.slug]) {
            merged[t.slug] = {
              title: live[t.slug].title || defaultTrack?.title || "",
              description: live[t.slug].description || defaultTrack?.description || "",
              materials:
                live[t.slug].materials && live[t.slug].materials.length > 0
                  ? live[t.slug].materials
                  : defaultTrack?.materials || [],
            };
          } else {
            merged[t.slug] = {
              title: defaultTrack?.title || "",
              description: defaultTrack?.description || "",
              materials: defaultTrack?.materials || [],
            };
          }
        }
        setTrackData(merged);
      })
      .catch((err) => console.error("Error loading resources data:", err))
      .finally(() => setLoading(false));
  }, []);

  const currentTrack = trackData[activeTrack] || {
    title: "",
    description: "",
    materials: TRACK_DETAILS[activeTrack]?.materials || [],
  };

  const updateTrackField = (field: string, value: string) => {
    setTrackData((prev) => ({
      ...prev,
      [activeTrack]: { ...currentTrack, [field]: value },
    }));
  };

  // Open modal for new material
  const openAddModal = () => {
    const materialsCount = (currentTrack.materials || []).length;
    setMaterialForm({
      ...emptyMaterial,
      part: `Part ${materialsCount + 1}`,
      date: new Date().toISOString().split("T")[0],
    });
    setEditingIndex(null);
    setYtPasteUrl("");
    setYtMsg(null);
    setModalOpen(true);
  };

  // Open modal for editing material
  const openEditModal = (index: number) => {
    const item = currentTrack.materials[index];
    setMaterialForm({
      part: item.part || (item.series ? item.series : `Part ${index + 1}`),
      title: item.title || "",
      speaker: item.speaker || "Dr. Joshua Agunbiade",
      date: item.date || new Date().toISOString().split("T")[0],
      scripture: item.scripture || "",
      duration: item.duration || "",
      overview: item.overview || item.description || "",
      youtubeUrl: item.youtubeUrl || (item.url && item.url.includes("youtu") ? item.url : ""),
      audioUrl: item.audioUrl || (item.url && item.url.includes(".mp3") ? item.url : ""),
      pdfUrl: item.pdfUrl || (item.url && item.url.includes(".pdf") ? item.url : ""),
      tags: item.tags || "",
      published: item.published !== undefined ? item.published : true,
    });
    setEditingIndex(index);
    setYtPasteUrl(item.youtubeUrl || (item.url && item.url.includes("youtu") ? item.url : ""));
    setYtMsg(null);
    setModalOpen(true);
  };

  // YouTube Quick-Paste Auto-Fill
  const handleYtAutoFill = async () => {
    const url = ytPasteUrl.trim();
    if (!url) {
      setYtMsg({ text: "Please enter a YouTube video URL", isError: true });
      return;
    }

    setYtFetching(true);
    setYtMsg(null);

    try {
      const match = url.match(/(?:v=|youtu\.be\/|\/embed\/)([A-Za-z0-9_-]{11})/);
      const videoId = match?.[1];
      if (!videoId) throw new Error("Could not extract a valid YouTube video ID from URL");

      const res = await fetch(`/api/sync-sermons/yt-meta?videoId=${videoId}`);
      if (!res.ok) throw new Error("Failed to fetch YouTube metadata");
      const meta = await res.json();

      setMaterialForm((prev) => ({
        ...prev,
        title: meta.title || prev.title,
        speaker: prev.speaker || "Dr. Joshua Agunbiade",
        duration: meta.duration || prev.duration,
        date: meta.publishedAt ? meta.publishedAt.split("T")[0] : prev.date,
        youtubeUrl: url,
        overview: meta.description ? meta.description.slice(0, 800) : prev.overview,
      }));

      setYtMsg({ text: `✓ Auto-filled: "${meta.title?.slice(0, 40)}..." (${meta.duration || "OK"})` });
    } catch (err: any) {
      setYtMsg({ text: err.message || "Failed to auto-fill from YouTube", isError: true });
    } finally {
      setYtFetching(false);
    }
  };

  // Save Material from Modal
  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.title.trim()) {
      alert("Please enter a Title for this teaching");
      return;
    }

    const itemToSave: ResourceMaterial = {
      ...materialForm,
      id: materialForm.id || Date.now().toString(),
      type: materialForm.youtubeUrl ? "Video" : materialForm.audioUrl ? "Audio" : materialForm.pdfUrl ? "PDF" : "Material",
      url: materialForm.youtubeUrl || materialForm.audioUrl || materialForm.pdfUrl || "",
    };

    const updatedMaterials = [...(currentTrack.materials || [])];
    if (editingIndex !== null) {
      updatedMaterials[editingIndex] = itemToSave;
    } else {
      updatedMaterials.push(itemToSave);
    }

    setTrackData((prev) => ({
      ...prev,
      [activeTrack]: { ...currentTrack, materials: updatedMaterials },
    }));

    setModalOpen(false);
    setMsg("Material added! Click 'Save Changes' to push live.");
    setTimeout(() => setMsg(""), 4000);
  };

  // Remove material
  const removeMaterial = (idx: number) => {
    if (!confirm("Are you sure you want to remove this teaching material?")) return;
    const mats = [...(currentTrack.materials || [])];
    mats.splice(idx, 1);
    setTrackData((prev) => ({
      ...prev,
      [activeTrack]: { ...currentTrack, materials: mats },
    }));
    setMsg("Material removed. Click 'Save Changes' to update the website.");
    setTimeout(() => setMsg(""), 4000);
  };

  const updateHubField = (field: string, value: string) => {
    setHubForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateDownloadable = (idx: number, field: string, value: string) => {
    setHubForm((prev) => {
      const list = [...prev.downloadables];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, downloadables: list };
    });
  };

  const addDownloadable = () => {
    setHubForm((prev) => ({
      ...prev,
      downloadables: [
        ...prev.downloadables,
        {
          title: "New Study Guide",
          category: "General",
          desc: "Description of study material or field manual...",
          size: "PDF",
          fileUrl: "",
        },
      ],
    }));
  };

  const removeDownloadable = (idx: number) => {
    if (!confirm("Remove this downloadable guide?")) return;
    setHubForm((prev) => {
      const list = [...prev.downloadables];
      list.splice(idx, 1);
      return { ...prev, downloadables: list };
    });
  };

  // Save all tracks and main hub settings to API
  const saveAllChanges = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/cms/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracks: trackData, hub: hubForm }),
      });
      const json = await res.json();
      if (json.ok) {
        setMsg("✓ All changes saved and published to the website!");
      } else {
        setMsg("Error saving: " + (json.error || "Unknown error"));
      }
    } catch (e: any) {
      setMsg("Error saving: " + e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 5000);
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
      <Link
        href="/cms"
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "12px",
          color: S.Blue700,
          textDecoration: "none",
          display: "block",
          marginBottom: "24px",
          fontWeight: 600,
        }}
      >
        ← Dashboard
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "28px", color: S.Navy, margin: 0, textTransform: "uppercase", letterSpacing: "-0.01em" }}>
            Resources & Study Guides
          </h1>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Slate500, margin: "4px 0 0" }}>
            Manage the main /resources hub page and individual study track subpages
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && (
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "12px",
                color: msg.startsWith("Error") ? S.Red : S.Green,
                fontWeight: 700,
              }}
            >
              {msg}
            </span>
          )}
          <button
            onClick={saveAllChanges}
            disabled={saving}
            style={{
              ...S.btn(S.Blue700, S.White),
              padding: "12px 28px",
              opacity: saving ? 0.6 : 1,
              boxShadow: "0 4px 12px rgba(1, 64, 193, 0.25)",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Top Tab Bar: Main Hub vs Subpages */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "28px", borderBottom: `2px solid ${S.Paper200}`, paddingBottom: "12px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("hub")}
          style={{
            ...S.btn(activeTab === "hub" ? S.Navy : S.Paper100, activeTab === "hub" ? S.White : S.Navy),
            padding: "10px 20px",
            fontSize: "12px",
            borderRadius: "6px",
            border: activeTab === "hub" ? `1px solid ${S.Navy}` : `1px solid ${S.Paper300}`,
          }}
        >
          ⚙️ Main Resources Page (/resources)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tracks")}
          style={{
            ...S.btn(activeTab === "tracks" ? S.Navy : S.Paper100, activeTab === "tracks" ? S.White : S.Navy),
            padding: "10px 20px",
            fontSize: "12px",
            borderRadius: "6px",
            border: activeTab === "tracks" ? `1px solid ${S.Navy}` : `1px solid ${S.Paper300}`,
          }}
        >
          📚 Study Tracks &amp; Subpages (/resources/[slug])
        </button>
      </div>

      {/* TAB 1: MAIN /resources HUB EDITOR */}
      {activeTab === "hub" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Hero Section Card */}
          <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "10px", padding: "28px", boxShadow: "0 2px 8px rgba(21, 26, 84, 0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px", color: S.Navy, margin: 0 }}>
                Hero Section Settings (/resources)
              </h2>
              <a
                href="/resources"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Blue500, textDecoration: "none", fontWeight: 600 }}
              >
                View Public Page ↗
              </a>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={S.label}>Hero Eyebrow Text</label>
                  <input
                    type="text"
                    style={S.input}
                    value={hubForm.heroEyebrow}
                    onChange={(e) => updateHubField("heroEyebrow", e.target.value)}
                    placeholder="e.g. Equipping the Saints · Psalm 68:11"
                  />
                </div>
                <div>
                  <label style={S.label}>Hero Headline</label>
                  <input
                    type="text"
                    style={S.input}
                    value={hubForm.heroHeadline}
                    onChange={(e) => updateHubField("heroHeadline", e.target.value)}
                    placeholder="e.g. Resources & Study Guides"
                  />
                </div>
              </div>

              <div>
                <label style={S.label}>Hero Description / Subtitle</label>
                <textarea
                  style={{ ...S.input, minHeight: "80px", resize: "vertical" }}
                  value={hubForm.heroDescription}
                  onChange={(e) => updateHubField("heroDescription", e.target.value)}
                  placeholder="Systematic teaching series, prayer class manuals, devotionals..."
                />
              </div>

              <div>
                <label style={S.label}>Hero Background Image URL</label>
                <input
                  type="text"
                  style={S.input}
                  value={hubForm.heroImage}
                  onChange={(e) => updateHubField("heroImage", e.target.value)}
                  placeholder="/images/teaching-and-resources.jpg"
                />
                {hubForm.heroImage && (
                  <div style={{ marginTop: "12px", height: "140px", borderRadius: "6px", overflow: "hidden", position: "relative", border: `1px solid ${S.Paper300}` }}>
                    <img
                      src={hubForm.heroImage}
                      alt="Hero Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(21, 26, 84, 0.88)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#FFFFFF", fontFamily: "'Poppins', sans-serif", fontSize: "12px", fontWeight: 600 }}>
                        Overlay Preview (Dark Blue)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Printable & Digital Materials (Downloadable Guides) */}
          <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "10px", padding: "28px", boxShadow: "0 2px 8px rgba(21, 26, 84, 0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px", color: S.Navy, margin: 0 }}>
                    Printable & Digital Materials
                  </h2>
                  <span style={{ backgroundColor: S.Paper200, color: S.Slate600, padding: "2px 8px", borderRadius: "12px", fontSize: "10.5px", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                    CMS Stored
                  </span>
                </div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Slate500, margin: "6px 0 0" }}>
                  Manage downloadable PDF study guides, manuals, and booklets. These remain preserved in CMS and can be re-enabled whenever materials are ready.
                </p>
              </div>
              <button
                type="button"
                onClick={addDownloadable}
                style={S.btn(S.Navy, S.White)}
              >
                + Add Study Guide
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {hubForm.downloadables.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${S.Paper300}`,
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: S.Paper100,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, color: S.Blue700, textTransform: "uppercase" }}>
                      Item #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDownloadable(idx)}
                      style={{ background: "none", border: "none", color: S.Red, cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontSize: "12px", fontWeight: 600 }}
                    >
                      Delete
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "12px" }}>
                    <div>
                      <label style={S.label}>Category</label>
                      <input
                        type="text"
                        style={S.input}
                        value={item.category}
                        onChange={(e) => updateDownloadable(idx, "category", e.target.value)}
                        placeholder="e.g. Devotional, Apostolic Training"
                      />
                    </div>
                    <div>
                      <label style={S.label}>Guide Title</label>
                      <input
                        type="text"
                        style={S.input}
                        value={item.title}
                        onChange={(e) => updateDownloadable(idx, "title", e.target.value)}
                        placeholder="e.g. 40 Days of Prayer & Fasting Devotional (PDF)"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label style={S.label}>Description</label>
                    <textarea
                      style={{ ...S.input, minHeight: "60px", resize: "vertical" }}
                      value={item.desc}
                      onChange={(e) => updateDownloadable(idx, "desc", e.target.value)}
                      placeholder="Brief overview of what this study guide contains..."
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
                    <div>
                      <label style={S.label}>File Size / Format</label>
                      <input
                        type="text"
                        style={S.input}
                        value={item.size}
                        onChange={(e) => updateDownloadable(idx, "size", e.target.value)}
                        placeholder="e.g. 4.2 MB · PDF"
                      />
                    </div>
                    <div>
                      <label style={S.label}>File Download URL</label>
                      <input
                        type="url"
                        style={S.input}
                        value={item.fileUrl || ""}
                        onChange={(e) => updateDownloadable(idx, "fileUrl", e.target.value)}
                        placeholder="https://... (Direct link to PDF)"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDY TRACKS & SUBPAGES */}
      {activeTab === "tracks" && (
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        {/* Track Sidebar Tabs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "240px", flexShrink: 0 }}>
          {TRACK_LIST.map((t) => {
            const count = (trackData[t.slug]?.materials || []).length;
            const isActive = activeTrack === t.slug;
            return (
              <button
                key={t.slug}
                onClick={() => setActiveTrack(t.slug)}
                style={{
                  ...S.btn(isActive ? S.Blue700 : S.Paper100, isActive ? S.White : S.Navy),
                  textAlign: "left",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  letterSpacing: "0.02em",
                  textTransform: "none" as const,
                  border: isActive ? `1px solid ${S.Blue700}` : `1px solid ${S.Paper300}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{t.label}</span>
                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    backgroundColor: isActive ? "rgba(255,255,255,0.2)" : S.Paper200,
                    color: isActive ? S.White : S.Slate600,
                    padding: "2px 8px",
                    borderRadius: "12px",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <div style={{ marginTop: "20px", padding: "16px", backgroundColor: S.Paper100, borderRadius: "8px", border: `1px solid ${S.Paper300}` }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, color: S.Navy, textTransform: "uppercase", marginBottom: "6px" }}>
              Public Web Link
            </div>
            <a
              href={`/resources/${activeTrack}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "11px",
                color: S.Blue500,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                wordBreak: "break-all",
              }}
            >
              /resources/{activeTrack} ↗
            </a>
          </div>
        </div>

        {/* Track Content Column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
          {/* Track Info Card */}
          <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "10px", padding: "28px", boxShadow: "0 2px 8px rgba(21, 26, 84, 0.04)" }}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px", color: S.Navy, margin: "0 0 20px" }}>
              {TRACK_LIST.find((t) => t.slug === activeTrack)?.label}
            </h2>
            <div style={{ marginBottom: "16px" }}>
              <label style={S.label}>Track Title (overrides default)</label>
              <input
                type="text"
                style={S.input}
                value={currentTrack.title || ""}
                onChange={(e) => updateTrackField("title", e.target.value)}
                placeholder={TRACK_LIST.find((t) => t.slug === activeTrack)?.label || ""}
              />
            </div>
            <div>
              <label style={S.label}>Track Description / Theological Context</label>
              <textarea
                style={{ ...S.input, minHeight: "84px", resize: "vertical" }}
                value={currentTrack.description || ""}
                onChange={(e) => updateTrackField("description", e.target.value)}
                placeholder="Exposition shown on the track subpage explaining its spiritual focus..."
              />
            </div>
          </div>

          {/* Materials Section */}
          <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "10px", padding: "28px", boxShadow: "0 2px 8px rgba(21, 26, 84, 0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "16px", color: S.Navy, margin: 0 }}>
                  Curriculum Sessions & Materials ({(currentTrack.materials || []).length})
                </h3>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11.5px", color: S.Slate500, margin: "2px 0 0" }}>
                  Teachings, video streams, audio recordings, and downloadable PDF study guides
                </p>
              </div>
              <button onClick={openAddModal} style={S.btn(S.Blue700, S.White)}>
                + Add Material
              </button>
            </div>

            {/* Materials List */}
            {(currentTrack.materials || []).length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: S.Paper100, borderRadius: "8px", border: `1px dashed ${S.Paper300}` }}>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: S.Slate500, margin: "0 0 12px" }}>
                  No materials recorded for this study track yet.
                </p>
                <button onClick={openAddModal} style={S.btn(S.Blue700, S.White)}>
                  + Add First Material
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(currentTrack.materials || []).map((mat: any, idx: number) => {
                  const isVideo = mat.youtubeUrl || (mat.url && mat.url.includes("youtu")) || mat.type === "Video";
                  const isAudio = mat.audioUrl || (mat.url && mat.url.includes(".mp3")) || mat.type === "Audio";
                  const isPdf = mat.pdfUrl || (mat.url && mat.url.includes(".pdf")) || mat.type === "PDF";
                  const badgeLabel = isVideo ? "VIDEO" : isAudio ? "AUDIO" : isPdf ? "PDF" : mat.type || "STUDY";

                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 18px",
                        backgroundColor: S.Paper100,
                        borderRadius: "8px",
                        border: `1px solid ${S.Paper300}`,
                        gap: "16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            backgroundColor: isVideo ? "#EFF6FF" : isPdf ? "#FEF2F2" : S.Paper200,
                            color: isVideo ? S.Blue700 : isPdf ? S.Red : S.Slate600,
                            border: `1px solid ${isVideo ? "#BFDBFE" : isPdf ? "#FECACA" : S.Paper300}`,
                            padding: "4px 8px",
                            borderRadius: "4px",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          {badgeLabel}
                        </span>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, color: S.Blue700, textTransform: "uppercase" }}>
                              {mat.part || `Part ${idx + 1}`}
                            </span>
                            {mat.speaker && (
                              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Slate500 }}>
                                · {mat.speaker}
                              </span>
                            )}
                            {mat.duration && (
                              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Slate500 }}>
                                ({mat.duration})
                              </span>
                            )}
                          </div>

                          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "14.5px", fontWeight: 700, color: S.Navy, marginTop: "2px" }}>
                            {mat.title}
                          </div>

                          {mat.overview && (
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "12.5px", color: S.Slate600, marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "550px" }}>
                              {mat.overview}
                            </div>
                          )}

                          <div style={{ display: "flex", gap: "12px", marginTop: "6px", flexWrap: "wrap" }}>
                            {(mat.youtubeUrl || (mat.url && mat.url.includes("youtu"))) && (
                              <a
                                href={mat.youtubeUrl || mat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Blue500, textDecoration: "none" }}
                              >
                                ▶ Watch URL ↗
                              </a>
                            )}
                            {(mat.pdfUrl || (mat.url && mat.url.includes(".pdf"))) && (
                              <a
                                href={mat.pdfUrl || mat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Green, textDecoration: "none" }}
                              >
                                📥 PDF Guide ↗
                              </a>
                            )}
                            {(mat.audioUrl || (mat.url && mat.url.includes(".mp3"))) && (
                              <a
                                href={mat.audioUrl || mat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "#8B5CF6", textDecoration: "none" }}
                              >
                                🎧 Audio Stream ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                        <button onClick={() => openEditModal(idx)} style={S.btn(S.Paper200, S.Navy)}>
                          Edit
                        </button>
                        <button onClick={() => removeMaterial(idx)} style={S.btn("#FEE2E2", S.Red)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* ====================================================================
          MODAL: ADD / EDIT RESOURCE TEACHING (Matching Screenshot 2 exactly)
         ==================================================================== */}
      {/* ── Slide-Over Drawer: Add / Edit Resource Teaching (comes from left side) ── */}
      {modalOpen && (
        <>
          {/* Backdrop overlay (click to close) */}
          <div
            onClick={() => setModalOpen(false)}
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
              width: "min(720px, 92vw)",
              backgroundColor: S.White,
              zIndex: 9999,
              boxShadow: "8px 0 36px rgba(0, 0, 0, 0.28)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "resDrawerIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <style>{`
              @keyframes resDrawerIn {
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
                  {editingIndex !== null ? "Edit Resource Material" : "Add New Resource"}
                </h2>
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
                  {TRACK_LIST.find((t) => t.slug === activeTrack)?.label || "Track Material"}
                </p>
              </div>

              {/* Hamburger / Close Button */}
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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
                title="Close Drawer (Click outside or ✕)"
                aria-label="Close Drawer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>

            {/* ⚡ YOUTUBE QUICK-PASTE AUTO-FILL (matching screenshot 2) */}
            <div
              style={{
                backgroundColor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: "8px",
                padding: "18px 20px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: "11px",
                  color: "#1D4ED8",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>⚡</span>
                <span>YouTube Quick-Paste Auto-Fill</span>
              </div>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11.5px", color: "#475569", margin: "0 0 12px", lineHeight: "1.5em" }}>
                Paste a YouTube video URL below and click <strong>Auto-fill</strong> — the title, speaker, date, duration, video URL, and synopsis will be imported automatically.
              </p>

              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={ytPasteUrl}
                  onChange={(e) => setYtPasteUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={{
                    ...S.input,
                    backgroundColor: S.White,
                    flex: 1,
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "13px",
                  }}
                />
                <button
                  type="button"
                  onClick={handleYtAutoFill}
                  disabled={ytFetching}
                  style={{
                    ...S.btn(S.Blue700, S.White),
                    padding: "10px 22px",
                    opacity: ytFetching ? 0.6 : 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {ytFetching ? "Fetching..." : "Auto-Fill →"}
                </button>
              </div>

              {ytMsg && (
                <div
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: ytMsg.isError ? S.Red : S.Green,
                    marginTop: "8px",
                  }}
                >
                  {ytMsg.text}
                </div>
              )}
            </div>

            {/* Entry Form */}
            <form onSubmit={handleSaveMaterial} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Row 1: Title & Speaker */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={S.label}>Sermon / Resource Title *</label>
                  <input
                    type="text"
                    required
                    style={S.input}
                    value={materialForm.title}
                    onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                    placeholder="e.g. THE WORD OF FAITH - PART 1"
                  />
                </div>
                <div>
                  <label style={S.label}>Speaker *</label>
                  <input
                    type="text"
                    required
                    style={S.input}
                    value={materialForm.speaker}
                    onChange={(e) => setMaterialForm({ ...materialForm, speaker: e.target.value })}
                    placeholder="Dr. Joshua Agunbiade"
                  />
                </div>
              </div>

              {/* Row 2: Date, Series/Part, Scripture, Duration */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 1fr", gap: "16px" }}>
                <div>
                  <label style={S.label}>Date *</label>
                  <input
                    type="date"
                    style={{ ...S.input, fontFamily: "'Poppins', sans-serif" }}
                    value={materialForm.date}
                    onChange={(e) => setMaterialForm({ ...materialForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label style={S.label}>Series / Programme</label>
                  <input
                    type="text"
                    style={S.input}
                    value={materialForm.part}
                    onChange={(e) => setMaterialForm({ ...materialForm, part: e.target.value })}
                    placeholder="e.g. Part 1, Chapter 1"
                  />
                </div>
                <div>
                  <label style={S.label}>Scripture Reference</label>
                  <input
                    type="text"
                    style={S.input}
                    value={materialForm.scripture}
                    onChange={(e) => setMaterialForm({ ...materialForm, scripture: e.target.value })}
                    placeholder="e.g. 2 TIMOTHY 2:15"
                  />
                </div>
                <div>
                  <label style={S.label}>Duration</label>
                  <input
                    type="text"
                    style={S.input}
                    value={materialForm.duration}
                    onChange={(e) => setMaterialForm({ ...materialForm, duration: e.target.value })}
                    placeholder="e.g. 1:24:56"
                  />
                </div>
              </div>

              {/* Row 3: Overview / Synopsis (Matching Screenshot 2) */}
              <div
                style={{
                  border: `1px solid ${S.Paper300}`,
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: S.Paper100,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ ...S.label, margin: 0, color: S.Blue700 }}>
                    ★ Overview / Message Synopsis
                  </label>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Slate500 }}>
                    {materialForm.overview?.length || 0} characters
                  </span>
                </div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: S.Slate500, margin: "0 0 10px", lineHeight: "1.4em" }}>
                  Write a unique, concise synopsis for this teaching. This overview appears on the resource card and subpage.
                </p>
                <textarea
                  style={{
                    ...S.input,
                    minHeight: "110px",
                    resize: "vertical",
                    backgroundColor: S.White,
                  }}
                  value={materialForm.overview}
                  onChange={(e) => setMaterialForm({ ...materialForm, overview: e.target.value })}
                  placeholder="e.g. In this teaching, Dr. Joshua Agunbiade expounds on the divine provisions of the Latter Rain, highlighting how believers are spiritually equipped for harvest..."
                />
              </div>

              {/* Row 4: URLs (YouTube, Audio, PDF) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={S.label}>YouTube / Video URL</label>
                  <input
                    type="url"
                    style={S.input}
                    value={materialForm.youtubeUrl}
                    onChange={(e) => setMaterialForm({ ...materialForm, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label style={S.label}>Audio URL (MP3 / Podcast)</label>
                  <input
                    type="url"
                    style={S.input}
                    value={materialForm.audioUrl}
                    onChange={(e) => setMaterialForm({ ...materialForm, audioUrl: e.target.value })}
                    placeholder="https://... (Direct audio stream)"
                  />
                </div>
                <div>
                  <label style={S.label}>Study Guide URL (PDF)</label>
                  <input
                    type="url"
                    style={S.input}
                    value={materialForm.pdfUrl}
                    onChange={(e) => setMaterialForm({ ...materialForm, pdfUrl: e.target.value })}
                    placeholder="https://... (PDF Study Guide)"
                  />
                </div>
              </div>

              {/* Row 5: Tags & Published Checkbox */}
              <div style={{ display: "flex", gap: "20px", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <label style={S.label}>Tags (Comma-Separated)</label>
                  <input
                    type="text"
                    style={S.input}
                    value={materialForm.tags}
                    onChange={(e) => setMaterialForm({ ...materialForm, tags: e.target.value })}
                    placeholder="Faith, Grace, Righteousness, Camp 2026"
                  />
                </div>

                <div style={{ marginTop: "22px" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontSize: "12px", fontWeight: 700, color: S.Navy }}>
                    <input
                      type="checkbox"
                      checked={materialForm.published}
                      onChange={(e) => setMaterialForm({ ...materialForm, published: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: S.Blue700, cursor: "pointer" }}
                    />
                    Published on Website
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${S.Paper200}` }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={S.btn(S.Paper200, S.Navy)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...S.btn(S.Blue700, S.White),
                    padding: "12px 28px",
                  }}
                >
                  {editingIndex !== null ? "Update Resource" : "Add Resource"}
                </button>
              </div>
              </form>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
