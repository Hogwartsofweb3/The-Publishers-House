"use client";

import { useAudio } from "@/components/GlobalAudioPlayer";
import Link from "next/link";

export interface ResourceMaterialItem {
  part: string;
  title: string;
  speaker: string;
  duration: string;
  scripture?: string;
  overview?: string;
  youtubeUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  notesUrl?: string;
}

interface ResourcesCurriculumClientProps {
  trackSlug: string;
  trackTitle: string;
  materials: ResourceMaterialItem[];
}

export default function ResourcesCurriculumClient({
  trackSlug,
  trackTitle,
  materials,
}: ResourcesCurriculumClientProps) {
  const { playVideo, playAudio } = useAudio();

  const handlePlayVideo = (m: ResourceMaterialItem, idx: number) => {
    playVideo({
      id: `res_${trackSlug}_${idx}`,
      title: m.title,
      speaker: m.speaker || "Dr. Joshua Agunbiade",
      series: trackTitle,
      scripture: m.scripture,
      videoUrl: m.youtubeUrl,
      audioUrl: m.audioUrl,
      duration: m.duration,
      type: "resource",
      resourceSlug: trackSlug,
    });
  };

  const handlePlayAudio = (m: ResourceMaterialItem, idx: number) => {
    playAudio({
      id: `res_${trackSlug}_${idx}`,
      title: m.title,
      speaker: m.speaker || "Dr. Joshua Agunbiade",
      series: trackTitle,
      scripture: m.scripture,
      videoUrl: m.youtubeUrl,
      audioUrl: m.audioUrl,
      duration: m.duration,
      type: "resource",
      resourceSlug: trackSlug,
    });
  };

  if (!materials || materials.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#F4F6FB", borderRadius: "8px", color: "#4A62A0" }}>
        No curriculum materials published yet for this track. Check back soon.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {materials.map((m, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: "#F4F6FB",
            border: "1px solid #D3DAEC",
            borderRadius: "8px",
            padding: "24px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            transition: "all 0.15s ease",
          }}
        >
          <div style={{ display: "flex", gap: "20px", alignItems: "center", minWidth: "260px", flex: 1 }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "8px",
                backgroundColor: "#151A54",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: "14px",
                flexShrink: 0,
              }}
            >
              {idx + 1}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, color: "#0140C1", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {m.part} · {m.speaker} {m.scripture ? `· ${m.scripture}` : ""}
              </div>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "17px", fontWeight: 700, color: "#151A54", margin: "4px 0 0" }}>
                {m.title}
              </h3>
              {m.overview && (
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", color: "#4A62A0", margin: "6px 0 0", lineHeight: "1.55em", maxWidth: "680px" }}>
                  {m.overview}
                </p>
              )}
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11.5px", color: "#747CA1", marginTop: "6px" }}>
                Duration: {m.duration}
              </div>
            </div>
          </div>

          {/* Action Buttons — In-Page Docked Playback */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {m.youtubeUrl ? (
              <button
                type="button"
                onClick={() => handlePlayVideo(m, idx)}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D3DAEC",
                  borderRadius: "4px",
                  color: "#151A54",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#2090FF";
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.borderColor = "#2090FF";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                  e.currentTarget.style.color = "#151A54";
                  e.currentTarget.style.borderColor = "#D3DAEC";
                }}
              >
                <span>▶</span>
                <span>Watch Video</span>
              </button>
            ) : m.audioUrl ? (
              <button
                type="button"
                onClick={() => handlePlayAudio(m, idx)}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D3DAEC",
                  borderRadius: "4px",
                  color: "#151A54",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#0140C1";
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.borderColor = "#0140C1";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                  e.currentTarget.style.color = "#151A54";
                  e.currentTarget.style.borderColor = "#D3DAEC";
                }}
              >
                <span>🎧</span>
                <span>Listen Audio</span>
              </button>
            ) : (
              <Link
                href="/sermons"
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D3DAEC",
                  borderRadius: "4px",
                  color: "#151A54",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>▶</span>
                <span>Listen &amp; Watch</span>
              </Link>
            )}

            {m.pdfUrl && (
              <a
                href={m.pdfUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#0140C1",
                  border: "none",
                  borderRadius: "4px",
                  color: "#FFFFFF",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(1,64,193,0.25)",
                }}
              >
                <span>📥</span>
                <span>Download PDF</span>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
