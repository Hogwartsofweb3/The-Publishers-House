"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";

interface Course {
  id: string;
  title: string;
  track: "Biblical" | "Church" | "Theological" | "Christian Ministry";
  code: string;
  duration: string;
  modulesCount: number;
  enrolledStudents: number;
  instructor: string;
  description: string;
  status: "active" | "enrolling" | "draft";
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState<Omit<Course, "id" | "enrolledStudents">>({
    title: "",
    track: "Biblical",
    code: "",
    duration: "6 Weeks",
    modulesCount: 6,
    instructor: "Rev. Joshua Agunbiade",
    description: "",
    status: "enrolling",
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "courses"), orderBy("code", "asc")));
      if (!snap.empty) {
        setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course)));
      } else {
        setCourses([]);
      }
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.code) return;

    const id = editingCourse ? editingCourse.id : `crs-${Date.now()}`;
    const toSave: Course = {
      ...form,
      id,
      enrolledStudents: editingCourse ? editingCourse.enrolledStudents : 0,
    };

    try {
      await setDoc(doc(db, "courses", id), toSave);
    } catch {}

    if (editingCourse) {
      setCourses((prev) => prev.map((c) => (c.id === id ? toSave : c)));
      setMsg("Course curriculum updated ✓");
    } else {
      setCourses((prev) => [toSave, ...prev]);
      setMsg("Course added to academy catalog ✓");
    }

    setShowModal(false);
    setEditingCourse(null);
    setForm({
      title: "",
      track: "Biblical",
      code: "",
      duration: "6 Weeks",
      modulesCount: 6,
      instructor: "Rev. Joshua Agunbiade",
      description: "",
      status: "enrolling",
    });
    setTimeout(() => setMsg(""), 3500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this course?")) return;
    try {
      await deleteDoc(doc(db, "courses", id));
    } catch {}
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setMsg("Course deleted ✓");
    setTimeout(() => setMsg(""), 3000);
  };

  const openEdit = (crs: Course) => {
    setEditingCourse(crs);
    setForm({
      title: crs.title,
      track: crs.track,
      code: crs.code,
      duration: crs.duration,
      modulesCount: crs.modulesCount,
      instructor: crs.instructor,
      description: crs.description,
      status: crs.status,
    });
    setShowModal(true);
  };

  const filteredCourses = courses.filter((c) => {
    if (selectedTrack === "all") return true;
    return c.track === selectedTrack;
  });

  const totalStudents = courses.reduce((acc, c) => acc + c.enrolledStudents, 0);

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
            Courses & Discipleship Academy
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
            Christian, Church, Biblical, and Theological Academic Training Curricula
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
                padding: "6px 12px",
                borderRadius: "6px",
              }}
            >
              {msg}
            </span>
          )}

          <button
            onClick={() => {
              setEditingCourse(null);
              setForm({
                title: "",
                track: "Biblical",
                code: "",
                duration: "6 Weeks",
                modulesCount: 6,
                instructor: "Rev. Joshua Agunbiade",
                description: "",
                status: "enrolling",
              });
              setShowModal(true);
            }}
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
            + Create Course
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D5DCF2", borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Active Curricula</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#141C6E", marginTop: "4px" }}>{courses.length}</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#4A5490" }}>Across 4 core tracks</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D5DCF2", borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Enrolled Disciples</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#1F46C8", marginTop: "4px" }}>{totalStudents}</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#1F46C8" }}>Actively studying course modules</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D5DCF2", borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Open For Enrollment</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#0F6B38", marginTop: "4px" }}>
            {courses.filter((c) => c.status === "enrolling").length}
          </div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#0F6B38" }}>New intake registration active</div>
        </div>
      </div>

      {/* Track Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #D5DCF2", paddingBottom: "12px", flexWrap: "wrap" }}>
        {[
          { key: "all", label: "All Curricula" },
          { key: "Biblical", label: "Biblical Studies" },
          { key: "Church", label: "Church & Ecclesiology" },
          { key: "Theological", label: "Theological Studies" },
          { key: "Christian Ministry", label: "Christian Life & Ministry" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTrack(tab.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: selectedTrack === tab.key ? "#1F46C8" : "transparent",
              color: selectedTrack === tab.key ? "#FFFFFF" : "#4A5490",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Courses Cards Grid (Figma Style) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredCourses.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              backgroundColor: "#FFFFFF",
              border: "1px dashed #D5DCF2",
              borderRadius: "14px",
              padding: "48px 24px",
              textAlign: "center",
              color: "#747CA1",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "13px",
            }}
          >
            No courses found matching this track. Click &ldquo;+ Create Course&rdquo; to add a new study syllabus.
          </div>
        ) : (
          filteredCourses.map((crs) => (
          <div
            key={crs.id}
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
              {/* Header pill & code */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    backgroundColor: "#E8EDFB",
                    color: "#1F46C8",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {crs.code} · {crs.track}
                </span>

                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "99px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "11px",
                    fontWeight: 600,
                    backgroundColor:
                      crs.status === "active"
                        ? "#E4F5EA"
                        : crs.status === "enrolling"
                        ? "#FFF2D6"
                        : "#F4F6FB",
                    color:
                      crs.status === "active"
                        ? "#0F6B38"
                        : crs.status === "enrolling"
                        ? "#7A5200"
                        : "#4A5490",
                  }}
                >
                  {crs.status === "active" ? "Active Cohort" : crs.status === "enrolling" ? "Now Enrolling" : "Draft"}
                </span>
              </div>

              {/* Title & Description */}
              <h3
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#141C6E",
                  margin: "0 0 8px",
                  lineHeight: "24px",
                }}
              >
                {crs.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12.5px",
                  color: "#4A5490",
                  lineHeight: "18px",
                  margin: 0,
                }}
              >
                {crs.description}
              </p>

              {/* Meta metrics */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  backgroundColor: "#F8FAFD",
                  border: "1px solid #E8EDFB",
                  borderRadius: "10px",
                  padding: "12px",
                  marginTop: "16px",
                }}
              >
                <div>
                  <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "10.5px", color: "#4A5490", textTransform: "uppercase" }}>Duration</div>
                  <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", fontWeight: 700, color: "#141C6E" }}>{crs.duration} ({crs.modulesCount} modules)</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "10.5px", color: "#4A5490", textTransform: "uppercase" }}>Enrollment</div>
                  <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", fontWeight: 700, color: "#1F46C8" }}>{crs.enrolledStudents} Disciples</div>
                </div>
              </div>

              <div style={{ marginTop: "12px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11.5px", color: "#4A5490" }}>
                Instructor: <strong>{crs.instructor}</strong>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", borderTop: "1px solid #E8EDFB", paddingTop: "14px" }}>
              <button
                onClick={() => openEdit(crs)}
                style={{
                  flex: 1,
                  padding: "8px 14px",
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
                Edit Syllabus
              </button>
              <button
                onClick={() => handleDelete(crs.id)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#FDE7E7",
                  border: "1px solid #F8B4B4",
                  borderRadius: "8px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#9B1C1C",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )))}
      </div>

      {/* Add / Edit Course Modal */}
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
              maxWidth: "540px",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.15)",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "20px", color: "#141C6E", margin: "0 0 6px" }}>
              {editingCourse ? "Edit Course Curriculum" : "Create New Academy Course"}
            </h2>
            <p style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#4A5490", margin: "0 0 24px" }}>
              Biblical, Theological, Ecclesiological, and Christian Ministry Academy
            </p>

            <form onSubmit={handleSaveCourse} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Foundations of Biblical Hermeneutics"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Academy Track</label>
                  <select
                    value={form.track}
                    onChange={(e) => setForm({ ...form, track: e.target.value as any })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  >
                    <option value="Biblical">Biblical Studies</option>
                    <option value="Church">Church & Ecclesiology</option>
                    <option value="Theological">Theological Studies</option>
                    <option value="Christian Ministry">Christian Ministry</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BIB-101"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: "#1F46C8", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 8 Weeks"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Number of Modules</label>
                  <input
                    type="number"
                    min="1"
                    value={form.modulesCount}
                    onChange={(e) => setForm({ ...form, modulesCount: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Lead Instructor</label>
                  <input
                    type="text"
                    value={form.instructor}
                    onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  >
                    <option value="enrolling">Now Enrolling</option>
                    <option value="active">Active Cohort</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Course Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none", resize: "vertical" }}
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
                  {editingCourse ? "Save Changes" : "Create Course"}
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
