"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ImageUpload from "../components/ImageUpload";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditionMessage {
  id: string;
  title: string;
  speaker: string;
  scripture?: string;
  duration?: string;
  audioUrl?: string;
  videoUrl?: string;
  summary?: string;
}

interface ProgramEdition {
  key: string;
  year: number;
  label: string;
  theme: string;
  dates: string;
  location: string;
  flierSrc: string;
  listenButtonText: string;
  speakers: string[];
  searchTerms: string[];
  curatedMessages: EditionMessage[];
}

interface ProgramRecord {
  id?: string;
  slug: string;
  name: string;
  scripture: string;
  scriptureVerse: string;
  frequency: string;
  cadence: string;
  location: string;
  summary: string;
  description: string;
  imageUrl?: string;
  logoImage?: string;
  bannerImage?: string;
  published: boolean;
  editions: ProgramEdition[];
}

// ─── Default seed data to ensure instant accessibility ────────────────────────

const DEFAULT_PROGRAMS: ProgramRecord[] = [
  {
    slug: "festival-of-light",
    name: "Festival of Light",
    scripture: "Isaiah 60:1",
    scriptureVerse: "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.",
    frequency: "Annual Homecoming Conference · October",
    cadence: "Annual",
    location: "Jos, Plateau State",
    summary: "Believers from across Nigeria and around the world gather each October for worship, sound apostolic teaching, Holy Ghost expressions and fellowship.",
    description: "Each October, believers from across Nigeria and around the world gather in Jos for worship, sound apostolic teaching, Holy Ghost expressions, and corporate fellowship. Festival of Light is our annual homecoming gathering where the light of God's Word illuminates lives and sets hearts ablaze.",
    logoImage: "/images/Festival of Light logo (white).png",
    bannerImage: "/images/programs-hero.jpg",
    published: true,
    editions: [
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
        searchTerms: ["festival of light", "fol 2026", "shout of a king"],
        curatedMessages: [
          {
            id: "fol26-1",
            title: "The Shout of a King in Zion",
            speaker: "Rev. Joshua Agunbiade",
            scripture: "Numbers 23:21",
            duration: "1h 45m",
            summary: "Opening charge on the sovereign victory and dominion of Christ.",
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
        searchTerms: ["festival of light", "fol 2024", "immanuel"],
        curatedMessages: [
          {
            id: "fol24-1",
            title: "Immanuel: God With Us in Truth & Power",
            speaker: "Rev. Joshua Agunbiade",
            scripture: "Matthew 1:23",
            duration: "1h 52m",
          },
        ],
      },
    ],
  },
  {
    slug: "merismos",
    name: "Merismos",
    scripture: "Hebrews 4:12",
    scriptureVerse: "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit...",
    frequency: "Annual Word & Power Conference",
    cadence: "Annual",
    location: "Jos, Plateau State",
    summary: "A power-packed encounter where the Word is rightly taught and the Holy Spirit moves tangibly to transform lives.",
    description: "A power-packed encounter where the Word of God is rightly taught and the Holy Spirit moves tangibly to transform lives. Merismos — the piercing, dividing work of the Word — defines every edition.",
    logoImage: "/images/Merismos black.png",
    bannerImage: "/images/programs-hero.jpg",
    published: true,
    editions: [
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
        searchTerms: ["merismos 2025", "miracles"],
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
        searchTerms: ["merismos 2024", "spirit and power"],
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
        searchTerms: ["merismos 2023"],
        curatedMessages: [],
      },
    ],
  },
  {
    slug: "the-forge",
    name: "The Forge",
    scripture: "Jeremiah 23:29",
    scriptureVerse: "Is not my word like as a fire? saith the LORD; and like a hammer that breaketh the rock in pieces?",
    frequency: "Monthly Intensive · End of Month (Wed–Fri)",
    cadence: "Monthly",
    location: "The House of Bread, Jos",
    summary: "An intensive prayer gathering running Wednesday to Friday and culminating in an overnight vigil.",
    description: "An intensive corporate prayer gathering running Wednesday through Friday and culminating in an overnight prayer vigil. The Forge is where men are made in the place of prayer.",
    logoImage: "/images/THE FORGE 1.png",
    bannerImage: "/images/programs-hero.jpg",
    published: true,
    editions: [
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
        searchTerms: ["the forge", "tarry"],
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
        searchTerms: ["the forge", "all may prophesy"],
        curatedMessages: [],
      },
    ],
  },
  {
    slug: "apostolic-camps",
    name: "Apostolic Camps",
    scripture: "Ephesians 4:11",
    scriptureVerse: "And he gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers...",
    frequency: "Monthly Gathering · Second Weekend",
    cadence: "Monthly",
    location: "Abuja, FCT & Nationwide",
    summary: "A close spiritual camp focused on equipping believers, prophetic words and deep spiritual alignment.",
    description: "Monthly apostolic gatherings in Abuja and across Nigeria, focused on equipping believers, prophetic alignment, and deep spiritual formation.",
    logoImage: "/images/TPH ABUJA.png",
    bannerImage: "/images/programs-hero.jpg",
    published: true,
    editions: [
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
        searchTerms: ["aac", "secret place"],
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
        searchTerms: ["aac", "spirit of life"],
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
        searchTerms: ["aac", "covenant"],
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
        searchTerms: ["aac"],
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
        searchTerms: ["aac", "face of jesus"],
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
        searchTerms: ["aac", "holy of holies"],
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
        searchTerms: ["aac", "believers authority"],
        curatedMessages: [],
      },
    ],
  },
  {
    slug: "jesus-convention",
    name: "Jesus Convention",
    scripture: "Philippians 3:10",
    scriptureVerse: "That I may know him, and the power of his resurrection, and the fellowship of his sufferings...",
    frequency: "Annual · Easter",
    cadence: "Easter",
    location: "Jos, Plateau State",
    summary: "Unveiling the person, finished work and lordship of Jesus Christ through sound teaching, prayer and worship.",
    description: "Every Easter, we gather to unveil the person, finished work and lordship of Jesus Christ through sound teaching, prayer and corporate worship.",
    logoImage: "/images/Jesus Convention logo white.png",
    bannerImage: "/images/programs-hero.jpg",
    published: true,
    editions: [],
  },
];

