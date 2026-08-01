"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home",      href: "/" },
  { label: "About",     href: "/about" },
  { label: "Resources", href: "/resources" },
  { label: "Programs",  href: "/programs" },
  { label: "Articles",  href: "/articles" },
  { label: "Events",    href: "/events" },
  { label: "Contact",   href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: "var(--z-nav)",
        height: "var(--nav-height)",
        display: "flex",
        alignItems: "center",
        transition: "background var(--transition-slow), box-shadow var(--transition-slow)",
        background: scrolled || !isHome
          ? "rgba(15, 15, 31, 0.97)"
          : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.2)" : "none",
      }}
    >
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "var(--max-width)", height: "100%" }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          {/* TODO: Replace with actual SVG logo from AVO */}
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-serif)",
              fontWeight: 700,
              fontSize: "var(--text-xl)",
              color: "var(--color-primary)",
              flexShrink: 0,
            }}
          >
            P
          </div>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              color: "var(--color-white)",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
            }}
          >
            The Publishers<br />
            <span style={{ color: "var(--color-accent)", fontWeight: 400, fontSize: "var(--text-base)" }}>
              House
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul
          className="hide-mobile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-1)",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    display: "block",
                    padding: "var(--space-2) var(--space-4)",
                    color: active ? "var(--color-accent)" : "rgba(255,255,255,0.85)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: active ? 600 : 400,
                    fontSize: "var(--text-sm)",
                    letterSpacing: "var(--tracking-wide)",
                    textDecoration: "none",
                    borderBottom: active ? "2px solid var(--color-accent)" : "2px solid transparent",
                    paddingBottom: "calc(var(--space-2) - 2px)",
                    transition: "color var(--transition-fast), border-color var(--transition-fast)",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Give CTA */}
        <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <Link href="/giving" className="btn btn-primary btn-sm">
            Give
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="hide-desktop"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "var(--space-2)",
            display: "flex",
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
                background: "var(--color-white)",
                borderRadius: "2px",
                transition: "all var(--transition-normal)",
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
            position: "absolute",
            top: "var(--nav-height)",
            left: 0,
            right: 0,
            background: "rgba(15, 15, 31, 0.98)",
            backdropFilter: "blur(12px)",
            padding: "var(--space-6)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            animation: "fadeInUp 0.25s ease",
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    display: "block",
                    padding: "var(--space-3) var(--space-4)",
                    color: pathname === link.href ? "var(--color-accent)" : "rgba(255,255,255,0.85)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: pathname === link.href ? 600 : 400,
                    fontSize: "var(--text-base)",
                    textDecoration: "none",
                    borderRadius: "var(--radius-md)",
                    background: pathname === link.href ? "rgba(201,168,76,0.1)" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li style={{ marginTop: "var(--space-4)" }}>
              <Link href="/giving" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Give
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
