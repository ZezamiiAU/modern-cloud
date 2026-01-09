/**
 * User Resolution from Kinde Token
 *
 * Resolves a Kinde token to a PostgreSQL user, handling:
 * - Direct Kinde authentication
 * - Firebase OIDC passthrough (legacy users)
 * - Account linking (multiple IdPs per user)
 */

import { type SupabaseClient } from "@supabase/supabase-js";
import { type KindeTokenClaims } from "@repo/auth";
import type {
  User,
  UserIdentity,
  VMembership,
  CreateUserInput,
} from "./types";

export interface ResolvedUser {
  id: string;
  primaryEmail: string;
  name: string | null;
  pictureUrl: string | null;
  emailVerified: boolean;
  primaryProvider: string | null;
  primaryProviderUserId: string | null;
}

export interface ResolvedSession {
  user: ResolvedUser;
  memberships: VMembership[];
}

/**
 * Resolve a Kinde token to a PostgreSQL user.
 *
 * Flow:
 * 1. Look up by Kinde ID in user_identities
 * 2. If not found and Firebase UID present, look up by Firebase UID
 * 3. If found by Firebase, also add Kinde identity for future lookups
 * 4. If not found at all, create new user + identities
 */
export async function resolveUser(
  supabase: SupabaseClient,
  claims: KindeTokenClaims
): Promise<ResolvedUser> {
  const kindeId = claims.sub;
  const firebaseUid = claims.firebase_uid;
  const email = claims.email;

  // 1. Try to find by Kinde ID first
  let identity = await findIdentityByProvider(supabase, "kinde", kindeId);

  if (identity) {
    // Found by Kinde - update last_login_at and return user
    await updateLastLogin(supabase, identity.id);
    return await getUserById(supabase, identity.user_id);
  }

  // 2. If not found and Firebase UID present, try Firebase
  if (firebaseUid) {
    identity = await findIdentityByProvider(supabase, "firebase", firebaseUid);

    if (identity) {
      // Found by Firebase - add Kinde identity for future lookups
      await createIdentity(supabase, {
        user_id: identity.user_id,
        provider: "kinde",
        provider_user_id: kindeId,
        email: email,
        is_primary: false, // Firebase remains primary for legacy users
      });

      await updateLastLogin(supabase, identity.id);
      return await getUserById(supabase, identity.user_id);
    }
  }

  // 3. Not found - create new user
  const user = await createUser(supabase, {
    primary_email: email,
    name: formatName(claims.given_name, claims.family_name),
    picture_url: claims.picture,
    email_verified: true, // Kinde has verified
  });

  // Create Kinde identity (primary for new users)
  await createIdentity(supabase, {
    user_id: user.id,
    provider: "kinde",
    provider_user_id: kindeId,
    email: email,
    is_primary: true,
  });

  // If Firebase UID present, also create Firebase identity
  if (firebaseUid) {
    await createIdentity(supabase, {
      user_id: user.id,
      provider: "firebase",
      provider_user_id: firebaseUid,
      email: claims.firebase_email || email,
      is_primary: false,
    });
  }

  return {
    id: user.id,
    primaryEmail: user.primary_email,
    name: user.name,
    pictureUrl: user.picture_url,
    emailVerified: user.email_verified,
    primaryProvider: "kinde",
    primaryProviderUserId: kindeId,
  };
}

/**
 * Resolve user session with memberships
 */
export async function resolveSession(
  supabase: SupabaseClient,
  claims: KindeTokenClaims
): Promise<ResolvedSession> {
  const user = await resolveUser(supabase, claims);
  const memberships = await getUserMemberships(supabase, user.id);

  return { user, memberships };
}

/**
 * Get user memberships from the v_memberships view
 */
export async function getUserMemberships(
  supabase: SupabaseClient,
  userId: string
): Promise<VMembership[]> {
  const { data, error } = await supabase
    .from("v_memberships")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to get memberships: ${error.message}`);
  }

  return data || [];
}

/**
 * Validate user has access to an org
 */
export async function validateOrgAccess(
  supabase: SupabaseClient,
  userId: string,
  orgRefId: string
): Promise<VMembership | null> {
  const { data, error } = await supabase
    .from("v_memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("org_ref_id", orgRefId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    throw new Error(`Failed to validate org access: ${error.message}`);
  }

  return data || null;
}

// -----------------------------------------------------------------------------
// Internal helpers
// -----------------------------------------------------------------------------

async function findIdentityByProvider(
  supabase: SupabaseClient,
  provider: string,
  providerUserId: string
): Promise<UserIdentity | null> {
  const { data, error } = await supabase
    .from("v_user_identities")
    .select("*")
    .eq("provider", provider)
    .eq("provider_user_id", providerUserId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to find identity: ${error.message}`);
  }

  return data || null;
}

async function getUserById(
  supabase: SupabaseClient,
  userId: string
): Promise<ResolvedUser> {
  const { data, error } = await supabase
    .from("v_users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }

  return {
    id: data.id,
    primaryEmail: data.primary_email,
    name: data.name,
    pictureUrl: data.picture_url,
    emailVerified: data.email_verified,
    primaryProvider: data.primary_provider,
    primaryProviderUserId: data.primary_provider_user_id,
  };
}

async function createUser(
  supabase: SupabaseClient,
  input: CreateUserInput
): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert({
      primary_email: input.primary_email,
      name: input.name || null,
      picture_url: input.picture_url || null,
      email_verified: input.email_verified ?? false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data;
}

interface CreateIdentityInput {
  user_id: string;
  provider: string;
  provider_user_id: string;
  email?: string;
  is_primary?: boolean;
}

async function createIdentity(
  supabase: SupabaseClient,
  input: CreateIdentityInput
): Promise<UserIdentity> {
  const { data, error } = await supabase
    .from("user_identities")
    .insert({
      user_id: input.user_id,
      provider: input.provider,
      provider_user_id: input.provider_user_id,
      email: input.email || null,
      is_primary: input.is_primary ?? false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create identity: ${error.message}`);
  }

  return data;
}

async function updateLastLogin(
  supabase: SupabaseClient,
  identityId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_identities")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", identityId);

  if (error) {
    // Non-fatal - log but don't throw
    console.warn(`Failed to update last_login_at: ${error.message}`);
  }
}

function formatName(
  givenName?: string,
  familyName?: string
): string | undefined {
  const parts = [givenName, familyName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

