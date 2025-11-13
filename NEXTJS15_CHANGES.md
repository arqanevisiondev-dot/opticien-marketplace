# 🔄 Changements Next.js 15

## ⚠️ Breaking Changes Importants

### 1. Params sont maintenant des Promises

Dans **Next.js 15**, les `params` dans les routes dynamiques et les Route Handlers sont maintenant des **Promises** et doivent être "unwrapped".

#### Pages Dynamiques (Client Components)

**❌ Avant (Next.js 14)**:
```tsx
export default function Page({ params }: { params: { id: string } }) {
  const productId = params.id;
  // ...
}
```

**✅ Après (Next.js 15)**:
```tsx
import { use } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // ...
}
```

#### Route Handlers (API Routes)

**❌ Avant (Next.js 14)**:
```tsx
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = params.id;
  // ...
}
```

**✅ Après (Next.js 15)**:
```tsx
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

## 📝 Fichiers Modifiés dans ce Projet

### Pages
- ✅ `/app/catalogue/[id]/page.tsx` - Utilise `use(params)`

### API Routes
- ✅ `/app/api/products/[id]/route.ts` - Utilise `await params`
- ✅ `/app/api/admin/opticians/[id]/route.ts` - Utilise `await params`

## 🔍 Comment Détecter ce Problème

### Erreurs Typiques

1. **Console Warning**:
```
A param property was accessed directly with `params.id`. 
`params` is a Promise and must be unwrapped with `React.use()` 
before accessing its properties.
```

2. **Erreur 500 dans l'API**:
```
GET http://localhost:3000/api/products/undefined 500 (Internal Server Error)
```

3. **TypeScript Error**:
```
Property 'id' does not exist on type 'Promise<{ id: string }>'
```

## 🛠️ Solution Rapide

### Pour les Pages (Client Components)
```tsx
import { use } from 'react';

// Changer le type
{ params }: { params: Promise<{ id: string }> }

// Unwrap avec use()
const resolvedParams = use(params);
const id = resolvedParams.id;
```

### Pour les API Routes
```tsx
// Changer le type
{ params }: { params: Promise<{ id: string }> }

// Unwrap avec await
const { id } = await params;
```

## 📚 Ressources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Migration Guide](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [React use() Hook](https://react.dev/reference/react/use)

## ✅ Checklist Migration

- [x] Identifier toutes les routes dynamiques `[param]`
- [x] Mettre à jour les types de `params` vers `Promise<>`
- [x] Utiliser `use()` dans les Client Components
- [x] Utiliser `await` dans les Route Handlers
- [x] Tester toutes les routes dynamiques
- [x] Vérifier qu'il n'y a plus d'erreurs dans la console

## 🎯 Impact sur OptiMarket

Ce changement affecte:
- ✅ Page de détail produit (`/catalogue/[id]`)
- ✅ API produit individuel (`/api/products/[id]`)
- ✅ API mise à jour opticien (`/api/admin/opticians/[id]`)

Toutes les routes ont été mises à jour et fonctionnent correctement! 🎉