export default function ProgramsCmsPage() {
  const [programs, setPrograms] = useState<ProgramRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("festival-of-light");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Load programs from API
  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/programs");
      if (res.ok) {
        const data = await res.json();
        if (data.programs && data.programs.length > 0) {
          // Merge with default seed data to ensure complete fields
          const merged = DEFAULT_PROGRAMS.map((def) => {
            const found = data.programs.find((p: any) => p.slug === def.slug || p.id === def.slug);
            if (!found) return def;
            return {
              ...def,
              ...found,
              editions: found.editions && found.editions.length > 0 ? found.editions : def.editions,
            };
          });

          // Add any custom programs added by user
          data.programs.forEach((custom: any) => {
            if (!merged.some((m) => m.slug === custom.slug)) {
              merged.push({
                slug: custom.slug,
                name: custom.name || "Custom Program",
                scripture: custom.scripture || "",
                scriptureVerse: custom.scriptureVerse || "",
                frequency: custom.frequency || "",
                cadence: custom.cadence || "",
                location: custom.location || "",
                summary: custom.summary || "",
                description: custom.description || "",
                logoImage: custom.imageUrl || custom.logoImage || "",
                bannerImage: custom.bannerImage || "",
                published: custom.published !== false,
                editions: custom.editions || [],
              });
            }
          });

          setPrograms(merged);
          return;
        }
      }
      setPrograms(DEFAULT_PROGRAMS);
    } catch {
      setPrograms(DEFAULT_PROGRAMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const currentProgram = programs.find((p) => p.slug === selectedSlug) || programs[0] || DEFAULT_PROGRAMS[0];

  // Update current program top-level field
  const updateProgramField = (field: keyof ProgramRecord, value: any) => {
    setPrograms((prev) =>
      prev.map((p) => (p.slug === currentProgram.slug ? { ...p, [field]: value } : p))
    );
  };

  // ── Edition Management ──

  const addEdition = () => {
    const newEd: ProgramEdition = {
      key: `${currentProgram.slug}-${Date.now()}`,
      year: new Date().getFullYear(),
      label: `${new Date().getFullYear()}`,
      theme: "New Edition Theme",
      dates: "Dates TBD",
      location: currentProgram.location || "Jos, Plateau State",
      flierSrc: "/images/programs-hero.jpg",
      listenButtonText: `Listen to ${currentProgram.name} Messages`,
      speakers: ["Rev. Joshua Agunbiade"],
      searchTerms: [currentProgram.slug],
      curatedMessages: [],
    };

    updateProgramField("editions", [newEd, ...(currentProgram.editions || [])]);
  };

  const updateEdition = (index: number, field: keyof ProgramEdition, value: any) => {
    const list = [...(currentProgram.editions || [])];
    list[index] = { ...list[index], [field]: value };
    updateProgramField("editions", list);
  };

  const removeEdition = (index: number) => {
    if (!confirm("Are you sure you want to remove this edition?")) return;
    const list = [...(currentProgram.editions || [])];
    list.splice(index, 1);
    updateProgramField("editions", list);
  };

  // ── Edition Message Management ──

  const addMessageToEdition = (editionIndex: number) => {
    const list = [...(currentProgram.editions || [])];
    const ed = list[editionIndex];
    const newMsg: EditionMessage = {
      id: `msg-${Date.now()}`,
      title: "Sermon Title",
      speaker: "Rev. Joshua Agunbiade",
      scripture: "2 Timothy 2:15",
      duration: "1h 30m",
      audioUrl: "",
      videoUrl: "",
      summary: "",
    };
    ed.curatedMessages = [...(ed.curatedMessages || []), newMsg];
    updateProgramField("editions", list);
  };

  const updateMessageInEdition = (
    editionIndex: number,
    messageIndex: number,
    field: keyof EditionMessage,
    value: string
  ) => {
    const list = [...(currentProgram.editions || [])];
    const ed = list[editionIndex];
    ed.curatedMessages[messageIndex] = {
      ...ed.curatedMessages[messageIndex],
      [field]: value,
    };
    updateProgramField("editions", list);
  };

  const removeMessageFromEdition = (editionIndex: number, messageIndex: number) => {
    const list = [...(currentProgram.editions || [])];
    list[editionIndex].curatedMessages.splice(messageIndex, 1);
    updateProgramField("editions", list);
  };

  // ── Save to Firestore via API ──

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/cms/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          id: currentProgram.id || currentProgram.slug,
          program: currentProgram,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to save program");
      }

      setMsg(`✓ Successfully saved ${currentProgram.name} and all editions!`);
      setTimeout(() => setMsg(""), 4000);
      fetchPrograms();
    } catch (err: any) {
      setErrorMsg("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "clamp(16px, 3vw, 32px)", maxWidth: "1280px", margin: "0 auto", backgroundColor: "#F4F6FB", minHeight: "100vh" }}>

      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <span style={{ fontFamily: "var(--font-poppins)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#0140C1" }}>
            CMS Portal · Flagship Programs
          </span>
          <h1 style={{ fontFamily: "var(--font-poppins)", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#151A54", margin: "4px 0 0", textTransform: "uppercase" }}>
            Programs &amp; Past Editions Editor
          </h1>
          <p style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", color: "#4A62A0", margin: "4px 0 0" }}>
            Manage flagship programs, fliers, past editions, and attached sermon recordings.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Direct link to Schedule */}
          <Link
            href="/schedule"
            target="_blank"
            style={{
              padding: "10px 18px",
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #0140C1",
              borderRadius: "4px",
              color: "#0140C1",
              fontFamily: "var(--font-poppins)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            📅 See Upcoming Programs (Schedule) →
          </Link>

          <Link
            href={`/programs/${currentProgram.slug}`}
            target="_blank"
            style={{
              padding: "10px 18px",
              backgroundColor: "#151A54",
              borderRadius: "4px",
              color: "#FFFFFF",
              fontFamily: "var(--font-poppins)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Preview Live Subpage ↗
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 24px",
              backgroundColor: "#0140C1",
              border: "none",
              borderRadius: "4px",
              color: "#FFFFFF",
              fontFamily: "var(--font-poppins)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(1, 64, 193, 0.25)",
            }}
          >
            {saving ? "Saving Changes..." : "Save Program ✓"}
          </button>
        </div>
      </div>

      {/* Alert notifications */}
      {msg && (
        <div style={{ background: "#DCFCE7", border: "1px solid #86EFAC", color: "#166534", padding: "12px 18px", borderRadius: "4px", marginBottom: "20px", fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "13px" }}>
          {msg}
        </div>
      )}
      {errorMsg && (
        <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", padding: "12px 18px", borderRadius: "4px", marginBottom: "20px", fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "13px" }}>
          {errorMsg}
        </div>
      )}

      {/* ── PROGRAM TABS (Festival of Light, Merismos, Jesus Convention, etc.) ── */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "24px" }}>
        {programs.map((p) => {
          const isSelected = p.slug === selectedSlug;
          return (
            <button
              key={p.slug}
              onClick={() => setSelectedSlug(p.slug)}
              style={{
                padding: "10px 20px",
                backgroundColor: isSelected ? "#0140C1" : "#FFFFFF",
                color: isSelected ? "#FFFFFF" : "#151A54",
                border: isSelected ? "1.5px solid #0140C1" : "1px solid #D3DAEC",
                borderRadius: "4px",
                fontFamily: "var(--font-poppins)",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>

        {/* ── CARD 1: Core Program Metadata & Details ── */}
        <div style={{ background: "#FFFFFF", border: "1px solid #D3DAEC", borderRadius: "6px", padding: "clamp(20px, 3vw, 32px)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <h2 style={{ fontFamily: "var(--font-poppins)", fontSize: "18px", fontWeight: 800, color: "#151A54", margin: "0 0 20px", textTransform: "uppercase" }}>
            1. Core Program Details ({currentProgram.name})
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-poppins)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A62A0", marginBottom: "6px" }}>
                Program Name
              </label>
              <input
                type="text"
                value={currentProgram.name}
                onChange={(e) => updateProgramField("name", e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "var(--font-poppins)", fontSize: "14px", color: "#151A54" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "var(--font-poppins)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A62A0", marginBottom: "6px" }}>
                Slug (URL Path: /programs/[slug])
              </label>
              <input
                type="text"
                value={currentProgram.slug}
                disabled
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: "4px", fontFamily: "var(--font-poppins)", fontSize: "14px", color: "#64748B", background: "#F8FAFC" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "var(--font-poppins)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A62A0", marginBottom: "6px" }}>
                Anchor Scripture
              </label>
              <input
                type="text"
                value={currentProgram.scripture || ""}
                onChange={(e) => updateProgramField("scripture", e.target.value)}
                placeholder="e.g. Isaiah 60:1"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "var(--font-poppins)", fontSize: "14px", color: "#151A54" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "var(--font-poppins)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A62A0", marginBottom: "6px" }}>
                Frequency / Cadence
              </label>
              <input
                type="text"
                value={currentProgram.frequency || ""}
                onChange={(e) => updateProgramField("frequency", e.target.value)}
                placeholder="e.g. Annual Homecoming Conference · October"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "var(--font-poppins)", fontSize: "14px", color: "#151A54" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "var(--font-poppins)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A62A0", marginBottom: "6px" }}>
                Default Venue / City
              </label>
              <input
                type="text"
                value={currentProgram.location || ""}
                onChange={(e) => updateProgramField("location", e.target.value)}
                placeholder="e.g. The House of Bread, Jos"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "var(--font-poppins)", fontSize: "14px", color: "#151A54" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "var(--font-poppins)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A62A0", marginBottom: "6px" }}>
                Logo / Plate Image URL
              </label>
              <input
                type="text"
                value={currentProgram.logoImage || currentProgram.imageUrl || ""}
                onChange={(e) => {
                  updateProgramField("logoImage", e.target.value);
                  updateProgramField("imageUrl", e.target.value);
                }}
                placeholder="e.g. /images/Festival of Light logo (white).png"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "var(--font-poppins)", fontSize: "14px", color: "#151A54" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontFamily: "var(--font-poppins)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A62A0", marginBottom: "6px" }}>
              Scripture Verse Quotation (Shows in Hero Box)
            </label>
            <textarea
              rows={2}
              value={currentProgram.scriptureVerse || ""}
              onChange={(e) => updateProgramField("scriptureVerse", e.target.value)}
              placeholder="e.g. Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee."
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "var(--font-playfair)", fontSize: "15px", color: "#151A54" }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontFamily: "var(--font-poppins)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A62A0", marginBottom: "6px" }}>
              Full Program Description
            </label>
            <textarea
              rows={3}
              value={currentProgram.description || currentProgram.summary || ""}
              onChange={(e) => {
                updateProgramField("description", e.target.value);
                updateProgramField("summary", e.target.value);
              }}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "var(--font-playfair)", fontSize: "15px", color: "#151A54" }}
            />
          </div>
        </div>

        {/* ── CARD 2: Past Editions & Event Fliers Editor ── */}
        <div style={{ background: "#FFFFFF", border: "1px solid #D3DAEC", borderRadius: "6px", padding: "clamp(20px, 3vw, 32px)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-poppins)", fontSize: "18px", fontWeight: 800, color: "#151A54", margin: 0, textTransform: "uppercase" }}>
                2. Past Editions &amp; Fliers ({currentProgram.editions?.length || 0} Editions)
              </h2>
              <p style={{ fontFamily: "var(--font-playfair)", fontSize: "14px", color: "#64748B", margin: "4px 0 0" }}>
                Add and manage event fliers, dates, themes, and attached sermon recordings.
              </p>
            </div>

            <button
              onClick={addEdition}
              style={{
                padding: "8px 18px",
                backgroundColor: "#0140C1",
                border: "none",
                borderRadius: "4px",
                color: "#FFFFFF",
                fontFamily: "var(--font-poppins)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              + Add New Edition
            </button>
          </div>

          {/* List of editions */}
          {(!currentProgram.editions || currentProgram.editions.length === 0) ? (
            <div style={{ padding: "40px 20px", textAlign: "center", background: "#F8FAFC", borderRadius: "4px", border: "1px dashed #CBD5E1" }}>
              <p style={{ fontFamily: "var(--font-playfair)", color: "#64748B", margin: 0 }}>
                No past editions yet. Click "+ Add New Edition" above to add the first flier and edition details.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {currentProgram.editions.map((ed, edIdx) => (
                <div
                  key={ed.key || edIdx}
                  style={{
                    background: "#F8FAFC",
                    border: "1.5px solid #D3DAEC",
                    borderRadius: "6px",
                    padding: "20px",
                  }}
                >
                  {/* Edition header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ background: "#0140C1", color: "#FFFFFF", padding: "4px 10px", borderRadius: "2px", fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>
                        #{edIdx + 1}
                      </span>
                      <strong style={{ fontFamily: "var(--font-poppins)", fontSize: "15px", color: "#151A54" }}>
                        {ed.label} Edition: &ldquo;{ed.theme}&rdquo;
                      </strong>
                    </div>

                    <button
                      onClick={() => removeEdition(edIdx)}
                      style={{
                        background: "#FEE2E2",
                        border: "1px solid #FCA5A5",
                        color: "#DC2626",
                        padding: "4px 10px",
                        borderRadius: "3px",
                        fontFamily: "var(--font-poppins)",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Delete Edition ✕
                    </button>
                  </div>

                  {/* Edition details grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontFamily: "var(--font-poppins)", fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", color: "#4A62A0", marginBottom: "4px" }}>
                        Edition Label (e.g. 2024, Sept 2026)
                      </label>
                      <input
                        type="text"
                        value={ed.label || ""}
                        onChange={(e) => updateEdition(edIdx, "label", e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "var(--font-poppins)", fontSize: "13px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: "var(--font-poppins)", fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", color: "#4A62A0", marginBottom: "4px" }}>
                        Theme
                      </label>
                      <input
                        type="text"
                        value={ed.theme || ""}
                        onChange={(e) => updateEdition(edIdx, "theme", e.target.value)}
                        placeholder="e.g. In the Spirit & Power"
                        style={{ width: "100%", padding: "8px 10px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "var(--font-playfair)", fontSize: "14px", fontStyle: "italic" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: "var(--font-poppins)", fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", color: "#4A62A0", marginBottom: "4px" }}>
                        Dates Held
                      </label>
                      <input
                        type="text"
                        value={ed.dates || ""}
                        onChange={(e) => updateEdition(edIdx, "dates", e.target.value)}
                        placeholder="e.g. 8–9 December 2024"
                        style={{ width: "100%", padding: "8px 10px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "var(--font-poppins)", fontSize: "13px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: "var(--font-poppins)", fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", color: "#4A62A0", marginBottom: "4px" }}>
                        Venue / Location
                      </label>
                      <input
                        type="text"
                        value={ed.location || ""}
                        onChange={(e) => updateEdition(edIdx, "location", e.target.value)}
                        placeholder="e.g. Jos, Plateau State"
                        style={{ width: "100%", padding: "8px 10px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "var(--font-poppins)", fontSize: "13px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: "var(--font-poppins)", fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", color: "#4A62A0", marginBottom: "4px" }}>
                        Event Flier Image URL
                      </label>
                      <input
                        type="text"
                        value={ed.flierSrc || ""}
                        onChange={(e) => updateEdition(edIdx, "flierSrc", e.target.value)}
                        placeholder="e.g. /images/programs/merismos-2024.jpg"
                        style={{ width: "100%", padding: "8px 10px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "var(--font-poppins)", fontSize: "13px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: "var(--font-poppins)", fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", color: "#4A62A0", marginBottom: "4px" }}>
                        Dynamic Button Text
                      </label>
                      <input
                        type="text"
                        value={ed.listenButtonText || ""}
                        onChange={(e) => updateEdition(edIdx, "listenButtonText", e.target.value)}
                        placeholder={`e.g. Listen to ${currentProgram.name} ${ed.label} Messages`}
                        style={{ width: "100%", padding: "8px 10px", border: "1px solid #D3DAEC", borderRadius: "4px", fontFamily: "var(--font-poppins)", fontSize: "13px" }}
                      />
                    </div>
                  </div>

                  {/* ── Attached Sermons / Recordings for this Edition ── */}
                  <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "4px", padding: "16px", marginTop: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontFamily: "var(--font-poppins)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#0140C1" }}>
                        🎙 Sermons &amp; Audio Messages for this Edition ({ed.curatedMessages?.length || 0})
                      </span>
                      <button
                        onClick={() => addMessageToEdition(edIdx)}
                        style={{
                          background: "#0140C1",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "3px",
                          padding: "4px 10px",
                          fontFamily: "var(--font-poppins)",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        + Add Sermon
                      </button>
                    </div>

                    {(!ed.curatedMessages || ed.curatedMessages.length === 0) ? (
                      <p style={{ fontFamily: "var(--font-playfair)", fontSize: "13px", color: "#94A3B8", margin: 0 }}>
                        No individual sermons added for this edition yet. (It will cross-reference from your main Sermons catalog automatically).
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {ed.curatedMessages.map((msgItem, mIdx) => (
                          <div
                            key={msgItem.id || mIdx}
                            style={{
                              background: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              borderRadius: "4px",
                              padding: "10px 14px",
                              display: "grid",
                              gridTemplateColumns: "1.5fr 1fr 1fr 1fr auto",
                              gap: "8px",
                              alignItems: "center",
                            }}
                          >
                            <input
                              type="text"
                              value={msgItem.title}
                              onChange={(e) => updateMessageInEdition(edIdx, mIdx, "title", e.target.value)}
                              placeholder="Sermon Title"
                              style={{ padding: "6px 8px", border: "1px solid #D3DAEC", borderRadius: "3px", fontSize: "12px" }}
                            />
                            <input
                              type="text"
                              value={msgItem.speaker}
                              onChange={(e) => updateMessageInEdition(edIdx, mIdx, "speaker", e.target.value)}
                              placeholder="Speaker"
                              style={{ padding: "6px 8px", border: "1px solid #D3DAEC", borderRadius: "3px", fontSize: "12px" }}
                            />
                            <input
                              type="text"
                              value={msgItem.scripture || ""}
                              onChange={(e) => updateMessageInEdition(edIdx, mIdx, "scripture", e.target.value)}
                              placeholder="Scripture"
                              style={{ padding: "6px 8px", border: "1px solid #D3DAEC", borderRadius: "3px", fontSize: "12px" }}
                            />
                            <input
                              type="text"
                              value={msgItem.audioUrl || ""}
                              onChange={(e) => updateMessageInEdition(edIdx, mIdx, "audioUrl", e.target.value)}
                              placeholder="Audio URL (.mp3)"
                              style={{ padding: "6px 8px", border: "1px solid #D3DAEC", borderRadius: "3px", fontSize: "12px" }}
                            />
                            <button
                              onClick={() => removeMessageFromEdition(edIdx, mIdx)}
                              style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontWeight: "bold" }}
                              title="Delete sermon"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Save bar bottom floating */}
      <div
        style={{
          position: "sticky",
          bottom: "16px",
          marginTop: "32px",
          background: "#151A54",
          borderRadius: "6px",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          color: "#FFFFFF",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span style={{ fontFamily: "var(--font-poppins)", fontSize: "13px", fontWeight: 600 }}>
          Editing: <strong>{currentProgram.name}</strong> ({currentProgram.editions?.length || 0} editions)
        </span>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "10px 28px",
            backgroundColor: "#0140C1",
            border: "none",
            borderRadius: "4px",
            color: "#FFFFFF",
            fontFamily: "var(--font-poppins)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving Changes..." : "Save All Changes ✓"}
        </button>
      </div>

    </div>
  );
}
