import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

function formatPrivateKey(key?: string): string {
  if (!key) return "";
  let formatted = key.trim();
  // Strip surrounding quotes if the user pasted it with quotes in Vercel
  if (
    (formatted.startsWith('"') && formatted.endsWith('"')) ||
    (formatted.startsWith("'") && formatted.endsWith("'"))
  ) {
    formatted = formatted.slice(1, -1);
  }
  // Replace escaped \n with actual newlines
  formatted = formatted.replace(/\\n/g, "\n");
  return formatted;
}

let firestoreInstance: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (firestoreInstance) return firestoreInstance;

  let app: App;
  if (!getApps().length) {
    const privateKey = formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || "thepublishershouse-6d1cf";

    if (!privateKey || !clientEmail) {
      throw new Error("Missing FIREBASE_ADMIN_PRIVATE_KEY or FIREBASE_ADMIN_CLIENT_EMAIL environment variables.");
    }

    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    app = getApps()[0];
  }

  firestoreInstance = getFirestore(app);
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
