import { initializeApp, getApps, cert } from "firebase-admin/app";
import type { App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { Auth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { Firestore } from "firebase-admin/firestore";

function formatPrivateKey(key?: string): string {
  if (!key) return "";
  let formatted = key.trim();
  // Strip surrounding quotes if present
  if (
    (formatted.startsWith('"') && formatted.endsWith('"')) ||
    (formatted.startsWith("'") && formatted.endsWith("'"))
  ) {
    formatted = formatted.slice(1, -1).trim();
  }
  // Normalize Windows line endings and escaped newlines
  formatted = formatted.replace(/\r\n/g, "\n").replace(/\r/g, "");
  formatted = formatted.replace(/\\n/g, "\n");
  return formatted;
}

let firestoreInstance: Firestore | null = null;

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const privateKey = formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || "thepublishershouse-6d1cf";

  if (!privateKey || !clientEmail) {
    throw new Error("Missing FIREBASE_ADMIN_PRIVATE_KEY or FIREBASE_ADMIN_CLIENT_EMAIL environment variables.");
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
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
