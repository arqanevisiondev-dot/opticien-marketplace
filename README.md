# OptiMarket - Plateforme de Marché pour Montures de Lunettes

Plateforme en ligne permettant aux opticiens professionnels d'accéder à un catalogue de montures de lunettes fourni par des fournisseurs agréés.

## 🎯 Objectifs

- Permettre aux opticiens de s'enregistrer sur la plateforme pour accéder aux informations des produits
- Garantir que seuls les opticiens inscrits puissent voir les prix des montures
- Offrir aux visiteurs la possibilité de localiser les opticiens les plus proches
- Faciliter la commande directe entre opticiens et fournisseurs via WhatsApp ou téléphone
- Proposer un site multilingue (français et arabe)

## 🚀 Technologies Utilisées

- **Frontend & Backend**: Next.js 15 (App Router)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS v4
- **Base de données**: MySQL avec Prisma ORM
- **Authentification**: NextAuth.js v5
- **Cartes**: Leaflet & React-Leaflet
- **Validation**: Zod
- **Formulaires**: React Hook Form
- **Icons**: Lucide React

## 🎨 Palette de Couleurs

- **Palladian**: #EEE9DF (Fond principal)
- **Oatmeal**: #C9C1B1
- **Blue Fantastic**: #2C3B4D (Header, boutons primaires)
- **Burning Flame**: #FFB162 (Accents, CTA)
- **Truffle Trouble**: #A35139
- **Abyssal**: #1B2632 (Texte principal)

## 📋 Prérequis

- Node.js 18+ 
- MySQL 8+
- pnpm (recommandé) ou npm

## 🛠️ Installation

1. **Cloner le projet**
```bash
cd opticien-marketplace
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configurer les variables d'environnement**
```bash
cp env.example .env
```

Modifier le fichier `.env` avec vos informations:
```env
DATABASE_URL="mysql://user:password@localhost:3306/opticien_marketplace"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

4. **Initialiser la base de données**
```bash
pnpm prisma generate
pnpm prisma db push
```

5. **Lancer le serveur de développement**
```bash
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du Projet

```
opticien-marketplace/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Authentification
│   │   ├── products/     # Gestion produits
│   │   └── opticians/    # Gestion opticiens
│   ├── auth/             # Pages d'authentification
│   ├── catalogue/        # Catalogue produits
│   ├── opticiens/        # Localisation opticiens
│   └── layout.tsx        # Layout principal
├── components/
│   ├── layout/           # Header, Footer
│   ├── map/              # Composants carte
│   └── ui/               # Composants UI réutilisables
├── lib/
│   ├── auth.ts           # Configuration NextAuth
│   ├── prisma.ts         # Client Prisma
│   └── utils.ts          # Utilitaires
├── prisma/
│   └── schema.prisma     # Schéma de base de données
└── types/                # Types TypeScript
```

## 👥 Rôles Utilisateurs

### Visiteurs (Non connectés)
- ✅ Consulter le catalogue sans prix
- ✅ Voir les opticiens sur la carte
- ✅ Contacter les opticiens via WhatsApp/téléphone
- ❌ Voir les prix
- ❌ Passer commande

### Opticiens (Inscrits et approuvés)
- ✅ Toutes les fonctionnalités visiteurs
- ✅ Voir les prix des montures
- ✅ Contacter les fournisseurs directement
- ✅ Gérer leur profil

### Administrateurs
- ✅ Gérer les comptes opticiens (validation, modification, suppression)
- ✅ Gérer le catalogue des montures
- ✅ Gérer les fournisseurs
- ✅ Envoyer des campagnes email

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- Authentification JWT via NextAuth.js
- Validation des données avec Zod
- Protection des routes API
- Sanitization des inputs

## 📧 Fonctionnalités Email

- Envoi d'emails de bienvenue
- Notifications de validation de compte
- Campagnes marketing ciblées
- Templates HTML personnalisables

## 🗺️ Géolocalisation

- Carte interactive avec Leaflet
- Marqueurs pour chaque opticien
- Recherche par proximité
- Affichage des coordonnées

## 🌐 Multilingue

Support complet pour:
- Français (FR)
- Arabe (AR) avec support RTL

## 📱 Responsive Design

- Mobile-first approach
- Optimisé pour tablettes et desktop
- Navigation adaptative

## 🧪 Scripts Disponibles

```bash
# Développement
pnpm dev

# Build production
pnpm build

# Démarrer en production
pnpm start

# Linter
pnpm lint

# Prisma Studio (interface DB)
pnpm prisma studio

# Migrations
pnpm prisma migrate dev
```

## 🚀 Déploiement

### Vercel (Recommandé)
1. Push le code sur GitHub
2. Connecter le repo à Vercel
3. Configurer les variables d'environnement
4. Déployer

### Autres plateformes
- Railway
- Render
- DigitalOcean App Platform

## 📝 TODO / Évolutions Futures

- [ ] Gestion des stocks en temps réel
- [ ] Système d'avis clients
- [ ] Statistiques de ventes
- [ ] Notifications push
- [ ] Export de données
- [ ] API publique pour partenaires
- [ ] Application mobile

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 📞 Support

Pour toute question ou support, contactez: contact@optimarket.com
