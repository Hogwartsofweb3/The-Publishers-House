"use client";

import Link from "next/link";
import type { Sermon } from "@/lib/firebase";
import { useAudio } from "@/components/GlobalAudioPlayer";

const Navy    = "#151A54";
const Blue500 = "#2090FF";
const Blue700 = "#0140C1";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const White   = "#FFFFFF";

const T = {
  displayS:  { fontFamily: "var(--font-headline, var(--font-poppins))", fontWeight: 700, fontSize: "16px", lineHeight: "1.25em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  eyebrow:   { fontFamily: "var(--font-body, var(--font-poppins))", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  colophon:  { fontFamily: "var(--font-body, var(--font-poppins))", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  readBody:  { fontFamily: "var(--font-body, var(--font-poppins))", fontWeight: 400, fontSize: "14px", lineHeight: "1.6em" },
  button:    { fontFamily: "var(--font-body, var(--font-poppins))", fontWeight: 600, fontSize: "11px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const, cursor: "pointer" },
};

export default function SermonCard({ sermon }: { sermon: Sermon }) {
  const { playVideo, playAudio } = useAudio();

  const dateLabel = sermon.date
    ? new Date(sermon.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";

  const getYouTubeVideoId = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const videoId = sermon.videoUrl ? getYouTubeVideoId(sermon.videoUrl) : null;
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sermon.videoUrl) {
      playVideo(sermon);
    } else {
      playAudio(sermon);
    }
  };

  const handleListenClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playAudio(sermon);
  };

  return (
    <div
      style={{
        backgroundColor: White,
        border: `1px solid ${Paper300}`,
        borderRadius: "8px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* Thumbnail — clicking play triggers the floating docked mini-player */}
      <div
        onClick={handlePlayClick}
        style={{
          height: "220px",
          backgroundColor: Paper200,
          backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
        }}
        title="Play in floating mini-player"
      >
        {/* Play overlay circle */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: thumbnailUrl ? "rgba(0,0,0,0.22)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s ease",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              transition: "transform 0.2s ease, background-color 0.2s ease",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: "8px solid transparent",
                borderBottom: "8px solid transparent",
                borderLeft: `14px solid ${Navy}`,
                marginLeft: "3px",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", padding: "16px 20px 20px", flex: 1 }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
          {sermon.series && <div style={{ ...T.eyebrow, color: Blue500 }}>{sermon.series}</div>}
          {sermon.tags?.[0] && (
            <>
              <div style={{ ...T.eyebrow, color: Paper300 }}>·</div>
              <div style={{ ...T.eyebrow, color: Blue500 }}>{sermon.tags[0]}</div>
            </>
          )}
        </div>

        <Link href={`/sermons/${sermon.id}`} style={{ textDecoration: "none" }}>
          <h3
            style={{
              ...T.displayS,
              color: Navy,
              margin: "0 0 10px",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
          >
            {sermon.title}
          </h3>
        </Link>

        <p
          style={{
            ...T.readBody,
            color: Slate500,
            margin: 0,
            flex: 1,
            paddingBottom: "16px",
          }}
        >
          {sermon.summary
            ? `${sermon.summary.slice(0, 140)}...`
            : sermon.speaker
            ? `Teaching by ${sermon.speaker}.`
            : "Teaching from The Publishers House."}
        </p>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            paddingTop: "12px",
            borderTop: `1px solid ${Paper300}`,
            flexWrap: "wrap",
          }}
        >
          {sermon.scripture && (
            <>
              <span style={{ ...T.colophon, color: Blue700, fontWeight: 700 }}>
                {sermon.scripture}
              </span>
              <span style={{ ...T.colophon, color: Paper300 }}>·</span>
            </>
          )}
          <span style={{ ...T.colophon, color: Slate500 }}>
            {sermon.speaker || "Dr. Joshua Agunbiade"}
          </span>
          {dateLabel && (
            <>
              <span style={{ ...T.colophon, color: Paper300 }}>·</span>
              <span style={{ ...T.colophon, color: Slate500 }}>{dateLabel}</span>
            </>
          )}
          {sermon.duration && (
            <>
              <span style={{ ...T.colophon, color: Paper300 }}>·</span>
              <span style={{ ...T.colophon, color: Slate500 }}>{sermon.duration}</span>
            </>
          )}
        </div>

        {/* Quick action bar */}
        <div style={{ display: "flex", gap: "12px", marginTop: "14px", alignItems: "center" }}>
          <button
            onClick={handlePlayClick}
            style={{
              ...T.button,
              background: Navy,
              color: White,
              padding: "7px 12px",
              borderRadius: "4px",
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            ▶ Watch
          </button>
          <button
            onClick={handleListenClick}
            style={{
              ...T.button,
              background: Paper200,
              color: Navy,
              padding: "7px 12px",
              borderRadius: "4px",
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            🔊 Listen
          </button>
          <Link
            href={`/sermons/${sermon.id}`}
            style={{
              ...T.button,
              color: Blue700,
              marginLeft: "auto",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            Notes →
          </Link>
        </div>
      </div>
    </div>
  );
}
