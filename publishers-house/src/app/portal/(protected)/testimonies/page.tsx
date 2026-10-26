"use client";

import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";

type ItemStatus = "pending" | "approved" | "rejected" | "prayed";

interface TestimonyItem {
  id: string;
  type: "testimony" | "prayer";
  name: string;
  email?: string;
  category?: string;
  content: string;
  status: ItemStatus;
  submittedAt: string;
}

type FilterValue = "all" | "pending" | "approved" | "rejected";
type Tab = "testimonies" | "prayers";

export default function TestimoniesPage() {
  const [tab, setTab] = useState<Tab>("testimonies");
  const [items, setItems] = useState<TestimonyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [msg, setMsg] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const colName = tab === "testimonies" ? "testimonies" : "prayers";
      const q = query(collection(db, colName), orderBy("submittedAt", "desc"));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data: TestimonyItem[] = snap.docs.map((d) => ({
          id: d.id,
          type: tab === "testimonies" ? "testimony" : "prayer",
          ...(d.data() as Omit<TestimonyItem, "id" | "type">),
        }));
        setItems(data);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleUpdateStatus = async (id: string, newStatus: ItemStatus) => {
    try {
      const colName = tab === "testimonies" ? "testimonies" : "prayers";
      await fetch("/api/portal/pastoral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", collection: colName, id, status: newStatus }),
      });
    } catch {}

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    setMsg(`Item marked as ${newStatus} ✓`);
    setTimeout(() => setMsg(""), 3000);
  };

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const pendingCount = items.filter((i) => i.status === "pending").length;

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
            Testimonies & Prayer Requests
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
            Review congregation praise reports for publication and pastoral intercession
          </p>
        </div>

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
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #D5DCF2", paddingBottom: "12px" }}>
        <button
          onClick={() => {
            setTab("testimonies");
            setFilter("all");
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: tab === "testimonies" ? "#1F46C8" : "transparent",
            color: tab === "testimonies" ? "#FFFFFF" : "#4A5490",
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <span>Testimonies</span>
          {tab === "testimonies" && pendingCount > 0 && (
            <span style={{ padding: "2px 6px", borderRadius: "99px", backgroundColor: "#FFF2D6", color: "#7A5200", fontSize: "11px", fontWeight: 700 }}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setTab("prayers");
            setFilter("all");
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: tab === "prayers" ? "#1F46C8" : "transparent",
            color: tab === "prayers" ? "#FFFFFF" : "#4A5490",
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <span>Prayer Requests</span>
        </button>
      </div>

      {/* Filter Row */}
      <div style={{ display: "flex", gap: "8px" }}>
        {[
          { key: "all", label: "All Items" },
          { key: "pending", label: "Pending Review" },
          { key: "approved", label: "Approved / Public" },
          { key: "rejected", label: "Rejected" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "1px solid",
              borderColor: filter === f.key ? "#1F46C8" : "#D5DCF2",
              backgroundColor: filter === f.key ? "#E8EDFB" : "#FFFFFF",
              color: filter === f.key ? "#1F46C8" : "#4A5490",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Moderation Cards List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
            Loading {tab}...
          </div>
        )}
        {!loading && filteredItems.length === 0 && (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "14px",
              padding: "40px",
              textAlign: "center",
              color: "#4A5490",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            }}
          >
            No {tab} found matching this filter.
          </div>
        )}
        {filteredItems.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "14px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 1px 3px rgba(14, 21, 86, 0.05)",
            }}
          >
            {/* Top Info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#141C6E",
                      margin: 0,
                    }}
                  >
                    {item.name}
                  </h3>
                  {item.category && (
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        backgroundColor: "#E8EDFB",
                        color: "#1F46C8",
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "10.5px",
                        fontWeight: 600,
                      }}
                    >
                      {item.category}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "11px",
                    color: "#4A5490",
                    marginTop: "3px",
                  }}
                >
                  {item.email} · Submitted {new Date(item.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>

              {/* Status Pill */}
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "99px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "11px",
                  fontWeight: 600,
                  backgroundColor:
                    item.status === "approved"
                      ? "#E4F5EA"
                      : item.status === "pending"
                      ? "#FFF2D6"
                      : item.status === "prayed"
                      ? "#E8EDFB"
                      : "#FDE7E7",
                  color:
                    item.status === "approved"
                      ? "#0F6B38"
                      : item.status === "pending"
                      ? "#7A5200"
                      : item.status === "prayed"
                      ? "#1F46C8"
                      : "#9B1C1C",
                }}
              >
                {item.status.toUpperCase()}
              </span>
            </div>

            {/* Content */}
            <div
              style={{
                backgroundColor: "#F8FAFD",
                border: "1px solid #E8EDFB",
                borderRadius: "10px",
                padding: "16px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "13.5px",
                lineHeight: "22px",
                color: "#141C6E",
              }}
            >
              &ldquo;{item.content}&rdquo;
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", borderTop: "1px solid #E8EDFB", paddingTop: "14px" }}>
              {item.status !== "approved" && (
                <button
                  onClick={() => handleUpdateStatus(item.id, "approved")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#E4F5EA",
                    color: "#0F6B38",
                    border: "1px solid #C4EED0",
                    borderRadius: "8px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Approve for Publication ✓
                </button>
              )}

              {tab === "prayers" && item.status !== "prayed" && (
                <button
                  onClick={() => handleUpdateStatus(item.id, "prayed")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#E8EDFB",
                    color: "#1F46C8",
                    border: "1px solid #C9D6FF",
                    borderRadius: "8px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Mark Prayed Over 🙏
                </button>
              )}

              {item.status !== "rejected" && (
                <button
                  onClick={() => handleUpdateStatus(item.id, "rejected")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#FDE7E7",
                    color: "#9B1C1C",
                    border: "1px solid #F8B4B4",
                    borderRadius: "8px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Reject / Archive
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
