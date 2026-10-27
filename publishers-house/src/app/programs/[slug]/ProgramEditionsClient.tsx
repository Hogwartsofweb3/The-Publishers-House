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
  searchTerms: string[]; // keywords to cross-reference with the Firestore sermons catalog
  curatedMessages: EditionMessage[];
}

// ─── Edition Data (Chronological Archive — Newest First) ──────────────────────

const PROGRAM_EDITIONS: Record<string, ProgramEdition[]> = {
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
      speakers: ["Rev. Joshua Agunbiade", "Guest Apostolic Ministers"],
      searchTerms: ["festival of light", "fol 2026", "fol", "shout of a king"],
      curatedMessages: [
        {
          id: "fol26-1",
          title: "The Shout of a King in Zion",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Numbers 23:21",
          duration: "1h 45m",
          summary: "Opening charge on the sovereign victory and majestic dominion of Christ among His people.",
        },
        {
          id: "fol26-2",
          title: "The Unconquerable Light",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Isaiah 60:1-3",
          duration: "2h 00m",
          summary: "Sound apostolic exposition on prevailing light in gross darkness.",
        },
      ],
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
      speakers: ["Rev. Joshua Agunbiade", "Pastor Damilare Ayodele"],
      searchTerms: ["festival of light", "fol 2024", "immanuel", "fol"],
      curatedMessages: [
        {
          id: "fol24-1",
          title: "Immanuel: God With Us in Truth & Power",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Matthew 1:23",
          duration: "1h 52m",
          summary: "The incarnation of Christ and the reality of His abiding presence in the believer.",
        },
        {
          id: "fol24-2",
          title: "Walking in the Light of His Countenance",
          speaker: "Pastor Damilare Ayodele",
          scripture: "Psalm 89:15",
          duration: "1h 38m",
          summary: "A practical charge on personal devotion and living illuminated by divine truth.",
        },
        {
          id: "fol24-3",
          title: "The Apostolic Commission & The Light of Nations",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Acts 13:47",
          duration: "2h 15m",
          summary: "The sending mandate of the church to publish Christ to the uttermost parts.",
        },
      ],
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
      curatedMessages: [
        {
          id: "mer25-1",
          title: "The Operations of Miracles by the Spirit",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "1 Corinthians 12:10",
          duration: "2h 10m",
          summary: "Understanding the spiritual mechanics and faith-posture behind tangible divine miracles.",
        },
        {
          id: "mer25-2",
          title: "Signs Following the Preached Word",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Mark 16:20",
          duration: "1h 50m",
          summary: "How sound doctrine and bold proclamation activate heaven's supernatural confirmation.",
        },
      ],
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
      curatedMessages: [
        {
          id: "mer24-1",
          title: "In Demonstration of the Spirit and of Power",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "1 Corinthians 2:4-5",
          duration: "2h 05m",
          summary: "Moving beyond enticing words of man's wisdom into the raw demonstration of God's power.",
        },
        {
          id: "mer24-2",
          title: "The Dividing Asunder: Discerning Soul and Spirit",
          speaker: "Pastor Boniface Onah",
          scripture: "Hebrews 4:12",
          duration: "1h 42m",
          summary: "The sharp scalpel of the Word separating natural emotion from divine spiritual impulse.",
        },
        {
          id: "mer24-3",
          title: "Fullness of the Holy Ghost for the Last Days",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Acts 2:17-18",
          duration: "2h 18m",
          summary: "An urgent apostolic call to continuous consecration and spiritual baptism.",
        },
      ],
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
      curatedMessages: [
        {
          id: "mer23-1",
          title: "Now The Lord Is That Spirit: The Ministry of Liberty",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "2 Corinthians 3:17-18",
          duration: "2h 02m",
          summary: "Beholding as in a glass the glory of the Lord and being changed into the same image.",
        },
        {
          id: "mer23-2",
          title: "The Dispensation of the Spirit in the Believer",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "John 7:37-39",
          duration: "1h 48m",
          summary: "Rivers of living water flowing from the inward parts to flood society.",
        },
      ],
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
      curatedMessages: [
        {
          id: "fg26-1",
          title: "Tarry Until Ye Be Endued",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Luke 24:49",
          duration: "2h 25m",
          summary: "The discipline of waiting, corporate intercession, and tarrying before God until power falls.",
        },
        {
          id: "fg26-2",
          title: "The Fire on the Altar Shall Not Go Out",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Leviticus 6:13",
          duration: "2h 10m",
          summary: "Sustaining spiritual momentum through prevailing secret and corporate prayer.",
        },
      ],
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
      curatedMessages: [
        {
          id: "fg24-1",
          title: "For Ye May All Prophesy One by One",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "1 Corinthians 14:31",
          duration: "2h 15m",
          summary: "Demystifying prophetic ministry and activating believers to hear and speak divine utterances.",
        },
        {
          id: "fg24-2",
          title: "Corporate Travail & Spiritual Utterance",
          speaker: "Pastor Theophilus Makinde",
          scripture: "Romans 8:26-27",
          duration: "1h 55m",
          summary: "Groanings that cannot be uttered and birthing the purposes of God in intercession.",
        },
      ],
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
      curatedMessages: [
        {
          id: "aac26-9-1",
          title: "Dwelling in the Secret Place of the Most High",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Psalm 91:1-2",
          duration: "1h 55m",
          summary: "Cultivating intimacy and unwavering spiritual authority from the hidden altar.",
        },
      ],
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
      curatedMessages: [
        {
          id: "aac26-8-1",
          title: "The Law of the Spirit of Life in Christ Jesus",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Romans 8:2",
          duration: "1h 45m",
          summary: "Total deliverance from the law of sin and death into effortless victory.",
        },
      ],
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
      curatedMessages: [
        {
          id: "aac26-7-1",
          title: "Heirs of the Promise and Sons of the Covenant",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Acts 3:25",
          duration: "1h 50m",
          summary: "Standing upon the inviolable covenant oaths of God for personal and territorial dominion.",
        },
      ],
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
      searchTerms: ["aac", "apostolic camp", "abuja apostolic", "aac may"],
      curatedMessages: [
        {
          id: "aac26-5-1",
          title: "The Apostolic Order for Territorial Impact",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Acts 19:10-12",
          duration: "2h 00m",
          summary: "Equipping believers in the seat of power to represent the kingdom of God effectively.",
        },
      ],
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
      searchTerms: ["aac", "apostolic camp", "the face of jesus christ", "face of jesus"],
      curatedMessages: [
        {
          id: "aac26-4-1",
          title: "The Light of the Knowledge of the Glory in the Face of Jesus",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "2 Corinthians 4:6",
          duration: "1h 55m",
          summary: "Beholding the person and unveiled glory of the Son of God until transformed.",
        },
      ],
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
      searchTerms: ["aac", "apostolic camp", "the holy of holies", "holy of holies"],
      curatedMessages: [
        {
          id: "aac26-3-1",
          title: "Boldness to Enter the Holiest by the Blood",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Hebrews 10:19-22",
          duration: "2h 10m",
          summary: "Transcending the veil into the very throne room of divine majesty.",
        },
      ],
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
      searchTerms: ["aac", "apostolic camp", "believers authority", "believer's authority"],
      curatedMessages: [
        {
          id: "aac26-2-1",
          title: "The Authority of the Sent Believer",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Luke 10:19",
          duration: "2h 05m",
          summary: "Wielding the name of Jesus and spiritual dominion over all the power of the enemy.",
        },
      ],
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
      curatedMessages: [
        {
          id: "jc24-1",
          title: "That I May Know Him and The Power of His Resurrection",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "Philippians 3:10",
          duration: "2h 15m",
          summary: "The central apostolic reality: knowing Christ, His cross, and His living reign.",
        },
        {
          id: "jc24-2",
          title: "The Triumph of the Cross Over Principalities",
          speaker: "Pastor Ngbede Odeh",
          scripture: "Colossians 2:14-15",
          duration: "1h 45m",
          summary: "Exposition on how Christ spoiled principalities and made a show of them openly.",
        },
      ],
    },
    {
      key: "jc-2023",
      year: 2023,
      label: "2023",
      theme: "Beholding the Lamb of God",
      dates: "7–9 April 2023",
      location: "The House of Bread, Jos",
      flierSrc: "/images/Jesus Convention logo white.png",
      listenButtonText: "Listen to Jesus Convention 2023 Messages",
      speakers: ["Rev. Joshua Agunbiade"],
      searchTerms: ["jesus convention", "lamb of god", "beholding"],
      curatedMessages: [
        {
          id: "jc23-1",
          title: "Behold the Lamb: The Finished Work on Calvary",
          speaker: "Rev. Joshua Agunbiade",
          scripture: "John 1:29",
          duration: "1h 55m",
          summary: "Resting completely in the eternal atonement and righteousness of Christ.",
        },
      ],
    },
  ],
};

