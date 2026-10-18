import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseAuth";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type UserRole = "super_admin" | "admin" | "portal_manager" | "unit_head" | "member";
export type ActivityTier = "seeker" | "regular" | "active" | "leader";
export type Campus = "jos" | "abuja";

export interface PortalUser {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: UserRole;
  assignedUnitId?: string;
  activityTier: ActivityTier;
  campus?: Campus;
  mustChangePassword?: boolean;
  tempPassword?: string;
  hasAccount?: boolean;
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
  
  // Build payload — NEVER include undefined values (Firestore rejects them)
  const payload: Record<string, string> = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || user.email?.split("@")[0] || "Member",
    role,
    activityTier: "regular",
    createdAt: now,
    lastLogin: now,
  };
  if (user.photoURL) payload.photoURL = user.photoURL;
  if (user.phoneNumber) payload.phone = user.phoneNumber;
  
  const existing = await getPortalUser(user.uid);
  if (existing) {
    // Best-effort: update lastLogin. Firestore rules may block browser writes — never fail login over this.
    try {
      await setDoc(doc(db, "users", user.uid), { lastLogin: now }, { merge: true });
    } catch {
      // silently ignore — server-side session is the real auth guard
    }
    return { ...existing, lastLogin: now };
  }

  // New user — try to create their profile. May fail if rules are strict; the session endpoint
  // will reject them with "No portal profile" which is the correct UX for unregistered users.
  try {
    await setDoc(doc(db, "users", user.uid), payload);
  } catch {
    // If rules block this, fall through — establishSession will return 403 with a clear message
  }
  return payload as unknown as PortalUser;
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "super_admin": return "Super Admin";
    case "admin": return "Administrator";
    case "portal_manager": return "Portal Manager";
    case "unit_head": return "Unit Head";
    case "member": return "Member";
    default: return "Member";
  }
}

export function getRoleColor(role: UserRole): string {
  switch (role) {
    case "super_admin": return "#E11D48";
    case "admin": return "#D97706";
    case "portal_manager": return "#7C3AED";
    case "unit_head": return "#2090FF";
    case "member": return "#10B981";
    default: return "#64748B";
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
