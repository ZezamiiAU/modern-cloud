# Partner Portal — Implementation Plan

> **Target repository:** `zezamii-daypass` (Azure DevOps, local `c:\dev\platform\zezamii-daypass`).
> This plan is authored against that repo's structure (`@repo/db`, `@repo/api`,
> `@repo/validators`, `@repo/ui`, `@app/cloud`, Vitest). It was drafted from a
> GitHub-connected session that can only see `ZezamiiAU/modern-cloud`, so
> package/role/tooling references below come from the daypass spec, and
> **file-level paths must be confirmed in-repo during Phase 0**. A working
> mock-backed scaffold was prototyped in `modern-cloud` and is a UX reference to
> port, not the production target.

## Context

We are adding a **partner** capability to the cloud platform. A partner is a lock
installer / reseller who services one or more customer organisations. They want a
portal to see the locks they installed, device health, access activity, and
partner-specific (co-branded) content. Some partners also need to administer the
customer's **Spaces** constructs (not People).

## Key design decisions

1. **Per-org, not cross-org.** A partner logs in and **selects one org at a
   time** using the existing org switcher. There is **no aggregated "all orgs"
   layer** — no `x-partner-id` context, no cross-org aggregation, no partner
   fan-out procedure.
2. **Two partner roles, both org membership roles.** Add both to
   `membershipRoleEnum` (+ `chk_role`), so the existing `selected_org` →
   `x-org-id` → `orgProcedure` machinery scopes them automatically:
   - **`partner`** → *Installed devices only.* Sees only the locks it installed
     (provenance-filtered) and their activity. No People.
   - **`partner_spaces_admin`** → *Spaces admin, no People access.* Can manage
     Spaces constructs across the selected org, but cannot manage People.
3. **Identity is decoupled from access level.** "This user *is* a partner"
   (branding, resources) comes from a global `partner_memberships → partners`
   link. "What they can see/do in org X" comes from the org `memberships.role`.
   Branding/resources persist even if a customer changes their role in one org.
4. **Least privilege, customer-elevated.** Defaults are narrow. If a partner
   needs more, the **customer** changes that partner's org membership role, at
   which point they use the normal dashboard for that org. Memberships are
   **one role per org** (`uq_user_org`), so elevation is a role *change*, not a
   stacked role — no new code.
5. **Device scope for `partner`: only the locks it installed.** A single org
   **can be serviced by more than one partner**, so each partner must see only
   *their* devices. Requires device→partner provenance:
   `device_refs.installedByPartnerId`. Devices and device-scoped activity are
   filtered to `installedByPartnerId = <partner>`. (`partner_spaces_admin`
   manages Spaces org-wide by design — see decision 2 — a deliberately broader,
   customer-granted role.)
6. **Frontend stays in `@app/cloud`.** A partner is a scoped org member, not an
   external cross-org party.
7. **Access is customer-granted.** A partner sees an org **only if the customer
   org grants their account** a `partner` / `partner_spaces_admin` membership,
   via the existing member-invite flow (`memberships.invitedBy` / `invitedAt` /
   `acceptedAt`). Orgs can grant multiple partners and revoke (soft-delete)
   anytime. The global `partners` / `partner_memberships` entity grants **no**
   org access by itself.

## Access levels (explicit customer-facing copy)

Make the difference unambiguous in every grant/role UI:

| Role | Can | Cannot |
| --- | --- | --- |
| `partner` | View the **locks they installed** in this org, their health and access activity, and partner resources | See other partners' devices, People, Billing, Org Admin, or org-wide Spaces |
| `partner_spaces_admin` | **Manage Spaces constructs** across this org (sites/buildings/floors/areas/devices — scope TBD) | **Manage People**, Billing, or Org Admin; it is not a generic org admin |

Copy requirement: the `partner_spaces_admin` grant must state plainly that it
can manage Spaces constructs across the selected org **but cannot manage
People.**

## Phase 0 — Preconditions & branch validation

- Confirm the partner scaffold branch (if any) exists in daypass and is intended
  to merge; validate it against current `main` before coding.
- Confirm authoritative locations in daypass for: `membershipRoleEnum` + role
  check constraint, `orgProcedure`/`adminProcedure`, the schema package
  (`@repo/db` vs `@repo/api`), the view-application script, and the device
  legacy API service.
- Confirm the two-schema situation (`@repo/api` + `@repo/db`) and keep them in
  sync throughout.

## Phase 1 — Schema & migration

