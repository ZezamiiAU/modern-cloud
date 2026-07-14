# Partner Portal — Implementation Plan

> Status: **Plan** (scaffold merged; production not yet started)
> Branch: `claude/partner-portal-role-vqyp17`

## Context

We are adding a **partner** role to the cloud platform. A partner is a lock
installer / reseller who services one or more customer organisations. They want
a portal to see the locks they installed, device health, access activity, and
partner-specific (co-branded) content.

A scaffold already exists (mock-backed) to validate UX:

- Contract stub: `packages/api/src/partner/types.ts` (exported from `@repo/api`)
- Portal + gate: `apps/cloud/src/app/partner/*`, `apps/cloud/src/lib/partner/*`
- Sidebar product: "Zezamii Partner" in `packages/ui/src/components/zezamii-sidebar.tsx`

This document is the plan to take that scaffold to production.

## Key design decisions (agreed)

1. **Per-org, not cross-org.** A partner logs in and **selects one org at a
   time** using the existing org switcher. There is **no aggregated "all orgs"
   layer**. This deletes the hardest parts of earlier drafts: no `x-partner-id`
   context, no cross-org aggregation views, no partner-scoped fan-out procedure.
2. **`partner` is an org membership role.** Add `"partner"` to
   `membershipRoleEnum`. A partner gets a normal `memberships` row (role
   `partner`) in each org they service, so the existing `selected_org` cookie →
   `x-org-id` → `orgProcedure` machinery handles all scoping with **zero new
   backend plumbing**.
3. **Identity is decoupled from access level.** "This user *is* a partner"
   (branding, resources) comes from a global `partner_memberships → partners`
   link. "What they can see in org X" comes from the org `memberships.role`.
   Branding/resources persist even if a customer changes their role in one org.
4. **Least privilege, customer-elevated.** Default `partner` role = a narrow,
   device-focused view. If a partner needs more, the **customer** changes that
   partner's org membership role (`partner` → `viewer` / `global_user`), at
   which point they drop into the normal cloud dashboard for that org. Note:
   memberships are **one role per org** (`uq_user_org`), so elevation is a role
   *change*, not a stacked second role. No new code — this is existing
   role machinery.
