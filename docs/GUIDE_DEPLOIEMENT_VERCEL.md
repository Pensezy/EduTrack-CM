# 🚀 Guide de Déploiement Vercel - EduTrack

## 📋 Architecture de Déploiement

EduTrack utilise une **architecture multi-apps** qui nécessite **2 projets Vercel séparés** :

```
1. Hub (Public)    → edutrack.cm ou hub.edutrack.cm
2. Admin (Privé)   → admin.edutrack.cm
```

---

## 🎯 Option 1 : Hub comme Site Principal (RECOMMANDÉ)

Cette configuration fait du **Hub la landing page principale** accessible au public.

### 1. Supprimer le Projet Vercel Actuel

Dans votre dashboard Vercel :
1. Allez dans **Settings** du projet actuel
2. Scrollez tout en bas
3. Cliquez **Delete Project**
4. Confirmez la suppression

### 2. Créer Nouveau Projet Vercel pour Hub

#### Méthode A : Via Dashboard Vercel

1. **New Project** → Sélectionner votre repo GitHub
2. **Configure Project** :
   ```
   Framework Preset: Vite
   Root Directory: apps/hub
   Build Command: pnpm install --no-frozen-lockfile && pnpm --filter hub build
   Output Directory: dist
   Install Command: pnpm install --no-frozen-lockfile
   ```

3. **Environment Variables** :
   ```env
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-cle-anon
   ```

4. **Deploy** ✅

#### Méthode B : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Depuis apps/hub/
cd apps/hub
vercel

# Suivre les prompts :
# - Link to existing project? No
# - Project name: edutrack-hub
# - Directory: ./
# - Override settings? Yes
#   - Build Command: pnpm install --no-frozen-lockfile && pnpm --filter hub build
#   - Output Directory: dist
#   - Install Command: pnpm install --no-frozen-lockfile
```

### 3. Configurer le Domaine

Dans Vercel Dashboard :
1. **Settings** → **Domains**
2. Ajouter votre domaine : `edutrack.cm`
3. Configurer les DNS selon les instructions Vercel

---

## 🎯 Option 2 : Déployer Hub ET Admin Séparément

### Hub (Site Principal)

**URL** : `edutrack.cm` ou `hub.edutrack.cm`

```bash
cd apps/hub
vercel --prod

# Configuration Vercel :
Project Name: edutrack-hub
Root Directory: apps/hub
Build Command: pnpm install --no-frozen-lockfile && pnpm --filter hub build
Output Directory: dist
```

**Environment Variables** :
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
```

### Admin (Dashboard Privé)

**URL** : `admin.edutrack.cm`

```bash
cd apps/admin
vercel --prod

# Configuration Vercel :
Project Name: edutrack-admin
Root Directory: apps/admin
Build Command: pnpm install --no-frozen-lockfile && pnpm --filter admin build
Output Directory: dist
```

**Environment Variables** :
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID_RECEIPT=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxx
```

---

## ⚙️ Configuration DNS (Pour Domaine Personnalisé)

### Si vous utilisez CloudFlare, Namecheap, etc.

Ajouter ces enregistrements DNS :

#### Pour Hub (Site principal)
```
Type: A
Name: @ (ou edutrack.cm)
Value: 76.76.21.21 (IP Vercel)
TTL: Auto

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

#### Pour Admin (Sous-domaine)
```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
TTL: Auto
```

---

## 🔧 Vérification du Build en Local

Avant de déployer, **toujours tester le build localement** :

### Hub
```bash
cd apps/hub
pnpm build
pnpm preview
```
→ Ouvrir `http://localhost:4173` et tester toutes les pages

### Admin
```bash
cd apps/admin
pnpm build
pnpm preview
```
→ Ouvrir `http://localhost:4174` et tester le dashboard

---

## 🐛 Troubleshooting Vercel

### Erreur : "Command not found: pnpm"

**Solution** : Ajouter dans **Settings** → **General** :
```
Package Manager: pnpm
```

Ou modifier le build command :
```bash
npm install -g pnpm && pnpm install && pnpm --filter hub build
```

---

### Erreur : "Module not found" pour @edutrack/ui

**Cause** : Les workspace dependencies ne sont pas résolues.

**Solution** : S'assurer que le build command installe **depuis la racine** :
```bash
cd ../.. && pnpm install && cd apps/hub && pnpm build
```

Ou dans vercel.json :
```json
{
  "buildCommand": "pnpm install --no-frozen-lockfile && pnpm --filter hub build"
}
```

