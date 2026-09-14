"use client";

import Link from "next/link";

const modules = [
  { name: "Sermons", path: "/cms/sermons", description: "Add, edit, and publish sermons with video/audio links.", icon: "🎙️" },
  { name: "Events", path: "/cms/events", description: "Manage upcoming church events and registrations.", icon: "📅" },
  { name: "Articles", path: "/cms/articles", description: "Publish blog posts and written teachings.", icon: "📝" },
  { name: "Programs", path: "/cms/programs", description: "Manage recurring church programs (FOL, Services, etc.).", icon: "🏛️" },
  { name: "Leadership", path: "/cms/leadership", description: "Update pastoral and leadership profiles.", icon: "👤" },
];

export default function CMSDashboard() {
  return (
    <div style={{ padding: "48px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "32px", color: "#151A54", marginBottom: "32px" }}>Dashboard</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
        {modules.map((mod) => (
          <Link href={mod.path} key={mod.name} style={{ textDecoration: "none" }}>
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px", border: "1px solid #D3DAEC", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>{mod.icon}</div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "20px", color: "#0140C1", marginBottom: "8px" }}>{mod.name}</h2>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", color: "#4A62A0", margin: 0 }}>{mod.description}</p>
            </div>
          </Link>
        ))}
      </div>
      
      <div style={{ marginTop: "48px", padding: "24px", backgroundColor: "#E8ECF7", borderRadius: "8px" }}>
        <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "16px", color: "#151A54", marginBottom: "8px" }}>Welcome to the Content Manager</h3>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", color: "#4A62A0", margin: 0 }}>
          This CMS is actively being built in Phase 4. Soon you will be able to click on these modules to add, edit, and publish content directly to The Publishers House website!
        </p>
      </div>
    </div>
  );
}
