import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "404 - Page Not Found | The Publishers House",
  description: "The page you are looking for does not exist or has been moved.",
};

const Navy = "#151A54";
const Blue700 = "#0140C1";
const Blue500 = "#2090FF";
const Blue300 = "#6496EF";
const Paper100 = "#F4F6FB";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const White = "#FFFFFF";

export default function NotFound() {
  return (
    <div style={{ backgroundColor: Paper100, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle decorative background glow */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(32, 144, 255, 0.08) 0%, rgba(21, 26, 84, 0) 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "680px",
            width: "100%",
            textAlign: "center",
            backgroundColor: White,
            borderRadius: "16px",
            padding: "clamp(32px, 6vw, 64px) clamp(24px, 5vw, 48px)",
            boxShadow: "0 10px 40px rgba(21, 26, 84, 0.08)",
            border: "1px solid #D3DAEC",
          }}
        >
          {/* Eyebrow badge */}
          <div
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: "20px",
              backgroundColor: "rgba(32, 144, 255, 0.1)",
              color: Blue700,
              fontFamily: "var(--font-poppins, sans-serif)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            Psalm 119:105
          </div>

          {/* 404 Large Display */}
          <h1
            style={{
              fontFamily: "var(--font-poppins, sans-serif)",
              fontSize: "clamp(72px, 14vw, 130px)",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: Navy,
              margin: "0 0 12px",
            }}
          >
            404
          </h1>

          <h2
            style={{
              fontFamily: "var(--font-poppins, sans-serif)",
              fontSize: "clamp(20px, 3.5vw, 28px)",
              fontWeight: 700,
              color: Navy,
              margin: "0 0 16px",
              letterSpacing: "-0.01em",
            }}
          >
            Page Not Found
          </h2>

          <p
            style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "clamp(15px, 2vw, 18px)",
              color: Slate600,
              lineHeight: 1.6,
              maxWidth: "520px",
              margin: "0 auto 32px",
            }}
          >
            The page you are looking for may have been moved, renamed, or is temporarily unavailable. Let us guide you back on path.
          </p>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
              marginBottom: "36px",
            }}
          >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 24px",
                backgroundColor: Navy,
                color: White,
                borderRadius: "6px",
                fontFamily: "var(--font-poppins, sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "background-color 0.2s ease",
              }}
            >
              Return Home
            </Link>

            <Link
              href="/schedule"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 24px",
                backgroundColor: Blue700,
                color: White,
                borderRadius: "6px",
                fontFamily: "var(--font-poppins, sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "background-color 0.2s ease",
              }}
            >
              View Schedule
            </Link>

            <Link
              href="/sermons"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 24px",
                backgroundColor: "transparent",
                color: Navy,
                borderRadius: "6px",
                border: `1px solid #D3DAEC`,
                fontFamily: "var(--font-poppins, sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              Sermons &amp; Talks
            </Link>
          </div>

          {/* Scripture footer */}
          <div
            style={{
              borderTop: "1px solid #E8ECF7",
              paddingTop: "20px",
              fontFamily: "var(--font-playfair, serif)",
              fontStyle: "italic",
              fontSize: "13.5px",
              color: Slate500,
            }}
          >
            &ldquo;Thy word is a lamp unto my feet, and a light unto my path.&rdquo;
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