---

### Erreur : "Missing env variables"

**Cause** : Variables d'environnement non configurées.

**Solution** :
1. Dashboard Vercel → **Settings** → **Environment Variables**
2. Ajouter toutes les variables `VITE_*`
3. **Redeploy** le projet

---

### Page blanche après déploiement

**Cause** : Mauvais `outputDirectory` configuré.

**Solution** : Vérifier dans **Settings** → **General** :
```
Output Directory: dist (si Root = apps/hub)
```

Ou :
```
Output Directory: apps/hub/dist (si Root = .)
```

---

### Routing ne fonctionne pas (404 sur /signup)

**Cause** : Rewrites manquants.

**Solution** : Vérifier `vercel.json` dans `apps/hub/` :
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📊 Monitoring Post-Déploiement

### Vérifier les Deployments

Dashboard Vercel → **Deployments**
- ✅ Status: Ready
- ✅ Build Logs: No errors
- ✅ Runtime Logs: No errors

### Tester le Parcours Complet

1. **Landing** : Ouvrir `https://edutrack.cm`
   - ✅ Affiche la landing page Hub
   - ✅ Design responsive
   - ✅ Tous les liens fonctionnent

2. **Signup** : Cliquer "Créer Mon Compte"
   - ✅ Formulaire 3 étapes s'affiche
   - ✅ Validation fonctionne
   - ✅ Soumission crée un compte Supabase

3. **Onboarding** : Après signup
   - ✅ Page onboarding s'affiche
   - ✅ Navigation entre étapes fonctionne
   - ✅ Bouton final redirige vers admin

4. **Admin** : Depuis onboarding
   - ✅ Redirige vers `https://admin.edutrack.cm`
   - ✅ Dashboard s'affiche
   - ✅ Données chargent correctement

---

## 🔐 Variables d'Environnement Production

### Hub (Minimum)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
```

### Admin (Complet)
```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx

# EmailJS (pour reçus)
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID_RECEIPT=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxx

# Optionnel : Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## 📝 Checklist Avant Déploiement

- [ ] Build Hub réussit en local (`pnpm --filter hub build`)
- [ ] Build Admin réussit en local (`pnpm --filter admin build`)
- [ ] Toutes les variables d'env sont configurées
- [ ] Le fichier `vercel.json` racine pointe vers Hub
- [ ] Les fichiers `apps/hub/vercel.json` et `apps/admin/vercel.json` existent
- [ ] Domaines DNS configurés (si domaine custom)
- [ ] Backup de l'ancien déploiement fait (si applicable)

---

## 🎯 Stratégie de Déploiement Recommandée

### Phase 1 : Hub uniquement (ACTUEL)
```
edutrack.cm → Hub App (Landing, Signup, Login, Onboarding)
```

**Pourquoi ?**
- Point d'entrée public essentiel
- Acquisition de nouveaux utilisateurs
- SEO optimisé pour la landing page

### Phase 2 : Admin en sous-domaine
```
edutrack.cm → Hub App
admin.edutrack.cm → Admin App
```

**Avantages** :
- Séparation claire public/privé
- Build et déploiement indépendants
- Scaling séparé si nécessaire

### Phase 3 : Future apps
```
edutrack.cm → Hub
admin.edutrack.cm → Admin
teacher.edutrack.cm → Teacher App (future)
parent.edutrack.cm → Parent App (future)
```

---

## 🚨 Important : Redéploiement

Après modification de `vercel.json` à la racine :

1. **Git commit & push** :
```bash
git add vercel.json apps/hub/vercel.json
git commit -m "🚀 Configure Vercel for Hub deployment"
git push
```

2. **Redeploy sur Vercel** :
   - Automatique si connecté à GitHub
   - Ou manuellement : `vercel --prod`

3. **Vérifier** :
   - Ouvrir l'URL de production
   - Devrait montrer la landing page Hub (pas l'ancien login)

---

## 📞 Support

### Logs de Build
Dashboard Vercel → Deployments → Cliquer sur le deployment → Build Logs

### Logs Runtime
Dashboard Vercel → Deployments → Functions → Logs

### Documentation Vercel
- [Monorepo Deployments](https://vercel.com/docs/monorepos)
- [pnpm Workspaces](https://vercel.com/docs/concepts/deployments/configure-a-build#pnpm)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Dernière mise à jour** : 2026-01-01
**Version** : 2.0.0 (Architecture Modulaire)
