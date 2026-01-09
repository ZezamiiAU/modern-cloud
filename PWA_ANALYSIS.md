# PWA Analysis: v0-zezamii-pass-prd

## Repository Successfully Cloned ✅

**Source:** https://github.com/ZezamiiAU/v0-zezamii-pass-prd
**Cloned to:** `/tmp/v0-zezamii-pass-prd`

---

## Architecture Overview

### Tech Stack

**Frontend:**
- **Framework:** Next.js 15.5.9 (App Router)
- **React:** 19.1.0
- **UI Library:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS v4.1.9
- **Forms:** react-hook-form + @hookform/resolvers
- **Validation:** Zod schemas

**Backend/Data:**
- **Database:** Supabase (PostgreSQL)
- **Auth:** @supabase/ssr
- **API Pattern:** Next.js API Routes (REST-like)

**Payments:**
- **Provider:** Stripe
- **Method:** Payment Intents API
- **Frontend:** @stripe/react-stripe-js, @stripe/stripe-js
- **Backend:** stripe library

**PWA Features:**
- **Service Worker:** `/public/sw.js`
- **Manifest:** Generated dynamically via `/api/manifest`
- **QR Scanner:** html5-qrcode library
- **Offline:** Service worker caching
- **Install Prompts:** `pwa-install-prompt.tsx`

**Other Notable Libraries:**
- **Email:** Resend + @react-email/render
- **Date/Time:** date-fns, luxon
- **Logging:** pino
- **Analytics:** @vercel/analytics
- **Icons:** lucide-react
- **Toast:** sonner

---

## File Structure

```
v0-zezamii-pass-prd/
├── app/
│   ├── api/
│   │   ├── accesspoints/resolve/[orgSlug]/[deviceSlug]/route.ts
│   │   ├── pass-types/route.ts
│   │   ├── passes/by-session/route.ts
│   │   ├── passes/sync-payment/route.ts
│   │   ├── payment-intents/route.ts
│   │   ├── webhooks/stripe/route.ts
│   │   └── wallet/ (apple, google, save)
│   ├── p/
│   │   └── [orgSlug]/[siteSlug]/[deviceSlug]/page.tsx  # Main entry point
│   ├── success/page.tsx                                 # Pass code display
│   ├── offline/page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── pass-purchase-form.tsx # Main purchase flow
│   ├── payment-form.tsx       # Stripe Elements form
│   ├── qr-scanner.tsx         # QR code scanner
│   ├── pwa-install-prompt.tsx # PWA install UI
│   └── service-worker-registration.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser client
│   │   └── server.ts          # Server client
│   ├── api/payments.ts        # Payment API client
│   ├── config/branding.ts     # Org branding config
│   ├── pin-generator.ts       # Pass code generator
│   └── utils.ts
├── public/
│   ├── sw.js                  # Service worker
│   ├── icon-*.jpg             # PWA icons
│   └── images/
├── middleware.ts              # Tenant context middleware
└── package.json
```

---

## User Flow

### 1. QR Code Scan
```
User scans QR code → Redirects to: /p/{orgSlug}/{siteSlug}/{deviceSlug}
```

### 2. Device Resolution
```typescript
// API: /p/[orgSlug]/[siteSlug]/[deviceSlug]/api/route.ts
// Queries Supabase devices table
// Returns: org, site, device info
```

### 3. Landing Page
- Shows org logo, device name, site name
- "Buy Pass" button
- Powered by Zezamii footer

### 4. Pass Purchase Form (`pass-purchase-form.tsx`)
**Fields:**
- Pass Type selection (dropdown)
- Email (required)
- Vehicle Rego (optional)
- Mobile (optional)
- Terms & conditions checkbox

**Flow:**
1. Load pass types from `/api/pass-types`
2. User fills form
3. Creates Stripe PaymentIntent via `/api/payment-intents`
4. Shows Stripe Elements payment form

### 5. Payment Form (`payment-form.tsx`)
- Stripe PaymentElement component
- Confirms payment with `redirect: "if_required"`
- On success → `/success?payment_intent=xxx`

