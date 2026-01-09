/**
 * Legacy API Client - Bridge to existing MSSQL-based system
 *
 * Provides controlled access to legacy access control API.
 * Used for backward compatibility during migration.
 */

interface LegacyApiConfig {
  baseUrl: string;
  apiKey: string;
}

/**
 * Get legacy API configuration from environment
 */
function getLegacyApiConfig(): LegacyApiConfig {
  const baseUrl = process.env.LEGACY_API_URL;
  const apiKey = process.env.LEGACY_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Legacy API not configured. Set LEGACY_API_URL and LEGACY_API_KEY environment variables."
    );
  }

  return { baseUrl, apiKey };
}

/**
 * Make a request to the legacy API
 */
async function legacyApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = getLegacyApiConfig();

  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": config.apiKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Legacy API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// =============================================================================
// TYPES
// =============================================================================

export interface LegacySite {
  id: string;
  orgId: string;
  name: string;
  address: string | null;
  timezone: string;
  active: boolean;
}

export interface LegacyDevice {
  id: string;
  siteId: string;
  name: string;
  type: string;
  location: string | null;
  online: boolean;
  lastSeen: string | null;
}

export interface LegacyUnlockRequest {
  deviceId: string;
  userId: string;
  reason: string;
}

export interface LegacyUnlockResponse {
  success: boolean;
  message: string;
  unlockId?: string;
  timestamp?: string;
}

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Get sites for an organization from legacy system
 */
export async function getLegacySites(_orgId: string): Promise<LegacySite[]> {
  return legacyApiRequest<LegacySite[]>(`/api/v1/organizations/${orgId}/sites`);
}

/**
 * Get devices for a site from legacy system
 */
export async function getLegacyDevices(siteId: string): Promise<LegacyDevice[]> {
  return legacyApiRequest<LegacyDevice[]>(`/api/v1/sites/${siteId}/devices`);
}

/**
 * Request an unlock for a device via legacy system
 */
export async function requestLegacyUnlock(
  request: LegacyUnlockRequest
): Promise<LegacyUnlockResponse> {
  return legacyApiRequest<LegacyUnlockResponse>("/api/v1/unlocks", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Sync organization from legacy system to PostgreSQL
 *
 * Creates or updates org_ref and site_refs based on legacy data.
 */
export async function syncLegacyOrg(_orgId: string): Promise<{
  orgRefId: string;
  siteCount: number;
}> {
  // TODO: Implement org sync
  // 1. Fetch org details from legacy API
  // 2. Create/update org_ref in PostgreSQL
  // 3. Fetch sites from legacy API
  // 4. Create/update site_refs in PostgreSQL
  throw new Error("Not implemented");
}

/**
 * Check if legacy API is configured and available
 */
export function isLegacyApiAvailable(): boolean {
  try {
    getLegacyApiConfig();
    return true;
  } catch {
    return false;
  }
}
