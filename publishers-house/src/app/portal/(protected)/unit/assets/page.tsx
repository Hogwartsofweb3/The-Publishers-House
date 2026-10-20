"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";
import { getPortalUser, PortalUser, UNITS } from "@/lib/portalAuth";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

interface UnitAsset {
  id?: string;
  unitId: string;
  name: string;
  category: string;
  serialNumber?: string;
  quantity: number;
  condition: "operational" | "maintenance" | "missing";
  storageLocation: string;
}

export default function UnitAssetsPage() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<UnitAsset[]>([]);

  // Add asset form
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Hardware / Electronics");
  const [serialNumber, setSerialNumber] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState<"operational" | "maintenance" | "missing">("operational");
  const [storageLocation, setStorageLocation] = useState("Media Control Booth");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const activeUnit = UNITS.find((u) => u.id === user?.assignedUnitId) || UNITS[0];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const pUser = await getPortalUser(fbUser.uid);
        setUser(pUser);
        if (pUser?.assignedUnitId) {
          fetchAssets(pUser.assignedUnitId);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const fetchAssets = async (unitId: string) => {
    try {
      const q = query(collection(db, "unit_assets"), where("unitId", "==", unitId));
      const snap = await getDocs(q);
      setAssets(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UnitAsset)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.assignedUnitId || !name.trim()) return;
    setSaving(true);
    setMsg("");
    try {
      const newAsset: UnitAsset = {
        unitId: user.assignedUnitId,
        name: name.trim(),
        category,
        serialNumber: serialNumber.trim() || undefined,
        quantity: Number(quantity) || 1,
        condition,
        storageLocation: storageLocation.trim() || "Sanctuary",
      };
      await addDoc(collection(db, "unit_assets"), newAsset);
      setMsg("Equipment asset logged successfully ✓");
      setName("");
      setSerialNumber("");
      fetchAssets(user.assignedUnitId);
      setTimeout(() => setMsg(""), 4000);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Delete this inventory item?")) return;
    try {
      await deleteDoc(doc(db, "unit_assets", id));
      if (user?.assignedUnitId) fetchAssets(user.assignedUnitId);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", color: "#1F46C8" }}>Loading unit assets...</div>;
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>
          Inventory &amp; Logistics · {activeUnit?.name}
        </div>
        <h1 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "clamp(24px, 3vw, 32px)", color: "#141C6E", margin: 0 }}>
          Unit Assets &amp; Equipment Inventory
        </h1>
        <p style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", fontStyle: "italic", fontSize: "14.5px", color: "#4A5490", marginTop: "6px" }}>
          Track, audit, and log the maintenance status of gear, instruments, hardware, and publications assigned to your unit.
        </p>
      </div>

      {/* Add Asset Card */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "17px", fontWeight: 700, color: "#141C6E", margin: "0 0 18px" }}>
          Register New Asset or Gear
        </h2>

        <form onSubmit={handleAddAsset}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Asset Name / Description
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sony FX3 Cinema Camera"
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Hardware / Electronics">Hardware / Electronics</option>
                <option value="Audio / Microphones">Audio / Microphones</option>
                <option value="Visual / Cameras">Visual / Cameras</option>
                <option value="Musical Instruments">Musical Instruments</option>
                <option value="Publications / Printables">Publications / Printables</option>
                <option value="Sanctuary Furniture">Sanctuary Furniture</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                min="1"
                onChange={(e) => setQuantity(e.target.value)}
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Condition Status
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="operational">Operational &amp; Good ✓</option>
                <option value="maintenance">Under Repair / Maintenance ⚠️</option>
                <option value="missing">Flagged / Missing ✕</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Serial / Asset Tag (Optional)
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. SN-889102-TPH"
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Storage Location
              </label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="e.g. Media Gallery Room / Sound Rack"
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {msg && (
            <div style={{ padding: "10px 14px", backgroundColor: "#DCFCE7", color: "#166534", borderRadius: "8px", fontSize: "12.5px", fontWeight: 600, marginBottom: "16px" }}>
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 22px",
              backgroundColor: "#1F46C8",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Registering..." : "Add to Unit Inventory"}
          </button>
        </form>
      </div>

      {/* Asset Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "17px", fontWeight: 700, color: "#141C6E", margin: "0 0 16px" }}>
          Unit Gear &amp; Equipment Ledger
        </h2>

        {assets.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #D5DCF2", color: "#4A5490" }}>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Item Name</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Category</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Qty</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Location</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Status</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #E8EDFB" }}>
                    <td style={{ padding: "14px", fontWeight: 700, color: "#141C6E" }}>
                      {item.name}
                      {item.serialNumber && <div style={{ fontSize: "11px", color: "#747CA1" }}>SN: {item.serialNumber}</div>}
                    </td>
                    <td style={{ padding: "14px", color: "#4A5490" }}>{item.category}</td>
                    <td style={{ padding: "14px", fontWeight: 700, color: "#1F46C8" }}>{item.quantity}</td>
                    <td style={{ padding: "14px", color: "#64748B" }}>{item.storageLocation}</td>
                    <td style={{ padding: "14px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          backgroundColor:
                            item.condition === "operational" ? "#DCFCE7" : item.condition === "maintenance" ? "#FEF3C7" : "#FEE2E2",
                          color:
                            item.condition === "operational" ? "#166534" : item.condition === "maintenance" ? "#B45309" : "#991B1B",
                        }}
                      >
                        {item.condition}
                      </span>
                    </td>
                    <td style={{ padding: "14px", textAlign: "right" }}>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{ padding: "4px 8px", backgroundColor: "#FFF1F2", color: "#BE123C", border: "1px solid #FECDD3", borderRadius: "4px", fontSize: "11.5px", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#747CA1", fontSize: "13px", fontStyle: "italic", margin: 0 }}>
            No assets registered yet for this unit.
          </p>
        )}
      </div>
    </div>
  );
}
