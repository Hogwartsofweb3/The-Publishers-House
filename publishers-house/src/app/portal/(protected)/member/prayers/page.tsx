"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import type { PortalUser } from "@/lib/portalAuth";
import { getPortalUser } from "@/lib/portalAuth";

export default function MemberPrayersAndTestimoniesPage() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [activeTab, setActiveTab] = useState<"prayers" | "testimonies">("prayers");

  // Prayers state
  const [prayers, setPrayers] = useState<any[]>([]);
  const [prayerText, setPrayerText] = useState("");
  const [prayerSubmitting, setPrayerSubmitting] = useState(false);
  const [prayerMsg, setPrayerMsg] = useState("");

  // Testimonies state
  const [testimonies, setTestimonies] = useState<any[]>([]);
  const [testimonyTitle, setTestimonyTitle] = useState("");
  const [testimonyText, setTestimonyText] = useState("");
  const [testimonySubmitting, setTestimonySubmitting] = useState(false);
  const [testimonyMsg, setTestimonyMsg] = useState("");

  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    try {
      // Fetch prayers
      const pq = query(
        collection(db, "prayers"),
        where("userId", "==", uid),
        orderBy("timestamp", "desc")
      );
      const psnap = await getDocs(pq);
      setPrayers(psnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      // index might be building
    }

    try {
      // Fetch testimonies
      const tq = query(
        collection(db, "testimonies"),
        where("userId", "==", uid)
      );
      const tsnap = await getDocs(tq);
      setTestimonies(tsnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const portalUser = await getPortalUser(fbUser.uid);
        setUser(portalUser);
        fetchUserData(fbUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const handlePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim() || !user) return;
    setPrayerSubmitting(true);
    setPrayerMsg("");
    try {
      await addDoc(collection(db, "prayers"), {
        content: prayerText.trim(),
        status: "pending",
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      });
      setPrayerMsg("Your prayer request has been submitted to the pastoral team ✓");
      setPrayerText("");
      fetchUserData(user.uid);
      setTimeout(() => setPrayerMsg(""), 5000);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setPrayerSubmitting(false);
    }
  };

  const handleTestimonySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonyText.trim() || !testimonyTitle.trim() || !user) return;
    setTestimonySubmitting(true);
    setTestimonyMsg("");
    try {
      await addDoc(collection(db, "testimonies"), {
        title: testimonyTitle.trim(),
        content: testimonyText.trim(),
        status: "pending",
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      });
      setTestimonyMsg("Testimony submitted! It will appear after pastoral review ✓");
      setTestimonyTitle("");
      setTestimonyText("");
      fetchUserData(user.uid);
      setTimeout(() => setTestimonyMsg(""), 5000);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setTestimonySubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>
          Pastoral Altar &amp; Praise Record
        </div>
        <h1 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "clamp(24px, 3vw, 32px)", color: "#141C6E", margin: 0 }}>
          Prayer &amp; Testimony Journal
        </h1>
        <p style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", fontStyle: "italic", fontSize: "14.5px", color: "#4A5490", marginTop: "6px" }}>
          Present petitions to God before the altar of prayer, and record testimonies of His miraculous faithfulness.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #D5DCF2" }}>
        <button
          onClick={() => setActiveTab("prayers")}
          style={{
            padding: "12px 20px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "prayers" ? "3px solid #1F46C8" : "3px solid transparent",
            color: activeTab === "prayers" ? "#1F46C8" : "#64748B",
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontWeight: activeTab === "prayers" ? 700 : 500,
            fontSize: "13.5px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>🙏</span>
          <span>Prayer Petitions</span>
        </button>

        <button
          onClick={() => setActiveTab("testimonies")}
          style={{
            padding: "12px 20px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "testimonies" ? "3px solid #1F46C8" : "3px solid transparent",
            color: activeTab === "testimonies" ? "#1F46C8" : "#64748B",
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontWeight: activeTab === "testimonies" ? 700 : 500,
            fontSize: "13.5px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>✨</span>
          <span>Praise Testimonies</span>
        </button>
      </div>

      {/* TAB 1: PRAYERS */}
      {activeTab === "prayers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Submit Form */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "17px", fontWeight: 700, color: "#141C6E", margin: "0 0 6px" }}>
              Submit a Confidential Prayer Request
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 16px" }}>
              Your petition is received directly by Dr. Joshua Agunbiade and the appointed prayer team.
            </p>

            <form onSubmit={handlePrayerSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <textarea
                value={prayerText}
                onChange={(e) => setPrayerText(e.target.value)}
                placeholder="Share your spiritual, personal, health, or family prayer point..."
                rows={4}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid #D5DCF2",
                  fontSize: "13.5px",
                  color: "#141C6E",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              {prayerMsg && (
                <div style={{ padding: "10px 14px", backgroundColor: "#DCFCE7", color: "#166534", borderRadius: "8px", fontSize: "12.5px", fontWeight: 600 }}>
                  {prayerMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={prayerSubmitting || !prayerText.trim()}
                style={{
                  alignSelf: "flex-start",
                  padding: "10px 24px",
                  backgroundColor: "#1F46C8",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: prayerSubmitting || !prayerText.trim() ? "not-allowed" : "pointer",
                  opacity: prayerSubmitting || !prayerText.trim() ? 0.6 : 1,
                }}
              >
                {prayerSubmitting ? "Submitting..." : "Send to Prayer Team"}
              </button>
            </form>
          </div>

          {/* Past Prayers */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px" }}>
            <h3 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "16px", fontWeight: 700, color: "#141C6E", margin: "0 0 16px" }}>
              My Prayer History
            </h3>
            {prayers.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {prayers.map((p) => (
                  <div key={p.id} style={{ padding: "16px", borderRadius: "8px", backgroundColor: "#F8FAFD", border: "1px solid #E8EDFB" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "10.5px", fontWeight: 700, color: p.status === "answered" ? "#10B981" : "#1F46C8", textTransform: "uppercase" }}>
                        {p.status === "answered" ? "Answered Prayer ✓" : "Under Intercession 🙏"}
                      </span>
                      <span style={{ fontSize: "11px", color: "#747CA1" }}>
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Recent"}
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#141C6E", margin: 0, lineHeight: "1.5em" }}>
                      {p.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#747CA1", fontSize: "13px", fontStyle: "italic", margin: 0 }}>
                No prayer petitions filed yet. Use the form above to submit your requests.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TESTIMONIES */}
      {activeTab === "testimonies" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Submit Testimony */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "17px", fontWeight: 700, color: "#141C6E", margin: "0 0 6px" }}>
              Share What God Has Done
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 16px" }}>
              &ldquo;They overcame him by the blood of the Lamb, and by the word of their testimony.&rdquo; (Rev 12:11)
            </p>

            <form onSubmit={handleTestimonySubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                  Testimony Title
                </label>
                <input
                  type="text"
                  value={testimonyTitle}
                  onChange={(e) => setTestimonyTitle(e.target.value)}
                  placeholder="e.g. Miraculous Healing &amp; Divine Provision"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #D5DCF2",
                    fontSize: "13.5px",
                    color: "#141C6E",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                  Full Testimony Details
                </label>
                <textarea
                  value={testimonyText}
                  onChange={(e) => setTestimonyText(e.target.value)}
                  placeholder="Narrate what God did to glorify His name..."
                  rows={4}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid #D5DCF2",
                    fontSize: "13.5px",
                    color: "#141C6E",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {testimonyMsg && (
                <div style={{ padding: "10px 14px", backgroundColor: "#DCFCE7", color: "#166534", borderRadius: "8px", fontSize: "12.5px", fontWeight: 600 }}>
                  {testimonyMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={testimonySubmitting || !testimonyText.trim() || !testimonyTitle.trim()}
                style={{
                  alignSelf: "flex-start",
                  padding: "10px 24px",
                  backgroundColor: "#0140C1",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: testimonySubmitting ? "not-allowed" : "pointer",
                  opacity: testimonySubmitting ? 0.6 : 1,
                }}
              >
                {testimonySubmitting ? "Submitting..." : "Submit Testimony"}
              </button>
            </form>
          </div>

          {/* Testimonies list */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px" }}>
            <h3 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "16px", fontWeight: 700, color: "#141C6E", margin: "0 0 16px" }}>
              My Submitted Testimonies
            </h3>
            {testimonies.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {testimonies.map((t) => (
                  <div key={t.id} style={{ padding: "16px", borderRadius: "8px", backgroundColor: "#F8FAFD", border: "1px solid #E8EDFB" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "10.5px", fontWeight: 700, color: t.status === "approved" ? "#10B981" : "#D97706", textTransform: "uppercase" }}>
                        {t.status === "approved" ? "Approved &amp; Published ✓" : "Pending Pastoral Review ⏳"}
                      </span>
                      <span style={{ fontSize: "11px", color: "#747CA1" }}>
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Recent"}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#141C6E", marginBottom: "4px" }}>
                      {t.title}
                    </div>
                    <p style={{ fontSize: "13px", color: "#4A5490", margin: 0, lineHeight: "1.5em" }}>
                      {t.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#747CA1", fontSize: "13px", fontStyle: "italic", margin: 0 }}>
                No testimonies recorded yet. Give glory to God with the form above!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
