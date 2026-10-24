import Link from "next/link";
import { YouTubeIcon, InstagramIcon, FacebookIcon, XIcon } from "@/components/SocialIcons";

// Figma: EL-7b2ab70f — Footer: column, padding 72px 100px 40px, gap 40px, bg #151A54
// EL-4597e800 — top row: row, gap 48px
// EL-7cda1055 — brand col: column, gap 10px
// EL-81986ca9 — bottom bar: column, padding-top 26px, border-top 1px #E8ECF7, center align, gap 10px

export default function Footer() {
  return (
    <footer style={{ background: "#151A54" }}>
      <div className="tph-footer-inner" style={{ flexDirection: "column", gap: "40px" }}>
        {/* Top Row */}
        <div className="tph-footer-top">
          {/* Brand Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: "18px",
                lineHeight: "1.6em",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#FFFFFF",
              }}
            >
              The Publishers House
            </span>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "10px",
                lineHeight: "1.6em",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#E8ECF7",
                maxWidth: "320px",
              }}
            >
              Established 2020
            </p>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 400,
                fontSize: "14.5px",
                lineHeight: "1.5em",
                color: "#E8ECF7",
                maxWidth: "320px",
              }}
            >
              The House of Bread, Korinjoh House,{"\n"}British, Jos, Plateau State
            </p>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 400,
                fontSize: "14.5px",
                lineHeight: "1.5em",
                color: "#E8ECF7",
                maxWidth: "320px",
              }}
            >
              Sundays 9:00 AM WAT · Thursdays 4:30 PM WAT
            </p>
          </div>

          {/* Explore Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "10px",
                lineHeight: "1.6em",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#E8ECF7",
                marginBottom: "4px",
              }}
            >
              Explore
            </span>
            {["About", "Resources", "Articles", "Programs"].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase()}`}
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 400,
                  fontSize: "14.5px",
                  lineHeight: "1.5em",
                  color: "#E8ECF7",
                  textDecoration: "none",
                  transition: "color 150ms ease",
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Take Part Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "10px",
                lineHeight: "1.6em",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#E8ECF7",
                marginBottom: "4px",
              }}
            >
              Take part
            </span>
            {[
              { label: "Events", href: "/events" },
              { label: "Giving", href: "/giving" },
              { label: "Watch live", href: "https://www.youtube.com/@ThePublishersHouse" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 400,
                  fontSize: "14.5px",
                  lineHeight: "1.5em",
                  color: "#E8ECF7",
                  textDecoration: "none",
                  transition: "color 150ms ease",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Follow Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "10px",
                lineHeight: "1.6em",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#E8ECF7",
                marginBottom: "4px",
              }}
            >
              Follow
            </span>
            {[
              { label: "YouTube", href: "https://www.youtube.com/@ThePublishersHouse", icon: <YouTubeIcon size={18} color="#FFFFFF" /> },
              { label: "Instagram", href: "https://www.instagram.com/thepublishershouse/", icon: <InstagramIcon size={18} color="#FFFFFF" /> },
              { label: "Facebook", href: "https://www.facebook.com/thepublishershouse", icon: <FacebookIcon size={18} color="#FFFFFF" /> },
              { label: "X (Twitter)", href: "https://x.com/tph_jos", icon: <XIcon size={16} color="#FFFFFF" /> },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 400,
                  fontSize: "14.5px",
                  lineHeight: "1.5em",
                  color: "#E8ECF7",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "all 150ms ease",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px" }}>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Bar — Figma: EL-81986ca9 — border-top 1px #E8ECF7, padding-top 26px, center, gap 10px */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            paddingTop: "26px",
            borderTop: "1px solid #E8ECF7",
          }}
        >
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(20px, 3vw, 24px)",
              lineHeight: "1.3em",
              textAlign: "center",
              color: "#FFFFFF",
              margin: 0
            }}
          >
            The Lord gave the word: great was the company of those that published it.
          </p>
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              marginTop: "8px"
            }}
          >
            PSALM 68:11 (KJV)
          </span>

          {/* Legal & Policy Navigation */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "18px",
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(232, 236, 247, 0.15)",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "11px",
                color: "rgba(255,255,255,0.65)",
              }}
            >
              © {new Date().getFullYear()} The Publishers House. All rights reserved.
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
            <Link
              href="/privacy"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                color: "#E8ECF7",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                transition: "color 150ms ease",
              }}
            >
              Privacy Policy
            </Link>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
            <Link
              href="/permissions"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                color: "#E8ECF7",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                transition: "color 150ms ease",
              }}
            >
              Copyright & Permissions
            </Link>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
            <Link
              href="/portal"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                color: "#6496EF",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>Portal Login</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
