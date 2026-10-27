"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Sermon {
  id: string;
  title: string;
  speaker: string;
  duration?: string;
  audioUrl?: string;
}

interface ProgramEdition {
  key: string;
  label: string;
  theme: string;
  dates: string;
  location: string;
  flierSrc: string;
  listenLabel: string;
  sermons: Sermon[];
}

// ─── Edition data (sourced from real program fliers) ──────────────────────────

const EDITIONS: Record<string, ProgramEdition[]> = {
  "festival-of-light": [
    {
      key: "fol-2026",
      label: "2026",
      theme: "The Shout of a King",
      dates: "28 October – 1 November 2026",
      location: "Jos, Plateau State",
      flierSrc: "/images/programs/fol-2026.jpg",
      listenLabel: "Listen to Festival of Light 2026 Messages",
      sermons: [],
    },
    {
      key: "fol-2024",
      label: "2024",
      theme: "Immanuel",
      dates: "24–27 October 2024",
      location: "Jos, Plateau State",
      flierSrc: "/images/programs/fol-2024.jpg",
      listenLabel: "Listen to Festival of Light 2024 Messages",
      sermons: [],
    },
  ],

  "merismos": [
    {
      key: "merismos-2025",
      label: "2025",
      theme: "Miracles",
      dates: "17–20 April 2025",
      location: "Jos, Plateau State",
      flierSrc: "/images/programs/merismos-2025.jpg",
      listenLabel: "Listen to Merismos 2025 Messages",
      sermons: [],
    },
    {
      key: "merismos-2024",
      label: "2024",
      theme: "In the Spirit & Power",
      dates: "8–9 December 2024",
      location: "Jos, Plateau State",
      flierSrc: "/images/programs/merismos-2024.jpg",
      listenLabel: "Listen to Merismos 2024 Messages",
      sermons: [],
    },
    {
      key: "merismos-2023",
      label: "2023",
      theme: "Now The Lord Is That Spirit",
      dates: "26–29 October 2023",
      location: "Jos, Plateau State",
      flierSrc: "/images/programs/merismos-2023.jpg",
      listenLabel: "Listen to Merismos 2023 Messages",
      sermons: [],
    },
  ],

  "the-forge": [
    {
      key: "forge-sept-2026",
      label: "September 2026",
      theme: "Tarry",
      dates: "24–25 September 2026",
      location: "Jos, Plateau State",
      flierSrc: "/images/programs/forge-sept-2026.jpg",
      listenLabel: "Listen to The Forge September 2026 Messages",
      sermons: [],
    },
    {
      key: "forge-july-2024",
      label: "July 2024",
      theme: "All May Prophesy",
      dates: "30 July – 1 August 2024",
      location: "Jos, Plateau State",
      flierSrc: "/images/programs/forge-july-2024.jpg",
      listenLabel: "Listen to The Forge July 2024 Messages",
      sermons: [],
    },
  ],

  "apostolic-camps": [
    {
      key: "aac-sept-2026",
      label: "September 2026",
      theme: "The Secret Place",
      dates: "11–12 September 2026",
      location: "Abuja, FCT",
      flierSrc: "/images/programs/aac-sept-2026.jpg",
      listenLabel: "Listen to AAC September 2026 Messages",
      sermons: [],
    },
    {
      key: "aac-aug-2026",
      label: "August 2026",
      theme: "The Spirit of Life",
      dates: "7–8 August 2026",
      location: "Abuja, FCT",
      flierSrc: "/images/programs/aac-august-2026.jpg",
      listenLabel: "Listen to AAC August 2026 Messages",
      sermons: [],
    },
    {
      key: "aac-july-2026",
      label: "July 2026",
      theme: "Children of the Covenant",
      dates: "10–11 July 2026",
      location: "Abuja, FCT",
      flierSrc: "/images/programs/aac-july-2026.jpg",
      listenLabel: "Listen to AAC July 2026 Messages",
      sermons: [],
    },
    {
      key: "aac-may-2026",
      label: "May 2026",
      theme: "Abuja Apostolic Camp",
      dates: "8–9 May 2026",
      location: "Abuja, FCT",
      flierSrc: "/images/programs/aac-may-2026.jpg",
      listenLabel: "Listen to AAC May 2026 Messages",
      sermons: [],
    },
    {
      key: "aac-april-2026",
      label: "April 2026",
      theme: "The Face of Jesus Christ",
      dates: "10–11 April 2026",
      location: "Abuja, FCT",
      flierSrc: "/images/programs/aac-april-2026.jpg",
      listenLabel: "Listen to AAC April 2026 Messages",
      sermons: [],
    },
    {
      key: "aac-march-2026",
      label: "March 2026",
      theme: "The Holy of Holies",
      dates: "13–14 March 2026",
      location: "Abuja, FCT",
      flierSrc: "/images/programs/aac-march-2026.jpg",
      listenLabel: "Listen to AAC March 2026 Messages",
      sermons: [],
    },
    {
      key: "aac-feb-2026",
      label: "February 2026",
      theme: "The Believers\u2019 Authority",
      dates: "14 February 2026",
      location: "Abuja, FCT",
      flierSrc: "/images/programs/aac-feb-2026.jpg",
      listenLabel: "Listen to AAC February 2026 Messages",
      sermons: [],
    },
  ],
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  eyebrow: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "10px",
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
  },
  label: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
  },
  theme: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontStyle: "italic" as const,
    lineHeight: "1.2em",
  },
  meta: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.04em",
  },
  sermonTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "15px",
    lineHeight: "1.4em",
    color: "#F8FAFC",
    margin: "0 0 6px",
  },
  sermonMeta: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "11px",
    letterSpacing: "0.04em",
    color: "#64748B",
  },
};

