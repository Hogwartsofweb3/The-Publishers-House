"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditionMessage {
  id: string;
  title: string;
  speaker: string;
  date?: string;
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

// ─── Design Tokens (Strict Style Guide Compliance) ────────────────────────────

const S = {
  Navy: "#151A54",
  Blue700: "#0140C1",
  Blue500: "#2090FF",
  Blue300: "#6496EF",
  Paper100: "#F4F6FB",
  Paper200: "#E8ECF7",
  Paper300: "#D3DAEC",
  White: "#FFFFFF",
  Slate500: "#747CA1",
  Slate600: "#4A62A0",
  Red: "#DC2626",
  Green: "#16A34A",
  label: {
    fontFamily: "var(--font-poppins)",
    fontWeight: 700,
    fontSize: "11px",
    letterSpacing: "0.12em",
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
    fontFamily: "var(--font-poppins)",
    fontSize: "13.5px",
    outline: "none",
    backgroundColor: "#FFFFFF",
    color: "#151A54",
    boxSizing: "border-box" as const,
  },
};

// ─── Default Programs Seed Data ───────────────────────────────────────────────

const DEFAULT_PROGRAMS: ProgramRecord[] = [
  {
    slug: "festival-of-light",
    name: "Festival of Light",
    scripture: "Isaiah 60:1",
    scriptureVerse:
      "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.",
    frequency: "Annual Homecoming Conference · October",
    cadence: "Annual",
    location: "Jos, Plateau State",
    summary:
      "Believers from across Nigeria and around the world gather each October for worship, sound apostolic teaching, Holy Ghost expressions and fellowship.",
    description:
      "Each October, believers from across Nigeria and around the world gather in Jos for worship, sound apostolic teaching, Holy Ghost expressions, and corporate fellowship. Festival of Light is our annual homecoming gathering where the light of God's Word illuminates lives and sets hearts ablaze.",
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
        speakers: [
          "Rev. Joshua Agunbiade",
          "Rev. Rasine Irem",
          "Rev. Adetokunbo Emmanuel",
          "Pastor Theophilus Makinde",
        ],
        searchTerms: ["festival of light", "fol 2026", "shout of a king"],
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
        searchTerms: ["festival of light", "fol 2024", "immanuel"],
        curatedMessages: [],
      },
    ],
  },
  {
    slug: "merismos",
    name: "Merismos",
    scripture: "Hebrews 4:12",
    scriptureVerse:
      "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit...",
    frequency: "Annual Word & Power Conference",
    cadence: "Annual",
    location: "Jos, Plateau State",
    summary:
      "A power-packed encounter where the Word is rightly taught and the Holy Spirit moves tangibly to transform lives.",
    description:
      "A power-packed encounter where the Word of God is rightly taught and the Holy Spirit moves tangibly to transform lives. Merismos — the piercing, dividing work of the Word — defines every edition.",
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
    scriptureVerse:
      "Is not my word like as a fire? saith the LORD; and like a hammer that breaketh the rock in pieces?",
    frequency: "Monthly Intensive · End of Month (Wed–Fri)",
    cadence: "Monthly",
    location: "The House of Bread, Jos",
    summary:
      "An intensive prayer gathering running Wednesday to Friday and culminating in an overnight vigil.",
    description:
      "An intensive corporate prayer gathering running Wednesday through Friday and culminating in an overnight prayer vigil. The Forge is where men are made in the place of prayer.",
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
    scriptureVerse:
      "And he gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers...",
    frequency: "Monthly Gathering · Second Weekend",
    cadence: "Monthly",
    location: "Abuja, FCT & Nationwide",
    summary:
      "A close spiritual camp focused on equipping believers, prophetic words and deep spiritual alignment.",
    description:
      "Monthly apostolic gatherings in Abuja and across Nigeria, focused on equipping believers, prophetic alignment, and deep spiritual formation.",
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
    scriptureVerse:
      "That I may know him, and the power of his resurrection, and the fellowship of his sufferings...",
    frequency: "Annual · Easter",
    cadence: "Easter",
    location: "Jos, Plateau State",
    summary:
      "Unveiling the person, finished work and lordship of Jesus Christ through sound teaching, prayer and worship.",
    description:
      "Every Easter, we gather to unveil the person, finished work and lordship of Jesus Christ through sound teaching, prayer and corporate worship.",
    logoImage: "/images/Jesus Convention logo white.png",
    bannerImage: "/images/programs-hero.jpg",
    published: true,
    editions: [
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
        searchTerms: ["jesus convention"],
        curatedMessages: [],
      },
    ],
  },
];

