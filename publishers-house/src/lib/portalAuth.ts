import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type UserRole = "admin" | "unit_head" | "member";
export type ActivityTier = "seeker" | "regular" | "active" | "leader";

export interface PortalUser {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: UserRole;
  assignedUnitId?: string;
  activityTier: ActivityTier;
  createdAt: string;
  lastLogin: string;
  photoURL?: string;
}

export const UNITS = [
  { id: "media_technical", name: "Media & Technical" },
  { id: "worship", name: "Worship Team" },
  { id: "editorial", name: "Editorial" },
  { id: "welfare", name: "Welfare" },
  { id: "sanctuary", name: "Sanctuary" },
  { id: "ushering", name: "Ushering" },
  { id: "protocol", name: "Protocol" },
  { id: "children", name: "Children" },
  { id: "registration", name: "Registration" },
  { id: "transportation", name: "Transportation" },
  { id: "prayer", name: "Prayer" },
  { id: "followup_hospitality", name: "Follow & Hospitality" },
];

export async function getPortalUser(uid: string): Promise<PortalUser | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      return snap.data() as PortalUser;
    }
    return null;
  } catch {
    return null;
  }
}

export async function createOrUpdatePortalUser(user: User, role: UserRole = "member"): Promise<PortalUser> {
  const now = new Date().toISOString();
  const portalUser: PortalUser = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || user.email?.split("@")[0] || "Member",
    role,
    activityTier: "regular",
    createdAt: now,
    lastLogin: now,
    photoURL: user.photoURL || undefined,
  };
  
  const existing = await getPortalUser(user.uid);
  if (existing) {
    // Only update lastLogin
    await setDoc(doc(db, "users", user.uid), { lastLogin: now }, { merge: true });
    return { ...existing, lastLogin: now };
  }
  
  await setDoc(doc(db, "users", user.uid), portalUser);
  return portalUser;
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "admin": return "Administrator";
    case "unit_head": return "Unit Head";
    case "member": return "Member";
  }
}

export function getRoleColor(role: UserRole): string {
  switch (role) {
    case "admin": return "#D97706";
    case "unit_head": return "#2090FF";
    case "member": return "#10B981";
  }
}

export function getTierLabel(tier: ActivityTier): string {
  switch (tier) {
    case "seeker": return "Seeker";
    case "regular": return "Regular";
    case "active": return "Active";
    case "leader": return "Leader";
  }
}
