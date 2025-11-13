# 🌍 Système Multilingue - OptiMarket

## ✅ Fonctionnalités Implémentées

### 1. **Nouveau Logo**
- ✅ Logo Arqane Vision remplace l'ancien logo
- ✅ Utilise Next.js Image pour l'optimisation
- ✅ Responsive et adaptatif

### 2. **Support de 3 Langues**
- 🇫🇷 **Français** (par défaut)
- 🇬🇧 **English**
- 🇸🇦 **العربية (Arabic)** avec support RTL

### 3. **Sélecteur de Langue**
- ✅ Boutons FR / EN / AR dans le header
- ✅ Sauvegarde de la préférence dans localStorage
- ✅ Changement instantané sans rechargement

### 4. **Support RTL (Right-to-Left)**
- ✅ Direction automatique pour l'arabe
- ✅ `dir="rtl"` appliqué au HTML
- ✅ Layout adapté automatiquement

## 📁 Architecture

### Fichiers Créés

#### 1. `/lib/i18n.ts`
Contient toutes les traductions:
```typescript
export const translations = {
  fr: { home: 'Accueil', catalog: 'Catalogue', ... },
  en: { home: 'Home', catalog: 'Catalog', ... },
  ar: { home: 'الرئيسية', catalog: 'الكتالوج', ... },
};
```

#### 2. `/contexts/LanguageContext.tsx`
Contexte React pour gérer la langue:
```typescript
const { language, setLanguage, t } = useLanguage();
```

### Fichiers Modifiés

#### 1. `/app/layout.tsx`
- Ajout du `LanguageProvider`
- Wrapper autour de toute l'application

#### 2. `/components/layout/Header.tsx`
- Nouveau logo Arqane Vision
- Sélecteur de langue (FR/EN/AR)
- Navigation traduite
- Boutons d'authentification traduits

## 🎯 Utilisation

### Dans un Composant

```typescript
'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function MyComponent() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <h1>{t.heroTitle}</h1>
      <p>{t.heroSubtitle}</p>
      <button onClick={() => setLanguage('ar')}>
        Switch to Arabic
      </button>
    </div>
  );
}
```

### Clés de Traduction Disponibles

#### Navigation
- `home`, `catalog`, `opticians`, `contact`
- `login`, `logout`, `signup`

#### Hero Section
- `heroTitle`, `heroSubtitle`
- `discoverCatalog`, `becomePartner`

#### Features
- `features`, `exclusiveCatalog`, `professionalPrices`, `fastDelivery`

#### Products
- `products`, `search`, `filter`
- `priceOnRequest`, `inStock`, `outOfStock`

#### Product Details
- `backToCatalog`, `reference`, `material`, `gender`
- `shape`, `color`, `description`
- `contactSupplier`, `call`, `whatsapp`

#### Admin
- `adminDashboard`, `manageOpticians`, `newProduct`
- `quickActions`, `pending`, `approved`, `rejected`

#### Forms
- `name`, `email`, `password`, `phone`
- `submit`, `cancel`, `save`

## 🔄 Fonctionnement

### 1. Initialisation
```typescript
// Au chargement, récupère la langue depuis localStorage
const savedLang = localStorage.getItem('language');
// Par défaut: 'fr'
```

### 2. Changement de Langue
```typescript
setLanguage('ar'); // Change vers l'arabe
// → Sauvegarde dans localStorage
// → Applique dir="rtl" au HTML
// → Re-render avec nouvelles traductions
```

### 3. Direction RTL
```typescript
if (language === 'ar') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
} else {
  document.documentElement.dir = 'ltr';
}
```

## 🎨 Interface

### Sélecteur de Langue
```
┌─────────────────┐
│ [FR] [EN] [AR]  │
└─────────────────┘
```

- Boutons groupés avec bordure
- Bouton actif avec fond semi-transparent
- Hover effect sur les boutons inactifs

### Exemple Visuel

**Français:**
```
Accueil | Catalogue | Opticiens | Contact
```

**English:**
```
Home | Catalog | Opticians | Contact
```

**العربية:**
```
الرئيسية | الكتالوج | أخصائيو البصريات | اتصل بنا
```

## 📝 Ajouter une Nouvelle Traduction

### 1. Ajouter la Clé dans `/lib/i18n.ts`

```typescript
export const translations = {
  fr: {
    // ... existing
    myNewKey: 'Mon nouveau texte',
  },
  en: {
    // ... existing
    myNewKey: 'My new text',
  },
  ar: {
    // ... existing
    myNewKey: 'نصي الجديد',
  },
};
```

### 2. Utiliser dans un Composant

```typescript
const { t } = useLanguage();
return <p>{t.myNewKey}</p>;
```

## 🌐 Support RTL

### CSS Automatique
Le support RTL est géré automatiquement par Tailwind CSS:
- `mr-2` devient `ml-2` en RTL
- `text-left` devient `text-right` en RTL
- Flexbox et Grid s'inversent automatiquement

### Forcer une Direction
```typescript
<div className="ltr:text-left rtl:text-right">
  Contenu
</div>
```

## 🚀 Prochaines Étapes

### Pages à Traduire
- [ ] Page d'accueil complète
- [ ] Page catalogue
- [ ] Page détail produit
- [ ] Page opticiens
- [ ] Pages d'authentification (signin/signup)
- [ ] Dashboard admin
- [ ] Formulaires de création

### Améliorations Possibles
- [ ] Détection automatique de la langue du navigateur
- [ ] URLs multilingues (/fr/catalogue, /en/catalog, /ar/الكتالوج)
- [ ] Traduction des messages d'erreur
- [ ] Traduction des emails
- [ ] Traduction du contenu dynamique (produits, descriptions)

## 🔍 Débogage

### Vérifier la Langue Actuelle
```typescript
console.log(language); // 'fr', 'en', ou 'ar'
```

### Vérifier la Direction
```typescript
console.log(document.documentElement.dir); // 'ltr' ou 'rtl'
```

### Réinitialiser la Langue
```typescript
localStorage.removeItem('language');
window.location.reload();
```

## ✅ Checklist Test

- [x] Logo Arqane Vision s'affiche correctement
- [x] Sélecteur de langue visible dans le header
- [x] Clic sur FR/EN/AR change la langue
- [x] Navigation traduite correctement
- [x] Boutons d'authentification traduits
- [x] Langue sauvegardée après rechargement
- [x] Direction RTL appliquée pour l'arabe
- [ ] Toutes les pages traduites
- [ ] Formulaires traduits
- [ ] Messages d'erreur traduits

---

**Dernière mise à jour**: Novembre 2025  
**Statut**: ✅ Système multilingue de base implémenté  
**Langues supportées**: Français 🇫🇷, English 🇬🇧, العربية 🇸🇦
