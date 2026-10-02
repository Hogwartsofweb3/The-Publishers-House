import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TPH Abuja | The Publishers House",
  description: "The Publishers House Abuja — Coming Soon.",
};

export default function AbujaPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#2A2A2A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "32px",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      {/* White logo */}
      <img
        src="/images/FULL LOGO white.png"
        alt="The Publishers House Abuja"
        style={{ height: "72px", width: "auto", objectFit: "contain", opacity: 0.9 }}
      />

      {/* Eyebrow */}
      <p
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          fontSize: "10px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#6496EF",
          margin: 0,
        }}
      >
        TPH Abuja
      </p>

      {/* Heading */}
      <h1
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(36px, 6vw, 72px)",
          lineHeight: "1em",
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color: "#FFFFFF",
          margin: 0,
        }}
      >
        Coming Soon
      </h1>

      {/* Subtext */}
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 400,
          fontSize: "18px",
          lineHeight: "1.6em",
          color: "rgba(255,255,255,0.55)",
          maxWidth: "480px",
          margin: 0,
        }}
      >
        The Publishers House is planting roots in Abuja.
        We&apos;ll have more to share soon.
      </p>

      {/* Back link */}
      <Link
        href="/"
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          fontSize: "11px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#FFFFFF",
          textDecoration: "none",
          borderBottom: "1px solid rgba(255,255,255,0.35)",
          paddingBottom: "2px",
          marginTop: "8px",
        }}
      >
        ← Back to TPH Jos
      </Link>
    </main>
  );
}
