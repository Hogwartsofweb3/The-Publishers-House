"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import Link from "next/link";
import { usePortal } from "@/lib/portalContext";

interface KPIData {
  totalMembers: number;
  newThisMonth: number;
  weeklyGiving: number;
  monthlyGiving: number;
  attendanceLastWeek: number;
  upcomingEventsCount: number;
  activeVolunteers: number;
  pendingTestimonies: number;
  pendingPrayers: number;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  status: "published" | "draft" | "upcoming";
  attendeesCount?: number;
}

interface ActivityItem {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  category: string;
}

export default function AdminDashboard() {
  const { effectiveUser } = usePortal();
  const [kpi, setKpi] = useState<KPIData>({
    totalMembers: 342,
    newThisMonth: 12,
    weeklyGiving: 385000,
    monthlyGiving: 1155000,
    attendanceLastWeek: 418,
    upcomingEventsCount: 5,
    activeVolunteers: 48,
    pendingTestimonies: 3,
    pendingPrayers: 7,
  });
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: "ev-1",
      title: "Sunday Celebration Service",
      date: "Sunday, 18 Oct 2026",
      time: "8:00 AM & 10:00 AM",
      venue: "Main Sanctuary (Jos)",
      status: "published",
      attendeesCount: 420,
    },
    {
      id: "ev-2",
      title: "Midweek Faith Clinic",
      date: "Thursday, 22 Oct 2026",
      time: "5:30 PM",
      venue: "Main Sanctuary & Online",
      status: "published",
      attendeesCount: 180,
    },
    {
      id: "ev-3",
      title: "Festival of Light 2026 Planning",
      date: "Saturday, 24 Oct 2026",
      time: "10:00 AM",
      venue: "Conference Room & Abuja Studio",
      status: "upcoming",
      attendeesCount: 35,
    },
    {
      id: "ev-4",
      title: "Pastoral Leadership Retreat",
      date: "Fri, 30 Oct - Sat, 31 Oct",
      time: "9:00 AM",
      venue: "Abuja Campus",
      status: "draft",
      attendeesCount: 22,
    },
  ]);

  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: "act-1", action: "Recorded Sunday 1st Service Headcount (245 Jos / 65 Online)", actor: "Ushering Unit", timestamp: "Today, 11:20 AM", category: "Attendance" },
    { id: "act-2", action: "Approved Testimony: 'Miraculous Healing from Migraine'", actor: "Admin", timestamp: "Today, 09:45 AM", category: "Testimony" },
    { id: "act-3", action: "Logged Tithe Contribution ₦50,000 via Paystack", actor: "Finance Team", timestamp: "Yesterday, 04:12 PM", category: "Finances" },
    { id: "act-4", action: "Assigned First-Time Visitor to Follow-up Roster", actor: "Pastoral Care", timestamp: "Yesterday, 02:30 PM", category: "Pastoral" },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const realMembers = usersSnap.size;

        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        let newCount = 0;
        usersSnap.docs.forEach((d) => {
          const created = d.data().createdAt;
          if (created && new Date(created) >= monthStart) newCount++;
        });

        // Testimonies & Prayers
        let pendingT = 0;
        let pendingP = 0;
        try {
          const tSnap = await getDocs(query(collection(db, "testimonies"), where("status", "==", "pending")));
          pendingT = tSnap.size;
        } catch {}

        try {
          const pSnap = await getDocs(query(collection(db, "prayers"), where("status", "==", "pending")));
          pendingP = pSnap.size;
        } catch {}

        // Audit logs
        try {
          const auditSnap = await getDocs(query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(4)));
          if (!auditSnap.empty) {
            setActivities(
              auditSnap.docs.map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  action: data.action || "System action",
                  actor: data.actor || "Admin",
                  timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
                  category: data.category || "General",
                };
              })
            );
          }
        } catch {}

        // Events
        try {
          const evSnap = await getDocs(query(collection(db, "events"), orderBy("date", "asc"), limit(4)));
          if (!evSnap.empty) {
            setEvents(
              evSnap.docs.map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  title: data.title || "Church Service",
                  date: data.date || "Upcoming",
                  time: data.time || "Morning",
                  venue: data.venue || "Sanctuary",
                  status: data.status || "published",
                  attendeesCount: data.attendeesCount || 0,
                };
              })
            );
          }
        } catch {}

        setKpi((prev) => ({
          ...prev,
          totalMembers: realMembers > 0 ? realMembers : prev.totalMembers,
          newThisMonth: newCount > 0 ? newCount : prev.newThisMonth,
          pendingTestimonies: pendingT,
          pendingPrayers: pendingP,
        }));
      } catch (err) {
        console.warn("Could not load all Firestore data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const todayStr = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Welcome & Actions Header (Figma 311:1870) */}
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
            Dashboard
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
            {todayStr} · Welcome back, {effectiveUser.displayName || "Admin"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href="/portal/attendance"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "10px",
              padding: "10px 16px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              fontSize: "13px",
              color: "#141C6E",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
          >
            <span>✦</span>
            <span>Record Attendance</span>
          </Link>

          <Link
            href="/portal/events"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#1F46C8",
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              fontSize: "13px",
              color: "#FFFFFF",
              textDecoration: "none",
              boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
            <span>New Event</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards Row (Figma 311:1884, Responsive 2x2 on Mobile) */}
      <div className="portal-kpi-grid">
        {/* Card 1: Total members */}
        <Link href="/portal/members" style={{ textDecoration: "none" }}>
          <div className="portal-kpi-card">
            <span
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "11.5px",
                fontWeight: 600,
                color: "#4A5490",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Total Members
            </span>
            <div
              className="portal-kpi-val"
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "34px",
                fontWeight: 800,
                color: "#141C6E",
                lineHeight: "40px",
              }}
            >
              {loading ? "..." : kpi.totalMembers.toLocaleString()}
            </div>
            <div className="portal-kpi-sub" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  backgroundColor: "#E4F5EA",
                  color: "#0F6B38",
                  fontSize: "11px",
                  fontWeight: 600,
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                }}
              >
                +{kpi.newThisMonth} this month
              </span>
            </div>
          </div>
        </Link>

        {/* Card 2: Upcoming events */}
        <Link href="/portal/events" style={{ textDecoration: "none" }}>
          <div className="portal-kpi-card">
            <span
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "11.5px",
                fontWeight: 600,
                color: "#4A5490",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Upcoming Events
            </span>
            <div
              className="portal-kpi-val"
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "34px",
                fontWeight: 800,
                color: "#141C6E",
                lineHeight: "40px",
              }}
            >
              {events.length}
            </div>
            <div
              className="portal-kpi-sub"
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                color: "#1F46C8",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Next: Sunday Worship, 18 Oct
            </div>
          </div>
        </Link>

        {/* Card 3: Monthly giving */}
        <Link href="/portal/finance" style={{ textDecoration: "none" }}>
          <div className="portal-kpi-card">
            <span
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "11.5px",
                fontWeight: 600,
                color: "#4A5490",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Monthly Giving
            </span>
            <div
              className="portal-kpi-val"
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "34px",
                fontWeight: 800,
                color: "#141C6E",
                lineHeight: "40px",
              }}
            >
              ₦{kpi.monthlyGiving.toLocaleString()}
            </div>
            <div className="portal-kpi-sub" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  backgroundColor: "#E4F5EA",
                  color: "#0F6B38",
                  fontSize: "11px",
                  fontWeight: 600,
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                }}
              >
                ₦125,000 above last month
              </span>
            </div>
          </div>
        </Link>

        {/* Card 4: Active volunteers & units */}
        <Link href="/portal/units" style={{ textDecoration: "none" }}>
          <div className="portal-kpi-card">
            <span
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "11.5px",
                fontWeight: 600,
                color: "#4A5490",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Active Units & Teams
            </span>
            <div
              className="portal-kpi-val"
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "34px",
                fontWeight: 800,
                color: "#141C6E",
                lineHeight: "40px",
              }}
            >
              12 Units
            </div>
            <div
              className="portal-kpi-sub"
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                color: "#4A5490",
                fontWeight: 500,
              }}
            >
              48 rostered volunteers
            </div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Events Table on Left, Actions & Insights on Right (Stacks on mobile) */}
      <div className="portal-two-col">
        {/* Left Column: Events Table + Audit Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Upcoming & Recent Events (Figma 311:1912) */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "14px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #E8EDFB",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#141C6E",
                    margin: 0,
                  }}
                >
                  Upcoming & Recent Events
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "12px",
                    color: "#4A5490",
                    margin: "4px 0 0",
                  }}
                >
                  Sanctuary worship schedule and upcoming conferences
                </p>
              </div>

              <Link
                href="/portal/events"
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#1F46C8",
                  textDecoration: "none",
                }}
              >
                View all events →
              </Link>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFD", borderBottom: "1px solid #E8EDFB" }}>
                    <th style={{ padding: "12px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Event</th>
                    <th style={{ padding: "12px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Date & Time</th>
                    <th style={{ padding: "12px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Venue</th>
                    <th style={{ padding: "12px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr
                      key={ev.id}
                      style={{
                        borderBottom: "1px solid #E8EDFB",
                        transition: "background-color 0.15s",
                      }}
                    >
                      <td style={{ padding: "16px 24px" }}>
                        <div
                          style={{
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "13.5px",
                            fontWeight: 700,
                            color: "#141C6E",
                          }}
                        >
                          {ev.title}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "11px",
                            color: "#4A5490",
                            marginTop: "3px",
                          }}
                        >
                          {ev.attendeesCount} registered attendees
                        </div>
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <div
                          style={{
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            color: "#141C6E",
                          }}
                        >
                          {ev.date}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "11px",
                            color: "#4A5490",
                          }}
                        >
                          {ev.time}
                        </div>
                      </td>

                      <td
                        style={{
                          padding: "16px 20px",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "12.5px",
                          color: "#4A5490",
                        }}
                      >
                        {ev.venue}
                      </td>

                      <td style={{ padding: "16px 24px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "99px",
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "11px",
                            fontWeight: 600,
                            backgroundColor:
                              ev.status === "published"
                                ? "#E4F5EA"
                                : ev.status === "upcoming"
                                ? "#E8EDFB"
                                : "#FFF2D6",
                            color:
                              ev.status === "published"
                                ? "#0F6B38"
                                : ev.status === "upcoming"
                                ? "#1F46C8"
                                : "#7A5200",
                          }}
                        >
                          {ev.status === "published"
                            ? "Published"
                            : ev.status === "upcoming"
                            ? "Confirmed"
                            : "Draft"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Audit / Security Trail (Figma Card Style) */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "14px",
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#141C6E",
                  margin: 0,
                }}
              >
                Recent Administrative Activity
              </h2>
              <Link
                href="/portal/audit"
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12px",
                  color: "#1F46C8",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Full Audit Log →
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {activities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    backgroundColor: "#F8FAFD",
                    borderRadius: "8px",
                    border: "1px solid #E8EDFB",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        backgroundColor: "#E8EDFB",
                        color: "#1F46C8",
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {act.category}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "12.5px",
                        fontWeight: 500,
                        color: "#141C6E",
                      }}
                    >
                      {act.action}
                    </span>
                  </div>

                  <span
                    style={{
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "11px",
                      color: "#4A5490",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {act.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Links & Priority Pending Modules */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Quick Management Shortcuts */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "14px",
              padding: "22px 24px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "15px",
                fontWeight: 700,
                color: "#141C6E",
                margin: "0 0 16px",
              }}
            >
              Management Shortcuts
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { href: "/portal/members", label: "Directory & Roles", sub: "Add or edit member credentials", icon: "◉" },
                { href: "/portal/units", label: "Church Units", sub: "Rosters, Unit Heads, 12 units", icon: "⬡" },
                { href: "/portal/attendance", label: "Headcount & Stream", sub: "Live codes & usher tallying", icon: "✦" },
                { href: "/portal/pastoral", label: "Pastoral Pipeline", sub: "Follow-up & visitor care", icon: "♡" },
                { href: "/portal/finance", label: "Finances & Giving", sub: "Tithes, projects, reconciliation", icon: "◇" },
                { href: "/portal/courses", label: "Academy Courses", sub: "Discipleship, biblical studies", icon: "📖" },
                { href: "/portal/facility", label: "Sanctuary & Assets", sub: "Bookings, audio gear, hall care", icon: "🏛️" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    backgroundColor: "#F8FAFD",
                    border: "1px solid #E8EDFB",
                    borderRadius: "10px",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#E8EDFB";
                    e.currentTarget.style.borderColor = "#1F46C8";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8FAFD";
                    e.currentTarget.style.borderColor = "#E8EDFB";
                  }}
                >
                  <span style={{ fontSize: "16px", color: "#1F46C8" }}>{item.icon}</span>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: "#141C6E",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "11px",
                        color: "#4A5490",
                      }}
                    >
                      {item.sub}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Pending Content Moderation Card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "14px",
              padding: "22px 24px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "15px",
                fontWeight: 700,
                color: "#141C6E",
                margin: "0 0 14px",
              }}
            >
              Items Awaiting Moderation
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  backgroundColor: kpi.pendingTestimonies > 0 ? "#FFF2D6" : "#E4F5EA",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: kpi.pendingTestimonies > 0 ? "#7A5200" : "#0F6B38",
                    }}
                  >
                    Testimonies
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "11px",
                      color: kpi.pendingTestimonies > 0 ? "#7A5200" : "#0F6B38",
                    }}
                  >
                    {kpi.pendingTestimonies} awaiting church bulletin approval
                  </div>
                </div>

                <Link
                  href="/portal/testimonies"
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D5DCF2",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#141C6E",
                    textDecoration: "none",
                  }}
                >
                  Review
                </Link>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  backgroundColor: kpi.pendingPrayers > 0 ? "#E8EDFB" : "#E4F5EA",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: kpi.pendingPrayers > 0 ? "#1F46C8" : "#0F6B38",
                    }}
                  >
                    Prayer Requests
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "11px",
                      color: kpi.pendingPrayers > 0 ? "#1F46C8" : "#0F6B38",
                    }}
                  >
                    {kpi.pendingPrayers} received this week
                  </div>
                </div>

                <Link
                  href="/portal/testimonies?tab=prayers"
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D5DCF2",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#141C6E",
                    textDecoration: "none",
                  }}
                >
                  Open
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
