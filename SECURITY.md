# 🔒 Sécurité - OptiMarket

## ✅ Protections Implémentées

### 1. **Protection des Routes Admin**

#### Pages Protégées (Client-Side)
- ✅ `/app/admin/page.tsx` - Dashboard admin
- ✅ `/app/admin/opticians/page.tsx` - Gestion opticiens

**Mécanisme**:
```tsx
const { data: session, status } = useSession();
const router = useRouter();

useEffect(() => {
  if (status === 'loading') return;
  
  if (!session || session.user?.role !== 'ADMIN') {
    router.push('/');
    return;
  }
}, [session, status, router]);
```

#### APIs Protégées (Server-Side)
- ✅ `/api/admin/stats` - Statistiques
- ✅ `/api/admin/opticians` - Liste opticiens
- ✅ `/api/admin/opticians/[id]` - Mise à jour opticien

**Mécanisme**:
```tsx
const session = await auth();

if (!session || session.user?.role !== 'ADMIN') {
  return NextResponse.json(
    { error: 'Accès non autorisé' },
    { status: 403 }
  );
}
```

### 2. **Contrôle d'Accès aux Prix**

Les prix ne sont visibles que pour:
- ✅ **Opticiens APPROUVÉS** (`role: OPTICIAN` + `opticianStatus: APPROVED`)
- ✅ **Administrateurs** (`role: ADMIN`)

**Logique**:
```tsx
const canSeePrices = 
  (session?.user?.role === 'OPTICIAN' && session?.user?.opticianStatus === 'APPROVED') || 
  session?.user?.role === 'ADMIN';
```

### 3. **Authentification**

- ✅ Mots de passe hashés avec **bcrypt** (10 rounds)
- ✅ Sessions JWT sécurisées avec **NextAuth.js v5**
- ✅ Secret de session dans variables d'environnement

### 4. **Validation des Données**

- ✅ Validation Zod sur l'inscription
- ✅ Validation des statuts dans l'API admin
- ✅ Sanitization des inputs

## 🎯 Matrice des Permissions

| Fonctionnalité | Visiteur | Opticien PENDING | Opticien APPROVED | Admin |
|----------------|----------|------------------|-------------------|-------|
| Voir catalogue | ✅ | ✅ | ✅ | ✅ |
| Voir prix | ❌ | ❌ | ✅ | ✅ |
| S'inscrire | ✅ | ❌ | ❌ | ❌ |
| Voir opticiens | ✅ | ✅ | ✅ | ✅ |
| Dashboard admin | ❌ | ❌ | ❌ | ✅ |
| Valider opticiens | ❌ | ❌ | ❌ | ✅ |
| Gérer produits | ❌ | ❌ | ❌ | ✅ |

## 🔐 Variables d'Environnement Sensibles

```env
# À CHANGER en production!
NEXTAUTH_SECRET="générer-avec-openssl-rand-base64-32"
DATABASE_URL="votre-connection-string"
SMTP_PASSWORD="votre-mot-de-passe-smtp"
```

## ⚠️ Points d'Attention

### Déjà Sécurisés ✅
- [x] Routes admin protégées (client + serveur)
- [x] APIs admin protégées
- [x] Contrôle d'accès aux prix
- [x] Mots de passe hashés
- [x] Sessions sécurisées

### À Améliorer (Optionnel) 🔄
- [ ] Rate limiting sur les APIs
- [ ] CAPTCHA sur l'inscription
- [ ] Logs d'audit des actions admin
- [ ] 2FA pour les admins
- [ ] Rotation des secrets
- [ ] CSP (Content Security Policy)
- [ ] Protection CSRF supplémentaire

## 🛡️ Bonnes Pratiques Appliquées

1. **Défense en profondeur**: Protection client-side ET server-side
2. **Principe du moindre privilège**: Chaque rôle a accès uniquement à ce dont il a besoin
3. **Validation stricte**: Toutes les entrées sont validées
4. **Séparation des préoccupations**: Auth, business logic, et présentation séparés
5. **Secrets externalisés**: Aucun secret en dur dans le code

## 🔍 Tests de Sécurité

### Test 1: Accès Admin sans Authentification
```bash
curl http://localhost:3000/api/admin/stats
# Résultat attendu: 403 Forbidden
```

### Test 2: Accès Admin avec Opticien
```bash
# Se connecter comme opticien
# Essayer d'accéder à /admin
# Résultat attendu: Redirection vers /
```

### Test 3: Voir Prix sans Approbation
```bash
# Se connecter comme opticien PENDING
# Aller sur /catalogue
# Résultat attendu: "Prix sur demande"
```

## 📝 Checklist Déploiement Sécurisé

- [ ] Changer `NEXTAUTH_SECRET` en production
- [ ] Utiliser HTTPS uniquement
- [ ] Configurer les CORS appropriés
- [ ] Activer les logs de sécurité
- [ ] Mettre en place des sauvegardes DB
- [ ] Configurer un WAF (Web Application Firewall)
- [ ] Activer le monitoring des erreurs
- [ ] Tester tous les scénarios d'accès

## 🚨 Signalement de Vulnérabilités

Si vous découvrez une vulnérabilité de sécurité, veuillez:
1. **NE PAS** créer une issue publique
2. Envoyer un email à: security@optimarket.com
3. Inclure une description détaillée et les étapes de reproduction

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NextAuth.js Security](https://next-auth.js.org/security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

---

**Dernière mise à jour**: Novembre 2025  
**Statut**: ✅ Protections critiques implémentées
