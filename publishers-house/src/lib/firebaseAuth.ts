import { app } from "./firebase";
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  browserPopupRedirectResolver,
  type Auth,
} from "firebase/auth";

function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    return getAuth(app);
  }
  try {
    // Prioritize browserLocalPersistence (localStorage).
    // Attach browserPopupRedirectResolver so signInWithPopup and getRedirectResult function without auth/argument-error.
    return initializeAuth(app, {
      persistence: [
        browserLocalPersistence,
        indexedDBLocalPersistence,
        browserSessionPersistence,
      ],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    return getAuth(app);
  }
}

export const auth: Auth = getFirebaseAuth();