// ─── Root component ───────────────────────────────────────────────────────────

export default function ProgramEditionsClient({
  programSlug,
  programName,
}: {
  programSlug: string;
  programName: string;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const editions = EDITIONS[programSlug] ?? [];

  const toggle = (key: string) =>
    setOpenKey((prev) => (prev === key ? null : key));

  return (
    <section style={{ background: "#0B0E14" }}>

      {/* Section header */}
      <div
        className="tph-inner"
        style={{
          paddingTop: "72px",
          paddingBottom: "40px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "32px", height: "2px", background: "#D97706" }} />
          <span style={{ ...S.eyebrow, color: "#D97706" }}>Past Editions</span>
        </div>
        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(28px, 4vw, 48px)",
            color: "#F8FAFC",
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            margin: 0,
            lineHeight: "0.95em",
          }}
        >
          The Archive
        </h2>
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "16px",
            color: "#64748B",
            margin: 0,
            maxWidth: "560px",
          }}
        >
          Every edition is preserved here — flier, theme, and the messages that were preached.
        </p>
      </div>

      {/* Edition list */}
      {editions.length === 0 ? (
        <div
          className="tph-inner"
          style={{ padding: "80px 0", textAlign: "center" }}
        >
          <span style={{ fontSize: "40px", display: "block", marginBottom: "20px" }}>📂</span>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#64748B" }}>
            Edition archives for {programName} are being compiled. Check back soon.
          </p>
        </div>
      ) : (
        <div className="tph-inner" style={{ paddingBottom: "96px" }}>
          {editions.map((edition) => (
            <EditionBlock
              key={edition.key}
              edition={edition}
              isOpen={openKey === edition.key}
              onToggle={() => toggle(edition.key)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Edition block ─────────────────────────────────────────────────────────────

function EditionBlock({
  edition,
  isOpen,
  onToggle,
}: {
  edition: ProgramEdition;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        paddingTop: "64px",
        paddingBottom: isOpen ? "0" : "64px",
      }}
    >
      {/* Two-column row: flier left, info right */}
      <div
        style={{
          display: "flex",
          gap: "clamp(28px, 5vw, 72px)",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {/* ── Flier image ── */}
        <div
          style={{
            flexShrink: 0,
            width: "clamp(180px, 26vw, 280px)",
          }}
        >
          <img
            src={edition.flierSrc}
            alt={`${edition.label} edition flier`}
            style={{
              width: "100%",
              display: "block",
              borderRadius: "3px",
              boxShadow: "0 12px 56px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4)",
            }}
          />
        </div>

        {/* ── Edition info ── */}
        <div style={{ flex: 1, minWidth: "240px", paddingTop: "6px" }}>

          {/* Year / edition badge */}
          <div style={{ marginBottom: "18px" }}>
            <span
              style={{
                display: "inline-block",
                padding: "5px 16px",
                background: "rgba(217, 119, 6, 0.12)",
                border: "1px solid rgba(217, 119, 6, 0.35)",
                borderRadius: "2px",
                ...S.label,
                color: "#D97706",
              }}
            >
              {edition.label} Edition
            </span>
          </div>

          {/* Theme */}
          <h3
            style={{
              ...S.theme,
              fontSize: "clamp(22px, 3.2vw, 40px)",
              color: "#F8FAFC",
              margin: "0 0 22px",
            }}
          >
            &ldquo;{edition.theme}&rdquo;
          </h3>

          {/* Dates & location */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: "36px",
            }}
          >
            <span style={{ ...S.meta, color: "#94A3B8" }}>
              {edition.dates}
            </span>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "14px" }}>·</span>
            <span style={{ ...S.meta, color: "#94A3B8" }}>
              {edition.location}
            </span>
          </div>

          {/* CTA button */}
          <button
            onClick={onToggle}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 30px",
              background: isOpen ? "transparent" : "#D97706",
              color: isOpen ? "#D97706" : "#151A54",
              border: "1.5px solid #D97706",
              borderRadius: "2px",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background 0.18s, color 0.18s",
            }}
          >
            {isOpen ? (
              <>
                <span style={{ fontSize: "14px" }}>✕</span>
                <span>Close Messages</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: "13px" }}>▶</span>
                <span>{edition.listenLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Expandable sermon panel ── */}
      {isOpen && (
        <div
          style={{
            marginTop: "40px",
            marginBottom: "64px",
            background: "rgba(21, 26, 84, 0.25)",
            border: "1px solid rgba(32, 144, 255, 0.12)",
            borderLeft: "3px solid #D97706",
            borderRadius: "4px",
            padding: "clamp(20px, 3vw, 36px)",
            maxHeight: "540px",
            overflowY: "auto",
          }}
        >
          <SermonPanel edition={edition} />
        </div>
      )}
    </article>
  );
}

// ─── Sermon panel ──────────────────────────────────────────────────────────────

function SermonPanel({ edition }: { edition: ProgramEdition }) {
  if (edition.sermons.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          textAlign: "center",
          gap: "14px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            background: "rgba(217,119,6,0.12)",
            border: "1px solid rgba(217,119,6,0.25)",
            borderRadius: "50%",
            fontSize: "24px",
          }}
        >
          🎙
        </span>
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#D97706",
            margin: 0,
          }}
        >
          Messages Coming Soon
        </p>
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "16px",
            color: "#64748B",
            maxWidth: "420px",
            margin: 0,
            lineHeight: "1.6em",
          }}
        >
          Audio messages for the {edition.label} edition &#x2014;&nbsp;&ldquo;{edition.theme}&rdquo;&nbsp;&#x2014; will be available here shortly.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Panel heading */}
      <div style={{ marginBottom: "28px", paddingBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <span style={{ ...S.eyebrow, color: "#D97706" }}>
          {edition.label} · &ldquo;{edition.theme}&rdquo;
        </span>
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "18px",
            color: "#F8FAFC",
            margin: "8px 0 0",
          }}
        >
          Messages from this edition
        </p>
      </div>

      {/* Sermon cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {edition.sermons.map((sermon) => (
          <SermonCard key={sermon.id} sermon={sermon} />
        ))}
      </div>
    </div>
  );
}

// ─── Sermon card ──────────────────────────────────────────────────────────────

function SermonCard({ sermon }: { sermon: Sermon }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "4px",
        padding: "20px 24px",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: sermon.audioUrl ? "16px" : "0",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px" }}>
          <h5 style={{ ...S.sermonTitle }}>{sermon.title}</h5>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <span style={{ ...S.sermonMeta }}>👤 {sermon.speaker}</span>
            {sermon.duration && (
              <span style={{ ...S.sermonMeta }}>⏱ {sermon.duration}</span>
            )}
          </div>
        </div>

        {!sermon.audioUrl && (
          <span
            style={{
              flexShrink: 0,
              padding: "4px 14px",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "100px",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "10px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#475569",
            }}
          >
            Coming Soon
          </span>
        )}
      </div>

      {/* In-page audio player */}
      {sermon.audioUrl && (
        <audio
          controls
          src={sermon.audioUrl}
          style={{
            width: "100%",
            height: "40px",
            display: "block",
            accentColor: "#D97706",
          }}
        >
          Your browser does not support audio playback.
        </audio>
      )}
    </div>
  );
}
