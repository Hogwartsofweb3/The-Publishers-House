import { app } from "./firebase";
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  type Auth,
} from "firebase/auth";

function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    return getAuth(app);
  }
  try {
    // Prioritize browserLocalPersistence (localStorage).
    // This prevents "Database is closing/hidden" errors when mobile browsers switch tabs or enter background.
    return initializeAuth(app, {
      persistence: [
        browserLocalPersistence,
        indexedDBLocalPersistence,
        browserSessionPersistence,
      ],
    });
  } catch {
    return getAuth(app);
  }
}

export const auth: Auth = getFirebaseAuth();

