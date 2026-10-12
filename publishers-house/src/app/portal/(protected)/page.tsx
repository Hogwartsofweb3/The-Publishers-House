"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from "firebase/firestore";
import Link from "next/link";

interface KPIData {
  totalMembers: number;
  newThisMonth: number;
  weeklyGiving: number;
  attendanceLastWeek: number;
  pendingTestimonies: number;
  pendingPrayers: number;
}

function StatCard({ label, value, sub, accent, icon, href }: { label: string; value: string | number; sub?: string; accent: string; icon: string; href?: string }) {
  const content = (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${accent}22`,
      borderRadius: "12px",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      cursor: href ? "pointer" : "default",
      transition: "all 0.2s",
      textDecoration: "none",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.15em" }}>{label}</span>
        <span style={{ fontSize: "20px", color: accent }}>{icon}</span>
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "36px", color: "#F8FAFC", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: accent }}>{sub}</div>}
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: "none" }}>{content}</Link> : content;
}

function RecentActivity() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const fetch = async () => {
      const q = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(10));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetch();
  }, []);

  if (items.length === 0) {
    return (
      <div style={{ padding: "32px", textAlign: "center" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#4B5563", fontSize: "14px" }}>No recent activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
      {items.map(item => (
        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2090FF", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: "#F8FAFC", margin: 0 }}>{item.action || "System event"}</p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", color: "#4B5563", margin: 0 }}>{item.actor || "System"}</p>
          </div>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", color: "#4B5563" }}>
            {item.timestamp?.toDate?.().toLocaleDateString() || "Recently"}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [kpi, setKpi] = useState<KPIData>({
    totalMembers: 0, newThisMonth: 0, weeklyGiving: 0,
    attendanceLastWeek: 0, pendingTestimonies: 0, pendingPrayers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpi = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const totalMembers = usersSnap.size;

        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        // Count new members this month
        let newThisMonth = 0;
        usersSnap.docs.forEach(d => {
          const created = d.data().createdAt;
          if (created && new Date(created) >= monthStart) newThisMonth++;
        });

        // Pending testimonies
        const testimoniesSnap = await getDocs(query(collection(db, "testimonies"), where("status", "==", "pending")));
        const pendingTestimonies = testimoniesSnap.size;

        // Pending prayers
        const prayersSnap = await getDocs(query(collection(db, "prayers"), where("status", "==", "pending")));
        const pendingPrayers = prayersSnap.size;

        // This week giving from transactions
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const txSnap = await getDocs(query(collection(db, "transactions"), where("status", "==", "success")));
        let weeklyGiving = 0;
        txSnap.docs.forEach(d => {
          const ts = d.data().timestamp;
          if (ts && new Date(ts) >= weekStart) weeklyGiving += (d.data().amountNGN || 0);
        });

        // Last attendance record
        const attSnap = await getDocs(query(collection(db, "attendance"), orderBy("date", "desc"), limit(1)));
        const attendanceLastWeek = attSnap.docs[0]?.data()?.count || 0;

        setKpi({ totalMembers, newThisMonth, weeklyGiving, attendanceLastWeek, pendingTestimonies, pendingPrayers });
      } catch {
        // Firestore might not have these collections yet
      } finally {
        setLoading(false);
      }
    };
    fetchKpi();
  }, []);

  const kpiCards = [
    { label: "Total Members", value: loading ? "—" : kpi.totalMembers, sub: `+${kpi.newThisMonth} this month`, accent: "#2090FF", icon: "◉", href: "/portal/members" },
    { label: "Last Weekend", value: loading ? "—" : kpi.attendanceLastWeek || "—", sub: "Attendance headcount", accent: "#10B981", icon: "✦", href: "/portal/attendance" },
    { label: "Weekly Giving", value: loading ? "—" : `₦${kpi.weeklyGiving.toLocaleString()}`, sub: "Last 7 days", accent: "#D97706", icon: "◇", href: "/portal/finance" },
    { label: "Testimonies", value: loading ? "—" : kpi.pendingTestimonies, sub: "Awaiting approval", accent: kpi.pendingTestimonies > 0 ? "#F59E0B" : "#10B981", icon: "✧", href: "/portal/testimonies" },
    { label: "Prayer Requests", value: loading ? "—" : kpi.pendingPrayers, sub: "Unprayed", accent: kpi.pendingPrayers > 0 ? "#F59E0B" : "#10B981", icon: "♡", href: "/portal/testimonies" },
    { label: "Active Units", value: "11", sub: "All departments", accent: "#8B5CF6", icon: "⬡", href: "/portal/units" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", fontWeight: 600, color: "#D97706", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Master Admin</div>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 3vw, 36px)", color: "#F8FAFC", margin: 0, letterSpacing: "-0.02em" }}>Command Center</h1>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#94A3B8", fontSize: "14px", marginTop: "8px" }}>
          {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {kpiCards.map(card => <StatCard key={card.label} {...card} />)}
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px", marginBottom: "40px" }}>
        {[
          { href: "/portal/members", label: "Manage Members", color: "#2090FF" },
          { href: "/portal/testimonies", label: "Review Content", color: "#D97706" },
          { href: "/portal/pastoral", label: "Pastoral Care", color: "#10B981" },
          { href: "/portal/finance", label: "View Giving", color: "#8B5CF6" },
        ].map(q => (
          <Link key={q.href} href={q.href} style={{
            display: "block", padding: "16px 20px", borderRadius: "8px",
            background: `${q.color}11`, border: `1px solid ${q.color}33`,
            color: q.color, fontFamily: "'Poppins', sans-serif", fontSize: "12px",
            fontWeight: 600, textDecoration: "none", textTransform: "uppercase",
            letterSpacing: "0.08em", transition: "background 0.2s",
          }}>
            {q.label} →
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "14px", color: "#F8FAFC", margin: 0 }}>Recent Activity</h2>
          <Link href="/portal/audit" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "#2090FF", textDecoration: "none" }}>View All →</Link>
        </div>
        <RecentActivity />
      </div>
    </div>
  );
}
