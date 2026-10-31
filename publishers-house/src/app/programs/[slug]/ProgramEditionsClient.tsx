"use client";

import { useState, useEffect, useMemo } from "react";
import type { Sermon } from "@/lib/firebase";
import { useAudio, type PlayableMedia } from "@/components/GlobalAudioPlayer";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface EditionMessage {
  id: string;
  title: string;
  speaker: string;
  duration?: string;
  scripture?: string;
  date?: string;
  audioUrl?: string;
  videoUrl?: string;
  summary?: string;
}

export interface ProgramEdition {
  key: string;
  year: number;
  label: string; // e.g. "2024", "July 2024", "September 2026"
  theme: string;
  dates: string;
  location: string;
  flierSrc: string;
  listenButtonText: string; // e.g. "Listen to Merismos 2024 Messages"
  speakers: string[];
  searchTerms: string[];
  curatedMessages: EditionMessage[];
}

// ─── Default Editions Data (Chronological Archive — Newest First) ─────────────

const STATIC_PROGRAM_EDITIONS: Record<string, ProgramEdition[]> = {
  // ───────────────────────────────────────────────────────────────────────────
  // FESTIVAL OF LIGHT
  // ───────────────────────────────────────────────────────────────────────────
  "festival-of-light": [
    {
      key: "fol-2026",
      year: 2026,
      label: "2026",
      theme: "The Shout of a King",
      dates: "28 October – 1 November 2026",
      location: "The House of Bread, Jos",
      flierSrc: "/images/programs/fol-2026.jpg",
      listenButtonText: "Listen to Festival of Light 2026 Messages",
      speakers: [
        "Rev. Joshua Agunbiade",
        "Rev. Rasine Irem",
        "Rev. Adetokunbo Emmanuel",
        "Pastor Theophilus Makinde",
      ],
      searchTerms: ["festival of light", "fol 2026", "fol", "shout of a king"],
      curatedMessages: [],
    },
    {
      key: "fol-2024",
      year: 2024,
      label: "2024",
      theme: "Immanuel",
      dates: "24–27 October 2024",
      location: "The House of Bread, Jos",
      flierSrc: "/images/programs/fol-2024.jpg",
      listenButtonText: "Listen to Festival of Light 2024 Messages",
      speakers: [
        "Dr. Joshua Agunbiade",
        "Apostle Gideon Odoma",
        "Rev. Rasine Irem",
        "Min. Sharon Agunbiade",
      ],
      searchTerms: ["festival of light", "fol 2024", "immanuel", "fol"],
      curatedMessages: [],
    },
  ],

  // ───────────────────────────────────────────────────────────────────────────
  // MERISMOS
  // ───────────────────────────────────────────────────────────────────────────
  "merismos": [
    {
      key: "merismos-2025",
      year: 2025,
      label: "2025",
      theme: "Miracles",
      dates: "17–20 April 2025",
      location: "The House of Bread, Jos",
      flierSrc: "/images/programs/merismos-2025.jpg",
      listenButtonText: "Listen to Merismos 2025 Messages",
      speakers: ["Rev. Joshua Agunbiade"],
      searchTerms: ["merismos 2025", "merismos", "miracles"],
      curatedMessages: [],
    },
    {
      key: "merismos-2024",
      year: 2024,
      label: "2024",
      theme: "In the Spirit & Power",
      dates: "8–9 December 2024",
      location: "The House of Bread, Jos",
      flierSrc: "/images/programs/merismos-2024.jpg",
      listenButtonText: "Listen to Merismos 2024 Messages",
      speakers: ["Rev. Joshua Agunbiade", "Pastor Boniface Onah"],
      searchTerms: ["merismos 2024", "merismos", "in the spirit and power", "spirit and power"],
      curatedMessages: [],
    },
    {
      key: "merismos-2023",
      year: 2023,
      label: "2023",
      theme: "Now The Lord Is That Spirit",
      dates: "26–29 October 2023",
      location: "The House of Bread, Jos",
      flierSrc: "/images/programs/merismos-2023.jpg",
      listenButtonText: "Listen to Merismos 2023 Messages",
      speakers: ["Rev. Joshua Agunbiade"],
      searchTerms: ["merismos 2023", "merismos", "now the lord is that spirit", "that spirit"],
      curatedMessages: [],
    },
  ],

  // ───────────────────────────────────────────────────────────────────────────
  // THE FORGE
  // ───────────────────────────────────────────────────────────────────────────
  "the-forge": [
    {
      key: "forge-sept-2026",
      year: 2026,
      label: "September 2026",
      theme: "Tarry",
      dates: "24–25 September 2026",
      location: "The House of Bread, Jos",
      flierSrc: "/images/programs/forge-sept-2026.jpg",
      listenButtonText: "Listen to The Forge September 2026 Messages",
      speakers: ["Rev. Joshua Agunbiade"],
      searchTerms: ["the forge", "forge", "tarry", "forge september"],
      curatedMessages: [],
    },
    {
      key: "forge-july-2024",
      year: 2024,
      label: "July 2024",
      theme: "All May Prophesy",
      dates: "30 July – 1 August 2024",
      location: "The House of Bread, Jos",
      flierSrc: "/images/programs/forge-july-2024.jpg",
      listenButtonText: "Listen to The Forge July 2024 Messages",
      speakers: ["Rev. Joshua Agunbiade", "Pastor Theophilus Makinde"],
      searchTerms: ["the forge", "forge", "all may prophesy", "forge july"],
      curatedMessages: [],
    },
  ],

  // ───────────────────────────────────────────────────────────────────────────
  // APOSTOLIC CAMPS (ABUJA APOSTOLIC CAMP)
  // ───────────────────────────────────────────────────────────────────────────
  "apostolic-camps": [
    {
      key: "aac-sept-2026",
      year: 2026,
      label: "September 2026",
      theme: "The Secret Place",
      dates: "11–12 September 2026",
      location: "Abuja, FCT",
      flierSrc: "/images/programs/aac-sept-2026.jpg",
      listenButtonText: "Listen to AAC September 2026 Messages",
      speakers: ["Rev. Joshua Agunbiade"],
      searchTerms: ["aac", "apostolic camp", "secret place", "abuja apostolic"],
      curatedMessages: [],
    },
    {
      key: "aac-aug-2026",
      year: 2026,
      label: "August 2026",
      theme: "The Spirit of Life",
      dates: "7–8 August 2026",
      location: "Abuja, FCT",
      flierSrc: "/images/programs/aac-august-2026.jpg",
      listenButtonText: "Listen to AAC August 2026 Messages",
      speakers: ["Rev. Joshua Agunbiade"],
      searchTerms: ["aac", "apostolic camp", "spirit of life", "abuja apostolic"],
      curatedMessages: [],
    },
    {
      key: "aac-july-2026",
      year: 2026,
      label: "July 2026",
      theme: "Children of the Covenant",
      dates: "10–11 July 2026",
      location: "Abuja, FCT",
      flierSrc: "/images/programs/aac-july-2026.jpg",
      listenButtonText: "Listen to AAC July 2026 Messages",
      speakers: ["Rev. Joshua Agunbiade"],
      searchTerms: ["aac", "apostolic camp", "children of the covenant", "covenant"],
      curatedMessages: [],
    },
    {
      key: "aac-may-2026",
      year: 2026,
      label: "May 2026",
      theme: "Abuja Apostolic Camp",
      dates: "8–9 May 2026",
      location: "Abuja, FCT",
      flierSrc: "/images/programs/aac-may-2026.jpg",
      listenButtonText: "Listen to AAC May 2026 Messages",
      speakers: ["Rev. Joshua Agunbiade"],
      searchTerms: ["aac", "apostolic camp", "abuja apostolic"],
      curatedMessages: [],
    },
    {
      key: "aac-april-2026",
      year: 2026,
      label: "April 2026",
      theme: "The Face of Jesus Christ",
      dates: "10–11 April 2026",
      location: "Abuja, FCT",
      flierSrc: "/images/programs/aac-april-2026.jpg",
      listenButtonText: "Listen to AAC April 2026 Messages",
      speakers: ["Rev. Joshua Agunbiade"],
      searchTerms: ["aac", "apostolic camp", "face of jesus"],
      curatedMessages: [],
    },
    {
      key: "aac-march-2026",
      year: 2026,
      label: "March 2026",
      theme: "The Holy of Holies",
      dates: "13–14 March 2026",
      location: "Abuja, FCT",
      flierSrc: "/images/programs/aac-march-2026.jpg",
      listenButtonText: "Listen to AAC March 2026 Messages",
      speakers: ["Rev. Joshua Agunbiade"],
      searchTerms: ["aac", "apostolic camp", "holy of holies"],
      curatedMessages: [],
    },
    {
      key: "aac-feb-2026",
      year: 2026,
      label: "February 2026",
      theme: "The Believers' Authority",
      dates: "14 February 2026",
      location: "Abuja, FCT",
      flierSrc: "/images/programs/aac-feb-2026.jpg",
      listenButtonText: "Listen to AAC February 2026 Messages",
      speakers: ["Rev. Joshua Agunbiade"],
      searchTerms: ["aac", "apostolic camp", "believers authority"],
      curatedMessages: [],
    },
  ],

  // ───────────────────────────────────────────────────────────────────────────
  // JESUS CONVENTION
  // ───────────────────────────────────────────────────────────────────────────
  "jesus-convention": [
    {
      key: "jc-2024",
      year: 2024,
      label: "2024",
      theme: "The Risen Christ and His Eternal Dominion",
      dates: "29–31 March 2024",
      location: "The House of Bread, Jos",
      flierSrc: "/images/Jesus Convention logo white.png",
      listenButtonText: "Listen to Jesus Convention 2024 Messages",
      speakers: ["Rev. Joshua Agunbiade", "Pastor Ngbede Odeh"],
      searchTerms: ["jesus convention", "risen christ", "eternal dominion"],
      curatedMessages: [],
    },
  ],
};

