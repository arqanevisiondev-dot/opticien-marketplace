# Category Management Setup Guide

## Overview
A complete category CRUD system has been added to the admin dashboard with the following features:
- ✅ Create, Read, Update, Delete categories
- ✅ Product count tracking per category
- ✅ Protected deletion (categories with products require confirmation)
- ✅ Force delete option (unlinks products from category)
- ✅ Search functionality
- ✅ Modern UI with modals
- ✅ Multilingual support (FR/EN/AR)

## Database Migration Required

The Prisma schema has been updated to include the `Category` model. You need to run migrations:

```bash
# Generate Prisma client with new schema
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_categories

# Or reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Features Implemented

### 1. Database Schema
- **Category Model** with fields:
  - `id`: Unique identifier
  - `name`: Category name (unique)
  - `slug`: URL-friendly slug (auto-generated)
  - `description`: Optional description
  - `products`: Relation to products
  - Timestamps: `createdAt`, `updatedAt`

- **Product Model** updated with:
  - `categoryId`: Optional foreign key
  - `category`: Relation to Category (onDelete: SetNull)

### 2. API Routes

#### GET `/api/admin/categories`
- Fetches all categories with product count
- Admin authentication required

#### POST `/api/admin/categories`
- Creates new category
- Auto-generates unique slug from name
- Admin authentication required

#### PUT `/api/admin/categories/[id]`
- Updates existing category
- Regenerates slug if name changes
- Admin authentication required

#### DELETE `/api/admin/categories/[id]`
- Deletes category
- **Protection**: Prevents deletion if category has products
- **Force Delete**: Use `?force=true` query parameter to delete anyway
  - Products will be unlinked (categoryId set to null)
- Admin authentication required

### 3. Admin UI

#### Category Management Page (`/admin/categories`)
- **List View**: Table showing all categories with:
  - Category name and slug
  - Description
  - Product count
  - Edit and Delete actions
- **Search**: Real-time search by name or description
- **Create Modal**: Form to add new category
- **Edit Modal**: Form to update existing category
- **Delete Confirmation**: 
  - Shows product count
  - Requires force confirmation if products exist
  - Warning message for force delete

#### Admin Dashboard Integration
- New "Manage Categories" button in Quick Actions
- Uses FolderTree icon
- Grid layout adjusted to 4 columns

### 4. Translations
All text is translated in French, English, and Arabic:
- Category management labels
- Form fields
- Success/error messages
- Confirmation dialogs

## Deletion Protection Logic

### Standard Delete
1. User clicks delete button
2. System checks if category has products
3. If no products: Delete immediately
4. If has products: Show warning with product count

### Force Delete
1. User confirms force delete
2. Category is deleted
3. All products linked to this category have `categoryId` set to `null`
4. Products remain in database but are uncategorized

This ensures data integrity while giving admins flexibility.

## Usage

### As Admin:
1. Navigate to `/admin`
2. Click "Manage Categories" in Quick Actions
3. Use the interface to:
   - Create new categories
   - Edit existing ones
   - Search categories
   - Delete categories (with protection)

### Category Assignment to Products:
The product creation/edit forms will need to be updated separately to allow selecting a category. This is not included in the current implementation but the database structure supports it.

## Next Steps (Optional Enhancements)

1. **Add category selector to product forms**
   - Update `/admin/products/new/page.tsx`
   - Add category dropdown

2. **Filter products by category**
   - Update catalog page
   - Add category filter UI

3. **Category images**
   - Add image field to Category model
   - Display in category cards

4. **Category hierarchy**
   - Add parent/child relationships
   - Support subcategories

## Technical Notes

- **Slug Generation**: Uses the existing `slugify` utility
- **Unique Slugs**: Auto-increments if duplicate (e.g., `sunglasses-2`)
- **Soft Relations**: Products use `onDelete: SetNull` to prevent cascade deletion
- **Type Safety**: Full TypeScript support with Prisma types
- **Error Handling**: Comprehensive error messages in all API routes
