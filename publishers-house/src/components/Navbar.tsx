"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Figma: EL-e6d41dfd — Navbar: row, padding 16px 100px, space-between, navy bg (#151A54), bottom border 1px #6496EF
// Nav links: UI/Label — Poppins SemiBold 11px, 0.16em tracking, UPPERCASE, white

const navLinks = [
  { label: "About",     href: "/about" },
  { label: "Resources", href: "/resources" },
  { label: "Programs",  href: "/programs" },
  { label: "Events",    href: "/events" },
  { label: "Articles",  href: "/articles" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 300,
        background: "#151A54",
        borderBottom: "1px solid #6496EF",
        transition: "box-shadow 250ms ease",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.3)" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 100px",
          maxWidth: "1440px",
          margin: "0 auto",
        }}
      >
        {/* Logo — Figma: EL-5efdc068 — logo mark + "The\nPublishers\nHouse" Poppins Bold 12px UPPER 0.16em */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
          }}
        >
          {/* Real Navbar Logo */}
          <img
            src="/images/nav-logo.png"
            alt="The Publishers House"
            style={{
              height: "40px",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </Link>

        {/* Desktop Nav Links — Figma: EL-28177092 — row, gap 26px */}
        <ul
          style={{
            display: "flex",
            alignItems: "center",
            gap: "26px",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
          className="nav-desktop"
        >
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    fontSize: "11px",
                    lineHeight: "1.6em",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: active ? "#6496EF" : "#FFFFFF",
                    textDecoration: "none",
                    transition: "color 150ms ease",
                    paddingBottom: "2px",
                    borderBottom: active ? "1px solid #6496EF" : "1px solid transparent",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Give Button — Figma: EL-14642757 — padding 0 26px, h48, border 1px #2090FF, borderRadius 2px, bg transparent, text navy */}
        <Link
          href="/giving"
          className="nav-give-btn"
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: "12px",
            lineHeight: "1em",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#151A54",
            background: "#2090FF",
            border: "1px solid #2090FF",
            borderRadius: "2px",
            padding: "0 26px",
            height: "48px",
            display: "inline-flex",
            alignItems: "center",
            textDecoration: "none",
            transition: "background 150ms ease",
          }}
        >
          Give
        </Link>

        {/* Mobile Hamburger */}
        <button
          className="nav-hamburger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: "24px",
                height: "2px",
                background: "#FFFFFF",
                borderRadius: "2px",
                transition: "all 250ms ease",
                transform:
                  menuOpen && i === 0 ? "rotate(45deg) translate(5px, 5px)"
                  : menuOpen && i === 1 ? "scaleX(0)"
                  : menuOpen && i === 2 ? "rotate(-45deg) translate(5px, -5px)"
                  : "none",
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            background: "#151A54",
            borderTop: "1px solid #6496EF",
            padding: "24px 20px",
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    fontSize: "11px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: pathname === link.href ? "#6496EF" : "#FFFFFF",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(100,150,239,0.2)",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li style={{ marginTop: "16px" }}>
              <Link
                href="/giving"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px 26px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: "12px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#151A54",
                  background: "#2090FF",
                  borderRadius: "2px",
                  textDecoration: "none",
                }}
              >
                Give
              </Link>
            </li>
          </ul>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-give-btn { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        nav > div { padding: 16px 20px; }
        @media (min-width: 769px) {
          nav > div { padding: 16px 100px; }
        }
      `}</style>
    </nav>
  );
}
