"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const RESOURCE_SUBPAGES = [
  { slug: "how-to-preach-the-gospel", label: "How to Preach the Gospel" },
  { slug: "basic-prayer-classes", label: "Basic Prayer Classes" },
  { slug: "40-days-prayer-and-fasting", label: "40 DAYS PRAYER & FASTING: DEVOTIONAL" },
  { slug: "the-doctrine-of-christ", label: "The doctrine of Christ" },
  { slug: "work-and-increase", label: "Work & Increase" },
  { slug: "grace-for-grace", label: "Grace for Grace" },
];

const navLinks = [
  { label: "Home", href: "/", isHome: true },
  { label: "About", href: "/about" },
  { label: "Sermons and Talks", href: "/sermons" },
  { label: "Resources", href: "/resources", hasDropdown: true },
  { label: "Programs", href: "/programs" },
  { label: "Events", href: "/events" },
  { label: "Articles", href: "/articles" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [announcement, setAnnouncement] = useState<{
    active: boolean;
    badge: string;
    message: string;
    linkText?: string;
    linkUrl?: string;
    bgColor?: string;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setResourcesOpen(false);
  }, [pathname]);

  // Fetch Global Announcement Banner
  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.active && data.message) setAnnouncement(data);
      })
      .catch(() => {});
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setResourcesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setResourcesOpen(false);
    }, 200);
  };

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
        boxShadow: scrolled ? "0 4px 25px rgba(0,0,0,0.35)" : "none",
      }}
    >
      {/* Global Urgent Church Announcement Bar (controllable from CMS) */}
      {announcement?.active && (
        <div
          style={{
            backgroundColor: announcement.bgColor || "#0140C1",
            color: "#FFFFFF",
            padding: "8px 24px",
            fontSize: "12px",
            fontFamily: "'Poppins', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            textAlign: "center",
            borderBottom: "1px solid rgba(255,255,255,0.18)",
            lineHeight: 1.4,
          }}
        >
          <span
            style={{
              backgroundColor: "rgba(255,255,255,0.22)",
              padding: "2px 8px",
              borderRadius: "4px",
              fontWeight: 700,
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {announcement.badge || "Announcement"}
          </span>
          <span style={{ fontWeight: 500 }}>{announcement.message}</span>
          {announcement.linkUrl && (
            <Link
              href={announcement.linkUrl}
              style={{
                color: "#FFFFFF",
                fontWeight: 700,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              {announcement.linkText || "View Details →"}
            </Link>
          )}
        </div>
      )}

      <div className="nav-container">
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
          }}
        >
          <picture>
            <source srcSet="/images/nav-logo-opt.webp" type="image/webp" />
            <img
              src="/images/FULL LOGO white.png"
              alt="The Publishers House"
              width={80}
              height={40}
              style={{
                height: "40px",
                width: "auto",
                objectFit: "contain",
              }}
            />
          </picture>
        </Link>

        {/* Right side: nav links + Give button */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
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
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(link.href + "/");

              if (link.hasDropdown) {
                return (
                  <li
                    key={link.href}
                    style={{ position: "relative" }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        cursor: "pointer",
                      }}
                    >
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
                          paddingBottom: "2px",
                          borderBottom: active ? "1px solid #6496EF" : "1px solid transparent",
                          transition: "color 150ms ease",
                        }}
                      >
                        {link.label}
                      </Link>
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          setResourcesOpen(!resourcesOpen);
                        }}
                        style={{
                          color: active ? "#6496EF" : "#FFFFFF",
                          fontSize: "10px",
                          lineHeight: 1,
                          transform: resourcesOpen ? "rotate(180deg)" : "none",
                          transition: "transform 150ms ease",
                        }}
                      >
                        ▾
                      </span>
                    </div>

                    {/* Resources Dropdown Menu (Gospel In Life Reference Style) */}
                    {resourcesOpen && (
                      <div
                        ref={dropdownRef}
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: "0",
                          paddingTop: "14px",
                          zIndex: 350,
                          minWidth: "260px",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: "4px",
                            border: "1px solid #D3DAEC",
                            boxShadow: "0 12px 32px rgba(21, 26, 84, 0.22)",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* All Resources Item */}
                          <Link
                            href="/resources"
                            style={{
                              padding: "14px 20px",
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: 700,
                              fontSize: "12px",
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              color: "#151A54",
                              textDecoration: "none",
                              borderBottom: "1px solid #E8ECF7",
                              backgroundColor: "#F4F6FB",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#E8ECF7")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#F4F6FB")}
                          >
                            <span>All Resources</span>
                            <span style={{ fontSize: "14px", color: "#0140C1" }}>→</span>
                          </Link>

                          {/* Sermons and Talks Subpage */}
                          <Link
                            href="/sermons"
                            style={{
                              padding: "13px 20px",
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: 700,
                              fontSize: "12px",
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              color: "#0140C1",
                              textDecoration: "none",
                              borderBottom: "1px solid #D3DAEC",
                              backgroundColor: "#FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#F4F6FB")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span>▶</span>
                              <span>Sermons & Audio Teachings</span>
                            </span>
                            <span style={{ fontSize: "14px", color: "#0140C1" }}>→</span>
                          </Link>

                          {/* Subpages / Categorized Sermons */}
                          {RESOURCE_SUBPAGES.map((sub) => {
                            const isCurrent = pathname === `/resources/${sub.slug}`;
                            return (
                              <Link
                                key={sub.slug}
                                href={`/resources/${sub.slug}`}
                                style={{
                                  padding: "12px 20px",
                                  fontFamily: "'Playfair Display', serif",
                                  fontSize: "14px",
                                  color: isCurrent ? "#0140C1" : "#151A54",
                                  fontWeight: isCurrent ? 700 : 500,
                                  textDecoration: "none",
                                  borderBottom: "1px solid #F4F6FB",
                                  transition: "all 120ms ease",
                                  display: "block",
                                  backgroundColor: isCurrent ? "#F4F6FB" : "#FFFFFF",
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = "#F4F6FB";
                                  e.currentTarget.style.color = "#0140C1";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = isCurrent ? "#F4F6FB" : "#FFFFFF";
                                  e.currentTarget.style.color = isCurrent ? "#0140C1" : "#151A54";
                                }}
                              >
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </li>
                );
              }

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
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {link.isHome ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <span>Home</span>
                      </span>
                    ) : (
                      link.label
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Action Buttons: Portal & Give */}
          <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              href="/portal"
              className="nav-portal-btn"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "12px",
                lineHeight: "1em",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#151A54",
                background: "#FFFFFF",
                border: "1px solid #FFFFFF",
                borderRadius: "2px",
                padding: "0 26px",
                height: "48px",
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
                transition: "all 150ms ease",
              }}
            >
              Portal
            </Link>

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
                background: "#FFFFFF",
                border: "1px solid #FFFFFF",
                borderRadius: "2px",
                padding: "0 26px",
                height: "48px",
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
                transition: "all 150ms ease",
              }}
            >
              Give
            </Link>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="nav-hamburger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            display: "none",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <span style={{ display: "block", width: "24px", height: "2px", background: "#FFFFFF", borderRadius: "2px" }} />
          <span style={{ display: "block", width: "24px", height: "2px", background: "#FFFFFF", borderRadius: "2px" }} />
          <span style={{ display: "block", width: "24px", height: "2px", background: "#FFFFFF", borderRadius: "2px" }} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div
          style={{
            background: "#151A54",
            borderTop: "1px solid #6496EF",
            padding: "24px 20px",
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(link.href + "/");

              if (link.hasDropdown) {
                return (
                  <li key={link.href}>
                    <div
                      onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                        fontSize: "11px",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: active ? "#6496EF" : "#FFFFFF",
                        borderBottom: "1px solid rgba(100,150,239,0.2)",
                        cursor: "pointer",
                      }}
                    >
                      <span>{link.label}</span>
                      <span>{mobileResourcesOpen ? "▴" : "▾"}</span>
                    </div>

                    {mobileResourcesOpen && (
                      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "8px 0" }}>
                        <Link
                          href="/resources"
                          style={{
                            display: "block",
                            padding: "8px 24px",
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#6496EF",
                            textDecoration: "none",
                            textTransform: "uppercase",
                          }}
                        >
                          • All Resources Hub
                        </Link>
                        <Link
                          href="/sermons"
                          style={{
                            display: "block",
                            padding: "8px 24px",
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#FFFFFF",
                            textDecoration: "none",
                            textTransform: "uppercase",
                          }}
                        >
                          • Sermons & Audio Teachings
                        </Link>
                        {RESOURCE_SUBPAGES.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/resources/${sub.slug}`}
                            style={{
                              display: "block",
                              padding: "8px 24px",
                              fontFamily: "'Playfair Display', serif",
                              fontSize: "13px",
                              color: "#FFFFFF",
                              textDecoration: "none",
                            }}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                );
              }

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 16px",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      fontSize: "11px",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: active ? "#6496EF" : "#FFFFFF",
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(100,150,239,0.2)",
                    }}
                  >
                    {link.isHome && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    )}
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
            <li style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link
                href="/portal"
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
                  background: "#FFFFFF",
                  border: "1px solid #FFFFFF",
                  borderRadius: "2px",
                  textDecoration: "none",
                }}
              >
                Login to Portal
              </Link>
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
                  color: "#FFFFFF",
                  background: "#0140C1",
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
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 100px;
          max-width: 1440px;
          margin: 0 auto;
        }
        
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-actions { display: none !important; }
          .nav-give-btn { display: none !important; }
          .nav-portal-btn { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-container { padding: 16px 20px !important; }
        }
      `}</style>
    </nav>
  );
}
