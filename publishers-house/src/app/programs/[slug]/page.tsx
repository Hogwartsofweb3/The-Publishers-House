import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgramEditionsClient from "./ProgramEditionsClient";

const S = {
  eyebrow: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  displayXL: { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 58px)", lineHeight: "0.98em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  readLede: { fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "20px", lineHeight: "1.55em" },
};

export default function ProgramSlugPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  const names: Record<string, string> = {
    "festival-of-light": "Festival of Light",
    "merismos": "Merismos",
    "jesus-convention": "Jesus Convention",
    "the-forge": "The Forge",
    "abuja-apostolic-camp": "Abuja Apostolic Camp",
    "sunday-midweek": "Sunday and midweek",
  };

  const name = names[slug] || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px", background: "#0B0E14" }}>
        
        {/* HERO */}
        <section
          style={{
            background: "#151A54",
            padding: "80px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "800px" }}>
            <span style={{ ...S.eyebrow, color: "#D3DAEC" }}>
              Historical Archives
            </span>
            <h1 style={{ ...S.displayXL, color: "#FFFFFF" }}>
              {name}
            </h1>
            <p style={{ ...S.readLede, color: "#E8ECF7" }}>
              Explore past editions, speakers, themes, and full sermon archives from this program.
            </p>
          </div>
        </section>

        {/* CLIENT COMPONENT FOR INTERACTIVE EDITIONS */}
        <ProgramEditionsClient programSlug={slug} programName={name} />

      </main>
      <Footer />
    </>
  );
}