STATIC_PROGRAM_EDITIONS["abuja-apostolic-camp"] = STATIC_PROGRAM_EDITIONS["apostolic-camps"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProgramEditionsClient({
  programSlug,
  programName,
  allSermons = [],
  cmsEditions,
}: {
  programSlug: string;
  programName: string;
  allSermons?: Sermon[];
  cmsEditions?: ProgramEdition[];
}) {
  const [openEditionKey, setOpenEditionKey] = useState<string | null>(null);

  // Lightbox modal state for full-screen flier view
  const [lightbox, setLightbox] = useState<{
    src: string;
    title: string;
    subtitle: string;
  } | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scroll when lightbox is open
  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [lightbox]);

  // Priority: CMS editions from Firestore → static registry
  const editions = useMemo(() => {
    const rawList =
      cmsEditions && Array.isArray(cmsEditions) && cmsEditions.length > 0
        ? cmsEditions
        : STATIC_PROGRAM_EDITIONS[programSlug] ?? [];

    return rawList.map((ed) => {
      let sps = ed.speakers || [];
      if (ed.key === "fol-2024" && sps.includes("Pastor Damilare Ayodele")) {
        sps = [
          "Dr. Joshua Agunbiade",
          "Apostle Gideon Odoma",
          "Rev. Rasine Irem",
          "Min. Sharon Agunbiade",
        ];
      }
      if (ed.key === "fol-2026" && sps.includes("Guest Apostolic Ministers")) {
        sps = [
          "Rev. Joshua Agunbiade",
          "Rev. Rasine Irem",
          "Rev. Adetokunbo Emmanuel",
          "Pastor Theophilus Makinde",
        ];
      }
      // Strip any legacy demo messages
      const cleanMessages = (ed.curatedMessages || []).filter(
        (m: any) =>
          !m.id?.startsWith("fol24-") &&
          !m.id?.startsWith("fol26-") &&
          !m.id?.startsWith("mer2") &&
          !m.id?.startsWith("fg") &&
          !m.id?.startsWith("aac2")
      );
      return {
        ...ed,
        speakers: sps,
        curatedMessages: cleanMessages,
      };
    });
  }, [programSlug, cmsEditions]);

  const toggleEditionMessages = (key: string) => {
    setOpenEditionKey((prev) => (prev === key ? null : key));
  };

  return (
    <div style={{ background: "#F4F6FB", minHeight: "600px", paddingBottom: "100px" }}>

      {/* ── Section Header ────────────────────────────────────────────── */}
      <div
        className="tph-inner"
        style={{
          paddingTop: "64px",
          paddingBottom: "36px",
          paddingLeft: "clamp(16px, 4vw, 24px)",
          paddingRight: "clamp(16px, 4vw, 24px)",
          borderBottom: "1px solid #D3DAEC",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{ width: "32px", height: "3px", background: "#0140C1", borderRadius: "2px" }} />
          <span
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "11px",
              lineHeight: "1.6em",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#0140C1",
            }}
          >
            Chronological Archive · Past Editions
          </span>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 800,
            fontSize: "clamp(26px, 4vw, 42px)",
            lineHeight: "1.05em",
            letterSpacing: "-0.015em",
            textTransform: "uppercase",
            color: "#151A54",
            margin: "0 0 10px",
          }}
        >
          {`${programName} Editions & Fliers`}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "17px",
            lineHeight: "1.6em",
            color: "#4A62A0",
            maxWidth: "760px",
            margin: 0,
          }}
        >
          Explore past editions in reverse chronological order. Click any flier to expand it in high resolution,
          or click the dynamic button below to listen to messages directly on this page.
        </p>
      </div>

      {/* ── Edition Showcase: Line by Line ────────────────────────────── */}
      <div className="tph-inner" style={{ paddingTop: "48px", paddingLeft: "clamp(16px, 4vw, 24px)", paddingRight: "clamp(16px, 4vw, 24px)" }}>
        {editions.length === 0 ? (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #D3DAEC",
              borderRadius: "4px",
              padding: "60px clamp(16px, 4vw, 32px)",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(21, 26, 84, 0.04)",
            }}
          >
            <span style={{ fontSize: "40px", display: "block", marginBottom: "16px" }}>📂</span>
            <h3
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "20px",
                fontWeight: 700,
                color: "#151A54",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              Archive Compiling
            </h3>
            <p
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "16px",
                color: "#4A62A0",
                maxWidth: "520px",
                margin: "0 auto",
                lineHeight: "1.6em",
              }}
            >
              Archival fliers and tapes for {programName} are currently being organized. Check back shortly.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
            {editions.map((edition, idx) => (
              <EditionRow
                key={edition.key}
                edition={edition}
                programName={programName}
                allSermons={allSermons}
                isOpen={openEditionKey === edition.key}
                onToggle={() => toggleEditionMessages(edition.key)}
                onOpenLightbox={(src, title, subtitle) =>
                  setLightbox({ src, title, subtitle })
                }
                isFirst={idx === 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── High-Resolution Lightbox Popup ────────────────────────────── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(11, 14, 20, 0.94)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(16px, 3vw, 24px)",
          }}
        >
          {/* Top Bar with Title & Close button */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "860px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              color: "#FFFFFF",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#2090FF",
                }}
              >
                High-Resolution Event Poster
              </span>
              <h4
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "20px",
                  margin: "4px 0 0",
                  color: "#FFFFFF",
                }}
              >
                {lightbox.title}
              </h4>
            </div>

            <button
              onClick={() => setLightbox(null)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#0140C1",
                border: "none",
                borderRadius: "2px",
                padding: "8px 16px",
                color: "#FFFFFF",
                fontFamily: "var(--font-poppins)",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              <span>✕</span> Close
            </button>
          </div>

          {/* Large Image View */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxHeight: "82vh",
              maxWidth: "92vw",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={lightbox.src}
              alt={lightbox.title}
              style={{
                maxHeight: "80vh",
                maxWidth: "90vw",
                objectFit: "contain",
                borderRadius: "4px",
                boxShadow: "0 25px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.12)",
              }}
            />
          </div>

          <p
            onClick={(e) => e.stopPropagation()}
            style={{
              color: "#99AFC6",
              fontFamily: "var(--font-poppins)",
              fontSize: "12px",
              marginTop: "12px",
              letterSpacing: "0.04em",
            }}
          >
            {lightbox.subtitle} · Tap anywhere outside or press ESC to dismiss
          </p>
        </div>
      )}

    </div>
  );
}