// Also support alias slug:
PROGRAM_EDITIONS["abuja-apostolic-camp"] = PROGRAM_EDITIONS["apostolic-camps"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProgramEditionsClient({
  programSlug,
  programName,
  allSermons = [],
}: {
  programSlug: string;
  programName: string;
  allSermons?: Sermon[];
}) {
  // Key of the currently expanded edition's messages card
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

  const editions = useMemo(() => {
    return PROGRAM_EDITIONS[programSlug] ?? [];
  }, [programSlug]);

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
          borderBottom: "1px solid #D3DAEC",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div style={{ width: "36px", height: "3px", background: "#D97706", borderRadius: "2px" }} />
          <span
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 700,
              fontSize: "11px",
              lineHeight: "1.6em",
              letterSpacing: "0.2em",
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
            fontSize: "clamp(28px, 4vw, 44px)",
            lineHeight: "1.05em",
            letterSpacing: "-0.015em",
            textTransform: "uppercase",
            color: "#151A54",
            margin: "0 0 10px",
          }}
        >
          {programName} Editions & Fliers
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
      <div className="tph-inner" style={{ paddingTop: "48px" }}>
        {editions.length === 0 ? (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #D3DAEC",
              borderRadius: "6px",
              padding: "60px 24px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(21, 26, 84, 0.04)",
            }}
          >
            <span style={{ fontSize: "44px", display: "block", marginBottom: "16px" }}>📂</span>
            <h3
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "20px",
                fontWeight: 700,
                color: "#151A54",
                marginBottom: "8px",
              }}
            >
              Archive Compiling
            </h3>
            <p
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "16px",
                color: "#64748B",
                maxWidth: "520px",
                margin: "0 auto",
              }}
            >
              Archival fliers and tapes for {programName} are currently being organized. Check back shortly.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>
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
            padding: "20px",
            animation: "fadeIn 0.2s ease-out",
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
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#D97706",
                }}
              >
                High-Resolution Flier
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
                background: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "3px",
                padding: "8px 16px",
                color: "#FFFFFF",
                fontFamily: "var(--font-poppins)",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "background 0.2s",
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
                borderRadius: "6px",
                boxShadow: "0 25px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.15)",
              }}
            />
          </div>

          <p
            onClick={(e) => e.stopPropagation()}
            style={{
              color: "#94A3B8",
              fontFamily: "var(--font-poppins)",
              fontSize: "12px",
              marginTop: "12px",
              letterSpacing: "0.05em",
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
        borderRadius: "6px",
        overflow: "hidden",
        boxShadow: isFirst
          ? "0 10px 30px rgba(21, 26, 84, 0.08)"
          : "0 4px 18px rgba(21, 26, 84, 0.04)",
        transition: "box-shadow 0.2s ease",
      }}
    >
      {/* ── Top Header Plate with Year Badge & Theme ── */}
      <div
        style={{
          background: "linear-gradient(to right, #151A54 0%, #0140C1 100%)",
          padding: "20px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          borderBottom: "3px solid #D97706",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span
            style={{
              background: "#D97706",
              color: "#151A54",
              fontFamily: "var(--font-poppins)",
              fontWeight: 800,
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
              fontSize: "clamp(20px, 3vw, 28px)",
              color: "#FFFFFF",
              margin: 0,
            }}
          >
            &ldquo;{edition.theme}&rdquo;
          </h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#BFD0F7" }}>
          <span style={{ fontFamily: "var(--font-poppins)", fontSize: "12px", fontWeight: 500 }}>
            📍 {edition.location}
          </span>
          <span>·</span>
          <span style={{ fontFamily: "var(--font-poppins)", fontSize: "12px", fontWeight: 500 }}>
            🗓 {edition.dates}
          </span>
        </div>
      </div>

      {/* ── Main Showcase Body: Flier Line-by-Line ── */}
      <div
        style={{
          padding: "clamp(24px, 4vw, 44px)",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          alignItems: "center",
          background: "#FFFFFF",
        }}
      >
        {/* Flier Container with Click-to-Expand Badge */}
        <div
          style={{
            position: "relative",
            maxWidth: "380px",
            width: "100%",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid #D3DAEC",
            boxShadow: "0 14px 40px rgba(21, 26, 84, 0.12)",
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
              transition: "transform 0.3s ease",
            }}
          />

          {/* Hover / Overlay hint pill */}
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              background: "rgba(21, 26, 84, 0.88)",
              backdropFilter: "blur(4px)",
              color: "#FFFFFF",
              padding: "6px 14px",
              borderRadius: "100px",
              fontFamily: "var(--font-poppins)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <span>🔍</span> Click to Expand
          </div>
        </div>

        {/* Core Edition Meta Information */}
        <div style={{ textAlign: "center", maxWidth: "600px" }}>
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

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            {edition.speakers.map((sp) => (
              <span
                key={sp}
                style={{
                  background: "#F4F6FB",
                  border: "1px solid #D3DAEC",
                  borderRadius: "20px",
                  padding: "4px 14px",
                  fontFamily: "var(--font-poppins)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#0140C1",
                }}
              >
                🎙 {sp}
              </span>
            ))}
          </div>

          {/* ── THE DYNAMIC BUTTON: "Listen to [Program] [Year] Messages" ── */}
          <button
            onClick={onToggle}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "16px 36px",
              background: isOpen ? "#151A54" : "#D97706",
              color: isOpen ? "#FFFFFF" : "#151A54",
              border: isOpen ? "2px solid #151A54" : "2px solid #D97706",
              borderRadius: "4px",
              fontFamily: "var(--font-poppins)",
              fontWeight: 800,
              fontSize: "13px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(217, 119, 6, 0.28)",
              transition: "all 0.2s ease",
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
              background: "#F8FAFC",
              border: "1.5px solid #0140C1",
              borderLeft: "5px solid #D97706",
              borderRadius: "6px",
              padding: "clamp(20px, 3.5vw, 36px)",
              boxShadow: "0 10px 35px rgba(21, 26, 84, 0.08)",
              animation: "slideDown 0.25s ease-out",
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
  allSermons,
}: {
  edition: ProgramEdition;
  programName: string;
  allSermons: Sermon[];
}) {
  const { playAudio, playSermon, currentSermon, isPlaying } = useAudio();

  // Cross-reference all matching sermons from Firestore catalog
  const catalogMatches = useMemo(() => {
    if (!allSermons || allSermons.length === 0) return [];

    const lowerTerms = edition.searchTerms.map((t) => t.toLowerCase());

    return allSermons.filter((s) => {
      const sTitle = (s.title || "").toLowerCase();
      const sSeries = (s.series || "").toLowerCase();
      const sTags = (s.tags || []).map((t) => t.toLowerCase());
      const sSummary = (s.summary || "").toLowerCase();

      // Check if matches any search term for this edition
      return lowerTerms.some((term) => {
        return (
          sTitle.includes(term) ||
          sSeries.includes(term) ||
          sTags.some((tag) => tag.includes(term)) ||
          sSummary.includes(term)
        );
      });
    });
  }, [allSermons, edition.searchTerms]);

  // Combined messages: prioritize curated messages and merge any catalog matches
  const displayMessages = useMemo(() => {
    const list: EditionMessage[] = [...edition.curatedMessages];

    // Append any extra catalog matches not already present by title
    catalogMatches.forEach((cat) => {
      const exists = list.some(
        (m) => m.title.toLowerCase() === cat.title.toLowerCase()
      );
      if (!exists) {
        list.push({
          id: cat.id,
          title: cat.title,
          speaker: cat.speaker,
          duration: cat.duration || "Sermon",
          scripture: cat.scripture,
          date: cat.date,
          audioUrl: cat.audioUrl,
          videoUrl: cat.videoUrl,
          summary: cat.summary,
        });
      }
    });

    return list;
  }, [edition.curatedMessages, catalogMatches]);

  const handlePlayMessage = (msg: EditionMessage) => {
    // Construct playable media object for the persistent global player
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
          paddingBottom: "18px",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#0140C1",
            }}
          >
            Audio Catalog & Messages Archive
          </span>
          <h4
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 800,
              fontSize: "20px",
              color: "#151A54",
              margin: "4px 0 0",
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
            }}
          >
            {programName} {edition.label} Messages
          </h4>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span
            style={{
              background: "rgba(1, 64, 193, 0.08)",
              color: "#0140C1",
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "12px",
              padding: "4px 12px",
              borderRadius: "100px",
            }}
          >
            {displayMessages.length} Messages Available
          </span>
        </div>
      </div>

      {/* ── Scrollable List Container (Mobile & Desktop) ── */}
      <div
        style={{
          maxHeight: "460px",
          overflowY: "auto",
          paddingRight: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {displayMessages.map((msg, index) => {
          const isThisPlaying =
            currentSermon?.id === msg.id && isPlaying;

          return (
            <div
              key={msg.id}
              style={{
                background: "#FFFFFF",
                border: isThisPlaying
                  ? "1.5px solid #D97706"
                  : "1px solid #E2E8F0",
                borderRadius: "4px",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow: isThisPlaying
                  ? "0 4px 16px rgba(217, 119, 6, 0.15)"
                  : "0 2px 6px rgba(0,0,0,0.02)",
                transition: "border 0.2s ease",
              }}
            >
              {/* Row: Title, Speaker, and Primary Action */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-poppins)",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#94A3B8",
                      }}
                    >
                      #{index + 1}
                    </span>
                    <h5
                      style={{
                        fontFamily: "var(--font-poppins)",
                        fontWeight: 700,
                        fontSize: "15.5px",
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
                      gap: "14px",
                      flexWrap: "wrap",
                      alignItems: "center",
                      fontFamily: "var(--font-poppins)",
                      fontSize: "12px",
                      color: "#64748B",
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
                        fontSize: "13.5px",
                        color: "#4A62A0",
                        margin: "8px 0 0",
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
                      gap: "8px",
                      background: isThisPlaying ? "#151A54" : "#D97706",
                      color: isThisPlaying ? "#FFFFFF" : "#151A54",
                      border: "none",
                      borderRadius: "3px",
                      padding: "10px 20px",
                      fontFamily: "var(--font-poppins)",
                      fontWeight: 700,
                      fontSize: "11px",
                      letterSpacing: "0.1em",
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
                <div style={{ marginTop: "4px", paddingTop: "8px", borderTop: "1px dashed #E2E8F0" }}>
                  <audio
                    controls
                    preload="none"
                    src={msg.audioUrl}
                    style={{
                      width: "100%",
                      height: "36px",
                      borderRadius: "4px",
                      accentColor: "#D97706",
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
                    background: "rgba(1, 64, 193, 0.04)",
                    borderRadius: "4px",
                    fontFamily: "var(--font-poppins)",
                    fontSize: "11px",
                    color: "#4A62A0",
                  }}
                >
                  <span style={{ color: "#D97706" }}>●</span>
                  <span>
                    Audio feed synchronized via the TPH Media Catalog. Click <strong>Listen Now</strong> to stream through the main player.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note inside the card */}
      <div
        style={{
          marginTop: "16px",
          paddingTop: "12px",
          borderTop: "1px solid #D3DAEC",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
          fontFamily: "var(--font-poppins)",
          fontSize: "11.5px",
          color: "#64748B",
        }}
      >
        <span>
          💡 All messages play in the player without leaving this page.
        </span>
        <span style={{ color: "#0140C1", fontWeight: 600 }}>
          The Publishers House Archive
        </span>
      </div>
    </div>
  );
}