- **Roles:** append `"partner"` and `"partner_spaces_admin"` to
  `membershipRoleEnum` and the matching `chk_role` check constraint. Update all
  `MembershipRole` consumers.
- **New tables** (mirror existing `coreSchema` idiom: TS string-literal enums +
  `.$type<...>()` + `check("chk_*", …)` + `index`/`uniqueIndex`):
  - `partners` — `id`, `slug`, `name`, `logoUrl`, `brandColor`, `contactEmail`,
    `tier`.
  - `partner_memberships` — `userId → partnerId`, unique `(userId, partnerId)`.
  - `partner_resources` — `title`, `description`, `category`, `url`,
    `updatedAt`, `coBranded`, `partnerId`.
- **Device provenance (required — decision 5):** add nullable
  `device_refs.installedByPartnerId` FK (→ `partners.id`) + index on
  `(orgRefId, installedByPartnerId)`; `ADD COLUMN IF NOT EXISTS`.
- **Validators:** add/extend Zod schemas in `@repo/validators` for the new
  roles, grant/revoke inputs, and partner entities.
- **Views:** add `v_partner_memberships` (+ `v_partner_resources` if read via
  views) using the confirmed view-application script.
- **Migration:** author the migration in the repo's established style; keep
  `@repo/api` and `@repo/db` aligned. All new constraints/views must be
  **idempotent**.

## Phase 2 — Backend procedures & portal wiring

- **Procedures:**
  - Reuse `orgProcedure` for `partner` reads (auto org-scoped), filtered to
    `installedByPartnerId = <this partner>`.
  - Add a **`spacesAdminProcedure`** authorizing Spaces mutations for
    `{ owner, global_admin, partner_spaces_admin }`; People/Billing/Org-Admin
    mutations stay restricted to `{ owner, global_admin }`. `partner_spaces_admin`
    must never reach People management.
- **Partner router** (`partnerRouter`, mounted in the root router):
  - `getContext` — partner identity + branding for the signed-in user.
  - `listDevices` — org devices filtered to this partner; joined to live health
    (Phase 3).
  - `listActivity` — access events for **this partner's devices in the current
    org only** (never org-wide — that would leak a co-servicing partner's
    events). Confirm the authoritative event source in Phase 0 (see Remaining
    Decisions).
  - `listResources` — `partner_resources` for the user's partner.
- **Gate:** replace the scaffold mock so the portal renders based on the
  resolved role (`partner` / `partner_spaces_admin`); server-side role checks,
  not nav visibility alone.
- **Port the scaffold screens** from the `modern-cloud` prototype into
  `@app/cloud` and wire them to the tRPC queries above.

## Phase 3 — Device health source (on-demand fetch)

`device_refs` carries identity only; health/battery/firmware/last-seen live in
the device platform / legacy MSSQL.

**Decision: on-demand fetch.** `listDevices` calls the legacy device API and
merges live health onto the partner's rows. Notes:

- **Batch** the lookup for the partner's device set (no per-device calls).
- **Short-TTL cache + graceful degradation:** on legacy-API slowness/outage,
  render "unknown / last-known" health rather than failing the page.
- Revisit a synced `device_health` table only if latency/availability bites.

## Phase 4 — Provisioning & granting access

Two actors, two steps:

1. **Register partner identity (internal / Zezamii admin).** Create the
   `partners` row and link users via `partner_memberships`. Identity + branding
   only — no org access.
2. **Grant access (customer org admin).** An `owner`/`global_admin` grants a
   partner account a `partner` or `partner_spaces_admin` membership via the
   existing invite flow. Revoke = soft-delete (`memberships.deletedAt`).

**Grant surface (the "grant partner" setting).** One set of admin-only
mutations, surfaced in **more than one place** via a shared client component
(no duplicated logic):

- Mutations (gate to `owner`/`global_admin`): `grantPartner`, `revokePartner`,
  `listGrantedPartners`.
- Shared `<GrantedPartners />` component (list + add/revoke + partner brand + a
  role selector for `partner` vs `partner_spaces_admin`), mounted in:
  - **Access product** (`Zezamii Access`) — the natural "who has access" home
    (e.g. Permissions / Access Settings).
  - **Admin section** — a partners route + sidebar entry.

## Phase 5 — Device provenance backfill

- Define the source of truth for historical installs before production launch.
- Prefer commissioning/install records where available.
- For unknown historical devices, leave `installedByPartnerId` null until
  verified; **null must not be visible to any partner.**
- Produce an auditable backfill script/report listing:
  - org
  - device ref
  - external device ID
  - assigned partner
  - confidence/source
  - unresolved rows