### 6. Success Page (`success/page.tsx`)
**Features:**
- Fetches pass details from `/api/passes/by-session`
- Displays pass code/PIN (large, centered)
- Shows valid from/to times
- Copy code to clipboard
- Offline detection
- Technical details collapsible
- Support email contact

**Additional Features:**
- Retry logic for pending payments
- Sync payment endpoint for delayed processing
- Error handling with detailed logs

---

## Database Schema (Supabase)

Based on the code, the Supabase schema includes:

### `devices` table
```sql
- id (uuid)
- name (text)
- slug (text) -- used for QR URLs
- slug_is_active (boolean)
- custom_name (text)
- custom_description (text)
- custom_logo_url (text)
- org_id (uuid) → organisations.id
- site_id (uuid) → sites.id
```

### `organisations` table
```sql
- id (uuid)
- name (text)
- slug (text) -- used for QR URLs
- brand_settings (jsonb)
- billing_email (text)
```

### `sites` table
```sql
- id (uuid)
- name (text)
```

### `pass_types` table
```sql
- id (uuid)
- name (text)
- code (text)
- description (text)
- price_cents (integer)
- duration_minutes (integer)
- currency (text)
```

### `passes` table
```sql
- id (uuid)
- code (text) -- PIN/access code
- valid_from (timestamp)
- valid_to (timestamp)
- pass_type_id (uuid)
- device_id (uuid)
- vehicle_plate (text)
- email (text)
- phone (text)
- stripe_payment_intent_id (text)
```

---

## Key Components to Port

### 1. **PassPurchaseForm** (`components/pass-purchase-form.tsx`)
- Multi-step form (details → payment)
- Stripe Elements integration
- Pass type selection
- Vehicle/email/phone inputs
- Terms acceptance
- Order summary display
- **Needs:** Replace Supabase API calls with tRPC

### 2. **PaymentForm** (`components/payment-form.tsx`)
- Stripe PaymentElement wrapper
- Payment confirmation logic
- Error handling
- **Needs:** Works as-is, just URL changes

### 3. **Success Page** (`app/success/page.tsx`)
- Pass code display
- QR code for pass (could add)
- Wallet integration buttons
- Retry/sync logic for payments
- **Needs:** Replace Supabase API calls with tRPC

### 4. **Device Landing Page** (`app/p/[orgSlug]/[siteSlug]/[deviceSlug]/page.tsx`)
- Resolves slugs to device/org/site
- Shows branding
- Buy Pass CTA
- **Needs:** Replace Supabase API calls with tRPC

### 5. **UI Components** (`components/ui/*`)
- Already have similar components in `@repo/ui`
- Can copy missing ones (spinner, collapsible, etc.)

### 6. **PWA Assets**
- Service worker (`public/sw.js`)
- PWA manifest (dynamic generation)
- Icons (icon-192.jpg, icon-512.jpg)
- Install prompt component

---

## Integration Strategy

### Recommended Approach: **Hybrid Integration**

**What to Keep:**
1. ✅ UI components (pass-purchase-form, payment-form, success page)
2. ✅ Stripe integration (PaymentElement, payment flow)
3. ✅ PWA features (service worker, manifest, install prompts)
4. ✅ Styling and branding logic
5. ✅ Form validation schemas

**What to Replace:**
1. ❌ Supabase client → tRPC queries
2. ❌ API routes → Use existing tRPC endpoints
3. ❌ Direct database access → Use tRPC router
4. ❌ Package structure → Integrate with monorepo shared packages

---

## tRPC Integration Mapping

### Current Supabase APIs → tRPC Endpoints

