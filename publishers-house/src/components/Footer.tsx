import Link from "next/link";

// TODO: Replace placeholder social links with actual handles from AVO
const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "YouTube",   href: "#" },
  { label: "Facebook",  href: "#" },
  { label: "Twitter/X", href: "#" },
];

const footerNav = [
  { heading: "Church",    links: [{ label: "About Us", href: "/about" }, { label: "Our Programs", href: "/programs" }, { label: "Events", href: "/events" }, { label: "Contact", href: "/contact" }] },
  { heading: "Resources", links: [{ label: "Sermons", href: "/resources" }, { label: "Teachings", href: "/resources" }, { label: "Articles", href: "/articles" }] },
  { heading: "Give",      links: [{ label: "Tithe", href: "/giving" }, { label: "Offering", href: "/giving" }, { label: "Special Projects", href: "/giving" }] },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--color-surface-dark)",
        color: "rgba(255,255,255,0.7)",
        paddingBlock: "var(--space-20) var(--space-8)",
      }}
    >
      <div className="container">
        {/* Top Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr repeat(3, 1fr)",
            gap: "var(--space-12)",
            marginBottom: "var(--space-16)",
          }}
        >
          {/* Brand Column */}
          <div>
            {/* TODO: Replace with actual logo from AVO */}
            <div style={{ marginBottom: "var(--space-6)" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "var(--color-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-serif)",
                    fontWeight: 700,
                    fontSize: "var(--text-lg)",
                    color: "var(--color-primary)",
                  }}
                >
                  P
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "var(--text-lg)",
                    fontWeight: 700,
                    color: "var(--color-white)",
                  }}
                >
                  The Publishers House
                </span>
              </div>
              {/* TODO: Replace with official tagline/mission from AVO */}
              <p
                style={{
                  maxWidth: "30ch",
                  fontSize: "var(--text-sm)",
                  lineHeight: "var(--leading-relaxed)",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                A vibrant, Spirit-filled church family — publishing the Word of God to our generation.
              </p>
            </div>

            {/* Service Times — TODO: replace with actual times */}
            <div style={{ marginBottom: "var(--space-6)" }}>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  letterSpacing: "var(--tracking-widest)",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  marginBottom: "var(--space-2)",
                  maxWidth: "none",
                }}
              >
                Service Times
              </p>
              <p style={{ fontSize: "var(--text-sm)", maxWidth: "none", color: "rgba(255,255,255,0.6)" }}>
                Sunday: [Time] · Wednesday: [Time]
              </p>
            </div>

            {/* Social */}
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  style={{
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.6)",
                    padding: "var(--space-1) var(--space-3)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "var(--radius-full)",
                    textDecoration: "none",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Nav Columns */}
          {footerNav.map((col) => (
            <div key={col.heading}>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  letterSpacing: "var(--tracking-widest)",
                  textTransform: "uppercase",
                  color: "var(--color-white)",
                  marginBottom: "var(--space-6)",
                  maxWidth: "none",
                }}
              >
                {col.heading}
              </p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: "var(--text-sm)",
                        textDecoration: "none",
                        transition: "color var(--transition-fast)",
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "var(--space-8)",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-4)",
          }}
        >
          <p style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.35)", maxWidth: "none" }}>
            © {year} The Publishers House. All rights reserved.
          </p>
          <p style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.35)", maxWidth: "none" }}>
            thepublishershouse.org
          </p>
        </div>
      </div>
    </footer>
  );
}
