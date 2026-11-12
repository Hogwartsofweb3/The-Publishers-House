// The Publishers House Portal Authentication & Multi-Role Architecture
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
  roles?: UserRole[];
  isUnitHead?: boolean;
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
  { id: "secretariat", name: "Secretariat" },
  { id: "transportation", name: "Transportation" },
  { id: "prayer", name: "Prayer" },
  { id: "followup_hospitality", name: "Follow Up & Hospitality" },
  { id: "discipleship_evangelism", name: "Discipleship & Evangelism" },
];

/** Canonical designated unit leaders mapping */
export const DESIGNATED_UNIT_HEADS: Record<string, { name: string; email: string; phone?: string }> = {
  media_technical: { name: "Pastor Theophilus Makinde", email: "tmakind@gmail.com", phone: "+234 8162264549" },
  editorial: { name: "Pastor Ngbede Odeh", email: "odehngbes@gmail.com", phone: "+234 8186335861" },
  prayer: { name: "Pastor Ayodele Oluwadamilare", email: "Ayodeledare86@gmail.com", phone: "+234 8035036498" },
  worship: { name: "Samson Adebayo", email: "adebayosamson888@gmail.com", phone: "+234 8116643403" },
  welfare: { name: "Ifedayo Mary Agunbiade", email: "maryomoyele@gmail.com", phone: "+234 8108697026" },
  protocol: { name: "David Jatto", email: "davidjatto2020@gmail.com", phone: "+234 8139063144" },
  ushering: { name: "Ushering Leadership · TPH", email: "ushering@thepublishershouse.org", phone: "+234 8139063144" },
  children: { name: "Children Ministry Lead", email: "children@thepublishershouse.org" },
  secretariat: { name: "Secretariat & Registry Desk", email: "thepublishershouse007@gmail.com" },
  transportation: { name: "Transportation Logistics Lead", email: "transport@thepublishershouse.org" },
  sanctuary: { name: "Sanctuary Order Lead", email: "sanctuary@thepublishershouse.org" },
  followup_hospitality: { name: "Follow Up & Hospitality Team", email: "followup@thepublishershouse.org" },
  discipleship_evangelism: { name: "Discipleship & Evangelism Team", email: "discipleship@thepublishershouse.org" },
};

/** Dual-Role Admins who are also Unit Heads */
export const DUAL_ROLE_PASTORS: Record<string, { name: string; unitId: string }> = {
  "tmakind@gmail.com": { name: "Pastor Theophilus Makinde", unitId: "media_technical" },
  "odehngbes@gmail.com": { name: "Pastor Ngbede Odeh", unitId: "editorial" },
  "ayodeledare86@gmail.com": { name: "Pastor Ayodele Oluwadamilare", unitId: "prayer" },
};

export function normalizeUnitId(unitId?: string): string {
  if (!unitId) return "";
  const clean = unitId.trim().toLowerCase();
  if (clean === "registration") return "secretariat";
  if (clean === "media") return "media_technical";
  if (clean === "discipleship" || clean === "evangelism") return "discipleship_evangelism";
  if (clean === "followup" || clean === "hospitality" || clean === "follow_up") return "followup_hospitality";
  return clean;
}

export function getDualRoleUnit(email?: string, assignedUnitId?: string): string {
  if (!email) return normalizeUnitId(assignedUnitId);
  const clean = email.trim().toLowerCase();
  if (DUAL_ROLE_PASTORS[clean]) {
    return DUAL_ROLE_PASTORS[clean].unitId;
  }
  return normalizeUnitId(assignedUnitId);
}