| PWA API Route | Purpose | tRPC Equivalent |
|---------------|---------|----------------|
| `/api/accesspoints/resolve/[orgSlug]/[deviceSlug]` | Resolve org/site/device slugs | `public.resolvePathSlugs` ✅ |
| `/api/pass-types?orgId=xxx` | Get available pass types | `public.getPassTypes` ✅ |
| `/api/payment-intents` | Create Stripe payment intent | `daypass.createPaymentIntent` ✅ |
| `/api/passes/by-session?payment_intent=xxx` | Get pass after payment | `daypass.issuePass` (needs update) |
| `/api/webhooks/stripe` | Stripe webhook handler | Keep as API route |

### New tRPC Endpoints Needed:

1. **`daypass.getPassByPaymentIntent`**
   ```typescript
   getPassByPaymentIntent: publicProcedure
     .input(z.object({ paymentIntentId: z.string() }))
     .query(async ({ input, ctx }) => {
       // Verify payment with Stripe
       // Return pass details with code
     })
   ```

2. **`daypass.syncPayment`** (for retry logic)
   ```typescript
   syncPayment: publicProcedure
     .input(z.object({ paymentIntentId: z.string() }))
     .mutation(async ({ input, ctx }) => {
       // Sync payment status from Stripe
       // Update pass record
     })
   ```

---

## Missing Features in Current Backend

Comparing PWA to our current backend:

### ✅ Already Implemented:
- Pass types table
- Stripe payment intents
- Pass code generation
- Slug resolution
- Database schema

### ❌ Need to Add:
1. **Vehicle Plate Field**
   - Add `vehiclePlate` to passes table
   - Update `createPaymentIntent` input schema

2. **Phone Field**
   - Add `phone` to passes table (optional)
   - For SMS sharing feature

3. **Pass Retrieval by Payment Intent**
   - Query passes by `stripePaymentIntentId`
   - Include all details for success page

4. **Payment Sync Endpoint**
   - Handle delayed Stripe webhook delivery
   - Manually sync payment status

5. **Wallet Integration**
   - Apple Wallet pass generation
   - Google Wallet pass generation
   - JWT signing for unlock codes

6. **Email Notifications**
   - Pass confirmation email
   - Include pass code, QR code, validity

---

## Dependencies to Add

### Production Dependencies:
```json
{
  "html5-qrcode": "latest",          // QR scanner (if needed)
  "qrcode": "^1.5.0",                // QR code generation for pass display
  "qrcode.react": "^3.1.0",          // React QR component
  "sonner": "latest",                // Toast notifications
  "date-fns": "4.1.0",               // Date formatting
  "input-otp": "latest"              // OTP input (if needed)
}
```

### Dev Dependencies:
```json
{
  "@types/qrcode": "^1.5.0"
}
```

Most other dependencies already exist in monorepo.

---

## Step-by-Step Integration Plan

### Phase 1: Prepare Backend (Priority)
1. ✅ Pass types table - DONE
2. ✅ Slug resolution - DONE
3. ⏳ Add vehicle_plate and phone to passes table
4. ⏳ Add getPassByPaymentIntent tRPC endpoint
5. ⏳ Add syncPayment tRPC endpoint
6. ⏳ Update createPaymentIntent to include vehicle/phone

### Phase 2: Copy UI Components
1. Copy `components/pass-purchase-form.tsx` → `apps/daypass/src/components/`
2. Copy `components/payment-form.tsx`
3. Copy `app/success/page.tsx` → `apps/daypass/src/app/success/`
4. Copy missing UI components (spinner, collapsible, etc.)

### Phase 3: Replace Data Layer
1. Replace Supabase imports with tRPC hooks
2. Update PassPurchaseForm to use `trpc.public.getPassTypes`
3. Update device page to use `trpc.public.resolvePathSlugs`
4. Update success page to use `trpc.daypass.getPassByPaymentIntent`

### Phase 4: PWA Features
1. Copy `public/sw.js`
2. Copy PWA icons (icon-192.jpg, icon-512.jpg)
3. Add PWA manifest generation
4. Copy `pwa-install-prompt.tsx`
5. Copy `service-worker-registration.tsx`

### Phase 5: Testing
1. Test QR URL flow: `/p/test-org/melbourne-cbd/front-door`
2. Test pass type loading
3. Test Stripe payment flow
4. Test success page display
5. Test PWA install
6. Test offline functionality