5. **Device scope: only the locks the partner installed.** Because a single org
   **can be serviced by more than one partner** (confirmed), each partner must
   see only *their* devices, not another partner's. This requires device→partner
   provenance: an `installedByPartnerId` column on `device_refs`. Devices and
   device-scoped activity are filtered to `installedByPartnerId = <partner>`.
   (If a customer elevates the partner's org role to `viewer`/`global_user`,
   they leave the partner view and see the whole org's normal dashboard — that
   broader access is the customer's explicit grant.)
6. **Frontend stays in `apps/cloud`.** Since a partner is a scoped org member
   (not an external cross-org party), the separate-app rationale falls away. The
   existing scaffold screens get wired to real per-org data.

## Phase 1 — Schema & migration

Follow the existing idiom in `packages/api/src/db/schema/orgs.ts` and
`sites.ts`: TS string-literal enum tuples + a text column typed with
`.$type<...>()` + a matching `check("chk_*", sql\`... IN (...)\`)` constraint;
`chk_*_slug` regex checks; indexes via `index(...)` / `uniqueIndex(...)`; all
tables declared as `coreSchema.table(...)`.

- **Add the role:** append `"partner"` to `membershipRoleEnum` and extend the
  `chk_role` check constraint in `orgs.ts`. Update the `MembershipRole` type
  consumers as needed.
- **New tables** (`coreSchema`), exported from `db/schema/index.ts` and the
  package `index.ts`:
  - `partners` — brand identity: `id`, `slug`, `name`, `logoUrl`, `brandColor`,
    `contactEmail`, `tier`. (Mirrors the `Partner` interface already in
    `partner/types.ts`.)
  - `partner_memberships` — `userId → partnerId` link (who logs in as this
    partner). Unique on `(userId, partnerId)`.
  - `partner_resources` — co-branded content: `title`, `description`,
    `category`, `url`, `updatedAt`, `coBranded`, `partnerId`.
- **Device provenance (required — see decision 5):** add a nullable
  `installedByPartnerId` FK column to `device_refs` (→ `partners.id`) plus an
  index on `(orgRefId, installedByPartnerId)`. This is an `ALTER TABLE` on an
  existing ref table; use `ADD COLUMN IF NOT EXISTS` in the migration. Backfill
  is a provisioning concern (Phase 4).
- **Views:** add `v_partner_memberships` (partner + user join) and, if resources
  are read via views, `v_partner_resources`, to the views SQL. The resolver
  reads `public.v_*` views, never `core.*` tables directly (repo convention:
  views are the stable, additive-only contract for tRPC).
- **Migration:** hand-write `packages/api/drizzle/0004_add_partners.sql` in the
  existing `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE ... ADD ... IF NOT EXISTS`
  style, plus the view definitions. Apply with `pnpm db:push && pnpm db:views`
  from `packages/api` (note: `_journal.json` only tracks `0000`; later
  migrations are applied out-of-band via push, matching current practice).

Files: `packages/api/src/db/schema/orgs.ts`,
`packages/api/src/db/schema/partners.ts` (new),
`packages/api/src/db/schema/index.ts`, `packages/api/src/index.ts`,
`packages/api/drizzle/0004_add_partners.sql` (new), views SQL.

## Phase 2 — Portal wiring (real data)

- **Partner router:** add `partnerRouter` in `packages/api/src/router/` and mount
  it in `router/index.ts` (currently `health, public, daypass, events, legacy,
  admin`). Use the existing **`orgProcedure`** (no new middleware) so everything
  is auto-scoped to the selected org:
  - `getContext` — the signed-in user's partner identity + branding.
  - `listDevices` — devices in the current org **filtered to
    `installedByPartnerId = <this partner>`** (joined to live health — Phase 3).
  - `listActivity` — access events for **this partner's devices in the current
    org**. Source note: `audit_log` is org-scoped with no device/site column, so
    filter its rows by `resourceType = 'device'` + `resourceId IN (<partner's
    device ids>)`; validate coverage, and fall back to device/pass events
    (which carry device + `site_ref_id`) if `audit_log` doesn't record every
    unlock. Showing *all* org activity is not acceptable here — it would leak a
    co-servicing partner's events.
  - `listResources` — `partner_resources` for the user's partner.
- **Swap the gate:** replace the mock in `apps/cloud/src/lib/partner/context.ts`
  (`isPartnerUser`, `getPartnerContext`) so the portal renders when the selected
  org's `membership.role === "partner"`; resolve branding/resources from the
  partner identity. Delete reliance on `apps/cloud/src/lib/partner/mock-data.ts`.
- **Server-side role check:** render partner pages based on the resolved role —
  do not rely on nav visibility alone.

Files: `packages/api/src/router/partner.ts` (new),
`packages/api/src/router/index.ts`, `apps/cloud/src/lib/partner/context.ts`,
`apps/cloud/src/app/partner/*` (swap mock imports for tRPC queries).

## Phase 3 — Device health source

`device_refs` has **no telemetry** (`externalDeviceId`, `slug`, `deviceType`,
`displayName` only). Health / battery / firmware / last-seen live in the device
platform / legacy MSSQL.

**Decision: on-demand fetch (A).** `listDevices` calls the legacy device API via
`packages/api/src/services/legacy-api.ts` and merges live health onto the
partner's `device_refs` rows — no new storage, always fresh. Implementation
notes:

- **Batch** the lookup (one call for the partner's device set), don't fetch
  per-device, to keep portal loads fast.
- **Short-TTL cache / graceful degradation:** if the legacy API is slow or down,
  render devices with an "unknown / last-known" health state rather than failing
  the whole page.
- Revisit a synced `device_health` table later only if latency or legacy-API
  availability becomes a real problem.

## Phase 4 — Provisioning

Internal-admin flow (tRPC first, UI later) to:

- create a `partners` row,
- link users via `partner_memberships`,
- grant `partner` `memberships` rows in each org the partner services.

Elevation ("give this partner full access to my org") needs **no new code** —
the customer changes the partner's org membership role through existing role
management.

## Verification

- **Phase 1:** `cd packages/api && pnpm db:push && pnpm db:views`; confirm tables
  + views in `pnpm db:studio`.
- **Phase 2:** assert a `partner`-role membership renders the portal and a
  non-partner role does not; confirm `orgProcedure` scopes every read to the
  selected org. `MOCK_AUTH=1 next build` in `apps/cloud` stays green (already
  verified for the scaffold).
- **Phase 3–4:** seed a partner + memberships; drive the portal end-to-end for a
  selected org and confirm devices / activity / resources render from real data.

## Resolved decisions

1. **Device health source → on-demand fetch** from the legacy device API
   (Phase 3, option A), batched with graceful degradation.
2. **Multi-partner orgs → yes.** A single org can be serviced by more than one
   partner, so `device_refs.installedByPartnerId` provenance is **required**
   (decision 5); devices and activity are filtered to the partner's own locks.

## Remaining unknowns (validate during implementation)

- **`audit_log` coverage** — confirm unlock/denied events are recorded with
  `resourceType = 'device'` + `resourceId`; if not, source activity from
  device/pass events instead (Phase 2, `listActivity`).
- **Backfill** — how existing `device_refs` get their `installedByPartnerId`
  populated for already-installed hardware (Phase 4 provisioning).