export async function getPortalUser(uid: string): Promise<PortalUser | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      return snap.data() as PortalUser;
    }
  } catch (err) {
    console.warn("Client getPortalUser error (using fallback):", err);
  }

  // Fallback to current auth user if available
  const currentUser = auth.currentUser;
  if (currentUser && currentUser.uid === uid) {
    const email = (currentUser.email || "").toLowerCase();
    const isJoshua = email === "joshuaagunbiade@gmail.com";
    const isPortalManager = email === "thepublishershouse007@gmail.com";
    return {
      uid: currentUser.uid,
      email: currentUser.email || "",
      displayName: isJoshua
        ? "Rev. Joshua Agunbiade"
        : (isPortalManager ? "TPH Content Manager" : currentUser.displayName || "Member"),
      role: isJoshua ? "super_admin" : (isPortalManager ? "portal_manager" : "member"),
      activityTier: isJoshua || isPortalManager ? "leader" : "regular",
      campus: "jos",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      photoURL: currentUser.photoURL || undefined,
    };
  }

  return null;
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
    case "portal_manager": return "Project Manager";
    case "unit_head": return "Unit Head";
    case "member": return "Member";
    default: return "Member";
  }
}

export function getRoleColor(role: UserRole): string {
  switch (role) {
    case "super_admin": return "#0140C1";
    case "admin": return "#1F46C8";
    case "portal_manager": return "#7C3AED";
    case "unit_head": return "#2090FF";
    case "member": return "#10B981";
    default: return "#64748B";
  }
}

/** Returns true if user is an Administrator or Super Admin */
export function isChurchAdmin(user?: PortalUser | null): boolean {
  if (!user) return false;
  return (
    user.role === "admin" ||
    user.role === "super_admin" ||
    user.role === "portal_manager" ||
    Boolean(user.roles?.includes("admin")) ||
    Boolean(user.roles?.includes("super_admin"))
  );
}

/** Returns true if user is a Unit Head (either as their primary role or as an admin leading a unit) */
export function isUserUnitHead(user?: PortalUser | null, unitId?: string): boolean {
  if (!user) return false;
  const email = (user.email || "").trim().toLowerCase();
  const dualUnit = DUAL_ROLE_PASTORS[email]?.unitId;
  const isHead =
    user.role === "unit_head" ||
    user.isUnitHead === true ||
    Boolean(user.roles?.includes("unit_head")) ||
    Boolean(dualUnit);

  if (!isHead) return false;
  if (!unitId) return true;
  const effectiveUnit = dualUnit || normalizeUnitId(user.assignedUnitId);
  return effectiveUnit === normalizeUnitId(unitId);
}

/** Returns all active role tags for a user (supporting dual-role e.g. Administrator + Unit Head) */
export function getUserRoleBadges(user?: PortalUser | null): { role: UserRole; label: string; color: string }[] {
  if (!user) return [{ role: "member", label: "Member", color: "#64748B" }];
  const badges: { role: UserRole; label: string; color: string }[] = [];

  // 1. Primary administrative tag
  if (user.role === "super_admin" || user.roles?.includes("super_admin")) {
    badges.push({ role: "super_admin", label: "Super Admin", color: "#0140C1" });
  } else if (user.role === "admin" || user.roles?.includes("admin")) {
    badges.push({ role: "admin", label: "Administrator", color: "#1F46C8" });
  } else if (user.role === "portal_manager" || user.roles?.includes("portal_manager")) {
    badges.push({ role: "portal_manager", label: "Project Manager", color: "#7C3AED" });
  }

  // 2. Unit Head tag (can coexist with Administrator)
  if (user.isUnitHead || user.role === "unit_head" || user.roles?.includes("unit_head")) {
    badges.push({ role: "unit_head", label: "Unit Head", color: "#2090FF" });
  }

  // 3. Fallback to Member if no special roles
  if (badges.length === 0) {
    badges.push({ role: "member", label: "Member", color: "#10B981" });
  }

  return badges;
}

export function getTierLabel(tier: ActivityTier): string {
  switch (tier) {
    case "seeker": return "Seeker";
    case "regular": return "Regular";
    case "active": return "Active";
    case "leader": return "Leader";
  }
}
