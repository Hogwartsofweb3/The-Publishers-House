"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TRACK_DETAILS, type ResourceTrack } from "@/lib/cmsDefaults";

export interface LessonMaterial {
  part: string;
  title: string;
  speaker: string;
  duration: string;
  youtubeUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  notesUrl?: string;
  scripture?: string;
  overview?: string;
  description?: string;
  published?: boolean;
}

export interface CourseTrack {
  slug: string;
  title: string;
  scripture: string;
  eyebrow: string;
  lede: string;
  description: string;
  materials: LessonMaterial[];
}

const emptyTrackForm = {
  slug: "",
  title: "",
  eyebrow: "Apostolic Curriculum",
  scripture: "Psalm 68:11",
  lede: "",
  description: "",
};

const emptyLessonForm: LessonMaterial = {
  part: "Part 1",
  title: "",
  speaker: "Dr. Joshua Agunbiade",
  duration: "45:00",
  youtubeUrl: "",
  audioUrl: "",
  pdfUrl: "",
  scripture: "",
  overview: "",
  published: true,
};

export default function CoursesAdminPage() {
  const [tracks, setTracks] = useState<Record<string, CourseTrack>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  // Track Modal State
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [editingTrackSlug, setEditingTrackSlug] = useState<string | null>(null);
  const [trackForm, setTrackForm] = useState(emptyTrackForm);

  // Lesson Management Modal State
  const [lessonsDrawerSlug, setLessonsDrawerSlug] = useState<string | null>(null);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLessonIdx, setEditingLessonIdx] = useState<number | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonMaterial>(emptyLessonForm);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/resources");
      if (res.ok) {
        const data = await res.json();
        const liveTracks = data.tracks || {};
        const merged: Record<string, CourseTrack> = {};

        // Merge defaults with live Firestore data
        for (const [slug, defaultData] of Object.entries(TRACK_DETAILS)) {
          const custom = liveTracks[slug] || {};
          merged[slug] = {
            slug,
            title: custom.title || defaultData.title,
            scripture: custom.scripture || defaultData.scripture,
            eyebrow: custom.eyebrow || defaultData.eyebrow,
            lede: custom.lede || defaultData.lede,
            description: custom.description || defaultData.description,
            materials: (custom.materials && custom.materials.length > 0)
              ? custom.materials
              : (defaultData.materials || []).map((m) => ({ ...m, published: true })),
          };
        }

        // Include any newly created custom tracks
        for (const [slug, custom] of Object.entries(liveTracks) as [string, any][]) {
          if (!merged[slug] && custom) {
            merged[slug] = {
              slug,
              title: custom.title || "Untitled Course",
              scripture: custom.scripture || "",
              eyebrow: custom.eyebrow || "Curriculum",
              lede: custom.lede || "",
              description: custom.description || "",
              materials: custom.materials || [],
            };
          }
        }

        setTracks(merged);
      } else {
        // Fallback to defaults
        const fallback: Record<string, CourseTrack> = {};
        for (const [slug, d] of Object.entries(TRACK_DETAILS)) {
          fallback[slug] = { slug, ...d, materials: d.materials.map((m) => ({ ...m, published: true })) };
        }
        setTracks(fallback);
      }
    } catch {
      const fallback: Record<string, CourseTrack> = {};
      for (const [slug, d] of Object.entries(TRACK_DETAILS)) {
        fallback[slug] = { slug, ...d, materials: d.materials.map((m) => ({ ...m, published: true })) };
      }
      setTracks(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const saveToBackend = async (newTracks: Record<string, CourseTrack>, successMessage: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracks: newTracks }),
      });
      if (!res.ok) throw new Error("Failed to save to database");
      setTracks(newTracks);
      setMsg(successMessage);
      setTimeout(() => setMsg(""), 3500);
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Track Handlers ---
  const openNewTrack = () => {
    setEditingTrackSlug(null);
    setTrackForm(emptyTrackForm);
    setTrackModalOpen(true);
  };

  const openEditTrack = (t: CourseTrack) => {
    setEditingTrackSlug(t.slug);
    setTrackForm({
      slug: t.slug,
      title: t.title,
      eyebrow: t.eyebrow,
      scripture: t.scripture,
      lede: t.lede,
      description: t.description,
    });
    setTrackModalOpen(true);
  };

  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackForm.title.trim()) return;

    const rawSlug = trackForm.slug.trim() || trackForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = editingTrackSlug || rawSlug;

    const existingMaterials = tracks[slug]?.materials || [];
    const updatedTrack: CourseTrack = {
      slug,
      title: trackForm.title,
      eyebrow: trackForm.eyebrow,
      scripture: trackForm.scripture,
      lede: trackForm.lede,
      description: trackForm.description,
      materials: existingMaterials,
    };

    const updatedTracks = {
      ...tracks,
      [slug]: updatedTrack,
    };

    await saveToBackend(
      updatedTracks,
      editingTrackSlug ? "Course details updated and live across website & members portal ✓" : "New course track added and published ✓"
    );
    setTrackModalOpen(false);
    setEditingTrackSlug(null);
  };

  const handleDeleteTrack = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete the course "${tracks[slug]?.title}"? This will remove it from the Resources page and Member portal.`)) return;

    const updated = { ...tracks };
    delete updated[slug];
    await saveToBackend(updated, "Course track removed ✓");
  };

  // --- Lesson Handlers ---
  const activeDrawerTrack = lessonsDrawerSlug ? tracks[lessonsDrawerSlug] : null;

  const openAddLesson = () => {
    const nextNum = (activeDrawerTrack?.materials.length || 0) + 1;
    setEditingLessonIdx(null);
    setLessonForm({
      ...emptyLessonForm,
      part: `Part ${nextNum}`,
    });
    setLessonModalOpen(true);
  };

  const openEditLesson = (idx: number, lesson: LessonMaterial) => {
    setEditingLessonIdx(idx);
    setLessonForm({ ...lesson });
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonsDrawerSlug || !lessonForm.title.trim()) return;

    const track = tracks[lessonsDrawerSlug];
    if (!track) return;

    let updatedMaterials = [...track.materials];
    if (editingLessonIdx !== null) {
      updatedMaterials[editingLessonIdx] = { ...lessonForm };
    } else {
      updatedMaterials.push({ ...lessonForm });
    }

    const updatedTracks = {
      ...tracks,
      [lessonsDrawerSlug]: {
        ...track,
        materials: updatedMaterials,
      },
    };

    await saveToBackend(
      updatedTracks,
      editingLessonIdx !== null ? "Lesson updated successfully ✓" : "New lesson added to course syllabus ✓"
    );
    setLessonModalOpen(false);
    setEditingLessonIdx(null);
  };

  const handleDeleteLesson = async (idx: number) => {
    if (!lessonsDrawerSlug) return;
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    const track = tracks[lessonsDrawerSlug];
    if (!track) return;

    const updatedMaterials = track.materials.filter((_, i) => i !== idx);
    const updatedTracks = {
      ...tracks,
      [lessonsDrawerSlug]: {
        ...track,
        materials: updatedMaterials,
      },
    };

    await saveToBackend(updatedTracks, "Lesson removed from course syllabus ✓");
  };

  const trackList = Object.values(tracks);
  const filteredTracks = trackList.filter((t) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(s) ||
      t.eyebrow.toLowerCase().includes(s) ||
      t.scripture.toLowerCase().includes(s) ||
      t.lede.toLowerCase().includes(s)
    );
  });

  const totalLessons = trackList.reduce((acc, t) => acc + (t.materials?.length || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "4px" }}>
            Curriculum &amp; Resources Sync · Psalm 68:11
          </div>
          <h1
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 800,
              fontSize: "28px",
              lineHeight: "34px",
              color: "#141C6E",
              margin: 0,
            }}
          >
            Courses &amp; Biblical Curricula
          </h1>
          <p
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 500,
              fontSize: "13px",
              color: "#4A5490",
              margin: "6px 0 0",
            }}
          >
            Directly connected to the public Resources page and Member Portal courses. Updates reflect everywhere instantly.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && (
            <span
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                color: "#0F6B38",
                backgroundColor: "#E4F5EA",
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid #B7EB8F",
              }}
            >
              {msg}
            </span>
          )}

          <Link
            href="/resources"
            target="_blank"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "10px",
              padding: "10px 16px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              fontSize: "13px",
              color: "#141C6E",
              textDecoration: "none",
            }}
          >
            View /resources ↗
          </Link>

          <button
            onClick={openNewTrack}
            style={{
              backgroundColor: "#1F46C8",
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              fontSize: "13px",
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
            }}
          >
            + Add Course Track
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D5DCF2", borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Active Curricula</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#141C6E", marginTop: "4px" }}>{trackList.length} Tracks</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#4A5490" }}>Live on public Resources &amp; Member Portal</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D5DCF2", borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Total Lesson Modules</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#1F46C8", marginTop: "4px" }}>{totalLessons} Lessons</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#1F46C8" }}>Audio, video, and PDF study outlines</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D5DCF2", borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Portal Integration</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#0F6B38", marginTop: "4px" }}>100% Synced</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#0F6B38" }}>Admin &harr; CMS &harr; Members linked</div>
        </div>
      </div>

      {/* Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "14px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #D5DCF2",
          borderRadius: "12px",
          padding: "14px 20px",
        }}
      >
        <input
          type="text"
          placeholder="Search courses by title, category, or scripture..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "9px 14px",
            borderRadius: "8px",
            border: "1px solid #D5DCF2",
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontSize: "13px",
            color: "#141C6E",
            outline: "none",
          }}
        />
        <span style={{ fontSize: "12px", color: "#4A5490", fontWeight: 600 }}>
          Showing {filteredTracks.length} of {trackList.length} courses
        </span>
      </div>

      {/* Courses Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "20px",
        }}
      >
        {loading && (
          <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", color: "#4A5490" }}>
            Loading course curricula from Resources repository...
          </div>
        )}

        {!loading && filteredTracks.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              backgroundColor: "#FFFFFF",
              border: "1px dashed #D5DCF2",
              borderRadius: "14px",
              padding: "48px 24px",
              textAlign: "center",
              color: "#747CA1",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "13px",
            }}
          >
            No courses found matching &ldquo;{search}&rdquo;. Click &ldquo;+ Add Course Track&rdquo; to publish a new course.
          </div>
        )}

        {!loading &&
          filteredTracks.map((crs) => (
            <div
              key={crs.slug}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D5DCF2",
                borderRadius: "14px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
                boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
              }}
            >
              <div>
                {/* Header Pill & Materials Count */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "6px",
                      backgroundColor: "#E8EDFB",
                      color: "#1F46C8",
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {crs.eyebrow}
                  </span>

                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "99px",
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: "#E4F5EA",
                      color: "#0F6B38",
                    }}
                  >
                    {crs.materials?.length || 0} Lessons
                  </span>
                </div>

                {/* Course Title */}
                <h3
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#141C6E",
                    margin: "0 0 6px",
                  }}
                >
                  {crs.title}
                </h3>

                {/* Scripture Anchor */}
                {crs.scripture && (
                  <div
                    style={{
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      color: "#0140C1",
                      marginBottom: "10px",
                    }}
                  >
                    📖 {crs.scripture}
                  </div>
                )}

                {/* Summary / Lede */}
                <p
                  style={{
                    fontFamily: "var(--font-serif, 'Playfair Display', serif)",
                    fontSize: "13.5px",
                    lineHeight: "1.55em",
                    color: "#4A5490",
                    margin: 0,
                  }}
                >
                  {crs.lede}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: "1px solid #E8EDFB", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setLessonsDrawerSlug(crs.slug)}
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      backgroundColor: "#1F46C8",
                      border: "none",
                      borderRadius: "8px",
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>Manage Lessons ({crs.materials?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => openEditTrack(crs)}
                    style={{
                      padding: "9px 14px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #D5DCF2",
                      borderRadius: "8px",
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#141C6E",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Link
                    href={`/resources/${crs.slug}`}
                    target="_blank"
                    style={{
                      fontSize: "11.5px",
                      color: "#0140C1",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    }}
                  >
                    View Public Page ↗
                  </Link>

                  <button
                    onClick={() => handleDeleteTrack(crs.slug)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#9B1C1C",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Delete Track
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Drawer / Modal: Manage Lessons of Selected Course */}
      {activeDrawerTrack && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "760px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 40px rgba(14, 21, 86, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #E8EDFB", paddingBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase" }}>
                  {activeDrawerTrack.eyebrow}
                </span>
                <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "20px", fontWeight: 800, color: "#141C6E", margin: "4px 0" }}>
                  {activeDrawerTrack.title} · Lessons Catalog
                </h2>
                <div style={{ fontSize: "12px", color: "#747CA1" }}>
                  Add or edit video lectures, MP3 audio links, and PDF study outlines.
                </div>
              </div>

              <button
                onClick={() => setLessonsDrawerSlug(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#747CA1",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                &times;
              </button>
            </div>

            {/* Quick Add Button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#141C6E" }}>
                {activeDrawerTrack.materials?.length || 0} Lessons Configured
              </span>
              <button
                onClick={openAddLesson}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#0F6B38",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Add Lesson to Course
              </button>
            </div>

            {/* Lessons List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {activeDrawerTrack.materials?.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#747CA1", backgroundColor: "#F8FAFD", borderRadius: "10px", border: "1px dashed #D5DCF2" }}>
                  No lessons added yet. Click &ldquo;+ Add Lesson to Course&rdquo; to add the first lecture or study guide.
                </div>
              ) : (
                activeDrawerTrack.materials?.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      backgroundColor: "#F8FAFD",
                      border: "1px solid #E8EDFB",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#1F46C8", backgroundColor: "#E8EDFB", padding: "2px 6px", borderRadius: "4px" }}>
                          {m.part}
                        </span>
                        <span style={{ fontSize: "11px", color: "#747CA1", fontWeight: 600 }}>
                          ⏱ {m.duration || "Study Session"}
                        </span>
                        {m.youtubeUrl && <span style={{ fontSize: "10px", color: "#DC2626", fontWeight: 700 }}>▶ Video</span>}
                        {m.audioUrl && <span style={{ fontSize: "10px", color: "#0F6B38", fontWeight: 700 }}>🎧 Audio</span>}
                        {m.pdfUrl && <span style={{ fontSize: "10px", color: "#D97706", fontWeight: 700 }}>📄 PDF</span>}
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#141C6E" }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#4A5490", marginTop: "2px" }}>
                        Speaker: {m.speaker} {m.scripture ? `· 📖 ${m.scripture}` : ""}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => openEditLesson(idx, m)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #D5DCF2",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#141C6E",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(idx)}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#FDE7E7",
                          border: "1px solid #F8B4B4",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#9B1C1C",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #E8EDFB", paddingTop: "16px" }}>
              <button
                onClick={() => setLessonsDrawerSlug(null)}
                style={{
                  padding: "9px 20px",
                  backgroundColor: "#151A54",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Course Track Metadata */}
      {trackModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "580px",
              boxShadow: "0 10px 40px rgba(14, 21, 86, 0.15)",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "20px", fontWeight: 800, color: "#141C6E", margin: "0 0 4px" }}>
              {editingTrackSlug ? "Edit Course Track" : "Add New Course Track"}
            </h2>
            <p style={{ fontSize: "12px", color: "#4A5490", margin: "0 0 20px" }}>
              Changes will immediately update the Resources page and the Member Portal curriculum.
            </p>

            <form onSubmit={handleSaveTrack} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "6px" }}>
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Foundations of Biblical Hermeneutics"
                  value={trackForm.title}
                  onChange={(e) => setTrackForm({ ...trackForm, title: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "6px" }}>
                    Category / Eyebrow
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apostolic Foundations"
                    value={trackForm.eyebrow}
                    onChange={(e) => setTrackForm({ ...trackForm, eyebrow: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "6px" }}>
                    Scripture Anchor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hebrews 6:1-2"
                    value={trackForm.scripture}
                    onChange={(e) => setTrackForm({ ...trackForm, scripture: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "6px" }}>
                  Course Summary (Lede) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Short introductory overview displayed on course cards..."
                  value={trackForm.lede}
                  onChange={(e) => setTrackForm({ ...trackForm, lede: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "6px" }}>
                  Full Description &amp; Objectives
                </label>
                <textarea
                  rows={3}
                  placeholder="In-depth theological background and curriculum objectives..."
                  value={trackForm.description}
                  onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setTrackModalOpen(false)}
                  style={{ padding: "10px 16px", backgroundColor: "#FFFFFF", border: "1px solid #D5DCF2", borderRadius: "8px", fontSize: "12px", fontWeight: 600, color: "#141C6E", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: "10px 20px", backgroundColor: "#1F46C8", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                >
                  {saving ? "Saving..." : "Save & Publish Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Single Lesson */}
      {lessonModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "540px",
              boxShadow: "0 10px 40px rgba(14, 21, 86, 0.15)",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "18px", fontWeight: 800, color: "#141C6E", margin: "0 0 16px" }}>
              {editingLessonIdx !== null ? "Edit Lesson Details" : "Add Lesson to Syllabus"}
            </h2>

            <form onSubmit={handleSaveLesson} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "10.5px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "4px" }}>Part / Module</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Part 1"
                    value={lessonForm.part}
                    onChange={(e) => setLessonForm({ ...lessonForm, part: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "12.5px", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "10.5px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "4px" }}>Lesson Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Title of this lecture"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "12.5px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "10.5px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "4px" }}>Speaker / Instructor</label>
                  <input
                    type="text"
                    value={lessonForm.speaker}
                    onChange={(e) => setLessonForm({ ...lessonForm, speaker: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "12.5px", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "10.5px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "4px" }}>Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 52:10"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "12.5px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10.5px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "4px" }}>YouTube / Video Stream URL</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={lessonForm.youtubeUrl || ""}
                  onChange={(e) => setLessonForm({ ...lessonForm, youtubeUrl: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "12.5px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10.5px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "4px" }}>Audio Stream / MP3 URL</label>
                <input
                  type="url"
                  placeholder="https://.../audio.mp3"
                  value={lessonForm.audioUrl || ""}
                  onChange={(e) => setLessonForm({ ...lessonForm, audioUrl: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "12.5px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10.5px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "4px" }}>PDF Study Guide / Notes URL</label>
                <input
                  type="url"
                  placeholder="https://.../study-notes.pdf"
                  value={lessonForm.pdfUrl || ""}
                  onChange={(e) => setLessonForm({ ...lessonForm, pdfUrl: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "12.5px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setLessonModalOpen(false)}
                  style={{ padding: "8px 14px", backgroundColor: "#FFFFFF", border: "1px solid #D5DCF2", borderRadius: "6px", fontSize: "12px", fontWeight: 600, color: "#141C6E", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: "8px 18px", backgroundColor: "#0F6B38", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                >
                  {saving ? "Saving..." : "Save Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