// ─── Single Edition Row (Line by Line Layout) ─────────────────────────────────

function EditionRow({
  edition,
  programName,
  allSermons,
  isOpen,
  onToggle,
  onOpenLightbox,
  isFirst,
}: {
  edition: ProgramEdition;
  programName: string;
  allSermons: Sermon[];
  isOpen: boolean;
  onToggle: () => void;
  onOpenLightbox: (src: string, title: string, subtitle: string) => void;
  isFirst: boolean;
}) {
  return (
    <article
      style={{
        background: "#FFFFFF",
        border: "1px solid #D3DAEC",
        borderRadius: "4px",
        overflow: "hidden",
        boxShadow: isFirst
          ? "0 8px 24px rgba(21, 26, 84, 0.06)"
          : "0 2px 12px rgba(21, 26, 84, 0.03)",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      {/* ── Top Header Plate with Year Badge & Theme ── */}
      <div
        style={{
          background: "linear-gradient(to right, #151A54 0%, #0140C1 100%)",
          padding: "18px clamp(16px, 3vw, 28px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          borderBottom: "3px solid #2090FF",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span
            style={{
              background: "#2090FF",
              color: "#FFFFFF",
              fontFamily: "var(--font-poppins)",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: "2px",
            }}
          >
            {edition.label} EDITION
          </span>
          <h3
            style={{
              fontFamily: "var(--font-playfair)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(18px, 2.8vw, 26px)",
              color: "#FFFFFF",
              margin: 0,
            }}
          >
            &ldquo;{edition.theme}&rdquo;
          </h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "#E8ECF7", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-poppins)", fontSize: "12px", fontWeight: 500 }}>
            📍 {edition.location}
          </span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
          <span style={{ fontFamily: "var(--font-poppins)", fontSize: "12px", fontWeight: 500 }}>
            🗓 {edition.dates}
          </span>
        </div>
      </div>

      {/* ── Main Showcase Body: Flier Line-by-Line ── */}
      <div
        style={{
          padding: "clamp(20px, 4vw, 40px) clamp(16px, 3vw, 32px)",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          alignItems: "center",
          background: "#FFFFFF",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Flier Container with Click-to-Expand Badge */}
        <div
          style={{
            position: "relative",
            maxWidth: "360px",
            width: "100%",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid #D3DAEC",
            boxShadow: "0 10px 30px rgba(21, 26, 84, 0.08)",
            cursor: "pointer",
            background: "#F4F6FB",
          }}
          onClick={() =>
            onOpenLightbox(
              edition.flierSrc,
              `${programName} ${edition.label}: "${edition.theme}"`,
              `${edition.dates} · ${edition.location}`
            )
          }
        >
          <img
            src={edition.flierSrc}
            alt={`${programName} ${edition.label} flyer - ${edition.theme}`}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />

          {/* Hover / Overlay hint pill */}
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              background: "rgba(21, 26, 84, 0.90)",
              backdropFilter: "blur(4px)",
              color: "#FFFFFF",
              padding: "6px 12px",
              borderRadius: "2px",
              fontFamily: "var(--font-poppins)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <span>🔍</span> Expand Poster
          </div>
        </div>

        {/* Core Edition Meta Information */}
        <div style={{ textAlign: "center", maxWidth: "600px", width: "100%", padding: "0 8px" }}>
          <p
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "18px",
              lineHeight: "1.55em",
              color: "#151A54",
              margin: "0 0 10px",
            }}
          >
            Theme: <strong>&ldquo;{edition.theme}&rdquo;</strong>
          </p>

          {/* Preachers / Speakers shown on flier */}
          {edition.speakers && edition.speakers.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              {edition.speakers.map((sp) => (
                <span
                  key={sp}
                  style={{
                    background: "#F4F6FB",
                    border: "1px solid #D3DAEC",
                    borderRadius: "2px",
                    padding: "4px 12px",
                    fontFamily: "var(--font-poppins)",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    color: "#0140C1",
                  }}
                >
                  🎙 {sp}
                </span>
              ))}
            </div>
          )}

          {/* ── THE DYNAMIC BUTTON: "Listen to [Program] [Year] Messages" ── */}
          {/* Primary Button: White on Blue 700 (#0140C1) */}
          <button
            onClick={onToggle}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "14px 28px",
              backgroundColor: isOpen ? "#151A54" : "#0140C1",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "2px",
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "12px",
              lineHeight: "1em",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(1, 64, 193, 0.3)",
              transition: "background-color 0.2s ease",
              width: "auto",
              maxWidth: "100%",
            }}
          >
            {isOpen ? (
              <>
                <span style={{ fontSize: "14px" }}>✕</span>
                <span>Close Messages</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: "14px" }}>▶</span>
                <span>{edition.listenButtonText}</span>
              </>
            )}
          </button>
        </div>

        {/* ── ON-PAGE SCROLLABLE MESSAGES CARD (Mobile & Desktop) ── */}
        {isOpen && (
          <div
            style={{
              width: "100%",
              maxWidth: "880px",
              marginTop: "8px",
              background: "#FFFFFF",
              border: "1.5px solid #0140C1",
              borderLeft: "4px solid #0140C1",
              borderRadius: "4px",
              padding: "clamp(16px, 3vw, 32px)",
              boxShadow: "0 8px 24px rgba(21, 26, 84, 0.08)",
              boxSizing: "border-box",
            }}
          >
            <ScrollableMessagesCard
              edition={edition}
              programName={programName}
              allSermons={allSermons}
            />
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Scrollable Messages Card ─────────────────────────────────────────────────

function ScrollableMessagesCard({
  edition,
  programName,
  allSermons = [],
}: {
  edition: ProgramEdition;
  programName: string;
  allSermons?: Sermon[];
}) {
  const { playAudio, playSermon, currentSermon, isPlaying } = useAudio();

  // Strictly use messages explicitly curated/added to this edition (no auto-matching)
  const displayMessages = useMemo(() => {
    return edition.curatedMessages || [];
  }, [edition.curatedMessages]);

  const handlePlayMessage = (msg: EditionMessage) => {
    const media: PlayableMedia = {
      id: msg.id,
      title: msg.title,
      speaker: msg.speaker,
      series: `${programName} ${edition.label} — "${edition.theme}"`,
      scripture: msg.scripture,
      audioUrl: msg.audioUrl,
      videoUrl: msg.videoUrl,
      duration: msg.duration,
      type: "sermon",
    };

    if (msg.audioUrl) {
      playAudio(media);
    } else {
      playSermon(media);
    }
  };

  return (
    <div>
      {/* Header banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid #D3DAEC",
          paddingBottom: "16px",
          marginBottom: "18px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#0140C1",
            }}
          >
            Audio Catalog &amp; Messages Archive
          </span>
          <h4
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 700,
              fontSize: "18px",
              color: "#151A54",
              margin: "4px 0 0",
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
            }}
          >
            {programName} {edition.label} Messages
          </h4>
        </div>

        <span
          style={{
            background: "rgba(1, 64, 193, 0.08)",
            color: "#0140C1",
            fontFamily: "var(--font-poppins)",
            fontWeight: 600,
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "4px 10px",
            borderRadius: "2px",
          }}
        >
          {displayMessages.length} {displayMessages.length === 1 ? "Message" : "Messages"} Available
        </span>
      </div>

      {/* ── Scrollable List Container (Mobile & Desktop) ── */}
      <div
        style={{
          maxHeight: "440px",
          overflowY: "auto",
          paddingRight: "4px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {displayMessages.length === 0 ? (
          <div
            style={{
              padding: "36px 20px",
              textAlign: "center",
              background: "#F4F6FB",
              borderRadius: "4px",
              border: "1px dashed #D3DAEC",
            }}
          >
            <span style={{ fontSize: "28px", display: "block", marginBottom: "8px" }}>🎙</span>
            <h5
              style={{
                fontFamily: "var(--font-poppins)",
                fontWeight: 700,
                fontSize: "14px",
                color: "#151A54",
                margin: "0 0 6px",
                textTransform: "uppercase",
              }}
            >
              No Messages Added Yet
            </h5>
            <p
              style={{
                fontFamily: "var(--font-playfair)",
                color: "#4A62A0",
                margin: 0,
                fontSize: "15px",
                lineHeight: "1.6em",
              }}
            >
              No messages added for this edition yet. Check back soon.
            </p>
          </div>
        ) : (
          displayMessages.map((msg, index) => {
            const isThisPlaying = currentSermon?.id === msg.id && isPlaying;

            return (
              <div
                key={msg.id}
                style={{
                  background: isThisPlaying ? "#F4F6FB" : "#FFFFFF",
                  border: isThisPlaying
                    ? "1.5px solid #0140C1"
                    : "1px solid #D3DAEC",
                  borderRadius: "4px",
                  padding: "16px clamp(14px, 2.5vw, 20px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  transition: "border 0.2s ease",
                }}
              >
                {/* Row: Title, Speaker, and Primary Action */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "14px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "220px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-poppins)",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#747CA1",
                        }}
                      >
                        #{index + 1}
                      </span>
                      <h5
                        style={{
                          fontFamily: "var(--font-poppins)",
                          fontWeight: 700,
                          fontSize: "15px",
                          color: "#151A54",
                          margin: 0,
                          lineHeight: "1.35em",
                        }}
                      >
                        {msg.title}
                      </h5>
                    </div>

                    {/* Metadata: Speaker, Scripture, Duration */}
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        alignItems: "center",
                        fontFamily: "var(--font-poppins)",
                        fontSize: "11.5px",
                        color: "#4A62A0",
                        marginTop: "4px",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#0140C1" }}>
                        🎙 {msg.speaker}
                      </span>
                      {msg.scripture && (
                        <span>📖 {msg.scripture}</span>
                      )}
                      {msg.duration && (
                        <span>⏱ {msg.duration}</span>
                      )}
                    </div>

                    {msg.summary && (
                      <p
                        style={{
                          fontFamily: "var(--font-playfair)",
                          fontSize: "14px",
                          color: "#4A62A0",
                          margin: "6px 0 0",
                          lineHeight: "1.5em",
                        }}
                      >
                        {msg.summary}
                      </p>
                    )}
                  </div>

                  {/* Listen Action Button */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                      onClick={() => handlePlayMessage(msg)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor: isThisPlaying ? "#151A54" : "#0140C1",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "2px",
                        padding: "8px 16px",
                        fontFamily: "var(--font-poppins)",
                        fontWeight: 600,
                        fontSize: "11px",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                      }}
                    >
                      <span>{isThisPlaying ? "⏸ Pause" : "▶ Listen Now"}</span>
                    </button>
                  </div>
                </div>

                {/* In-Page Native Audio Player for Direct Inline Listening without redirection */}
                {msg.audioUrl ? (
                  <div style={{ marginTop: "4px", paddingTop: "8px", borderTop: "1px dashed #D3DAEC" }}>
                    <audio
                      controls
                      preload="none"
                      src={msg.audioUrl}
                      style={{
                        width: "100%",
                        height: "36px",
                        borderRadius: "2px",
                        accentColor: "#0140C1",
                      }}
                    >
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      background: "#F4F6FB",
                      borderRadius: "2px",
                      fontFamily: "var(--font-poppins)",
                      fontSize: "11px",
                      color: "#4A62A0",
                    }}
                  >
                    <span style={{ color: "#0140C1" }}>●</span>
                    <span>
                      Audio stream connected via the TPH Media Catalog. Click <strong>Listen Now</strong> to stream in the bottom player.
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer note inside the card */}
      <div
        style={{
          marginTop: "14px",
          paddingTop: "10px",
          borderTop: "1px solid #D3DAEC",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
          fontFamily: "var(--font-poppins)",
          fontSize: "11px",
          color: "#4A62A0",
        }}
      >
        <span>
          💡 Messages stream in the persistent player without leaving this page.
        </span>
        <span style={{ color: "#0140C1", fontWeight: 600 }}>
          The Publishers House Archive
        </span>
      </div>
    </div>
  );
}
