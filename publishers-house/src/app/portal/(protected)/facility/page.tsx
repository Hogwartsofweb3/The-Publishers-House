"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, query, orderBy } from "firebase/firestore";

interface FacilitySpace {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: "available" | "in_use" | "maintenance";
  nextEvent?: string;
  amenities: string[];
}

interface TechnicalAsset {
  id: string;
  name: string;
  category: "Audio" | "Visual & Lighting" | "Power & Utility" | "Instruments";
  model: string;
  location: string;
  condition: "operational" | "service_due" | "under_repair";
  assignedUnit: string;
}

const SEED_SPACES: FacilitySpace[] = [
  {
    id: "spc-1",
    name: "Main Sanctuary (Jos)",
    location: "Main Campus, Jos",
    capacity: 650,
    status: "available",
    nextEvent: "Sunday Celebration Service (Sun 8:00 AM)",
    amenities: ["Line Array Sound", "LED Wall Display", "Central AC", "Broadcast Cameras"],
  },
  {
    id: "spc-2",
    name: "Abuja Sanctuary Hall",
    location: "Abuja Campus, FCT",
    capacity: 250,
    status: "available",
    nextEvent: "Midweek Word Feast (Thu 6:00 PM)",
    amenities: ["PA System", "Dual Projection", "Conference Seating", "High-Speed Uplink"],
  },
  {
    id: "spc-3",
    name: "Youth & Overflow Chapel",
    location: "Ground Floor East, Jos",
    capacity: 180,
    status: "in_use",
    nextEvent: "Choir Vocal Rehearsal (Today 5:00 PM)",
    amenities: ["Audio Monitors", "Acoustic Treatment", "Drum Booth", "Keyboards"],
  },
  {
    id: "spc-4",
    name: "Media & Livestream Studio",
    location: "Level 1 Production Wing",
    capacity: 20,
    status: "available",
    nextEvent: "Podcast & Sermon Audio Post-Production",
    amenities: ["Atem Mini Extreme", "Shure SM7B Mics", "Soundproofing", "4K PTZ Cams"],
  },
];

const SEED_ASSETS: TechnicalAsset[] = [
  {
    id: "ast-1",
    name: "Behringer X32 Digital Console",
    category: "Audio",
    model: "X32 40-Input 25-Bus",
    location: "Jos FOH Mixing Booth",
    condition: "operational",
    assignedUnit: "Media & Technical",
  },
  {
    id: "ast-2",
    name: "P3.91 Indoor LED Video Wall",
    category: "Visual & Lighting",
    model: "Unilumin 6m x 3m",
    location: "Main Sanctuary Stage",
    condition: "operational",
    assignedUnit: "Media & Technical",
  },
  {
    id: "ast-3",
    name: "Nord Stage 3 88-Key",
    category: "Instruments",
    model: "Nord Stage 3 HP76",
    location: "Sanctuary Stage",
    condition: "operational",
    assignedUnit: "Worship Team",
  },
  {
    id: "ast-4",
    name: "Perkins 100kVA Diesel Generator",
    category: "Power & Utility",
    model: "Perkins 1104A-44TG2",
    location: "Power Station Compound",
    condition: "service_due",
    assignedUnit: "Sanctuary & Logistics",
  },
  {
    id: "ast-5",
    name: "Sennheiser EW-D Wireless Vocal Mics (Set of 4)",
    category: "Audio",
    model: "EW-D SKM-S Base",
    location: "Audio Mic Locker",
    condition: "operational",
    assignedUnit: "Worship Team",
  },
];

