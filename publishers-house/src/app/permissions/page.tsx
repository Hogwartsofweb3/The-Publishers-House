"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Navy = "#151A54";
const Blue700 = "#0140C1";
const Blue500 = "#2090FF";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const Paper100 = "#F4F6FB";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const White = "#FFFFFF";

interface PermissionItem {
  id: number;
  question: string;
  verdict: "Allowed" | "Prohibited" | "With Prior Approval";
  verdictColor: string;
  answer: string;
  details?: string;
}

const PERMISSION_ITEMS: PermissionItem[] = [
  {
    id: 1,
    question: "Can I play TPH sermon audio or video in a church service or conference?",
    verdict: "With Prior Approval",
    verdictColor: "#D97706",
    answer:
      "Yes, with prior written notice. You may stream or play official teachings of Dr. Joshua Agunbiade during a church gathering or Christian conference at no cost, provided the teaching is not altered, no admission fee is charged specifically for viewing the video, and full verbal or visual attribution is provided to \"The Publishers House, Jos\".",
    details: "Please notify permissions@thepublishershouse.org in advance with the date, expected audience, and gathering details.",
  },
  {
    id: 2,
    question: "Can I use TPH curriculum materials in a small group, house fellowship, or Bible study?",
    verdict: "Allowed",
    verdictColor: "#10B981",
    answer:
      "Yes, wholeheartedly encouraged. You may freely download, print, and distribute our Study Guides, Devotionals (e.g. 40 Days Prayer & Fasting), and curriculum outlines for use in home fellowships, campus fellowships, or discipleship classes, provided no fee is charged and the content is not edited.",
    details: "We ask that you encourage participants to explore the full curriculum library at thepublishershouse.org/resources.",
  },
  {
    id: 3,
    question: "Can I re-upload full sermon videos or audio to my YouTube, Facebook, or Podcast channel?",
    verdict: "Prohibited",
    verdictColor: "#DC2626",
    answer:
      "No. Re-uploading entire sermon audio files or full video recordings to independent YouTube channels, podcast feeds, Spotify, or audio websites is strictly prohibited.",
    details: "Full-length teachings must remain on the official TPH platforms (YouTube, Mixlr, and the TPH Website) to preserve accurate doctrine, prevent unauthorized monetization, and maintain ministry integrity.",
  },
  {
    id: 4,
    question: "Can I create and post short clips (reels, shorts, TikToks) of Dr. Joshua Agunbiade's sermons?",
    verdict: "Allowed",
    verdictColor: "#10B981",
    answer:
      "Yes, under fair-use clip guidelines. You may extract and share short inspirational snippets (under 3 minutes) on social media, provided: (1) The clip is not edited out of context or doctrinal accuracy, (2) Visible text attribution is provided to @ThePublishersHouse or Dr. Joshua Agunbiade, and (3) The clip does not run third-party commercial advertisements.",
  },
  {
    id: 5,
    question: "Can I quote excerpts from sermons or articles in my book, academic paper, or blog?",
    verdict: "Allowed",
    verdictColor: "#10B981",
    answer:
      "Yes. You may quote brief excerpts (up to 300 words per excerpt) in non-commercial or published Christian literature, provided standard bibliographic attribution is given (Speaker Name, Sermon Title, Year, The Publishers House, URL).",
    details: "For extensive quotations exceeding 500 words or dedicated chapter republications, please request formal written permission.",
  },
  {
    id: 6,
    question: "Can I translate TPH study guides or teachings into other languages (Hausa, French, Yoruba)?",
    verdict: "With Prior Approval",
    verdictColor: "#D97706",
    answer:
      "Yes, but translation initiatives require formal editorial approval. Because apostolic precision in doctrine is paramount, all translation initiatives must be submitted to the Editorial Board for linguistic and doctrinal review prior to public dissemination.",
    details: "Email your translation proposal to editorial@thepublishershouse.org along with your theological background and targeted language.",
  },
  {
    id: 7,
    question: "Can I share downloaded PDF study guides directly with friends or family?",
    verdict: "Allowed",
    verdictColor: "#10B981",
    answer:
      "Yes. You are free to send downloaded study guides, reading plans, and conference notes to individuals via WhatsApp, Telegram, email, or personal file transfer.",
    details: "We only ask that you direct recipients to thepublishershouse.org/resources so they can explore the complete curriculum track.",
  },
  {
    id: 8,
    question: "Can I sell TPH study guides, sermon flash drives, or printed devotionals?",
    verdict: "Prohibited",
    verdictColor: "#DC2626",
    answer:
      "No. The selling of any material, audio recording, conference manual, or devotional authored or published by The Publishers House is strictly prohibited without explicit contractual authorization from Ministry Leadership.",
    details: "\"Freely ye have received, freely give.\" (Matthew 10:8)",
  },
];

