import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Our Programs | The Publishers House",
  description:
    "Explore the programs of The Publishers House — Festival of Light, Merismos, The Forge, and Abuja Apostolic Camp.",
};

export default function ProgramsPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section
          style={{
            background: "var(--color-primary)",
            color: "var(--color-white)",
            paddingBlock: "var(--space-24) var(--space-20)",
            textAlign: "center",
            paddingInline: "var(--space-6)",
          }}
        >
          <div className="container">
            <p className="overline" style={{ color: "var(--color-accent)" }}>Get Involved</p>
            <h1 style={{ color: "var(--color-white)", marginBottom: "var(--space-4)" }}>
              Our Programs
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", maxWidth: "55ch", marginInline: "auto", fontSize: "var(--text-lg)" }}>
              Where community meets purpose. Discover the programs that make The Publishers
              House a place of transformation, growth, and belonging.
            </p>
          </div>
        </section>

        {/* Annual Conferences */}
        <section className="section">
          <div className="container">
            <div style={{ marginBottom: "var(--space-10)" }}>
              <p className="overline" style={{ marginBottom: "var(--space-2)" }}>Flagship Events</p>
              <h2>Annual Conferences</h2>
              <div className="divider" />
            </div>
            <div className="grid-2">
              {annualPrograms.map((program) => (
                <div key={program.slug} className="card" style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      height: "260px",
                      background: `linear-gradient(135deg, var(--color-primary) 0%, ${program.color} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {/* TODO: Replace with real hero image from AVO */}
                    <span style={{ fontSize: "4rem" }}>{program.icon}</span>
                    <span
                      style={{
                        position: "absolute",
                        top: "var(--space-4)",
                        right: "var(--space-4)",
                        background: "var(--color-accent)",
                        color: "var(--color-primary)",
                        fontSize: "var(--text-xs)",
                        fontWeight: 700,
                        letterSpacing: "var(--tracking-wide)",
                        textTransform: "uppercase",
                        padding: "4px 10px",
                        borderRadius: "var(--radius-full)",
                      }}
                    >
                      {program.frequency}
                    </span>
                  </div>
                  <div className="card__body">
                    <h3 className="card__title">{program.name}</h3>
                    <p className="card__excerpt">{program.description}</p>
                    <a
                      href={`/programs/${program.slug}`}
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: "var(--space-4)", display: "inline-flex" }}
                    >
                      Learn More &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Monthly Programs */}
        <section className="section" style={{ background: "var(--color-surface-2)" }}>
          <div className="container">
            <div style={{ marginBottom: "var(--space-10)" }}>
              <p className="overline" style={{ marginBottom: "var(--space-2)" }}>Monthly</p>
              <h2>Prayer &amp; Spiritual Intensity</h2>
              <div className="divider" />
            </div>
            <div className="grid-2">
              {monthlyPrograms.map((program) => (
                <div key={program.slug} className="card" style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      height: "220px",
                      background: `linear-gradient(135deg, var(--color-primary) 0%, ${program.color} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {/* TODO: Replace with real hero image from AVO */}
                    <span style={{ fontSize: "4rem" }}>{program.icon}</span>
                    <span
                      style={{
                        position: "absolute",
                        top: "var(--space-4)",
                        right: "var(--space-4)",
                        background: "rgba(255,255,255,0.15)",
                        color: "var(--color-white)",
                        fontSize: "var(--text-xs)",
                        fontWeight: 700,
                        letterSpacing: "var(--tracking-wide)",
                        textTransform: "uppercase",
                        padding: "4px 10px",
                        borderRadius: "var(--radius-full)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {program.frequency}
                    </span>
                  </div>
                  <div className="card__body">
                    <h3 className="card__title">{program.name}</h3>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-accent)", fontWeight: 600, letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", marginBottom: "var(--space-2)", maxWidth: "none" }}>
                      {program.schedule}
                    </p>
                    <p className="card__excerpt">{program.description}</p>
                    <a
                      href={`/programs/${program.slug}`}
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: "var(--space-4)", display: "inline-flex" }}
                    >
                      Learn More &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section" style={{ background: "var(--color-primary)", textAlign: "center" }}>
          <div className="container">
            <h2 style={{ color: "var(--color-white)" }}>Don&apos;t Know Where to Start?</h2>
            <p style={{ marginInline: "auto", marginBottom: "var(--space-8)", color: "rgba(255,255,255,0.75)" }}>
              Reach out and we will help connect you to the right program for your season.
            </p>
            <a href="/contact" className="btn btn-primary btn-lg">Get Connected</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// ── Real program data — confirmed by Patricia/AVO (Aug 2026) ─────────────────

const annualPrograms = [
  {
    name: "Festival of Light",
    slug: "festival-of-light",
    icon: "🕯️",
    frequency: "Annual Conference",
    description:
      "The flagship annual convention of The Publishers House. Festival of Light gathers believers for extended sessions of apostolic teaching, prophetic revelation, worship, and spiritual impartations.",
    color: "#C9A84C",
  },
  {
    name: "Merismos",
    slug: "merismos",
    icon: "✦",
    frequency: "Annual Conference",
    description:
      "Named after the biblical concept of spiritual distribution and discernment, this power-packed conference brings together believers from around the world for intensive apostolic teaching, deep worship, and divine impartations.",
    color: "#4E2D7A",
  },
];

const monthlyPrograms = [
  {
    name: "The Forge",
    slug: "the-forge",
    icon: "⚒️",
    frequency: "Monthly",
    schedule: "End of month · Wed – Fri (Friday Vigil)",
    description:
      "A high-intensity prayer program designed to fan your prayer altars and impart spiritual Christian teachings. The Forge typically runs from Wednesday to Friday, with Friday being a vigil service.",
    color: "#2D4E7A",
  },
  {
    name: "Abuja Apostolic Camp",
    slug: "abuja-apostolic-camp",
    icon: "🏕️",
    frequency: "Monthly",
    schedule: "First 2 weeks of the month · Abuja",
    description:
      "An intense spiritual camp focused on equipping believers, prophetic words, and deep spiritual alignment. Held monthly in Abuja for the outreach community.",
    color: "#2D7A4E",
  },
];
