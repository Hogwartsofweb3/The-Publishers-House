import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Events",
  description: "Stay up to date with upcoming events, conferences, and special services at The Publishers House.",
};

export default function EventsPage() {
  return (
    <>
      <Navbar />
      <main>
        <section style={{ background: "var(--color-surface-2)", paddingBlock: "var(--space-24) var(--space-16)", textAlign: "center" }}>
          <div className="container">
            <p className="overline">Mark Your Calendar</p>
            <h1>Upcoming Events</h1>
            <p style={{ marginInline: "auto", fontSize: "var(--text-lg)" }}>
              Don&apos;t miss what God is doing at The Publishers House.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginBottom: "var(--space-10)" }}>
              {["All", "Conference", "Special Service", "Programs", "Community"].map((cat) => (
                <button
                  key={cat}
                  className={cat === "All" ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                  style={{ borderRadius: "var(--radius-full)" }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Event Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr auto",
                    gap: "var(--space-6)",
                    background: "var(--color-surface-1)",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-card)",
                    alignItems: "center",
                  }}
                >
                  <div className="skeleton" style={{ height: "160px", borderRadius: 0 }} />
                  <div style={{ padding: "var(--space-6)" }}>
                    <span className="badge badge--accent" style={{ marginBottom: "var(--space-3)" }}>Conference</span>
                    <h4>Event Title Placeholder</h4>
                    <p style={{ maxWidth: "none", fontSize: "var(--text-sm)", margin: "var(--space-2) 0" }}>
                      📅 Date · 🕐 Time · 📍 Venue
                    </p>
                    <p style={{ maxWidth: "55ch", fontSize: "var(--text-sm)" }}>
                      Short event description that gives a quick overview of what to expect at this event.
                    </p>
                  </div>
                  <div style={{ padding: "var(--space-6)", textAlign: "center" }}>
                    <a href="#" className="btn btn-primary btn-sm">Register</a>
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
