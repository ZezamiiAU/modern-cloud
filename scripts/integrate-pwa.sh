#!/bin/bash
# PWA Integration Helper Script
# This script helps integrate the v0-zezamii-pass-prd PWA into the modern-cloud monorepo

set -e

echo "🚀 PWA Integration Helper"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
  echo "❌ Error: Please run this script from the monorepo root directory"
  exit 1
fi

# Ask user which option they want
echo "Choose integration method:"
echo "  1) Replace existing apps/daypass (recommended)"
echo "  2) Add as new app (apps/pass-pwa)"
echo "  3) Cancel"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo ""
    echo "📦 Option 1: Replace existing apps/daypass"
    echo "==========================================="

    # Check if PWA directory exists
    if [ ! -d "../v0-zezamii-pass-prd" ]; then
      echo ""
      echo "📥 Cloning v0-zezamii-pass-prd repository..."
      cd ..
      git clone https://github.com/ZezamiiAU/v0-zezamii-pass-prd.git
      cd modern-cloud
    fi

    # Backup existing
    echo "💾 Backing up current apps/daypass to apps/daypass.backup..."
    rm -rf apps/daypass.backup
    cp -r apps/daypass apps/daypass.backup

    # Copy new PWA
    echo "📋 Copying PWA code to apps/daypass..."
    rm -rf apps/daypass/*
    cp -r ../v0-zezamii-pass-prd/* apps/daypass/

    echo ""
    echo "✅ PWA code copied successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Review the integration plan: cat PWA_INTEGRATION_PLAN.md"
    echo "  2. Update apps/daypass/package.json to use workspace packages"
    echo "  3. Run: pnpm install"
    echo "  4. Test: pnpm --filter @app/daypass dev"
    echo ""
    echo "🔄 Run 'git status' to see changes"
    ;;

  2)
    echo ""
    echo "📦 Option 2: Add as new app (apps/pass-pwa)"
    echo "=========================================="

    # Check if PWA directory exists
    if [ ! -d "../v0-zezamii-pass-prd" ]; then
      echo ""
      echo "📥 Cloning v0-zezamii-pass-prd repository..."
      cd ..
      git clone https://github.com/ZezamiiAU/v0-zezamii-pass-prd.git
      cd modern-cloud
    fi

    # Copy to new directory
    echo "📋 Copying PWA code to apps/pass-pwa..."
    rm -rf apps/pass-pwa
    cp -r ../v0-zezamii-pass-prd apps/pass-pwa

    echo ""
    echo "✅ PWA code copied successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Update apps/pass-pwa/package.json:"
    echo "     - Change name to '@app/pass-pwa'"
    echo "     - Add workspace dependencies"
    echo "  2. Update turbo.json to include 'pass-pwa'"
    echo "  3. Run: pnpm install"
    echo "  4. Test: pnpm --filter @app/pass-pwa dev"
    echo ""
    ;;

  3)
    echo "❌ Cancelled"
    exit 0
    ;;

  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "💡 Tip: Review PWA_INTEGRATION_PLAN.md for detailed integration guidance"
