# 🚀 Guide de Démarrage Rapide - OptiMarket

## Installation en 5 Minutes

### 1. Cloner et Installer

```bash
cd opticien-marketplace
pnpm install
```

### 2. Configurer l'Environnement

```bash
cp env.example .env
```

Modifier `.env` avec vos informations:
```env
DATABASE_URL="mysql://root:password@localhost:3306/opticien_marketplace"
NEXTAUTH_SECRET="votre-secret-genere"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Initialiser la Base de Données

```bash
# Générer le client Prisma
pnpm db:generate

# Créer les tables
pnpm db:push

# Peupler avec des données de test
pnpm db:seed
```

### 4. Lancer l'Application

```bash
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🔑 Comptes de Test

Après le seed, vous pouvez vous connecter avec:

### Administrateur
- **Email**: admin@optimarket.com
- **Mot de passe**: admin123
- **Accès**: Dashboard admin complet

### Opticien
- **Email**: optique.paris@example.com
- **Mot de passe**: optician123
- **Accès**: Catalogue avec prix, profil opticien

## 📂 Structure du Projet

```
opticien-marketplace/
├── app/                    # Pages et API Routes
│   ├── api/               # API endpoints
│   │   ├── auth/         # Authentification
│   │   ├── products/     # Gestion produits
│   │   ├── opticians/    # Gestion opticiens
│   │   └── admin/        # Routes admin
│   ├── auth/             # Pages auth (signin, signup)
│   ├── catalogue/        # Catalogue produits
│   ├── opticiens/        # Carte des opticiens
│   ├── admin/            # Dashboard admin
│   └── layout.tsx        # Layout principal
├── components/
│   ├── layout/           # Header, Footer
│   ├── map/              # Composants carte
│   └── ui/               # Composants UI
├── lib/
│   ├── auth.ts           # Configuration NextAuth
│   ├── prisma.ts         # Client Prisma
│   └── utils.ts          # Utilitaires
├── prisma/
│   ├── schema.prisma     # Schéma DB
│   └── seed.ts           # Données de test
└── types/                # Types TypeScript
```

## 🎯 Fonctionnalités Principales

### Pour les Visiteurs
- ✅ Consulter le catalogue (sans prix)
- ✅ Localiser les opticiens sur une carte
- ✅ Contacter les opticiens via WhatsApp/téléphone

### Pour les Opticiens
- ✅ Inscription avec validation admin
- ✅ Voir les prix des produits
- ✅ Gérer leur profil professionnel
- ✅ Contacter les fournisseurs

### Pour les Administrateurs
- ✅ Valider/rejeter les inscriptions opticiens
- ✅ Gérer le catalogue produits
- ✅ Gérer les fournisseurs
- ✅ Envoyer des campagnes email
- ✅ Voir les statistiques

## 🛠️ Commandes Utiles

```bash
# Développement
pnpm dev                    # Lancer le serveur dev
pnpm build                  # Build production
pnpm start                  # Démarrer en production

# Base de données
pnpm db:generate            # Générer le client Prisma
pnpm db:push                # Pousser le schéma
pnpm db:studio              # Interface graphique DB
pnpm db:seed                # Peupler avec des données

# Qualité de code
pnpm lint                   # Linter le code
```

## 📱 Pages Principales

| Page | URL | Description |
|------|-----|-------------|
| Accueil | `/` | Page d'accueil avec présentation |
| Catalogue | `/catalogue` | Liste des produits avec filtres |
| Opticiens | `/opticiens` | Carte et liste des opticiens |
| Inscription | `/auth/signup` | Formulaire d'inscription opticien |
| Connexion | `/auth/signin` | Page de connexion |
| Admin Dashboard | `/admin` | Dashboard administrateur |
| Gestion Opticiens | `/admin/opticians` | Liste et validation des opticiens |

## 🎨 Personnalisation

### Couleurs
Les couleurs sont définies dans `app/globals.css`:
- `--palladian`: #EEE9DF (Fond)
- `--blue-fantastic`: #2C3B4D (Primaire)
- `--burning-flame`: #FFB162 (Accent)
- `--abyssal`: #1B2632 (Texte)

### Logo
Remplacer le logo dans `components/layout/Header.tsx`

### Emails
Templates d'emails à créer dans `lib/email-templates/`

## 🔧 Configuration Avancée

### Google Maps
1. Obtenir une clé API sur Google Cloud Console
2. Ajouter dans `.env`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="votre-clé"
```

### Upload d'Images (Cloudinary)
1. Créer un compte Cloudinary
2. Ajouter dans `.env`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="votre-cloud"
CLOUDINARY_API_KEY="votre-key"
CLOUDINARY_API_SECRET="votre-secret"
```

### SMTP Email
Configuration Gmail:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre-email@gmail.com"
SMTP_PASSWORD="app-password"
```

## 🐛 Résolution de Problèmes

### Erreur Prisma Client
```bash
pnpm db:generate
```

### Port 3000 déjà utilisé
```bash
pnpm dev -- -p 3001
```

### Erreur de connexion DB
- Vérifier que MySQL est démarré
- Vérifier les credentials dans `.env`
- Tester la connexion: `mysql -u root -p`

### Leaflet ne s'affiche pas
- Vérifier que les styles CSS sont importés
- Désactiver SSR pour le composant carte

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Leaflet Documentation](https://leafletjs.com/reference.html)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Support

- **Email**: support@optimarket.com
- **Documentation**: Voir README.md
- **Issues**: Ouvrir une issue sur GitHub

## ⚡ Prochaines Étapes

1. [ ] Personnaliser les couleurs et le logo
2. [ ] Configurer l'envoi d'emails
3. [ ] Ajouter des produits réels
4. [ ] Configurer Google Maps
5. [ ] Déployer en production (voir DEPLOYMENT.md)
6. [ ] Implémenter le multilingue (FR/AR)
7. [ ] Ajouter des tests automatisés

Bon développement! 🚀