---

## Environment Variables Needed

```env
# Stripe (already have these)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (if using Resend)
RESEND_API_KEY=re_...

# Support contact
NEXT_PUBLIC_SUPPORT_EMAIL=support@zezamii.com

# API URL (already configured)
NEXT_PUBLIC_API_URL=http://localhost:3000/api/trpc
```

---

## Risks & Considerations

### 1. **Dual Database Architecture**
**Risk:** PWA uses Supabase, monorepo uses Drizzle+Postgres
**Solution:** Replace all Supabase calls with tRPC → Single source of truth

### 2. **Service Worker Conflicts**
**Risk:** Multiple apps with different service workers
**Solution:** Namespace service worker to daypass app only

### 3. **Stripe Webhook Handling**
**Risk:** Webhooks need to reach both apps
**Solution:** Keep webhook in API package, shared by all apps

### 4. **Different Data Schemas**
**Risk:** PWA expects `duration_minutes`, we have `duration_hours`
**Solution:** Convert in tRPC layer or update schema

### 5. **Slug Resolution Logic**
**Risk:** PWA expects org-device, we have org-site-device
**Solution:** Already handled in `resolvePathSlugs` endpoint

---

## Recommendations

### 1. **Use PWA UI, Replace Backend** ⭐ RECOMMENDED
- Keep all UI components, forms, flows
- Replace Supabase with tRPC throughout
- Single codebase, single database
- Easier maintenance

**Pros:**
- ✅ Clean architecture
- ✅ Type safety with tRPC
- ✅ Single database
- ✅ Leverages existing backend work

**Cons:**
- ⚠️ More initial work to replace Supabase calls
- ⚠️ Need to update some backend schemas

### 2. **Dual Backend (Not Recommended)**
- Keep Supabase client in PWA
- Add tRPC for new features
- Two databases, sync required

**Pros:**
- ✅ Less initial work

**Cons:**
- ❌ Data synchronization issues
- ❌ Dual database maintenance
- ❌ More complex deployment

---

## Next Steps

1. **Review this analysis** with the team
2. **Confirm integration approach** (Recommend #1)
3. **Update backend schema** (add vehicle_plate, phone fields)
4. **Add missing tRPC endpoints** (getPassByPaymentIntent, syncPayment)
5. **Start UI integration** (copy components, replace Supabase)
6. **Test end-to-end flow**
7. **Deploy and verify**

---

## Files to Review

**Key PWA files to understand before integration:**

1. `components/pass-purchase-form.tsx` - Main purchase flow
2. `components/payment-form.tsx` - Stripe integration
3. `app/success/page.tsx` - Pass display
4. `app/p/[orgSlug]/[siteSlug]/[deviceSlug]/page.tsx` - Entry point
5. `lib/api/payments.ts` - Payment API client
6. `lib/pin-generator.ts` - Pass code generation logic
7. `public/sw.js` - Service worker implementation

**Current monorepo files to update:**

1. `packages/api/src/db/schema/passes.ts` - Add vehicle_plate, phone
2. `packages/api/src/router/daypass.ts` - Add new endpoints
3. `apps/daypass/src/app/pass/[slug]/page.tsx` - Replace with PWA version
4. `apps/daypass/package.json` - Add new dependencies

---

## Estimated Effort

- **Backend Updates:** 2-3 hours
- **UI Component Integration:** 3-4 hours
- **tRPC Integration:** 2-3 hours
- **PWA Features:** 1-2 hours
- **Testing:** 2-3 hours
- **Total:** ~10-15 hours

---

## Conclusion

The PWA is production-ready with excellent UX, PWA features, and Stripe integration. The main work is replacing Supabase with our tRPC backend to maintain a clean monorepo architecture. The UI/UX should be kept largely as-is, as it's well-designed and mobile-optimized.

**Recommendation:** Proceed with Option 1 (Use PWA UI, Replace Backend) for cleanest long-term architecture.
