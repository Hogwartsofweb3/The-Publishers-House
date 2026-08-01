import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Giving",
  description:
    "Partner with The Publishers House through your tithes, offerings, and special project donations. Give securely online.",
};

export default function GivingPage() {
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
            paddingInline: "var(--space-6)",
            textAlign: "center",
          }}
        >
          <div className="container">
            <p className="overline" style={{ color: "var(--color-accent)" }}>
              Partner With Us
            </p>
            <h1 style={{ color: "var(--color-white)", marginBottom: "var(--space-4)" }}>
              Your Generosity Builds the Kingdom
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                maxWidth: "55ch",
                marginInline: "auto",
                fontSize: "var(--text-lg)",
              }}
            >
              Every gift you sow is an act of worship and an investment in eternity.
              Give with joy, knowing God honours a cheerful giver.
            </p>
          </div>
        </section>

        {/* Giving Categories */}
        <section className="section section--warm">
          <div className="container">
            <div className="section-header">
              <p className="overline">Choose a Category</p>
              <h2>How Would You Like to Give?</h2>
            </div>
            <div className="grid-4" style={{ gap: "var(--space-6)" }}>
              {givingCategories.map((cat) => (
                <div
                  key={cat.label}
                  style={{
                    background: "var(--color-surface-1)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-8) var(--space-6)",
                    textAlign: "center",
                    boxShadow: "var(--shadow-card)",
                    border: "2px solid transparent",
                    transition: "all var(--transition-normal)",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "var(--space-4)" }}>
                    {cat.icon}
                  </span>
                  <h4 style={{ marginBottom: "var(--space-2)", fontSize: "var(--text-xl)" }}>
                    {cat.label}
                  </h4>
                  <p style={{ fontSize: "var(--text-sm)", maxWidth: "none" }}>{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Give Now Form */}
        <section className="section">
          <div className="container" style={{ maxWidth: "680px" }}>
            <div className="section-header">
              <p className="overline">Secure Giving</p>
              <h2>Give Now</h2>
            </div>

            {/* Amount presets */}
            <div style={{ marginBottom: "var(--space-8)" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-4)", fontSize: "var(--text-sm)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase" }}>
                Select Amount (₦)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)" }}>
                {[5000, 10000, 25000, 50000].map((amount) => (
                  <button
                    key={amount}
                    className="btn btn-outline"
                    style={{ borderRadius: "var(--radius-md)", textTransform: "none", letterSpacing: 0, fontSize: "var(--text-base)" }}
                  >
                    ₦{amount.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Custom amount"
                style={{
                  marginTop: "var(--space-3)",
                  width: "100%",
                  padding: "var(--space-4)",
                  border: "2px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-base)",
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                }}
              />
            </div>

            {/* One-time / Recurring toggle */}
            <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-8)" }}>
              <button className="btn btn-primary" style={{ flex: 1 }}>One-Time</button>
              <button className="btn btn-outline" style={{ flex: 1 }}>Recurring</button>
            </div>

            {/* Name + Email */}
            <div style={{ display: "grid", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
              <input
                type="text"
                placeholder="Full Name"
                style={{
                  padding: "var(--space-4)",
                  border: "2px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-base)",
                  fontFamily: "var(--font-sans)",
                }}
              />
              <input
                type="email"
                placeholder="Email Address"
                style={{
                  padding: "var(--space-4)",
                  border: "2px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-base)",
                  fontFamily: "var(--font-sans)",
                }}
              />
            </div>

            {/* CTA */}
            <button className="btn btn-primary btn-lg" style={{ width: "100%", borderRadius: "var(--radius-md)", justifyContent: "center" }}>
              Give Securely via Paystack →
            </button>
            <p style={{ textAlign: "center", marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)", maxWidth: "none" }}>
              🔒 Payments are processed securely by Paystack. We never store your card details.
            </p>
          </div>
        </section>

        {/* Bank Transfer */}
        <section className="section section--warm">
          <div className="container" style={{ maxWidth: "600px", textAlign: "center" }}>
            <p className="overline">Alternative</p>
            <h3 style={{ marginBottom: "var(--space-6)" }}>Bank Transfer</h3>
            {/* TODO: Replace with actual account details from Patricia/AVO */}
            <div style={{ background: "var(--color-surface-1)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", boxShadow: "var(--shadow-card)" }}>
              <p style={{ maxWidth: "none", marginBottom: "var(--space-2)" }}><strong>Account Name:</strong> The Publishers House</p>
              <p style={{ maxWidth: "none", marginBottom: "var(--space-2)" }}><strong>Bank:</strong> [Bank Name — from AVO]</p>
              <p style={{ maxWidth: "none" }}><strong>Account No:</strong> [Account Number — from AVO]</p>
            </div>
          </div>
        </section>

        {/* Why Give */}
        <section className="section">
          <div className="container" style={{ maxWidth: "720px", textAlign: "center" }}>
            <p className="overline">The Theology of Giving</p>
            <h3 style={{ marginBottom: "var(--space-6)" }}>Why We Give</h3>
            <p style={{ marginInline: "auto", maxWidth: "none", fontSize: "var(--text-lg)" }}>
              Giving is not a religious duty — it is a privilege and an act of worship. When we give,
              we participate in God's purposes for our generation. We declare that our trust is in God,
              not in material wealth, and we become partners in building a community that changes lives.
            </p>
            <p style={{ marginInline: "auto", maxWidth: "none", marginTop: "var(--space-4)", fontSize: "var(--text-lg)" }}>
              <em>"Give, and it will be given to you. A good measure, pressed down, shaken together
              and running over, will be poured into your lap."</em> — Luke 6:38
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const givingCategories = [
  { icon: "🙏", label: "Tithe", desc: "Return the first tenth of your income as an act of trust and honour to God." },
  { icon: "🎁", label: "Offering", desc: "Give above and beyond your tithe to support the work of the ministry." },
  { icon: "💡", label: "Special Projects", desc: "Sow into specific church building projects, missions, and outreaches." },
  { icon: "🎉", label: "Thanksgiving", desc: "Celebrate God's goodness with a gift of gratitude and praise." },
];
