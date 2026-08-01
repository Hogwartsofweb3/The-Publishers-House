import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with The Publishers House. Find our location, service times, and contact details.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <section style={{ background: "var(--color-surface-2)", paddingBlock: "var(--space-24) var(--space-16)", textAlign: "center" }}>
          <div className="container">
            <p className="overline">We&apos;d Love to Hear From You</p>
            <h1>Contact Us</h1>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2" style={{ gap: "var(--space-16)", alignItems: "start" }}>
            {/* Contact Info */}
            <div>
              <h3 style={{ marginBottom: "var(--space-8)" }}>Get in Touch</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                <div>
                  <p className="overline" style={{ marginBottom: "var(--space-2)" }}>Address</p>
                  {/* TODO: Replace with actual address from AVO */}
                  <p style={{ maxWidth: "none" }}>[Church Address — from Patricia/AVO]</p>
                </div>
                <div>
                  <p className="overline" style={{ marginBottom: "var(--space-2)" }}>Service Times</p>
                  {/* TODO: Replace with actual service times from AVO */}
                  <p style={{ maxWidth: "none" }}>Sunday: [Time]<br />Wednesday: [Time]</p>
                </div>
                <div>
                  <p className="overline" style={{ marginBottom: "var(--space-2)" }}>Phone</p>
                  {/* TODO: Replace with actual phone from AVO */}
                  <p style={{ maxWidth: "none" }}>[Phone Number — from AVO]</p>
                </div>
                <div>
                  <p className="overline" style={{ marginBottom: "var(--space-2)" }}>Follow Us</p>
                  <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                    {["Instagram", "Facebook", "YouTube", "Twitter/X"].map((platform) => (
                      <a key={platform} href="#" className="btn btn-outline btn-sm" style={{ borderRadius: "var(--radius-full)" }}>
                        {platform}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 style={{ marginBottom: "var(--space-8)" }}>Send a Message</h3>
              <form style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  style={{ padding: "var(--space-4)", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "var(--text-base)", fontFamily: "var(--font-sans)" }}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  style={{ padding: "var(--space-4)", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "var(--text-base)", fontFamily: "var(--font-sans)" }}
                />
                <input
                  type="text"
                  placeholder="Subject"
                  style={{ padding: "var(--space-4)", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "var(--text-base)", fontFamily: "var(--font-sans)" }}
                />
                <textarea
                  placeholder="Your Message"
                  rows={6}
                  required
                  style={{ padding: "var(--space-4)", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "var(--text-base)", fontFamily: "var(--font-sans)", resize: "vertical" }}
                />
                <button type="submit" className="btn btn-primary btn-lg" style={{ borderRadius: "var(--radius-md)" }}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Map Embed */}
        <section style={{ height: "400px", background: "var(--color-surface-3)" }}>
          {/* TODO: Replace with Google Maps embed once address is confirmed from AVO */}
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>
            <p style={{ maxWidth: "none" }}>Google Maps embed — replace when address is confirmed</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
