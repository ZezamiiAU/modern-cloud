/**
 * Pass Code Generation Utilities
 *
 * Generates unique, readable pass codes for day passes.
 */

import { randomBytes } from "crypto";

/**
 * Generate a unique pass code
 *
 * Format: 5-digit numeric PIN
 * - Range: 10000-99999
 * - Example: 54321
 */
export function generatePassCode(): string {
  // Generate random 5-digit number between 10000 and 99999
  const min = 10000;
  const max = 99999;
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNum.toString();
}

/**
 * Validate pass code format
 */
export function isValidPassCodeFormat(code: string): boolean {
  // Validate 5-digit numeric code
  const pattern = /^\d{5}$/;
  return pattern.test(code);
}

/**
 * Generate a short URL-safe code (for QR codes)
 *
 * Format: 8 characters, URL-safe base64
 * Example: aB3xK9mZ
 */
export function generateShortCode(): string {
  return randomBytes(6)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
    .slice(0, 8);
}
