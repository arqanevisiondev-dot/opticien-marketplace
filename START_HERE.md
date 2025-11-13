# 🎉 Bienvenue sur OptiMarket!

## 🚀 Démarrage en 3 Étapes

### 1️⃣ Configuration (5 minutes)

```bash
# Copier le fichier d'environnement
cp env.example .env

# Éditer .env avec vos informations
nano .env  # ou votre éditeur préféré
```

**Variables essentielles à configurer**:
```env
DATABASE_URL="mysql://user:password@localhost:3306/opticien_marketplace"
NEXTAUTH_SECRET="générer-avec-openssl-rand-base64-32"
```

### 2️⃣ Installation (2 minutes)

```bash
# Option A: Script automatique (recommandé)
./QUICKSTART.sh

# Option B: Manuel
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed
```

### 3️⃣ Lancement

```bash
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) 🎊

---

## 📚 Documentation

| Document | Description | Quand l'utiliser |
|----------|-------------|------------------|
| **README.md** | Documentation complète | Vue d'ensemble du projet |
| **GETTING_STARTED.md** | Guide démarrage détaillé | Première installation |
| **DEPLOYMENT.md** | Guide de déploiement | Mise en production |
| **FEATURES.md** | Liste des fonctionnalités | Comprendre les capacités |
| **PROJECT_SUMMARY.md** | Résumé technique | Vue technique complète |

---

## 🔑 Comptes de Test

Après `pnpm db:seed`:

### 👨‍💼 Administrateur
```
Email: admin@optimarket.com
Mot de passe: admin123
URL: http://localhost:3000/admin
```

### 👓 Opticien
```
Email: optique.paris@example.com
Mot de passe: optician123
URL: http://localhost:3000/auth/signin
```

---

## 🗂️ Structure du Projet

```
opticien-marketplace/
├── 📄 Documentation
│   ├── README.md              ← Documentation principale
│   ├── GETTING_STARTED.md     ← Guide démarrage
│   ├── DEPLOYMENT.md          ← Guide déploiement
│   ├── FEATURES.md            ← Fonctionnalités
│   └── PROJECT_SUMMARY.md     ← Résumé technique
│
├── 🎨 Application
│   ├── app/                   ← Pages Next.js
│   │   ├── page.tsx          ← Accueil
│   │   ├── auth/             ← Authentification
│   │   ├── catalogue/        ← Catalogue produits
│   │   ├── opticiens/        ← Carte opticiens
│   │   ├── admin/            ← Dashboard admin
│   │   └── api/              ← API Routes
│   │
│   ├── components/            ← Composants React
│   │   ├── layout/           ← Header, Footer
│   │   ├── map/              ← Carte interactive
│   │   └── ui/               ← Composants UI
│   │
│   └── lib/                   ← Utilitaires
│       ├── auth.ts           ← NextAuth config
│       ├── prisma.ts         ← Client DB
│       └── utils.ts          ← Helpers
│
├── 🗄️ Base de Données
│   └── prisma/
│       ├── schema.prisma     ← Schéma DB
│       └── seed.ts           ← Données test
│
└── ⚙️ Configuration
    ├── .env                   ← Variables env
    ├── package.json          ← Dépendances
    └── tsconfig.json         ← TypeScript
```

---

## 🎯 Premiers Pas

### 1. Explorer l'Interface

1. **Page d'accueil** → http://localhost:3000
   - Hero section
   - Fonctionnalités
   - CTA inscription

2. **Catalogue** → http://localhost:3000/catalogue
   - Filtres produits
   - Recherche
   - Prix masqués (visiteur)

3. **Opticiens** → http://localhost:3000/opticiens
   - Carte interactive
   - Liste opticiens
   - Contacts WhatsApp

4. **Admin** → http://localhost:3000/admin
   - Dashboard statistiques
   - Gestion opticiens
   - Actions rapides

### 2. Tester les Fonctionnalités

#### ✅ Inscription Opticien
1. Aller sur `/auth/signup`
2. Remplir le formulaire
3. Vérifier le statut "PENDING" dans admin

#### ✅ Validation Admin
1. Se connecter en admin
2. Aller dans "Gestion Opticiens"
3. Approuver/rejeter les inscriptions

#### ✅ Catalogue avec Prix
1. Se connecter en opticien approuvé
2. Voir le catalogue
3. Les prix sont maintenant visibles!

---

## 🛠️ Commandes Utiles

```bash
# Développement
pnpm dev                    # Serveur dev
pnpm build                  # Build production
pnpm start                  # Démarrer production

# Base de données
pnpm db:generate            # Générer client Prisma
pnpm db:push                # Pousser schéma
pnpm db:studio              # Interface graphique
pnpm db:seed                # Données de test

# Qualité
pnpm lint                   # Vérifier le code
```

---

## 🎨 Personnalisation

### Changer les Couleurs

Éditer `app/globals.css`:
```css
:root {
  --palladian: #EEE9DF;      /* Fond */
  --blue-fantastic: #2C3B4D; /* Primaire */
  --burning-flame: #FFB162;  /* Accent */
}
```

### Modifier le Logo

Éditer `components/layout/Header.tsx`:
```tsx
<Link href="/" className="flex items-center">
  <YourLogo />
  <span>Votre Nom</span>
</Link>
```

### Ajouter des Produits

1. Utiliser Prisma Studio: `pnpm db:studio`
2. Ou créer via l'API admin (à implémenter)

---

## ❓ Problèmes Courants

### ❌ Erreur "Cannot find module '@prisma/client'"
```bash
pnpm db:generate
```

### ❌ Erreur de connexion base de données
- Vérifier que MySQL est démarré
- Vérifier `DATABASE_URL` dans `.env`

### ❌ Port 3000 déjà utilisé
```bash
pnpm dev -- -p 3001
```

### ❌ Carte ne s'affiche pas
- Vérifier que Leaflet CSS est importé
- Désactiver SSR pour le composant carte

---

## 📞 Besoin d'Aide?

1. **Documentation**: Lire les fichiers .md
2. **Issues**: Ouvrir une issue GitHub
3. **Email**: support@optimarket.com

---

## ✅ Checklist Avant Production

- [ ] Changer tous les mots de passe
- [ ] Configurer SMTP pour emails
- [ ] Ajouter Google Maps API key
- [ ] Tester toutes les fonctionnalités
- [ ] Optimiser les images
- [ ] Configurer le domaine
- [ ] Sauvegarder la base de données
- [ ] Activer le monitoring

---

## 🎓 Ressources d'Apprentissage

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [NextAuth.js](https://next-auth.js.org)

---

## 🚀 Prêt à Démarrer!

```bash
# Lancer le projet maintenant
./QUICKSTART.sh
```

**Bon développement! 🎉**

---

*OptiMarket - Votre marketplace de montures professionnelle*
