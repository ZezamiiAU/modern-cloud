/**
 * @repo/auth
 *
 * Centralized authentication helpers for Zezamii Modern Platform.
 *
 * Auth Strategy:
 * - Kinde: Primary auth provider for modern apps
 * - Firebase: Legacy compatibility tokens
 *
 * Flow:
 * 1. User authenticates via Kinde
 * 2. Core API validates Kinde token
 * 3. Core API issues Firebase token for legacy API calls
 * 4. Apps never decode tokens directly - always via Core API
 */

// Kinde (primary)
export {
  type KindeUser,
  type KindeTokenClaims,
  getUserFromClaims,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "./kinde";

// Firebase (legacy compat)
export {
  initializeFirebaseAdmin,
  getFirebaseAuth,
  createLegacyToken,
  verifyLegacyToken,
} from "./firebase";