export default function PermissionsPage() {
  const [openIds, setOpenIds] = useState<number[]>([1, 2]); // Default first two open
  const [search, setSearch] = useState("");

  const toggleAccordion = (id: number) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredItems = PERMISSION_ITEMS.filter((item) =>
    item.question.toLowerCase().includes(search.toLowerCase()) ||
    item.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px", backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
        
        {/* Hero Section with Mid-Blue Overlay */}
        <section
          style={{
            position: "relative",
            backgroundColor: Navy,
            padding: "80px 24px",
            overflow: "hidden",
            borderBottom: "4px solid #2090FF",
          }}
        >
          {/* Subtle Background Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(21, 26, 84, 0.90) 0%, rgba(1, 64, 193, 0.65) 100%)",
              zIndex: 1,
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: "860px",
              margin: "0 auto",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
            }}
          >
            {/* Breadcrumb */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#A9C2FF",
              }}
            >
              <Link href="/" style={{ color: "#FFFFFF", textDecoration: "none" }}>
                Home
              </Link>
              <span>/</span>
              <span>Legal</span>
              <span>/</span>
              <span style={{ color: Blue500 }}>Copyright & Permissions</span>
            </div>

            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(30px, 4.5vw, 46px)",
                color: White,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                margin: 0,
                lineHeight: "1.05em",
              }}
            >
              Copyright & Permissions
            </h1>

            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "17px",
                color: "rgba(255, 255, 255, 0.9)",
                maxWidth: "680px",
                margin: 0,
                lineHeight: "1.55em",
              }}
            >
              All content, teachings, and curricula published by The Publishers House are protected by copyright. While we actively encourage publishing God’s Word (Psalm 68:11), not all usage is permitted. Please review our policy guidelines below.
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "#E2E8F0",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: "6px",
              }}
            >
              <span>Psalm 68:11 Mandate</span>
              <span>•</span>
              <span>Faithful Doctrinal Stewardship</span>
            </div>
          </div>
        </section>

        {/* Permissions Content Area */}
        <section style={{ padding: "60px 24px 100px", maxWidth: "860px", margin: "0 auto" }}>
          
          {/* Search Filter Box */}
          <div style={{ marginBottom: "32px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: Paper100,
                border: `1px solid ${Paper300}`,
                borderRadius: "8px",
                padding: "10px 16px",
                gap: "12px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={Slate500} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search permissions guidelines (e.g. video, book, translation, reels)..."
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "15px",
                  color: Navy,
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: Slate500,
                    fontSize: "12px",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Accordion List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredItems.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: Paper100, borderRadius: "8px", border: `1px solid ${Paper300}` }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "16px", color: Slate500, margin: 0 }}>
                  No matching permissions policy found for &ldquo;{search}&rdquo;. Please contact permissions@thepublishershouse.org.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isOpen = openIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    style={{
                      border: `1px solid ${isOpen ? Blue500 : Paper300}`,
                      borderRadius: "8px",
                      backgroundColor: White,
                      boxShadow: isOpen ? "0 4px 16px rgba(32, 144, 255, 0.08)" : "0 1px 3px rgba(0,0,0,0.02)",
                      transition: "all 0.2s ease",
                      overflow: "hidden",
                    }}
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleAccordion(item.id)}
                      style={{
                        width: "100%",
                        padding: "20px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        backgroundColor: isOpen ? Paper100 : White,
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 700,
                            fontFamily: "'Poppins', sans-serif",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            backgroundColor: `${item.verdictColor}15`,
                            color: item.verdictColor,
                            border: `1px solid ${item.verdictColor}33`,
                            flexShrink: 0,
                          }}
                        >
                          {item.verdict}
                        </span>

                        <span
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 600,
                            fontSize: "15px",
                            color: Navy,
                            lineHeight: "1.4em",
                          }}
                        >
                          {item.question}
                        </span>
                      </div>

                      {/* Expand / Collapse Icon */}
                      <span
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: isOpen ? Blue700 : Paper200,
                          color: isOpen ? White : Navy,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          fontWeight: 700,
                          flexShrink: 0,
                          transition: "all 0.2s ease",
                        }}
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    {/* Accordion Content */}
                    {isOpen && (
                      <div
                        style={{
                          padding: "20px 24px 24px",
                          backgroundColor: White,
                          borderTop: `1px solid ${Paper200}`,
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "16.5px",
                            lineHeight: "1.8em",
                            color: Slate600,
                            margin: "0 0 12px",
                          }}
                        >
                          {item.answer}
                        </p>
                        {item.details && (
                          <div
                            style={{
                              backgroundColor: Paper100,
                              borderLeft: `3px solid ${item.verdictColor}`,
                              padding: "12px 16px",
                              borderRadius: "0 6px 6px 0",
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: "12.5px",
                              color: Navy,
                              lineHeight: "1.6em",
                            }}
                          >
                            <strong>Guideline Note:</strong> {item.details}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Contact Callout Box */}
          <div
            style={{
              marginTop: "48px",
              padding: "32px",
              borderRadius: "12px",
              backgroundColor: Paper100,
              border: `1px solid ${Paper300}`,
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: Blue700, marginBottom: "4px" }}>
                Specialized Permissions Inquiries
              </div>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "20px", color: Navy, margin: "0 0 8px" }}>
                Have a unique request or publishing project?
              </h3>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15.5px", lineHeight: "1.7em", color: Slate600, margin: 0 }}>
                If your proposed usage is not specifically addressed above, or if you are representing a Christian publishing house, broadcast network, or academic theological institution, please contact our Editorial and Legal Directorate with your formal proposal.
              </p>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", paddingTop: "8px" }}>
              <a
                href="mailto:permissions@thepublishershouse.org"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  backgroundColor: Blue700,
                  color: White,
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "background-color 0.2s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = Blue500)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = Blue700)}
              >
                <span>Email Permissions Desk →</span>
              </a>

              <a
                href="mailto:editorial@thepublishershouse.org"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  backgroundColor: White,
                  border: `1px solid ${Paper300}`,
                  color: Navy,
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = Paper200;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = White;
                }}
              >
                <span>Editorial Board</span>
              </a>
            </div>
          </div>

        </section>

      </main>
      <Footer />
    </>
  );
}
