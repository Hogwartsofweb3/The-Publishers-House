import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Our Programs",
  description:
    "Explore the programs of The Publishers House — Festival of Light, The Forge, Merismos, AAC, and more.",
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
              Where community meets purpose. Discover the vibrant programs that make The Publishers
              House a place of transformation, growth, and belonging.
            </p>
          </div>
        </section>

        {/* Programs Grid */}
        <section className="section">
          <div className="container">
            {/* TODO: Replace placeholder data with Strapi programs data once CMS is live */}
            <div className="grid-3">
              {placeholderPrograms.map((program) => (
                <div key={program.slug} className="card">
                  {/* Program image placeholder */}
                  <div
                    style={{
                      height: "240px",
                      background: `linear-gradient(135deg, var(--color-primary) 0%, ${program.color} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: "3rem" }}>{program.icon}</span>
                  </div>
                  <div className="card__body">
                    <span className="card__tag">{program.category}</span>
                    <h3 className="card__title">{program.name}</h3>
                    <p className="card__excerpt">{program.tagline}</p>
                    <a
                      href={`/programs/${program.slug}`}
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: "var(--space-4)", display: "inline-flex" }}
                    >
                      Learn More →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section
          className="section"
          style={{
            background: "var(--color-surface-2)",
            textAlign: "center",
          }}
        >
          <div className="container">
            <h2>Don&apos;t Know Where to Start?</h2>
            <p style={{ marginInline: "auto", marginBottom: "var(--space-8)" }}>
              Reach out and we will help connect you to the right program for your season.
            </p>
            <a href="/contact" className="btn btn-primary btn-lg">
              Get Connected
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// TODO: Replace with actual Strapi data once Samson deploys CMS
// TODO: Replace colors with actual program brand colors from AVO
// TODO: Confirm full official names with Patricia/AVO
const placeholderPrograms = [
  {
    name: "Festival of Light",
    slug: "festival-of-light",
    icon: "🕯️",
    tagline: "An annual celebration of faith, worship, and community — a landmark event in our church calendar.",
    category: "Annual Event",
    color: "#C9A84C",
  },
  {
    name: "The Forge",
    slug: "the-forge",
    icon: "⚒️",
    tagline: "A discipleship and leadership development program forging men and women of God.",
    category: "Discipleship",
    color: "#2D4E7A",
  },
  {
    name: "Merismos",
    slug: "merismos",
    icon: "✂️",
    tagline: "A program dedicated to the dividing and rightly handling of the Word of Truth.",
    category: "Bible Study",
    color: "#4E2D7A",
  },
  {
    name: "AAC",
    slug: "aac",
    icon: "📖",
    tagline: "Description coming soon — confirm full name and details with Patricia/AVO.",
    category: "Program",
    color: "#2D7A4E",
  },
];
