"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { TRACK_DETAILS } from "@/lib/cmsDefaults";

export interface TrackMaterial {
  part?: string;
  title: string;
  speaker?: string;
  duration?: string;
  youtubeUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  notesUrl?: string;
  scripture?: string;
  overview?: string;
  published?: boolean;
}

interface CourseTrackItem {
  slug: string;
  title: string;
  scripture: string;
  eyebrow: string;
  lede: string;
  description: string;
  materials: TrackMaterial[];
}

const STAGES = [
  { step: "01", title: "Sound Doctrine", desc: "Understanding the core tenets of the Christian faith and biblical truth." },
  { step: "02", title: "Prayer & Intercession", desc: "Cultivating a deep secret place and prevailing intercessory grace." },
  { step: "03", title: "Living Publications", desc: "Reflecting the life of Christ through personal integrity and character." },
  { step: "04", title: "Ministry Service", desc: "Deploying spiritual gifts in ministry units to build up the church." },
];

export default function MemberGrowthTrackPage() {
  const [tracks, setTracks] = useState<CourseTrackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTrackForSyllabus, setSelectedTrackForSyllabus] = useState<CourseTrackItem | null>(null);

  // Fetch live tracks from /api/cms/resources (which synchronizes with settings/resources_tracks & portal/courses)
  useEffect(() => {
    let isMounted = true;

    async function loadCurriculum() {
      try {
        const res = await fetch("/api/cms/resources");
        if (res.ok) {
          const data = await res.json();
          const liveTracks = data.tracks || {};
          const trackMap: Record<string, CourseTrackItem> = {};

          // Seed with defaults
          for (const [slug, def] of Object.entries(TRACK_DETAILS)) {
            const live = liveTracks[slug];
            trackMap[slug] = {
              slug,
              title: live?.title || def.title,
              scripture: live?.scripture || def.scripture,
              eyebrow: live?.eyebrow || def.eyebrow,
              lede: live?.lede || def.lede,
              description: live?.description || def.description,
              materials: (live?.materials && live.materials.length > 0)
                ? live.materials.filter((m: any) => m && m.published !== false)
                : (def.materials || []).map((m) => ({ ...m, published: true })),
            };
          }

          // Merge any new tracks created by Admin in /portal/courses
          for (const [slug, custom] of Object.entries(liveTracks) as [string, any][]) {
            if (!trackMap[slug] && custom) {
              trackMap[slug] = {
                slug,
                title: custom.title || "Curriculum Track",
                scripture: custom.scripture || "Psalm 68:11",
                eyebrow: custom.eyebrow || "Apostolic Curriculum",
                lede: custom.lede || "",
                description: custom.description || "",
                materials: (custom.materials && Array.isArray(custom.materials))
                  ? custom.materials.filter((m: any) => m && m.published !== false)
                  : [],
              };
            }
          }

          if (isMounted) {
            setTracks(Object.values(trackMap));
          }
        } else {
          // Fallback to static defaults
          if (isMounted) {
            setTracks(
              Object.entries(TRACK_DETAILS).map(([slug, def]) => ({
                slug,
                ...def,
                materials: def.materials || [],
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch member curriculum tracks:", err);
        if (isMounted) {
          setTracks(
            Object.entries(TRACK_DETAILS).map(([slug, def]) => ({
              slug,
              ...def,
              materials: def.materials || [],
            }))
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCurriculum();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered tracks based on search
  const filteredTracks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.scripture.toLowerCase().includes(q) ||
        t.lede.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.eyebrow.toLowerCase().includes(q) ||
        t.materials.some((m) => (m.title?.toLowerCase().includes(q) || false) || (m.speaker?.toLowerCase().includes(q) || false))
    );
  }, [tracks, search]);

  const totalLessonsCount = useMemo(() => {
    return tracks.reduce((acc, t) => acc + (t.materials?.length || 0), 0);
  }, [tracks]);

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px", paddingBottom: "48px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>
            Discipleship &amp; Equipping · Psalm 68:11
          </div>
          <h1 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "clamp(24px, 3vw, 32px)", color: "#141C6E", margin: 0 }}>
            Growth Track &amp; Biblical Curriculum
          </h1>
          <p style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", fontStyle: "italic", fontSize: "14.5px", color: "#4A5490", marginTop: "6px", maxWidth: "700px" }}>
            Structured doctrinal courses designed to root believers in sound biblical theology, prayer, and kingdom impact.
          </p>
        </div>

        {/* Live sync badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px", padding: "8px 14px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#1E40AF" }}>
            Live Curriculum Synced with Resources
          </span>
        </div>
      </div>

      {/* Pillars Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {STAGES.map((p) => (
          <div
            key={p.step}
            style={{
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#2090FF", marginBottom: "6px" }}>
              STAGE {p.step}
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#141C6E", marginBottom: "6px" }}>
              {p.title}
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", lineHeight: "1.55em" }}>
              {p.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Available Curriculum Tracks Container */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        {/* Toolbar: Title, stats and search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "18px", fontWeight: 700, color: "#141C6E", margin: 0 }}>
              Curriculum Modules &amp; Study Tracks
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0" }}>
              Each course includes video teachings, audio downloads, and companion study outlines.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search courses or lessons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "8px 12px 8px 32px",
                  borderRadius: "6px",
                  border: "1px solid #D5DCF2",
                  fontSize: "12.5px",
                  color: "#141C6E",
                  width: "240px",
                  outline: "none",
                }}
              />
              <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#94A3B8" }}>
                🔍
              </span>
            </div>

            <span style={{ fontSize: "12px", color: "#1F46C8", fontWeight: 700, backgroundColor: "#EEF2FF", padding: "6px 12px", borderRadius: "6px" }}>
              {tracks.length} Tracks · {totalLessonsCount} Lessons
            </span>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#64748B" }}>
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>⏳</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#141C6E" }}>Loading latest curriculum...</div>
            <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>Synchronizing live modules and study outlines</div>
          </div>
        )}

        {/* Empty Search Result */}
        {!loading && filteredTracks.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#64748B" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>📖</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#141C6E" }}>No matching curriculum tracks found</div>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "6px 0 16px" }}>
              Try adjusting your search query or clear the filter.
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  padding: "6px 16px",
                  backgroundColor: "#1F46C8",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Tracks Grid */}
        {!loading && filteredTracks.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            {filteredTracks.map((track, idx) => {
              const videoCount = track.materials.filter((m) => !!m.youtubeUrl).length;
              const audioCount = track.materials.filter((m) => !!m.audioUrl).length;
              const pdfCount = track.materials.filter((m) => !!m.pdfUrl || !!m.notesUrl).length;

              return (
                <div
                  key={track.slug}
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#FFFFFF",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "18px",
                    boxShadow: "0 2px 10px rgba(20, 28, 110, 0.03)",
                    transition: "box-shadow 0.2s ease, transform 0.2s ease",
                  }}
                >
                  <div>
                    {/* Top Tag & Lesson Count */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.12em", backgroundColor: "#EFF6FF", padding: "3px 8px", borderRadius: "4px" }}>
                        {track.eyebrow || `Module ${idx + 1}`}
                      </span>
                      <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                        📚 {track.materials.length} Lessons
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "17px", fontWeight: 700, color: "#141C6E", margin: "0 0 8px", lineHeight: "1.3em" }}>
                      {track.title}
                    </h3>

                    {/* Scripture Reference */}
                    <div style={{ fontSize: "11.5px", color: "#2090FF", fontWeight: 600, marginBottom: "10px" }}>
                      📖 {track.scripture || "Psalm 68:11"}
                    </div>

                    {/* Lede / Overview */}
                    <p style={{ fontSize: "12.5px", color: "#475569", margin: "0 0 16px", lineHeight: "1.55em" }}>
                      {track.lede || track.description}
                    </p>

                    {/* Media Availability Badges */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                      {videoCount > 0 && (
                        <span style={{ fontSize: "10.5px", fontWeight: 600, color: "#DC2626", backgroundColor: "#FEF2F2", padding: "2px 8px", borderRadius: "4px" }}>
                          🎬 {videoCount} Video{videoCount > 1 ? "s" : ""}
                        </span>
                      )}
                      {audioCount > 0 && (
                        <span style={{ fontSize: "10.5px", fontWeight: 600, color: "#059669", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "4px" }}>
                          🎧 {audioCount} Audio MP3{audioCount > 1 ? "s" : ""}
                        </span>
                      )}
                      {pdfCount > 0 && (
                        <span style={{ fontSize: "10.5px", fontWeight: 600, color: "#2563EB", backgroundColor: "#EFF6FF", padding: "2px 8px", borderRadius: "4px" }}>
                          📄 {pdfCount} Study PDF{pdfCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Buttons */}
                  <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link
                        href={`/resources/${track.slug}`}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          padding: "10px 14px",
                          backgroundColor: "#1F46C8",
                          color: "#FFFFFF",
                          borderRadius: "6px",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        Start Course →
                      </Link>

                      <button
                        onClick={() => setSelectedTrackForSyllabus(track)}
                        style={{
                          padding: "10px 14px",
                          backgroundColor: "#F8FAFC",
                          color: "#1E293B",
                          border: "1px solid #CBD5E1",
                          borderRadius: "6px",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        View Syllabus
                      </button>
                    </div>

                    <Link
                      href={`/resources/${track.slug}#curriculum`}
                      style={{
                        textAlign: "center",
                        fontSize: "11.5px",
                        color: "#2090FF",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Download Outlines &amp; Lesson Audio →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Syllabus Modal Drawer */}
      {selectedTrackForSyllabus && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setSelectedTrackForSyllabus(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              maxWidth: "750px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              padding: "28px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", borderBottom: "1px solid #E2E8F0", paddingBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>
                  {selectedTrackForSyllabus.eyebrow || "Curriculum Track"} · {selectedTrackForSyllabus.scripture}
                </div>
                <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "20px", fontWeight: 700, color: "#141C6E", margin: 0 }}>
                  {selectedTrackForSyllabus.title}
                </h2>
                <p style={{ fontSize: "12.5px", color: "#64748B", margin: "6px 0 0" }}>
                  {selectedTrackForSyllabus.lede || selectedTrackForSyllabus.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedTrackForSyllabus(null)}
                style={{
                  backgroundColor: "#F1F5F9",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#64748B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Lessons List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Course Lessons ({selectedTrackForSyllabus.materials.length})
              </div>

              {selectedTrackForSyllabus.materials.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", backgroundColor: "#F8FAFC", borderRadius: "8px", color: "#64748B", fontSize: "13px" }}>
                  No lessons published for this course yet.
                </div>
              ) : (
                selectedTrackForSyllabus.materials.map((lesson, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      padding: "16px",
                      backgroundColor: "#F8FAFC",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "220px" }}>
                      <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase" }}>
                        {lesson.part || `Part ${idx + 1}`} · {lesson.duration || "Study Session"}
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginTop: "2px" }}>
                        {lesson.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                        Speaker: {lesson.speaker || "Dr. Joshua Agunbiade"}
                      </div>
                      {lesson.scripture && (
                        <div style={{ fontSize: "11px", color: "#2563EB", fontWeight: 600, marginTop: "2px" }}>
                          📖 {lesson.scripture}
                        </div>
                      )}
                    </div>

                    {/* Lesson Media Action Links */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {lesson.youtubeUrl && (
                        <a
                          href={lesson.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#FEE2E2",
                            color: "#991B1B",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          ▶ Video
                        </a>
                      )}
                      {lesson.audioUrl && (
                        <a
                          href={lesson.audioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#D1FAE5",
                            color: "#065F46",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          🎧 Audio
                        </a>
                      )}
                      {lesson.pdfUrl && (
                        <a
                          href={lesson.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#DBEAFE",
                            color: "#1E40AF",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          📄 Outline
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Bottom CTA */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #E2E8F0", paddingTop: "16px" }}>
              <button
                onClick={() => setSelectedTrackForSyllabus(null)}
                style={{
                  padding: "9px 18px",
                  backgroundColor: "#F1F5F9",
                  color: "#475569",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <Link
                href={`/resources/${selectedTrackForSyllabus.slug}`}
                style={{
                  padding: "9px 20px",
                  backgroundColor: "#1F46C8",
                  color: "#FFFFFF",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Go to Dedicated Course Page →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
