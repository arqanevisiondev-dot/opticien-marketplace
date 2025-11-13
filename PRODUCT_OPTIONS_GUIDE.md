# Product Options Management Guide

## Overview
A complete system to manage materials and genders for your products through an admin interface.

## Features
✅ **Add/Delete Materials** - Manage available material options (Métal, Plastique, Titane, etc.)
✅ **Add/Delete Genders** - Manage gender categories (Homme, Femme, Unisexe, Enfant)
✅ **Admin UI** - Clean interface at `/admin/settings`
✅ **Multilingual** - Full support for FR/EN/AR
✅ **Dynamic Filters** - Catalogue page automatically shows only materials/genders that exist in products

## Setup Instructions

### 1. Run the Migration

```bash
# Option 1: Use the setup script
./setup-product-options.sh

# Option 2: Manual steps
npx prisma generate
npx prisma migrate dev --name add_product_options
npx tsx prisma/seed-options.ts
```

### 2. Restart Dev Server

```bash
pnpm dev
```

## How to Use

### As Admin:

1. **Navigate to Settings**
   - Go to `/admin`
   - Click "Product Options" button (Settings icon)
   - Or directly visit `/admin/settings`

2. **Add Material**
   - Enter material name (e.g., "Carbone")
   - Click "Ajouter"
   - Material is now available for products

3. **Add Gender**
   - Enter gender name (e.g., "Adolescent")
   - Click "Ajouter"
   - Gender is now available for products

4. **Delete Option**
   - Click trash icon next to any material or gender
   - Option is removed from the list
   - **Note**: Existing products keep their values

## Database Structure

### ProductOption Model
```prisma
model ProductOption {
  id        String   @id @default(cuid())
  type      String   // "material" or "gender"
  value     String
  createdAt DateTime @default(now())
  
  @@unique([type, value])
  @@index([type])
}
```

## API Endpoints

### GET `/api/admin/product-options`
Fetch all options or filter by type
```bash
# Get all options
GET /api/admin/product-options

# Get only materials
GET /api/admin/product-options?type=material

# Get only genders
GET /api/admin/product-options?type=gender
```

### POST `/api/admin/product-options`
Create new option
```json
{
  "type": "material",
  "value": "Carbone"
}
```

### DELETE `/api/admin/product-options/[id]`
Delete an option

## Default Options

### Materials (7 options)
- Métal
- Plastique
- Titane
- Acétate
- Bois
- Aluminium
- Carbone

### Genders (4 options)
- Homme
- Femme
- Unisexe
- Enfant

## How It Works with Products

### Current Behavior
The catalogue page filters are **dynamic** - they show only materials and genders that actually exist in your products:

```typescript
// Automatically generated from products
const uniqueMaterials = Array.from(new Set(products.map(p => p.material).filter(Boolean)));
const uniqueGenders = Array.from(new Set(products.map(p => p.gender).filter(Boolean)));
```

### Future Enhancement (Optional)
You can update the product creation form to use these predefined options:

1. **Update `/app/admin/products/new/page.tsx`**
2. **Fetch options from API**
3. **Replace text inputs with dropdowns**

Example:
```typescript
// Fetch materials
const [materials, setMaterials] = useState([]);

useEffect(() => {
  fetch('/api/admin/product-options?type=material')
    .then(res => res.json())
    .then(data => setMaterials(data));
}, []);

// Use in form
<select>
  {materials.map(m => (
    <option key={m.id} value={m.value}>{m.value}</option>
  ))}
</select>
```

## Important Notes

1. **Deleting Options**
   - Deleting a material/gender does NOT affect existing products
   - Products keep their current values
   - Only removes the option from the management list

2. **Adding Options**
   - New options are immediately available
   - Can be used when creating new products
   - Appear in catalogue filters only when products use them

3. **Duplicate Prevention**
   - System prevents duplicate materials/genders
   - Unique constraint on `[type, value]`

## Files Created/Modified

### Created:
- `/app/admin/settings/page.tsx` - Settings UI
- `/app/api/admin/product-options/route.ts` - List & Create API
- `/app/api/admin/product-options/[id]/route.ts` - Delete API
- `/prisma/seed-options.ts` - Default options seeder
- `/setup-product-options.sh` - Setup script
- `/PRODUCT_OPTIONS_GUIDE.md` - This guide

### Modified:
- `/prisma/schema.prisma` - Added ProductOption model
- `/lib/i18n.ts` - Added translations
- `/app/admin/page.tsx` - Added Settings button
- `/app/catalogue/page.tsx` - Dynamic filters (already done)

## Troubleshooting

### TypeScript Errors
If you see `Property 'productOption' does not exist`:
1. Run `npx prisma generate`
2. Restart your IDE/dev server

### 404 on `/api/admin/product-options`
1. Restart dev server
2. Check migration was applied: `npx prisma migrate status`

### Options Not Showing
1. Check you're logged in as ADMIN
2. Verify migration ran successfully
3. Check browser console for errors

## Next Steps (Optional)

1. **Update Product Form**
   - Add dropdowns for material/gender selection
   - Use predefined options instead of free text

2. **Add More Option Types**
   - Colors
   - Shapes
   - Brands

3. **Bulk Import**
   - CSV upload for multiple options
   - Import from existing products

4. **Usage Statistics**
   - Show how many products use each option
   - Prevent deletion of options in use
