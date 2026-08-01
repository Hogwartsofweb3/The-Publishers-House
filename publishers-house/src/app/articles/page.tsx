import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Articles",
  description: "Read faith-building articles, devotionals, and insights from The Publishers House.",
};

export default function ArticlesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{ background: "var(--color-surface-2)", paddingBlock: "var(--space-24) var(--space-16)", textAlign: "center" }}>
          <div className="container">
            <p className="overline">Read & Reflect</p>
            <h1>Articles</h1>
            <p style={{ marginInline: "auto", fontSize: "var(--text-lg)" }}>
              Faith, devotionals, family, and kingdom perspective — written for everyday life.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {/* Category Filter */}
            <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginBottom: "var(--space-10)" }}>
              {["All", "Faith", "Devotionals", "Family", "Leadership", "Announcements"].map((cat) => (
                <button
                  key={cat}
                  className={cat === "All" ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                  style={{ borderRadius: "var(--radius-full)" }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Article Grid */}
            <div className="grid-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ height: "220px", borderRadius: 0 }} />
                  <div className="card__body">
                    <span className="card__tag">Faith</span>
                    <h3 className="card__title" style={{ fontSize: "var(--text-xl)" }}>
                      Article Title Placeholder
                    </h3>
                    <p className="card__meta">Author Name · Date Here</p>
                    <p className="card__excerpt">
                      A short excerpt of the article will appear here, giving readers a taste of
                      what the full piece contains...
                    </p>
                    <a href="#" className="btn btn-outline btn-sm" style={{ marginTop: "var(--space-4)" }}>
                      Read More →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "var(--space-12)" }}>
              <button className="btn btn-outline btn-lg">Load More Articles</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
