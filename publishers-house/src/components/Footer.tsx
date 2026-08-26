import Link from "next/link";

// Figma: EL-7b2ab70f — Footer: column, padding 72px 100px 40px, gap 40px, bg #151A54
// EL-4597e800 — top row: row, gap 48px
// EL-7cda1055 — brand col: column, gap 10px
// EL-81986ca9 — bottom bar: column, padding-top 26px, border-top 1px #E8ECF7, center align, gap 10px

export default function Footer() {
  return (
    <footer style={{ background: "#151A54" }}>
      {/* Desktop Footer */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          padding: "72px 100px 40px",
          gap: "40px",
          maxWidth: "1440px",
          margin: "0 auto",
        }}
      >
        {/* Top Row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignSelf: "stretch",
            gap: "48px",
          }}
        >
          {/* Brand Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: "0 0 320px" }}>
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
            {/* Figma: EL-dec8b8b6 — Established 2020 · Dr. Joshua Agunbiade — UI/Eyebrow, #E8ECF7 */}
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
              Established 2020 · Dr. Joshua Agunbiade
            </p>
            {/* Figma: EL-01d16010 — Address — Read/Small, #E8ECF7 */}
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
            {/* Figma: EL-17d3c3f6 — Service times — Read/Small, #E8ECF7 */}
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
              Sundays 9:00 AM · Thursdays 5:00 PM WAT
            </p>
            {/* Figma: EL-bb58850b — Outreach — Read/Small, #99AFC6 (muted) */}
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 400,
                fontSize: "14.5px",
                lineHeight: "1.5em",
                color: "#99AFC6",
                maxWidth: "320px",
              }}
            >
              Outreach: Abuja
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
              Follow
            </span>
            {[
              { label: "YouTube", href: "https://www.youtube.com/@ThePublishersHouse" },
              { label: "Instagram", href: "https://www.instagram.com/thepublishershouse/" },
              { label: "Facebook", href: "https://www.facebook.com/thepublishershouse" },
              { label: "X", href: "https://x.com/tph_jos" },
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
                  transition: "color 150ms ease",
                }}
              >
                {item.label}
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
          {/* Figma: EL-ed81264a — Psalm 68:11 quote — Playfair Display Italic 21px, center, white */}
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "21px",
              lineHeight: "1.3em",
              textAlign: "center",
              color: "#FFFFFF",
              maxWidth: "760px",
            }}
          >
            &ldquo;The Lord gave the word: great was the company of those that published it.&rdquo;
          </p>
          {/* Figma: EL-03e03fcf — Psalm 68:11 (KJV) — UI/Scripture, #F4F6FB */}
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: "11px",
              lineHeight: "1.6em",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#F4F6FB",
            }}
          >
            Psalm 68:11 (KJV)
          </span>
        </div>
      </div>

      {/* Mobile Footer styles */}
      <style>{`
        @media (max-width: 768px) {
          footer > div {
            padding: 48px 20px 32px !important;
          }
          footer > div > div:first-child {
            flex-direction: column !important;
            gap: 32px !important;
          }
          footer > div > div:first-child > div:first-child {
            flex: unset !important;
          }
        }
      `}</style>
    </footer>
  );
}
