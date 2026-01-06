/**
 * Kinde Authentication Helpers
 *
 * Kinde is the primary auth provider for modern apps.
 * This module provides server-side utilities for token validation
 * and user context extraction.
 */

export interface KindeUser {
  id: string;
  email: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
}

export interface KindeTokenClaims {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  org_code?: string;
  permissions?: string[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  // Firebase OIDC passthrough claims (when user authenticates via Firebase)
  firebase_uid?: string;
  firebase_email?: string;
  // Generic OIDC identity claims
  idp?: string; // Identity provider: 'kinde', 'firebase', 'google', etc.
  idp_user_id?: string; // Original user ID from the IdP
}

/**
 * Extract user from Kinde token claims
 */
export function getUserFromClaims(claims: KindeTokenClaims): KindeUser {
  return {
    id: claims.sub,
    email: claims.email,
    givenName: claims.given_name,
    familyName: claims.family_name,
    picture: claims.picture,
  };
}

/**
 * Check if token has required permission
 */
export function hasPermission(
  claims: KindeTokenClaims,
  permission: string
): boolean {
  return claims.permissions?.includes(permission) ?? false;
}

/**
 * Check if token has any of the required permissions
 */
export function hasAnyPermission(
  claims: KindeTokenClaims,
  permissions: string[]
): boolean {
  return permissions.some((p) => hasPermission(claims, p));
}

/**
 * Check if token has all required permissions
 */
export function hasAllPermissions(
  claims: KindeTokenClaims,
  permissions: string[]
): boolean {
  return permissions.every((p) => hasPermission(claims, p));
}
