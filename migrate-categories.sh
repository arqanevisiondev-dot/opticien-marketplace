#!/bin/bash

echo "🚀 Setting up Category Management System"
echo "========================================"
echo ""

echo "Step 1: Generating Prisma Client..."
npx prisma generate

echo ""
echo "Step 2: Creating database migration..."
npx prisma migrate dev --name add_categories

echo ""
echo "✅ Category system is ready!"
echo ""
echo "You can now:"
echo "  1. Start the dev server: pnpm dev"
echo "  2. Login as admin"
echo "  3. Navigate to /admin/categories"
echo ""
echo "📖 See CATEGORY_SETUP.md for full documentation"
