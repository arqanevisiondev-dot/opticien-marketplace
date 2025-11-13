#!/bin/bash

echo "🚀 Setting up Product Options Management"
echo "========================================"
echo ""

echo "Step 1: Generating Prisma Client..."
npx prisma generate

echo ""
echo "Step 2: Creating database migration..."
npx prisma migrate dev --name add_product_options

echo ""
echo "Step 3: Seeding default materials and genders..."
npx tsx prisma/seed-options.ts

echo ""
echo "✅ Product options system is ready!"
echo ""
echo "Default options added:"
echo "  Materials: Métal, Plastique, Titane, Acétate, Bois, Aluminium, Carbone"
echo "  Genders: Homme, Femme, Unisexe, Enfant"
echo ""
echo "You can now:"
echo "  1. Start the dev server: pnpm dev"
echo "  2. Login as admin"
echo "  3. Navigate to /admin/settings to manage materials and genders"
echo ""
