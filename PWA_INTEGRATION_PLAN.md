# PWA Integration Plan

## Current Status

### Repository Access Issue
- **Target Repo:** `https://github.com/ZezamiiAU/v0-zezamii-pass-prd`
- **Status:** Private repository - requires authentication to access
- **Action Needed:** Grant access or provide code manually

### Existing PWA App Found
Location: `apps/daypass`

**Current Implementation:**
- ✅ Next.js 14 with App Router
- ✅ PWA manifest configured (`public/manifest.json`)
- ✅ tRPC integration with backend API
- ✅ Shared packages (`@repo/api`, `@repo/ui`, `@repo/config`)
- ✅ Basic pass purchase flow UI
- ⏳ Stripe payment integration (placeholder)
- ⏳ QR code display (demo code only)
- ⏳ Pass code generation (hardcoded demo)

**Current Features:**
1. Landing page with QR code explanation
2. Pass selection page at `/pass/[slug]`
3. Multi-step purchase flow:
   - Select pass type
   - Enter user details (name, email)
   - Payment screen (Stripe placeholder)
   - Success screen with demo pass code

## Integration Options

### Option 1: Replace Existing Daypass App
**Best if:** The new PWA is a complete rewrite or significantly different architecture

**Steps:**
1. Backup current `apps/daypass` to `apps/daypass.backup`
2. Copy new PWA code to `apps/daypass`
3. Update package.json to use monorepo shared packages:
   - `@repo/api` - Backend API client
   - `@repo/ui` - Shared UI components
   - `@repo/config` - Shared configuration
4. Ensure tRPC integration matches existing pattern
5. Update import paths to use shared packages
6. Test PWA manifest and icons

### Option 2: Merge/Enhance Existing Daypass App
**Best if:** The new PWA has specific features to add to current implementation

**Steps:**
1. Copy new features/components into existing `apps/daypass`
2. Integrate with current tRPC setup
3. Update UI components to use `@repo/ui`
4. Merge PWA configurations
5. Keep existing monorepo integration intact

### Option 3: Add as New Separate App
**Best if:** You need both PWAs running simultaneously (e.g., different customers/purposes)

**Steps:**
1. Create new app directory: `apps/pass-pwa`
2. Copy new PWA code there
3. Update `turbo.json` to include new app
4. Configure different port (e.g., 3002)
5. Integrate with shared packages

## Current Daypass App Structure

```
apps/daypass/
├── src/
│   ├── app/
│   │   ├── api/trpc/[trpc]/route.ts  # tRPC endpoint
│   │   ├── layout.tsx                 # Root layout with PWA head tags
│   │   ├── page.tsx                   # Landing page
│   │   ├── pass/[slug]/
│   │   │   ├── page.tsx              # Pass purchase page
│   │   │   └── pass-purchase-flow.tsx # Multi-step flow component
│   │   └── providers.tsx             # React Query + tRPC providers
│   └── lib/
│       └── trpc.ts                    # tRPC client setup
├── public/
│   └── manifest.json                  # PWA manifest
├── package.json
└── next.config.js
```

## What the New PWA Should Include

Based on previous discussion and backend implementation:

### Core Features Needed:
1. **QR Code Scanning Landing**
   - URL pattern: `/p/{orgSlug}/{siteSlug}/{deviceSlug?}`
   - Resolve slugs using `resolvePathSlugs` tRPC endpoint
   - Display site name and available pass types

2. **Pass Type Selection**
   - Fetch from `passTypes` table via tRPC
   - Show pricing, duration, description
   - Site-specific filtering

3. **Stripe Payment Integration**
   - Use `createPaymentIntent` tRPC endpoint
   - Stripe Elements for card input
   - Handle 3D Secure / SCA

4. **Pass Code Display**
   - QR code generation for pass code
   - Using libraries: `qrcode`, `qrcode.react`, or `qr-code-styling`
   - Save to wallet functionality
   - Email confirmation

5. **PWA Features**
   - Offline support (service worker)
   - App icons (192x192, 512x512)
   - Splash screens
   - Add to home screen prompts

### Integration Requirements:

**1. Use Monorepo Shared Packages:**
```json
{
  "dependencies": {
    "@repo/api": "workspace:*",
    "@repo/ui": "workspace:*",
    "@repo/config": "workspace:*"
  }
}
```

**2. tRPC Endpoints to Use:**
- `public.resolvePathSlugs` - Convert org/site/device slugs to IDs
- `public.getPassTypes` - Get available pass types for a site
- `daypass.createPaymentIntent` - Create Stripe payment
- `daypass.verifyPayment` - Verify and issue pass after payment
- `daypass.issuePass` - Get issued pass details

**3. Environment Variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Next Steps

### To Grant Repository Access:
1. Go to: https://github.com/ZezamiiAU/v0-zezamii-pass-prd/settings/access
2. Add collaborator or make repo public temporarily
3. I'll clone and review the code

### OR Manual Copy:
1. Clone the repo locally:
   ```bash
   git clone https://github.com/ZezamiiAU/v0-zezamii-pass-prd.git /tmp/pwa
   ```
2. Copy to modern-cloud:
   ```bash
   # Option 1: Replace existing
   rm -rf apps/daypass
   cp -r /tmp/pwa apps/daypass

   # Option 2: Add as new app
   cp -r /tmp/pwa apps/pass-pwa
   ```
3. Update package.json and integrations
4. Let me know and I'll complete the integration

## Recommended Approach

**I recommend Option 2 (Merge/Enhance)** because:
- ✅ Keeps existing tRPC integration working
- ✅ Leverages shared packages already set up
- ✅ Less risk of breaking changes
- ✅ Incremental improvement approach

**Next:** Once I can access the code, I'll:
1. Review the PWA's current implementation
2. Identify what to keep from existing `apps/daypass`
3. Merge in production-ready features from v0-zezamii-pass-prd
4. Ensure all integrations work with the backend we just built
5. Test the complete flow end-to-end
