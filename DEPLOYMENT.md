# Guide de Déploiement - OptiMarket

## 📋 Prérequis

- Compte Vercel (ou autre plateforme)
- Base de données MySQL hébergée (PlanetScale, Railway, AWS RDS, etc.)
- Compte email SMTP (Gmail, SendGrid, etc.)
- (Optionnel) Compte Cloudinary pour les images
- (Optionnel) Clé API Google Maps

## 🚀 Déploiement sur Vercel

### 1. Préparation du Repository

```bash
# Initialiser git si ce n'est pas déjà fait
git init
git add .
git commit -m "Initial commit"

# Créer un repo sur GitHub et pusher
git remote add origin https://github.com/votre-username/opticien-marketplace.git
git branch -M main
git push -u origin main
```

### 2. Configuration de la Base de Données

#### Option A: PlanetScale (Recommandé)

1. Créer un compte sur [PlanetScale](https://planetscale.com/)
2. Créer une nouvelle base de données
3. Obtenir la connection string
4. Format: `mysql://user:password@host/database?sslaccept=strict`

#### Option B: Railway

1. Créer un compte sur [Railway](https://railway.app/)
2. Créer un nouveau projet MySQL
3. Copier la connection string

### 3. Déploiement sur Vercel

1. Aller sur [Vercel](https://vercel.com/)
2. Cliquer sur "New Project"
3. Importer votre repository GitHub
4. Configurer les variables d'environnement:

```env
# Database
DATABASE_URL="votre-connection-string-mysql"

# NextAuth
NEXTAUTH_URL="https://votre-domaine.vercel.app"
NEXTAUTH_SECRET="générer-avec: openssl rand -base64 32"

# Email (exemple avec Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre-email@gmail.com"
SMTP_PASSWORD="votre-app-password"
SMTP_FROM="noreply@optimarket.com"

# Google Maps (optionnel)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="votre-clé-api"

# Cloudinary (optionnel)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="votre-cloud-name"
CLOUDINARY_API_KEY="votre-api-key"
CLOUDINARY_API_SECRET="votre-api-secret"
```

5. Cliquer sur "Deploy"

### 4. Initialisation de la Base de Données

Une fois déployé, vous devez initialiser la base de données:

```bash
# Générer le client Prisma
pnpm db:generate

# Pousser le schéma vers la base de données
pnpm db:push

# Peupler avec des données de test
pnpm db:seed
```

Ou via l'interface Vercel:
1. Aller dans votre projet > Settings > Environment Variables
2. Ajouter toutes les variables d'environnement
3. Redéployer le projet

## 🔐 Configuration SMTP pour Gmail

1. Activer la validation en 2 étapes sur votre compte Google
2. Générer un mot de passe d'application:
   - Aller dans Paramètres Google > Sécurité
   - Mots de passe d'application
   - Créer un nouveau mot de passe pour "Mail"
3. Utiliser ce mot de passe dans `SMTP_PASSWORD`

## 🗺️ Configuration Google Maps

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet
3. Activer l'API "Maps JavaScript API"
4. Créer des identifiants (clé API)
5. Restreindre la clé à votre domaine
6. Copier la clé dans `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## 📦 Build Commands

### Vercel
```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "pnpm install",
  "devCommand": "next dev"
}
```

### Railway
```bash
# Procfile
web: pnpm start

# Build command
pnpm install && pnpm db:generate && pnpm build
```

## 🔄 Migrations de Base de Données

Pour les mises à jour futures du schéma:

```bash
# Créer une migration
pnpm prisma migrate dev --name nom_de_la_migration

# Appliquer en production
pnpm prisma migrate deploy
```

## 🧪 Tests Post-Déploiement

1. ✅ Vérifier que la page d'accueil se charge
2. ✅ Tester l'inscription d'un opticien
3. ✅ Vérifier la connexion admin (admin@optimarket.com / admin123)
4. ✅ Tester le catalogue produits
5. ✅ Vérifier la carte des opticiens
6. ✅ Tester l'envoi d'emails

## 🐛 Troubleshooting

### Erreur de connexion à la base de données
- Vérifier que `DATABASE_URL` est correcte
- S'assurer que la base de données accepte les connexions externes
- Vérifier les paramètres SSL

### Erreur NextAuth
- Vérifier que `NEXTAUTH_SECRET` est défini
- S'assurer que `NEXTAUTH_URL` correspond au domaine de production

### Problème d'envoi d'emails
- Vérifier les credentials SMTP
- Tester avec un service comme Mailtrap en développement
- Vérifier les logs d'erreur

### Carte ne s'affiche pas
- Vérifier que la clé Google Maps est valide
- S'assurer que l'API est activée
- Vérifier les restrictions de domaine

## 📊 Monitoring

### Logs Vercel
```bash
vercel logs [deployment-url]
```

### Prisma Studio (en local)
```bash
pnpm db:studio
```

## 🔒 Sécurité en Production

- [ ] Changer tous les mots de passe par défaut
- [ ] Activer HTTPS (automatique sur Vercel)
- [ ] Configurer les CORS si nécessaire
- [ ] Limiter les tentatives de connexion
- [ ] Activer les logs d'audit
- [ ] Sauvegarder régulièrement la base de données

## 📈 Optimisations

- Activer la mise en cache Vercel
- Utiliser un CDN pour les images (Cloudinary)
- Optimiser les requêtes Prisma avec `select` et `include`
- Implémenter la pagination pour les listes longues
- Ajouter des index sur les colonnes fréquemment recherchées

## 🆘 Support

Pour toute question ou problème:
- Email: support@optimarket.com
- Documentation: https://docs.optimarket.com
- Issues GitHub: https://github.com/votre-repo/issues