**Exit criteria:**

- Internal admins can register partner identity.
- Customer admins can grant/revoke partner org access.
- Partner portal returns zero devices until provenance is populated.
- Backfill report exists for existing hardware.

## Phase 6 — Verification

Run targeted checks before broad build checks.

Suggested commands from `c:\dev\platform\zezamii-daypass`:

- `pnpm --filter @repo/db type-check`
- `pnpm --filter @repo/api type-check`
- `pnpm --filter @repo/validators type-check`
- `pnpm --filter @repo/ui type-check`
- `pnpm --filter @app/cloud type-check`
- `pnpm --filter @app/cloud build`
- `pnpm test:run` or targeted Vitest suites if the full suite is too slow

DB verification:

- Apply migration to a disposable DB.
- Apply views using the confirmed view command.
- Inspect tables/views in Drizzle Studio or Supabase.
- Seed:
  - two partners
  - one org with both partners granted
  - devices split across both partners
  - one unassigned device
  - activity for all three device groups

Security test matrix:

| User | Selected org role | Partner identity | Expected result |
| --- | --- | --- | --- |
| Partner A | `partner` | Partner A | Sees only A devices/activity |
| Partner B | `partner` | Partner B | Sees only B devices/activity |
| Partner A | `partner_spaces_admin` | Partner A | Can administer Spaces constructs for selected org |
| Partner A | no membership | Partner A | Forbidden/no org data |
| Normal user | `viewer` | none | No partner portal |
| Org admin | `global_admin` | none | Can grant/revoke partners |
| Org admin | `operator` | none | Cannot grant/revoke partners |
| Partner spaces admin | `partner_spaces_admin` | Partner A | Cannot manage People/Billing/Org Admin |
| Partner user elevated | `viewer` | Partner A | Normal dashboard behavior, not narrow partner portal |

Acceptance criteria:

- No partner can access another partner's devices in the same org.
- No partner can access org-wide activity through partner endpoints.
- `partner_spaces_admin` can manage Spaces constructs without becoming a generic
  org admin.
- `partner_spaces_admin` cannot access People management.
- Soft-deleted partner memberships and org memberships are ignored.
- All new DB constraints and views are idempotent in migration.
- Partner pages are usable with empty state, legacy API failure, and real data.

## Rollout Plan

1. Ship schema and views behind no visible UI.
2. Register one internal/test partner identity.
3. Backfill a small pilot org's device provenance.
4. Enable partner role grant for internal/admin users only.
5. Pilot with one customer org and one partner.
6. Validate logs for forbidden access, legacy API latency, and empty device
   surprises.
7. Enable customer-facing grant UI.
8. Expand partner by partner.

## Rollback Plan

- Hide/remove partner sidebar entry and `/partner` route access.
- Disable grant partner UI while leaving schema in place.
- Stop assigning `installedByPartnerId` for new devices.
- Soft-delete problematic `memberships` rows with role `partner`.
- Keep partner tables and nullable device provenance columns; avoid destructive
  rollback unless a migration has not reached shared environments.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Scaffold branch differs from current repo | Phase 0 requires branch validation before coding. |
| Two schema packages drift | Update `@repo/api` and `@repo/db` together; type-check both. |
| `partner` leaks into normal role hierarchy | Treat `partner` / `partner_spaces_admin` as special roles in UI/nav checks. |
| Activity source lacks device IDs | Validate coverage early; switch to unlock/pass event source if needed. |
| Legacy API latency hurts portal | Batch calls, timeout, short TTL cache, graceful unknown state. |
| Historical device ownership is unclear | Null provenance shows no partner; backfill only verified rows. |
| Existing billing partner model causes confusion | Keep portal identity separate unless a later ADR merges concepts. |
| Existing public procedures bypass role intent | Audit Spaces/People reads and move sensitive org data behind explicit org-scoped procedures. |

## Remaining Decisions

- Is the scaffold branch available and intended to be merged?
- Which file is the authoritative view-application script in this repo?
- Should partner identity allow one user to belong to multiple partner
  organisations at launch, or should that be blocked until a switcher exists?
- What exactly counts as a "Spaces construct" for `partner_spaces_admin`:
  sites/buildings/floors/areas/devices only, or also bookings, booking
  resources, cloud keys, capture forms, QR codes, monitoring, and backup codes?
- What is the authoritative historical install/commissioning source for device
  provenance backfill?
- Which event table is authoritative for unlock/denied activity in the partner
  portal?
