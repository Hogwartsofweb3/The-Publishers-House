import { initializeApp, getApps, cert } from "firebase-admin/app";
import type { App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { Auth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { Firestore } from "firebase-admin/firestore";

/**
 * Build a ServiceAccount credential from environment variables.
 *
 * Strategy 1 (preferred, Vercel-safe):
 *   FIREBASE_SERVICE_ACCOUNT_KEY — the *entire* service-account JSON,
 *   base64-encoded.  No quoting / newline issues.
 *
 * Strategy 2 (fallback):
 *   FIREBASE_ADMIN_PRIVATE_KEY + FIREBASE_ADMIN_CLIENT_EMAIL +
 *   FIREBASE_ADMIN_PROJECT_ID as separate env vars.
 */
function buildCredential() {
  // --- Strategy 1: full JSON, base64 ---
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (b64) {
    try {
      const json = Buffer.from(b64, "base64").toString("utf-8");
      const sa = JSON.parse(json);
      return cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey: sa.private_key,
      });
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
      // fall through to strategy 2
    }
  }

  // --- Strategy 2: individual env vars ---
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID || "thepublishershouse-6d1cf";

  if (!rawKey || !clientEmail) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY " +
        "(base64 JSON) or FIREBASE_ADMIN_PRIVATE_KEY + FIREBASE_ADMIN_CLIENT_EMAIL."
    );
  }

  let privateKey = rawKey.trim();
  // Strip surrounding quotes if present
  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1).trim();
  }
  // Normalize escaped newlines → real newlines
  privateKey = privateKey.replace(/\r\n/g, "\n").replace(/\r/g, "");
  privateKey = privateKey.replace(/\\n/g, "\n");

  return cert({ projectId, clientEmail, privateKey });
}

let firestoreInstance: Firestore | null = null;

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];
  return initializeApp({ credential: buildCredential() });
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  if (firestoreInstance) return firestoreInstance;
  firestoreInstance = getFirestore(getAdminApp());
  return firestoreInstance;
}

// Lazy Proxy: NEVER runs during Next.js build time, only initializes on actual request
export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    const db = getAdminDb();
    const value = (db as any)[prop];
    if (typeof value === "function") {
      return value.bind(db);
    }
    return value;
  },
});