// Helper to extract YouTube 11-char ID
function extractVideoId(url: string): string | null {
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url?.match(regExp);
  return match ? match[1] : null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProgramsCmsPage() {
  const [programs, setPrograms] = useState<ProgramRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("festival-of-light");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Church sermons catalog for quick cross-referencing
  const [catalogSermons, setCatalogSermons] = useState<any[]>([]);
  const [catalogSearch, setCatalogSearch] = useState("");

  // ── Modal State for Rich Sermon Editor ──
  const [activeSermonModal, setActiveSermonModal] = useState<{
    editionIndex: number;
    messageIndex: number | null; // null if adding new, index if editing existing
    form: EditionMessage;
    ytPasteUrl: string;
    ytFetching: boolean;
    ytMsg: string;
  } | null>(null);

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
            const found = data.programs.find(
              (p: any) => p.slug === def.slug || p.id === def.slug
            );
            if (!found) return def;

            // Sanitize editions from Firestore: remove demo sermons and ensure FOL 2024 speakers are accurate
            const editions = (
              found.editions && found.editions.length > 0 ? found.editions : def.editions
            ).map((ed: ProgramEdition) => {
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

            return {
              ...def,
              ...found,
              editions,
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

  // Load church sermon catalog for quick attach
  const fetchCatalogSermons = async () => {
    try {
      const res = await fetch("/api/cms/sermons");
      if (res.ok) {
        const data = await res.json();
        if (data.sermons && Array.isArray(data.sermons)) {
          setCatalogSermons(data.sermons);
        }
      }
    } catch (e) {
      console.error("Error fetching church sermons catalog:", e);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchCatalogSermons();
  }, []);

  const currentProgram =
    programs.find((p) => p.slug === selectedSlug) || programs[0] || DEFAULT_PROGRAMS[0];

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

  // ── Rich Sermon Editor Handlers ──

  const openAddSermonModal = (editionIndex: number) => {
    const defaultSpeaker =
      currentProgram.editions[editionIndex]?.speakers?.[0] || "Dr. Joshua Agunbiade";

    setActiveSermonModal({
      editionIndex,
      messageIndex: null,
      form: {
        id: `msg-${Date.now()}`,
        title: "",
        speaker: defaultSpeaker,
        date: new Date().toISOString().split("T")[0],
        scripture: "",
        duration: "",
        audioUrl: "",
        videoUrl: "",
        summary: "",
      },
      ytPasteUrl: "",
      ytFetching: false,
      ytMsg: "",
    });
  };

  const openEditSermonModal = (editionIndex: number, messageIndex: number) => {
    const ed = currentProgram.editions[editionIndex];
    const existing = ed.curatedMessages[messageIndex];
    if (!existing) return;

    setActiveSermonModal({
      editionIndex,
      messageIndex,
      form: { ...existing },
      ytPasteUrl: existing.videoUrl || "",
      ytFetching: false,
      ytMsg: "",
    });
  };

  const closeSermonModal = () => {
    setActiveSermonModal(null);
    setCatalogSearch("");
  };

  // YouTube Auto-fill for Edition Sermon Modal
  const handleYtAutoFill = async () => {
    if (!activeSermonModal) return;
    const url = activeSermonModal.ytPasteUrl.trim() || activeSermonModal.form.videoUrl?.trim();
    if (!url) {
      setActiveSermonModal((prev) =>
        prev ? { ...prev, ytMsg: "Please paste a YouTube URL first." } : null
      );
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setActiveSermonModal((prev) =>
        prev
          ? {
              ...prev,
              ytMsg: "Could not find a valid YouTube video ID in that URL.",
            }
          : null
      );
      return;
    }

    setActiveSermonModal((prev) =>
      prev ? { ...prev, ytFetching: true, ytMsg: "Fetching video metadata..." } : null
    );

    try {
      const res = await fetch(`/api/sync-sermons/yt-meta?videoId=${videoId}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to fetch YouTube details");
      }

      setActiveSermonModal((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          ytFetching: false,
          ytMsg: "✓ Imported title, date, duration, and video link from YouTube!",
          form: {
            ...prev.form,
            title: prev.form.title || data.title || "",
            date: data.publishedAt ? data.publishedAt.split("T")[0] : prev.form.date,
            duration: data.duration || prev.form.duration,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            summary: prev.form.summary || data.description?.slice(0, 300) || "",
          },
        };
      });
    } catch (e: any) {
      setActiveSermonModal((prev) =>
        prev ? { ...prev, ytFetching: false, ytMsg: "Error: " + e.message } : null
      );
    }
  };

  // Attach from Church Sermon Catalog
  const handleAttachFromCatalog = (sermon: any) => {
    if (!activeSermonModal) return;

    setActiveSermonModal((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ytMsg: `✓ Attached details from "${sermon.title}"`,
        form: {
          ...prev.form,
          title: sermon.title || prev.form.title,
          speaker: sermon.speaker || prev.form.speaker,
          date: sermon.date || prev.form.date,
          scripture: sermon.scripture || prev.form.scripture,
          duration: sermon.duration || prev.form.duration,
          audioUrl: sermon.audioUrl || prev.form.audioUrl,
          videoUrl: sermon.videoUrl || prev.form.videoUrl,
          summary: sermon.summary || prev.form.summary,
        },
      };
    });
  };

  // Save Sermon to Edition
  const handleSaveSermonModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSermonModal) return;

    const { editionIndex, messageIndex, form } = activeSermonModal;
    if (!form.title.trim()) {
      alert("Please enter a sermon title.");
      return;
    }
    if (!form.speaker.trim()) {
      alert("Please enter the speaker's name.");
      return;
    }

    const list = [...(currentProgram.editions || [])];
    const ed = list[editionIndex];
    if (!ed) return;

    const currentMessages = [...(ed.curatedMessages || [])];

    if (messageIndex === null) {
      // Adding new sermon
      currentMessages.push({
        ...form,
        id: form.id || `msg-${Date.now()}`,
      });
    } else {
      // Updating existing sermon
      currentMessages[messageIndex] = {
        ...form,
      };
    }

    ed.curatedMessages = currentMessages;
    updateProgramField("editions", list);
    closeSermonModal();
  };

  const removeMessageFromEdition = (editionIndex: number, messageIndex: number) => {
    if (!confirm("Are you sure you want to remove this sermon from this edition?")) return;
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
      setTimeout(() => setMsg(""), 4500);
      fetchPrograms();
    } catch (err: any) {
      setErrorMsg("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Filtered catalog list for quick selector
  const filteredCatalogSermons = useMemo(() => {
    if (!catalogSearch.trim()) return catalogSermons.slice(0, 10);
    const q = catalogSearch.toLowerCase();
    return catalogSermons
      .filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.speaker?.toLowerCase().includes(q) ||
          s.series?.toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [catalogSermons, catalogSearch]);

  return (
    <div
      style={{
        padding: "clamp(16px, 3vw, 32px)",
        maxWidth: "1280px",
        margin: "0 auto",
        backgroundColor: "#F4F6FB",
        minHeight: "100vh",
      }}
    >
      {/* ── Top Header Bar ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px",
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
              color: "#0140C1",
            }}
          >
            CMS Portal · Flagship Programs
          </span>
          <h1
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 800,
              color: "#151A54",
              margin: "4px 0 0",
              textTransform: "uppercase",
            }}
          >
            Programs &amp; Past Editions Editor
          </h1>
          <p
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "16px",
              color: "#4A62A0",
              margin: "4px 0 0",
            }}
          >
            Manage flagship programs, fliers, flier speakers, and attached sermon recordings.
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

          {/* View Live Subpage button */}
          <Link
            href={`/programs/${currentProgram.slug}`}
            target="_blank"
            style={{
              padding: "10px 18px",
              backgroundColor: "#151A54",
              border: "none",
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
            👁 View Live Page ↗
          </Link>
        </div>
      </div>

      {/* ── Status Notifications ── */}
      {msg && (
        <div
          style={{
            padding: "14px 20px",
            backgroundColor: "#DCFCE7",
            border: "1px solid #86EFAC",
            color: "#15803D",
            borderRadius: "4px",
            marginBottom: "20px",
            fontFamily: "var(--font-poppins)",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {msg}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: "14px 20px",
            backgroundColor: "#FEE2E2",
            border: "1px solid #FCA5A5",
            color: "#DC2626",
            borderRadius: "4px",
            marginBottom: "20px",
            fontFamily: "var(--font-poppins)",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* ── Program Selector Pills ── */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "12px",
          marginBottom: "24px",
        }}
      >
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
                border: isSelected ? "1px solid #0140C1" : "1px solid #D3DAEC",
                borderRadius: "4px",
                fontFamily: "var(--font-poppins)",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: isSelected ? "0 4px 12px rgba(1, 64, 193, 0.2)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* ── Main Two-Column or Stack Layout ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* ── CARD 1: Core Program Metadata & Details ── */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #D3DAEC",
            borderRadius: "6px",
            padding: "clamp(20px, 3vw, 32px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              paddingBottom: "12px",
              borderBottom: "1px solid #E2E8F0",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#151A54",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                1. Core Program Information ({currentProgram.name})
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "14px",
                  color: "#4A62A0",
                  margin: "4px 0 0",
                }}
              >
                Information displayed on the main /programs directory card and the subpage hero.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#151A54",
                }}
              >
                Status:
              </label>
              <select
                value={currentProgram.published ? "published" : "draft"}
                onChange={(e) => updateProgramField("published", e.target.value === "published")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "4px",
                  border: "1px solid #D3DAEC",
                  fontFamily: "var(--font-poppins)",
                  fontSize: "12px",
                  fontWeight: 600,
                  backgroundColor: currentProgram.published ? "#DCFCE7" : "#FEE2E2",
                  color: currentProgram.published ? "#15803D" : "#DC2626",
                }}
              >
                <option value="published">Published</option>
                <option value="draft">Draft / Hidden</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "18px",
              marginBottom: "18px",
            }}
          >
            <div>
              <label style={S.label}>Program Title *</label>
              <input
                type="text"
                value={currentProgram.name}
                onChange={(e) => updateProgramField("name", e.target.value)}
                style={S.input}
              />
            </div>

            <div>
              <label style={S.label}>URL Slug (Permanent link identifier)</label>
              <input
                type="text"
                value={currentProgram.slug}
                disabled
                style={{ ...S.input, backgroundColor: "#F8FAFC", color: "#64748B" }}
              />
            </div>

            <div>
              <label style={S.label}>Scripture Anchor (e.g. Isaiah 60:1)</label>
              <input
                type="text"
                value={currentProgram.scripture || ""}
                onChange={(e) => updateProgramField("scripture", e.target.value)}
                placeholder="e.g. Isaiah 60:1"
                style={S.input}
              />
            </div>

            <div>
              <label style={S.label}>Cadence / Meeting Frequency</label>
              <input
                type="text"
                value={currentProgram.frequency || ""}
                onChange={(e) => {
                  updateProgramField("frequency", e.target.value);
                  updateProgramField("cadence", e.target.value);
                }}
                placeholder="e.g. Annual Homecoming Conference · October"
                style={S.input}
              />
            </div>

            <div>
              <label style={S.label}>Default Venue / Location</label>
              <input
                type="text"
                value={currentProgram.location || ""}
                onChange={(e) => updateProgramField("location", e.target.value)}
                placeholder="e.g. The House of Bread, Jos"
                style={S.input}
              />
            </div>

            <div>
              <label style={S.label}>Logo / Plate Image URL</label>
              <input
                type="text"
                value={currentProgram.logoImage || currentProgram.imageUrl || ""}
                onChange={(e) => {
                  updateProgramField("logoImage", e.target.value);
                  updateProgramField("imageUrl", e.target.value);
                }}
                placeholder="e.g. /images/Festival of Light logo (white).png"
                style={S.input}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={S.label}>Scripture Verse Quotation (Shows in Hero Box)</label>
            <textarea
              rows={2}
              value={currentProgram.scriptureVerse || ""}
              onChange={(e) => updateProgramField("scriptureVerse", e.target.value)}
              placeholder="e.g. Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee."
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #D3DAEC",
                borderRadius: "4px",
                fontFamily: "var(--font-playfair)",
                fontSize: "15px",
                color: "#151A54",
              }}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label style={S.label}>Full Program Description</label>
            <textarea
              rows={3}
              value={currentProgram.description || currentProgram.summary || ""}
              onChange={(e) => {
                updateProgramField("description", e.target.value);
                updateProgramField("summary", e.target.value);
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #D3DAEC",
                borderRadius: "4px",
                fontFamily: "var(--font-playfair)",
                fontSize: "15px",
                color: "#151A54",
              }}
            />
          </div>
        </div>

        {/* ── CARD 2: Past Editions & Event Fliers Editor ── */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #D3DAEC",
            borderRadius: "6px",
            padding: "clamp(20px, 3vw, 32px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#151A54",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                2. Past Editions, Fliers &amp; Speakers ({currentProgram.editions?.length || 0} Editions)
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "14px",
                  color: "#64748B",
                  margin: "4px 0 0",
                }}
              >
                Add event fliers, theme, dates, preachers shown on fliers, and attached sermon recordings.
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
          {!currentProgram.editions || currentProgram.editions.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                background: "#F8FAFC",
                borderRadius: "4px",
                border: "1px dashed #CBD5E1",
              }}
            >
              <p style={{ fontFamily: "var(--font-playfair)", color: "#64748B", margin: 0 }}>
                No past editions yet. Click &ldquo;+ Add New Edition&rdquo; above to add the first flier and edition details.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {currentProgram.editions.map((ed, edIdx) => (
                <div
                  key={ed.key || edIdx}
                  style={{
                    background: "#F8FAFC",
                    border: "1.5px solid #D3DAEC",
                    borderRadius: "6px",
                    padding: "22px",
                  }}
                >
                  {/* Edition header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid #E2E8F0",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          background: "#0140C1",
                          color: "#FFFFFF",
                          padding: "4px 10px",
                          borderRadius: "2px",
                          fontFamily: "var(--font-poppins)",
                          fontWeight: 700,
                          fontSize: "11px",
                          textTransform: "uppercase",
                        }}
                      >
                        #{edIdx + 1}
                      </span>
                      <strong
                        style={{
                          fontFamily: "var(--font-poppins)",
                          fontSize: "15px",
                          color: "#151A54",
                        }}
                      >
                        {ed.label} Edition: &ldquo;{ed.theme}&rdquo;
                      </strong>
                    </div>

                    <button
                      onClick={() => removeEdition(edIdx)}
                      style={{
                        background: "#FEE2E2",
                        border: "1px solid #FCA5A5",
                        color: "#DC2626",
                        padding: "5px 12px",
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
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "14px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <label style={S.label}>Edition Label (e.g. 2024, Sept 2026)</label>
                      <input
                        type="text"
                        value={ed.label || ""}
                        onChange={(e) => updateEdition(edIdx, "label", e.target.value)}
                        style={S.input}
                      />
                    </div>

                    <div>
                      <label style={S.label}>Theme *</label>
                      <input
                        type="text"
                        value={ed.theme || ""}
                        onChange={(e) => updateEdition(edIdx, "theme", e.target.value)}
                        placeholder="e.g. Immanuel"
                        style={{
                          ...S.input,
                          fontFamily: "var(--font-playfair)",
                          fontStyle: "italic",
                        }}
                      />
                    </div>

                    <div>
                      <label style={S.label}>Dates Held</label>
                      <input
                        type="text"
                        value={ed.dates || ""}
                        onChange={(e) => updateEdition(edIdx, "dates", e.target.value)}
                        placeholder="e.g. 24–27 October 2024"
                        style={S.input}
                      />
                    </div>

                    <div>
                      <label style={S.label}>Venue / Location</label>
                      <input
                        type="text"
                        value={ed.location || ""}
                        onChange={(e) => updateEdition(edIdx, "location", e.target.value)}
                        placeholder="e.g. The House of Bread, Jos"
                        style={S.input}
                      />
                    </div>

                    <div>
                      <label style={S.label}>Event Flier Image URL</label>
                      <input
                        type="text"
                        value={ed.flierSrc || ""}
                        onChange={(e) => updateEdition(edIdx, "flierSrc", e.target.value)}
                        placeholder="e.g. /images/programs/fol-2024.jpg"
                        style={S.input}
                      />
                    </div>

                    <div>
                      <label style={S.label}>Dynamic Button Text</label>
                      <input
                        type="text"
                        value={ed.listenButtonText || ""}
                        onChange={(e) => updateEdition(edIdx, "listenButtonText", e.target.value)}
                        placeholder={`e.g. Listen to ${currentProgram.name} ${ed.label} Messages`}
                        style={S.input}
                      />
                    </div>

                    {/* ── PREACHERS / SPEAKERS ON FLIER FIELD ── */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: "4px",
                        }}
                      >
                        <label style={{ ...S.label, color: "#0140C1", marginBottom: 0 }}>
                          Preachers / Speakers on this Flier (Comma-separated) *
                        </label>
                        <span style={{ fontFamily: "var(--font-poppins)", fontSize: "11px", color: "#64748B" }}>
                          {(ed.speakers || []).length} preachers specified
                        </span>
                      </div>
                      <input
                        type="text"
                        value={(ed.speakers || []).join(", ")}
                        onChange={(e) => {
                          const sps = e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          updateEdition(edIdx, "speakers", sps);
                        }}
                        placeholder="e.g. Dr. Joshua Agunbiade, Apostle Gideon Odoma, Rev. Rasine Irem, Min. Sharon Agunbiade"
                        style={{ ...S.input, borderColor: "#0140C1" }}
                      />
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#4A62A0",
                          marginTop: "4px",
                          display: "block",
                          lineHeight: "1.4em",
                        }}
                      >
                        💡 Enter the exact preacher names shown on the poster. These render as speaker badges
                        (<code>🎙 Preacher Name</code>) underneath the flier on the public program page.
                      </span>
                    </div>
                  </div>

                  {/* ── RICH SERMONS & AUDIO MESSAGES FOR THIS EDITION ── */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #D3DAEC",
                      borderRadius: "6px",
                      padding: "18px",
                      marginTop: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "14px",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontFamily: "var(--font-poppins)",
                            fontSize: "10.5px",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "#0140C1",
                          }}
                        >
                          Sermons &amp; Audio Messages
                        </span>
                        <h4
                          style={{
                            fontFamily: "var(--font-poppins)",
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#151A54",
                            margin: "2px 0 0",
                          }}
                        >
                          Attached Messages ({ed.curatedMessages?.length || 0})
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => openAddSermonModal(edIdx)}
                        style={{
                          background: "#0140C1",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "4px",
                          padding: "8px 16px",
                          fontFamily: "var(--font-poppins)",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 2px 8px rgba(1, 64, 193, 0.25)",
                        }}
                      >
                        <span>+</span> Add Sermon to Edition
                      </button>
                    </div>

                    {!ed.curatedMessages || ed.curatedMessages.length === 0 ? (
                      <div
                        style={{
                          padding: "24px 16px",
                          textAlign: "center",
                          background: "#F4F6FB",
                          borderRadius: "4px",
                          border: "1px dashed #D3DAEC",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--font-playfair)",
                            fontSize: "14px",
                            color: "#64748B",
                            margin: 0,
                          }}
                        >
                          No individual sermons added for this edition yet. Click &ldquo;+ Add Sermon to Edition&rdquo;
                          above to attach audio messages, YouTube streams, or import from your main catalog.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {ed.curatedMessages.map((msgItem, mIdx) => (
                          <div
                            key={msgItem.id || mIdx}
                            style={{
                              background: "#F8FAFC",
                              border: "1px solid #D3DAEC",
                              borderRadius: "4px",
                              padding: "14px 16px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: "12px",
                              flexWrap: "wrap",
                            }}
                          >
                            <div style={{ flex: 1, minWidth: "240px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  marginBottom: "4px",
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: "var(--font-poppins)",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "#747CA1",
                                  }}
                                >
                                  #{mIdx + 1}
                                </span>
                                <h5
                                  style={{
                                    fontFamily: "var(--font-poppins)",
                                    fontWeight: 700,
                                    fontSize: "14.5px",
                                    color: "#151A54",
                                    margin: 0,
                                  }}
                                >
                                  {msgItem.title}
                                </h5>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                  flexWrap: "wrap",
                                  alignItems: "center",
                                  fontFamily: "var(--font-poppins)",
                                  fontSize: "11px",
                                  color: "#4A62A0",
                                  marginTop: "4px",
                                }}
                              >
                                <span style={{ fontWeight: 600, color: "#0140C1" }}>
                                  🎙 {msgItem.speaker}
                                </span>
                                {msgItem.scripture && <span>📖 {msgItem.scripture}</span>}
                                {msgItem.duration && <span>⏱ {msgItem.duration}</span>}
                                {msgItem.audioUrl && (
                                  <span
                                    style={{
                                      background: "#E8ECF7",
                                      padding: "2px 8px",
                                      borderRadius: "2px",
                                      color: "#0140C1",
                                    }}
                                  >
                                    🎧 MP3 Audio
                                  </span>
                                )}
                                {msgItem.videoUrl && (
                                  <span
                                    style={{
                                      background: "#FEE2E2",
                                      padding: "2px 8px",
                                      borderRadius: "2px",
                                      color: "#DC2626",
                                    }}
                                  >
                                    🎥 YouTube Video
                                  </span>
                                )}
                              </div>

                              {msgItem.summary && (
                                <p
                                  style={{
                                    fontFamily: "var(--font-playfair)",
                                    fontSize: "13px",
                                    color: "#64748B",
                                    margin: "6px 0 0",
                                    fontStyle: "italic",
                                    lineHeight: "1.4em",
                                  }}
                                >
                                  &ldquo;{msgItem.summary}&rdquo;
                                </p>
                              )}
                            </div>

                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <button
                                type="button"
                                onClick={() => openEditSermonModal(edIdx, mIdx)}
                                style={{
                                  background: "#FFFFFF",
                                  border: "1px solid #D3DAEC",
                                  borderRadius: "3px",
                                  padding: "6px 12px",
                                  color: "#0140C1",
                                  fontFamily: "var(--font-poppins)",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                ✏ Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => removeMessageFromEdition(edIdx, mIdx)}
                                style={{
                                  background: "#FEE2E2",
                                  border: "1px solid #FCA5A5",
                                  borderRadius: "3px",
                                  padding: "6px 12px",
                                  color: "#DC2626",
                                  fontFamily: "var(--font-poppins)",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                🗑 Delete
                              </button>
                            </div>
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

      {/* ── Save Bar Bottom Sticky Floating ── */}
      <div
        style={{
          position: "sticky",
          bottom: "16px",
          marginTop: "32px",
          background: "#151A54",
          borderRadius: "6px",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          color: "#FFFFFF",
          flexWrap: "wrap",
          gap: "12px",
          zIndex: 10,
        }}
      >
        <span style={{ fontFamily: "var(--font-poppins)", fontSize: "13px", fontWeight: 600 }}>
          Editing Program: <strong>{currentProgram.name}</strong> ({currentProgram.editions?.length || 0} editions)
        </span>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "12px 32px",
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
            boxShadow: "0 4px 14px rgba(1, 64, 193, 0.4)",
          }}
        >
          {saving ? "Saving Changes..." : "Save All Changes ✓"}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          RICH SERMON EDITOR MODAL (Matching /cms/sermons layout & workflow)
          Provides:
          - YouTube Quick-Paste Auto-fill
          - Quick selector from church sermon catalog
          - Full title, speaker, scripture, duration, audioUrl, videoUrl, synopsis
      ════════════════════════════════════════════════════════════════════════ */}
      {activeSermonModal && (
        <div
          onClick={closeSermonModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(21, 26, 84, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(16px, 3vw, 24px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: "6px",
              width: "100%",
              maxWidth: "760px",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              border: "1px solid #D3DAEC",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #D3DAEC",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#F4F6FB",
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#0140C1",
                  }}
                >
                  {currentProgram.name} ·{" "}
                  {currentProgram.editions[activeSermonModal.editionIndex]?.label} Edition
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#151A54",
                    margin: "2px 0 0",
                    textTransform: "uppercase",
                  }}
                >
                  {activeSermonModal.messageIndex === null
                    ? "+ Add Sermon to Edition"
                    : `Edit Sermon: ${activeSermonModal.form.title || "Message"}`}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeSermonModal}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #D3DAEC",
                  borderRadius: "4px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#151A54",
                  fontWeight: "bold",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              <form onSubmit={handleSaveSermonModal} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

                {/* ── Quick Import Option 1: YouTube Auto-fill ── */}
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#F0F7FF",
                    border: "1px solid #B8D4F8",
                    borderRadius: "6px",
                  }}
                >
                  <label style={{ ...S.label, color: "#0140C1", marginBottom: "6px" }}>
                    ⚡ YouTube Quick-Paste Auto-fill
                  </label>
                  <p
                    style={{
                      fontFamily: "var(--font-poppins)",
                      fontSize: "11px",
                      color: "#4A62A0",
                      margin: "0 0 10px",
                      lineHeight: "1.5em",
                    }}
                  >
                    Paste a YouTube sermon URL below and click <strong>Auto-fill</strong> — title, duration, date, and link will be imported automatically.
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={activeSermonModal.ytPasteUrl}
                      onChange={(e) =>
                        setActiveSermonModal({
                          ...activeSermonModal,
                          ytPasteUrl: e.target.value,
                        })
                      }
                      style={{ ...S.input, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleYtAutoFill}
                      disabled={activeSermonModal.ytFetching}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#0140C1",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "4px",
                        fontFamily: "var(--font-poppins)",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: activeSermonModal.ytFetching ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {activeSermonModal.ytFetching ? "Fetching..." : "Auto-fill →"}
                    </button>
                  </div>
                  {activeSermonModal.ytMsg && (
                    <p
                      style={{
                        fontFamily: "var(--font-poppins)",
                        fontSize: "11.5px",
                        color: activeSermonModal.ytMsg.startsWith("✓") ? "#16A34A" : "#DC2626",
                        margin: "8px 0 0",
                        fontWeight: 600,
                      }}
                    >
                      {activeSermonModal.ytMsg}
                    </p>
                  )}
                </div>

                {/* ── Quick Import Option 2: Select from Church Catalog ── */}
                {catalogSermons.length > 0 && (
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#F4F6FB",
                      border: "1px solid #D3DAEC",
                      borderRadius: "6px",
                    }}
                  >
                    <label style={{ ...S.label, color: "#151A54", marginBottom: "6px" }}>
                      📚 Or Attach From Main Church Sermon Catalog ({catalogSermons.length} sermons available)
                    </label>
                    <input
                      type="text"
                      placeholder="Type sermon title or speaker to search catalog..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      style={{ ...S.input, marginBottom: "8px" }}
                    />
                    <div
                      style={{
                        maxHeight: "130px",
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        border: "1px solid #D3DAEC",
                        borderRadius: "4px",
                        backgroundColor: "#FFFFFF",
                        padding: "6px",
                      }}
                    >
                      {filteredCatalogSermons.map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => handleAttachFromCatalog(cat)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "3px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "12px",
                            fontFamily: "var(--font-poppins)",
                            backgroundColor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          <div>
                            <strong style={{ color: "#151A54" }}>{cat.title}</strong>
                            <span style={{ color: "#4A62A0", marginLeft: "6px" }}>
                              ({cat.speaker})
                            </span>
                          </div>
                          <span style={{ color: "#0140C1", fontWeight: 700, fontSize: "11px" }}>
                            Attach +
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Row 1: Title & Speaker */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={S.label}>Sermon Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Immanuel: God With Us in Truth & Power"
                      value={activeSermonModal.form.title}
                      onChange={(e) =>
                        setActiveSermonModal({
                          ...activeSermonModal,
                          form: { ...activeSermonModal.form, title: e.target.value },
                        })
                      }
                      style={S.input}
                    />
                  </div>

                  <div>
                    <label style={S.label}>Preacher / Speaker *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Joshua Agunbiade"
                      value={activeSermonModal.form.speaker}
                      onChange={(e) =>
                        setActiveSermonModal({
                          ...activeSermonModal,
                          form: { ...activeSermonModal.form, speaker: e.target.value },
                        })
                      }
                      style={S.input}
                    />
                    {/* Quick Speaker Selector Chips */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                      {[
                        "Dr. Joshua Agunbiade",
                        "Rev. Joshua Agunbiade",
                        "Rev. Rasine Irem",
                        "Apostle Gideon Odoma",
                        "Min. Sharon Agunbiade",
                        "Pastor Theophilus Makinde",
                      ].map((sp) => (
                        <button
                          key={sp}
                          type="button"
                          onClick={() =>
                            setActiveSermonModal({
                              ...activeSermonModal,
                              form: { ...activeSermonModal.form, speaker: sp },
                            })
                          }
                          style={{
                            background: "#E8ECF7",
                            border: "none",
                            borderRadius: "2px",
                            padding: "2px 6px",
                            fontSize: "10px",
                            fontFamily: "var(--font-poppins)",
                            color: "#0140C1",
                            cursor: "pointer",
                          }}
                        >
                          + {sp}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 2: Date, Scripture & Duration */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={S.label}>Date Preached</label>
                    <input
                      type="date"
                      value={activeSermonModal.form.date || ""}
                      onChange={(e) =>
                        setActiveSermonModal({
                          ...activeSermonModal,
                          form: { ...activeSermonModal.form, date: e.target.value },
                        })
                      }
                      style={S.input}
                    />
                  </div>

                  <div>
                    <label style={S.label}>Scripture Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. Matthew 1:23"
                      value={activeSermonModal.form.scripture || ""}
                      onChange={(e) =>
                        setActiveSermonModal({
                          ...activeSermonModal,
                          form: { ...activeSermonModal.form, scripture: e.target.value },
                        })
                      }
                      style={S.input}
                    />
                  </div>

                  <div>
                    <label style={S.label}>Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 1h 45m"
                      value={activeSermonModal.form.duration || ""}
                      onChange={(e) =>
                        setActiveSermonModal({
                          ...activeSermonModal,
                          form: { ...activeSermonModal.form, duration: e.target.value },
                        })
                      }
                      style={S.input}
                    />
                  </div>
                </div>

                {/* Row 3: Audio MP3 and Video URLs */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={S.label}>Audio URL (.mp3 direct link)</label>
                    <input
                      type="url"
                      placeholder="https://.../sermon.mp3"
                      value={activeSermonModal.form.audioUrl || ""}
                      onChange={(e) =>
                        setActiveSermonModal({
                          ...activeSermonModal,
                          form: { ...activeSermonModal.form, audioUrl: e.target.value },
                        })
                      }
                      style={S.input}
                    />
                    <span style={{ fontSize: "10.5px", color: "#64748B", marginTop: "3px", display: "block" }}>
                      Direct audio enables the native in-page audio player.
                    </span>
                  </div>

                  <div>
                    <label style={S.label}>YouTube / Video URL</label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={activeSermonModal.form.videoUrl || ""}
                      onChange={(e) =>
                        setActiveSermonModal({
                          ...activeSermonModal,
                          form: { ...activeSermonModal.form, videoUrl: e.target.value },
                        })
                      }
                      style={S.input}
                    />
                    <span style={{ fontSize: "10.5px", color: "#64748B", marginTop: "3px", display: "block" }}>
                      Enables streaming via the bottom expandable YouTube player.
                    </span>
                  </div>
                </div>

                {/* Row 4: Overview / Synopsis */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "4px",
                    }}
                  >
                    <label style={S.label}>Overview / Message Synopsis</label>
                    <span style={{ fontSize: "10.5px", color: "#747CA1" }}>
                      {activeSermonModal.form.summary ? `${activeSermonModal.form.summary.length} chars` : "Optional"}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the sermon's focal truth and exposition..."
                    value={activeSermonModal.form.summary || ""}
                    onChange={(e) =>
                      setActiveSermonModal({
                        ...activeSermonModal,
                        form: { ...activeSermonModal.form, summary: e.target.value },
                      })
                    }
                    style={{
                      ...S.input,
                      fontFamily: "var(--font-playfair)",
                      fontSize: "14px",
                      lineHeight: "1.55em",
                    }}
                  />
                </div>

                {/* Modal Footer Controls */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    paddingTop: "16px",
                    borderTop: "1px solid #D3DAEC",
                  }}
                >
                  <button
                    type="button"
                    onClick={closeSermonModal}
                    style={{
                      padding: "10px 20px",
                      background: "#FFFFFF",
                      border: "1px solid #D3DAEC",
                      borderRadius: "4px",
                      fontFamily: "var(--font-poppins)",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      color: "#64748B",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      padding: "10px 24px",
                      backgroundColor: "#0140C1",
                      border: "none",
                      borderRadius: "4px",
                      color: "#FFFFFF",
                      fontFamily: "var(--font-poppins)",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(1, 64, 193, 0.3)",
                    }}
                  >
                    Save Sermon to Edition ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