export default function FacilityPage() {
  const [spaces, setSpaces] = useState<FacilitySpace[]>([]);
  const [assets, setAssets] = useState<TechnicalAsset[]>([]);
  const [activeTab, setActiveTab] = useState<"spaces" | "assets">("spaces");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    purpose: "",
    spaceOrAsset: "Main Sanctuary (Jos)",
    unit: "Worship Team",
    date: new Date().toISOString().split("T")[0],
    time: "4:00 PM - 7:00 PM",
    notes: "",
  });

  const fetchData = async () => {
    try {
      const spSnap = await getDocs(collection(db, "facilities_spaces"));
      if (!spSnap.empty) {
        setSpaces(spSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FacilitySpace)));
      } else {
        setSpaces(SEED_SPACES);
      }

      const astSnap = await getDocs(collection(db, "facilities_assets"));
      if (!astSnap.empty) {
        setAssets(astSnap.docs.map((d) => ({ id: d.id, ...d.data() } as TechnicalAsset)));
      } else {
        setAssets(SEED_ASSETS);
      }
    } catch {
      setSpaces(SEED_SPACES);
      setAssets(SEED_ASSETS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.purpose) return;

    setMsg("Facility booking request submitted to Administration ✓");
    setShowModal(false);
    setForm({
      purpose: "",
      spaceOrAsset: "Main Sanctuary (Jos)",
      unit: "Worship Team",
      date: new Date().toISOString().split("T")[0],
      time: "4:00 PM - 7:00 PM",
      notes: "",
    });
    setTimeout(() => setMsg(""), 3500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 800,
              fontSize: "28px",
              lineHeight: "34px",
              color: "#141C6E",
              margin: 0,
            }}
          >
            Facility & Asset Management
          </h1>
          <p
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 500,
              fontSize: "13px",
              color: "#4A5490",
              margin: "6px 0 0",
            }}
          >
            Sanctuary spaces, audio-visual technical inventory, and booking allocations
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && (
            <span
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                color: "#0F6B38",
                backgroundColor: "#E4F5EA",
                padding: "6px 14px",
                borderRadius: "6px",
              }}
            >
              {msg}
            </span>
          )}

          <button
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: "#1F46C8",
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              fontSize: "13px",
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
            }}
          >
            + Request Facility Booking
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D5DCF2", borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Managed Spaces</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#141C6E", marginTop: "4px" }}>{spaces.length} Spaces</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#4A5490" }}>Jos & Abuja campuses</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D5DCF2", borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Technical Gear & Assets</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#1F46C8", marginTop: "4px" }}>{assets.length} Units</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#1F46C8" }}>Audio, visual, and instruments</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D5DCF2", borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Facility Health</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#0F6B38", marginTop: "4px" }}>94% Good</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#0F6B38" }}>1 asset scheduled for service</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #D5DCF2", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("spaces")}
          style={{
            padding: "8px 18px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: activeTab === "spaces" ? "#1F46C8" : "transparent",
            color: activeTab === "spaces" ? "#FFFFFF" : "#4A5490",
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          Campus Spaces & Auditoriums
        </button>

        <button
          onClick={() => setActiveTab("assets")}
          style={{
            padding: "8px 18px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: activeTab === "assets" ? "#1F46C8" : "transparent",
            color: activeTab === "assets" ? "#FFFFFF" : "#4A5490",
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          Technical & AV Inventory ({assets.length})
        </button>
      </div>

      {/* Tab: Spaces */}
      {activeTab === "spaces" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
          {spaces.map((sp) => (
            <div
              key={sp.id}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D5DCF2",
                borderRadius: "14px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
                boxShadow: "0 1px 3px rgba(14, 21, 86, 0.05)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "17px", fontWeight: 700, color: "#141C6E", margin: 0 }}>
                      {sp.name}
                    </h3>
                    <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11.5px", color: "#4A5490", marginTop: "2px" }}>
                      📍 {sp.location} · Capacity {sp.capacity} seats
                    </div>
                  </div>

                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "99px",
                      fontSize: "11px",
                      fontWeight: 600,
                      backgroundColor: sp.status === "available" ? "#E4F5EA" : sp.status === "in_use" ? "#FFF2D6" : "#FDE7E7",
                      color: sp.status === "available" ? "#0F6B38" : sp.status === "in_use" ? "#7A5200" : "#9B1C1C",
                    }}
                  >
                    {sp.status === "available" ? "Available" : sp.status === "in_use" ? "In Use" : "Maintenance"}
                  </span>
                </div>

                {/* Next Booking */}
                {sp.nextEvent && (
                  <div
                    style={{
                      backgroundColor: "#F8FAFD",
                      border: "1px solid #E8EDFB",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      marginTop: "12px",
                    }}
                  >
                    <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "10.5px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase" }}>Next Scheduled Use</div>
                    <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12.5px", fontWeight: 600, color: "#141C6E", marginTop: "2px" }}>{sp.nextEvent}</div>
                  </div>
                )}

                {/* Amenities */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "14px" }}>
                  {sp.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        backgroundColor: "#E8EDFB",
                        color: "#1F46C8",
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "10.5px",
                        fontWeight: 600,
                      }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid #E8EDFB", paddingTop: "14px" }}>
                <button
                  onClick={() => {
                    setForm((prev) => ({ ...prev, spaceOrAsset: sp.name }));
                    setShowModal(true);
                  }}
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D5DCF2",
                    borderRadius: "8px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#141C6E",
                    cursor: "pointer",
                  }}
                >
                  Reserve This Space →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Assets */}
      {activeTab === "assets" && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFD", borderBottom: "1px solid #E8EDFB" }}>
                  <th style={{ padding: "14px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Equipment Name</th>
                  <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Category</th>
                  <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Location</th>
                  <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Managing Unit</th>
                  <th style={{ padding: "14px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Condition</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((ast) => (
                  <tr
                    key={ast.id}
                    style={{
                      borderBottom: "1px solid #E8EDFB",
                      transition: "background-color 0.15s",
                    }}
                  >
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "14px", fontWeight: 700, color: "#141C6E" }}>
                        {ast.name}
                      </div>
                      <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#4A5490" }}>
                        Model: {ast.model}
                      </div>
                    </td>

                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          backgroundColor: "#E8EDFB",
                          color: "#1F46C8",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {ast.category}
                      </span>
                    </td>

                    <td style={{ padding: "16px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#4A5490" }}>
                      {ast.location}
                    </td>

                    <td style={{ padding: "16px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", fontWeight: 600, color: "#141C6E" }}>
                      {ast.assignedUnit}
                    </td>

                    <td style={{ padding: "16px 24px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "99px",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: ast.condition === "operational" ? "#E4F5EA" : "#FFF2D6",
                          color: ast.condition === "operational" ? "#0F6B38" : "#7A5200",
                        }}
                      >
                        {ast.condition === "operational" ? "Operational" : "Service Due"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.15)",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "20px", color: "#141C6E", margin: "0 0 6px" }}>
              Request Facility Space or Asset
            </h2>
            <p style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#4A5490", margin: "0 0 24px" }}>
              Submit church hall reservation or technical gear booking
            </p>

            <form onSubmit={handleBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Space or Asset *</label>
                <input
                  type="text"
                  required
                  value={form.spaceOrAsset}
                  onChange={(e) => setForm({ ...form, spaceOrAsset: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Event Purpose *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Choir Rehearsal, Youth Seminar, Wedding Thanksgiving"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Time Window</label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Requesting Unit / Minister</label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#1F46C8",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "10px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Submit Reservation
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D5DCF2",
                    color: "#4A5490",
                    borderRadius: "10px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
