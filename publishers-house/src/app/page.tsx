import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "The Publishers House | Welcome Home",
  description:
    "The Publishers House — a Spirit-filled church family. Join us for worship, community, and the Word.",
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ================================================================
            HERO — Full-bleed cinematic section
            TODO: Replace background with actual church photo/video from AVO
        ================================================================ */}
        <section className="hero">
          <div className="hero__bg">
            {/* Placeholder gradient until AVO delivers hero image */}
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #0F0F2E 0%, #1A1A3E 50%, #0A0A1E 100%)",
              }}
            />
          </div>
          <div className="hero__overlay" />
          <div className="hero__content">
            <p className="overline animate-fadeInUp" style={{ color: "var(--color-accent)", animationDelay: "0.1s" }}>
              Welcome to
            </p>
            <h1
              className="animate-fadeInUp"
              style={{
                color: "var(--color-white)",
                fontSize: "clamp(var(--text-4xl), 6vw, var(--text-7xl))",
                marginBottom: "var(--space-6)",
                animationDelay: "0.2s",
              }}
            >
              The Publishers<br />
              <span style={{ color: "var(--color-accent)" }}>House</span>
            </h1>
            <p
              className="animate-fadeInUp"
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "var(--text-xl)",
                maxWidth: "55ch",
                marginInline: "auto",
                marginBottom: "var(--space-10)",
                animationDelay: "0.3s",
              }}
            >
              {/* TODO: Replace with official church tagline from AVO */}
              A vibrant church family — rooted in the Word, alive in the Spirit, and sent into the world.
            </p>
            <div className="hero__actions animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
              <Link href="/about" className="btn btn-primary btn-lg">
                Plan Your Visit
              </Link>
              <Link href="/resources" className="btn btn-ghost btn-lg">
                Watch Sermons
              </Link>
            </div>

            {/* Service Info Strip */}
            <div
              style={{
                display: "flex",
                gap: "var(--space-8)",
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: "var(--space-16)",
                paddingTop: "var(--space-8)",
                borderTop: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {/* TODO: Replace with actual service times and location from AVO */}
              {[
                { label: "Sunday Service", value: "[Time] — [Service Type]" },
                { label: "Midweek Service", value: "[Day] · [Time]" },
                { label: "Location", value: "[City, State]" },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: "center" }}>
                  <p style={{ color: "var(--color-accent)", fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", maxWidth: "none", marginBottom: "var(--space-1)" }}>
                    {item.label}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "var(--text-sm)", maxWidth: "none" }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            LATEST SERMON CARD
        ================================================================ */}
        <section className="section section--warm">
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-10)", flexWrap: "wrap", gap: "var(--space-4)" }}>
              <div>
                <p className="overline">Latest Message</p>
                <h2>Watch This Week&apos;s Sermon</h2>
              </div>
              <Link href="/resources" className="btn btn-outline">
                All Sermons →
              </Link>
            </div>

            {/* TODO: Replace with dynamic latest sermon from Strapi */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-12)",
                alignItems: "center",
                background: "var(--color-surface-1)",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div className="skeleton" style={{ height: "360px", borderRadius: 0, minHeight: "300px" }} />
              <div style={{ padding: "var(--space-10)", paddingLeft: 0 }}>
                <span className="badge badge--accent" style={{ marginBottom: "var(--space-4)" }}>
                  Latest Sermon
                </span>
                <h3 style={{ marginBottom: "var(--space-4)" }}>Sermon Title Will Appear Here</h3>
                <p style={{ maxWidth: "none", marginBottom: "var(--space-2)", color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                  Speaker Name · Date
                </p>
                <p style={{ maxWidth: "50ch", marginBottom: "var(--space-8)" }}>
                  A short description of the sermon message will appear here once connected to the Strapi CMS.
                </p>
                <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                  <button className="btn btn-primary">▶ Watch Now</button>
                  <button className="btn btn-outline">🎧 Listen</button>
                  <button className="btn btn-outline">📄 Study Notes</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            UPCOMING EVENTS STRIP
        ================================================================ */}
        <section className="section">
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-10)", flexWrap: "wrap", gap: "var(--space-4)" }}>
              <div>
                <p className="overline">Coming Up</p>
                <h2>Upcoming Events</h2>
              </div>
              <Link href="/events" className="btn btn-outline">
                All Events →
              </Link>
            </div>

            {/* TODO: Replace with dynamic events from Strapi */}
            <div className="grid-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ height: "180px", borderRadius: 0 }} />
                  <div className="card__body">
                    <span className="badge badge--accent" style={{ marginBottom: "var(--space-3)" }}>Conference</span>
                    <h4 className="card__title">Event Name Placeholder</h4>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", maxWidth: "none", marginBottom: "var(--space-4)" }}>
                      📅 Date · 📍 Venue
                    </p>
                    <a href="/events" className="btn btn-outline btn-sm">Learn More →</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            ABOUT TEASER
        ================================================================ */}
        <section className="section section--accent">
          <div
            className="container"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-16)",
              alignItems: "center",
            }}
          >
            <div>
              <p className="overline" style={{ color: "var(--color-accent)" }}>Our Story</p>
              <h2 style={{ color: "var(--color-white)", marginBottom: "var(--space-6)" }}>
                More Than a Church —<br />A Family
              </h2>
              <p style={{ color: "rgba(255,255,255,0.75)", maxWidth: "none", fontSize: "var(--text-lg)", marginBottom: "var(--space-8)" }}>
                {/* TODO: Replace with official mission from AVO */}
                We are The Publishers House — a people called to declare the Word of God with clarity,
                power, and love. Discover who we are, what we believe, and how you can be part of this
                community.
              </p>
              <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
                <Link href="/about" className="btn btn-primary btn-lg">
                  Who We Are
                </Link>
                <Link href="/about#what-to-expect" className="btn btn-ghost btn-lg">
                  What to Expect
                </Link>
              </div>
            </div>
            <div
              style={{
                height: "400px",
                borderRadius: "var(--radius-xl)",
                background: "rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {/* TODO: Replace with church interior photo from AVO */}
              <p style={{ color: "rgba(255,255,255,0.3)", maxWidth: "none", fontSize: "var(--text-sm)" }}>
                Church photo — from AVO
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================
            PROGRAMS SPOTLIGHT
        ================================================================ */}
        <section className="section section--warm">
          <div className="container">
            <div className="section-header">
              <p className="overline">Get Involved</p>
              <h2>Our Programs</h2>
              <p>Discover the programs that shape our community and deepen our faith.</p>
            </div>

            {/* TODO: Replace with dynamic programs from Strapi */}
            <div className="grid-4">
              {[
                { name: "Festival of Light", icon: "🕯️", color: "var(--color-accent)" },
                { name: "The Forge",          icon: "⚒️", color: "#4E8BD0" },
                { name: "Merismos",           icon: "✂️", color: "#8B4ED0" },
                { name: "AAC",                icon: "📖", color: "#4ED08B" },
              ].map((prog) => (
                <Link
                  key={prog.name}
                  href="/programs"
                  style={{
                    display: "block",
                    background: "var(--color-surface-1)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-8) var(--space-6)",
                    textAlign: "center",
                    boxShadow: "var(--shadow-card)",
                    textDecoration: "none",
                    transition: "transform var(--transition-normal), box-shadow var(--transition-normal)",
                    borderTop: `4px solid ${prog.color}`,
                  }}
                >
                  <span style={{ fontSize: "2rem", display: "block", marginBottom: "var(--space-4)" }}>
                    {prog.icon}
                  </span>
                  <h5 style={{ color: "var(--color-text-primary)", fontSize: "var(--text-base)", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                    {prog.name}
                  </h5>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "var(--space-10)" }}>
              <Link href="/programs" className="btn btn-primary btn-lg">
                View All Programs →
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================
            GIVE CTA BANNER
        ================================================================ */}
        <section
          style={{
            background: "var(--color-primary)",
            paddingBlock: "var(--space-20)",
            textAlign: "center",
            paddingInline: "var(--space-6)",
          }}
        >
          <div className="container">
            <p className="overline" style={{ color: "var(--color-accent)" }}>Partner With Us</p>
            <h2 style={{ color: "var(--color-white)", marginBottom: "var(--space-4)" }}>
              Your Generosity Makes a Difference
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", marginInline: "auto", fontSize: "var(--text-lg)", marginBottom: "var(--space-8)" }}>
              Sow into the Kingdom and partner with what God is doing at The Publishers House.
            </p>
            <div style={{ display: "flex", gap: "var(--space-4)", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/giving" className="btn btn-primary btn-lg">Give Online</Link>
              <Link href="/giving#bank-transfer" className="btn btn-ghost btn-lg">Bank Transfer</Link>
            </div>
          </div>
        </section>

        {/* ================================================================
            LATEST ARTICLES
        ================================================================ */}
        <section className="section">
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-10)", flexWrap: "wrap", gap: "var(--space-4)" }}>
              <div>
                <p className="overline">Read & Reflect</p>
                <h2>Latest Articles</h2>
              </div>
              <Link href="/articles" className="btn btn-outline">All Articles →</Link>
            </div>

            {/* TODO: Replace with dynamic articles from Strapi */}
            <div className="grid-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ height: "200px", borderRadius: 0 }} />
                  <div className="card__body">
                    <span className="card__tag">Faith</span>
                    <h4 className="card__title">Article Title Placeholder</h4>
                    <p className="card__meta">Author · Date</p>
                    <p className="card__excerpt">
                      Short article excerpt will appear here once articles are published in the CMS...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
