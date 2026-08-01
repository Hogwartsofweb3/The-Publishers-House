import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Access sermons, teachings, and study materials from The Publishers House. Audio, video, and PDF resources available.",
};

export default function ResourcesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section
          style={{
            background: "var(--color-surface-2)",
            paddingBlock: "var(--space-24) var(--space-16)",
            textAlign: "center",
          }}
        >
          <div className="container">
            <p className="overline">Grow in the Word</p>
            <h1>Resources</h1>
            <p style={{ marginInline: "auto", fontSize: "var(--text-lg)" }}>
              Sermons, teachings, and study materials to deepen your walk with God.
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="section">
          <div className="container">
            {/* Tabs */}
            <div style={{ display: "flex", gap: "var(--space-2)", borderBottom: "2px solid var(--color-border)", marginBottom: "var(--space-12)" }}>
              <button
                style={{
                  padding: "var(--space-3) var(--space-6)",
                  background: "none",
                  border: "none",
                  borderBottom: "3px solid var(--color-accent)",
                  marginBottom: "-2px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "var(--text-base)",
                  color: "var(--color-accent)",
                  cursor: "pointer",
                }}
              >
                Sermons
              </button>
              <button
                style={{
                  padding: "var(--space-3) var(--space-6)",
                  background: "none",
                  border: "none",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "var(--text-base)",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                }}
              >
                Teachings
              </button>
            </div>

            {/* Search + Filter Bar */}
            <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", marginBottom: "var(--space-10)" }}>
              <input
                type="search"
                placeholder="Search sermons..."
                style={{
                  flex: 1,
                  minWidth: "240px",
                  padding: "var(--space-3) var(--space-4)",
                  border: "2px solid var(--color-border)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-base)",
                  fontFamily: "var(--font-sans)",
                }}
              />
              <select
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  border: "2px solid var(--color-border)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-sm)",
                  fontFamily: "var(--font-sans)",
                  background: "var(--color-surface-1)",
                }}
              >
                <option>All Speakers</option>
              </select>
              <select
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  border: "2px solid var(--color-border)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-sm)",
                  fontFamily: "var(--font-sans)",
                  background: "var(--color-surface-1)",
                }}
              >
                <option>All Series</option>
              </select>
            </div>

            {/* Sermon Grid — placeholder cards until CMS is live */}
            <div className="grid-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ height: "200px", borderRadius: 0 }} />
                  <div className="card__body">
                    <span className="card__tag">Sermon Series Name</span>
                    <h3 className="card__title" style={{ fontSize: "var(--text-xl)" }}>
                      Sermon Title Placeholder
                    </h3>
                    <p className="card__meta">Speaker Name · Date Here</p>
                    <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
                      <button className="btn btn-primary btn-sm">▶ Watch</button>
                      <button className="btn btn-outline btn-sm">🎧 Listen</button>
                      <button className="btn btn-outline btn-sm">📄 Notes</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div style={{ textAlign: "center", marginTop: "var(--space-12)" }}>
              <button className="btn btn-outline btn-lg">Load More</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
