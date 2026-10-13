import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/health
 * Diagnostic endpoint — verifies Firebase Admin SDK can initialize.
 * Returns sanitized info (never leaks secrets).
 */
export async function GET() {
  const checks: Record<string, string> = {};

  // 1. Check env vars
  checks.hasServiceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? "yes"
    : "no";
  checks.hasPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ? "yes" : "no";
  checks.hasClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    ? "yes"
    : "no";
  checks.hasProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID ? "yes" : "no";
  checks.nodeVersion = process.version;

  // 2. Try importing firebase-admin
  try {
    const { getAdminAuth, getAdminDb } = await import("@/lib/firebaseAdmin");
    checks.importOk = "yes";

    // 3. Try initializing
    try {
      const auth = getAdminAuth();
      checks.authInit = "yes";

      // 4. Try a simple operation
      try {
        await auth.listUsers(1);
        checks.authWorks = "yes";
      } catch (e: any) {
        checks.authWorks = `no: ${e.message?.substring(0, 200)}`;
      }
    } catch (e: any) {
      checks.authInit = `no: ${e.message?.substring(0, 200)}`;
    }

    // 5. Try Firestore
    try {
      const db = getAdminDb();
      checks.firestoreInit = "yes";
    } catch (e: any) {
      checks.firestoreInit = `no: ${e.message?.substring(0, 200)}`;
    }
  } catch (e: any) {
    checks.importOk = `no: ${e.message?.substring(0, 200)}`;
  }

  return NextResponse.json(checks);
}
