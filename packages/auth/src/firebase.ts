/**
 * Firebase Authentication Helpers
 *
 * Firebase tokens are used for legacy API compatibility.
 * The Core API issues Firebase-compatible tokens after Kinde auth,
 * allowing new apps to call legacy APIs without changes.
 */

import { type App, getApps, initializeApp, cert } from "firebase-admin/app";
import { type Auth, getAuth } from "firebase-admin/auth";

let firebaseApp: App | undefined;
let firebaseAuth: Auth | undefined;

interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

/**
 * Initialize Firebase Admin SDK
 * Call this once at server startup
 */
export function initializeFirebaseAdmin(config: FirebaseConfig): void {
  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
  } else {
    firebaseApp = initializeApp({
      credential: cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }
  firebaseAuth = getAuth(firebaseApp);
}

/**
 * Get Firebase Auth instance
 * Throws if not initialized
 */
export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    throw new Error(
      "Firebase Admin not initialized. Call initializeFirebaseAdmin() first."
    );
  }
  return firebaseAuth;
}

/**
 * Create a custom Firebase token for a user
 * Used to issue legacy-compatible tokens after Kinde auth
 */
export async function createLegacyToken(
  userId: string,
  claims?: Record<string, unknown>
): Promise<string> {
  const auth = getFirebaseAuth();
  return auth.createCustomToken(userId, claims);
}

/**
 * Verify a Firebase token
 * Used when legacy systems call back to modern APIs
 */
export async function verifyLegacyToken(token: string) {
  const auth = getFirebaseAuth();
  return auth.verifyIdToken(token);
}
