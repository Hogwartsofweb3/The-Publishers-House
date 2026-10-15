import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { SESSION_COOKIE } from "@/lib/sessionCookie";
import type { ActivityTier, PortalUser, UserRole } from "@/lib/portalAuth";

const ROLES: UserRole[] = ["admin", "unit_head", "member"];
const TIERS: ActivityTier[] = ["seeker", "regular", "active", "leader"];

export async function requirePortalUser(): Promise<PortalUser | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE)?.value;
    if (!session) return null;

    const decoded = await getAdminAuth().verifySessionCookie(session, true);
    const snap = await getAdminDb().collection("users").doc(decoded.uid).get();
    if (!snap.exists) return null;

    const data = snap.data() || {};
    const role = data.role as UserRole;
    if (!ROLES.includes(role)) return null;

    const rawTier = data.activityTier as ActivityTier;
    const activityTier: ActivityTier = TIERS.includes(rawTier) ? rawTier : "regular";

    return {
      uid: decoded.uid,
      email: typeof data.email === "string" ? data.email : decoded.email || "",
      displayName: typeof data.displayName === "string" ? data.displayName : "Member",
      phone: typeof data.phone === "string" ? data.phone : undefined,
      role,
      assignedUnitId: typeof data.assignedUnitId === "string" ? data.assignedUnitId : undefined,
      activityTier,
      createdAt: typeof data.createdAt === "string" ? data.createdAt : "",
      lastLogin: typeof data.lastLogin === "string" ? data.lastLogin : "",
      photoURL: typeof data.photoURL === "string" ? data.photoURL : undefined,
    };
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

export function portalHomeFor(role: UserRole): string {
  if (role === "admin") return "/portal";
  if (role === "unit_head") return "/portal/unit";
  return "/portal/member";
}

export function canAccessPortal(pathname: string, role: UserRole): boolean {
  if (pathname === "/portal/login") return true;

  if (pathname === "/portal" || pathname === "/portal/") {
    return role === "admin";
  }

  if (pathname === "/portal/units" || pathname.startsWith("/portal/units/")) {
    return role === "admin";
  }

  if (pathname === "/portal/unit" || pathname.startsWith("/portal/unit/")) {
    return role === "unit_head" || role === "admin";
  }

  if (pathname === "/portal/member" || pathname.startsWith("/portal/member/")) {
    return true;
  }

  const adminPrefixes = [
    "/portal/members",
    "/portal/attendance",
    "/portal/events",
    "/portal/finance",
    "/portal/testimonies",
    "/portal/pastoral",
    "/portal/courses",
    "/portal/facility",
    "/portal/audit",
    "/portal/settings",
  ];

  if (adminPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return role === "admin";
  }

  return role === "admin";
}
