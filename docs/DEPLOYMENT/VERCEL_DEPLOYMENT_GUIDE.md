# 🚀 Guide de Déploiement Vercel - EduTrack Admin

**Date:** 31 Décembre 2025
**App:** Admin (apps/admin)
**Framework:** Vite + React 18

---

## 📋 Prérequis

- ✅ Compte Vercel créé
- ✅ GitHub connecté à Vercel
- ✅ Repository GitHub à jour avec le monorepo
- ✅ Compte Supabase avec projet actif

---

## 🔧 Étape 1: Configuration Vercel

### 1.1 Créer Nouveau Projet

1. Aller sur https://vercel.com/dashboard
2. Cliquer sur **"Add New..." → "Project"**
3. Sélectionner votre repository GitHub **EduTrack-CM**
4. Cliquer sur **"Import"**

### 1.2 Configurer le Build

Dans la section **"Configure Project"**, utiliser ces paramètres :

#### Framework Preset
```
Vite
```

#### Root Directory
```
apps/admin
```
⚠️ **IMPORTANT:** Cliquer sur **"Edit"** à côté de Root Directory et sélectionner `apps/admin`

#### Build & Development Settings

⚠️ **IMPORTANT:** Cliquer sur **"Override"** pour personnaliser chaque commande.

**Build Command:**
```bash
cd ../.. && pnpm install --no-frozen-lockfile && pnpm --filter admin build
```

**Output Directory:**
```
dist
```

**Install Command:**
```bash
cd ../.. && pnpm install --no-frozen-lockfile
```

**Development Command:**
```bash
pnpm dev
```

**Node.js Version:**
```
20.x
```

---

## 🔐 Étape 2: Variables d'Environnement

### 2.1 Récupérer les Clés Supabase

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Settings → API**
4. Copier :
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public** key (VITE_SUPABASE_ANON_KEY)

### 2.2 Ajouter dans Vercel

Dans la section **"Environment Variables"** du projet Vercel :

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://votre-project.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `votre-anon-key-ici` | Production, Preview, Development |

**Comment ajouter :**
1. Name: `VITE_SUPABASE_URL`
2. Value: Coller votre URL Supabase
3. Cocher : **Production**, **Preview**, **Development**
4. Cliquer **"Add"**
5. Répéter pour `VITE_SUPABASE_ANON_KEY`

---

## 🚀 Étape 3: Déploiement

### 3.1 Lancer le Déploiement

1. Après avoir configuré Build Settings et Environment Variables
2. Cliquer sur **"Deploy"**
3. Attendre le build (environ 2-3 minutes)

### 3.2 Vérifier le Build

Le log de build devrait afficher :
```
✓ built in 20-30s
```

### 3.3 Accéder à l'Application

Une fois le déploiement réussi, Vercel affichera :
```
🎉 Deployment Ready
https://votre-app-admin-xxx.vercel.app
```

---

## 🔍 Étape 4: Tests Post-Déploiement

### 4.1 Vérifier la Page de Connexion

1. Ouvrir l'URL Vercel
2. Vérifier que la page de login s'affiche correctement
3. Tester la connexion avec vos identifiants Supabase

### 4.2 Vérifier le Dashboard

1. Se connecter avec email + mot de passe
2. Vérifier que le dashboard s'affiche
3. Tester la navigation (Sidebar)
4. Tester la déconnexion

### 4.3 Vérifier la Console

Ouvrir la console du navigateur (F12) et vérifier :
- ✅ Pas d'erreurs 404
- ✅ Pas d'erreurs de CORS
- ✅ Connexion Supabase fonctionnelle

---

## ⚙️ Configuration Avancée

### Custom Domain (Optionnel)

1. Aller dans **Settings → Domains**
2. Cliquer **"Add"**
3. Entrer votre domaine : `admin.edutrack.cm`
4. Suivre les instructions DNS

### Preview Deployments

Chaque push sur une branche créera un déploiement de preview :
```
https://votre-app-admin-git-branch-name.vercel.app
```

### Production Branch

Par défaut, la branche `main` ou `master` est déployée en production.

---

## 🐛 Dépannage

### Problème 1: Build Failed - "pnpm: command not found"

**Solution:**
1. Aller dans **Settings → General → Node.js Version**
2. Sélectionner **20.x** (dernière version)
3. Redéployer

### Problème 2: "Module not found" Errors

**Cause:** Root Directory mal configuré

**Solution:**
1. Aller dans **Settings → General → Root Directory**
2. S'assurer que c'est `apps/admin`
3. Redéployer

### Problème 3: Blank Page After Deploy

**Cause:** Variables d'environnement manquantes

**Solution:**
1. Vérifier que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont définis
2. Vérifier la console pour les erreurs
3. Redéployer

### Problème 4: 404 sur les Routes

**Cause:** SPA routing non configuré

**Solution:** Le `vercel.json` devrait gérer ça automatiquement :
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Problème 5: CORS Errors

**Cause:** URL Supabase incorrect

**Solution:**
1. Vérifier `VITE_SUPABASE_URL` dans Vercel Environment Variables
2. S'assurer qu'il n'y a pas de `/` à la fin
3. Exemple correct: `https://xxx.supabase.co`

---

## 📊 Monitoring

### Vercel Analytics

1. Aller dans **Analytics** tab
2. Activer **Vercel Analytics** (gratuit)
3. Voir les métriques de performance

### Logs

1. Aller dans **Deployments**
2. Cliquer sur un déploiement
3. Voir les **Runtime Logs** en temps réel

---

## 🔄 Redéploiement

### Automatique (Recommandé)

Chaque push sur GitHub déclenche automatiquement un redéploiement :
```bash
git add .
git commit -m "Update admin app"
git push origin main
```

### Manuel

1. Aller sur Vercel Dashboard
2. Sélectionner le projet
3. Cliquer **Deployments**
4. Cliquer **"Redeploy"** sur le dernier déploiement

---

## 📝 Checklist de Déploiement

Avant de déployer, vérifier que :

- [ ] Le build local fonctionne (`pnpm --filter admin build`)
- [ ] Les variables d'environnement sont correctes
- [ ] Le code est poussé sur GitHub
- [ ] Root Directory = `apps/admin`
- [ ] Build Command = `cd ../.. && pnpm install && pnpm --filter admin build`
- [ ] Output Directory = `dist`
- [ ] `vercel.json` existe dans `apps/admin/`
- [ ] `.env.example` est à jour

---

## 🎯 Structure des Fichiers Vercel

```
apps/admin/
├── vercel.json              # Configuration Vercel
├── .env.example             # Template variables d'environnement
├── .gitignore              # Ignorer dist/, .env, etc.
├── vite.config.js          # Configuration Vite
├── package.json            # Dépendances
├── dist/                   # Build output (généré)
│   ├── index.html
│   └── assets/
│       ├── index-xxx.css
│       └── index-xxx.js
└── src/                    # Source code
```

---

## 🔐 Sécurité Production

### Variables Sensibles

⚠️ **JAMAIS** commit les fichiers suivants :
- `.env`
- `.env.local`
- `.env.production`

✅ Toujours utiliser Vercel Environment Variables pour la production

### Supabase RLS

Assurez-vous que Row Level Security est activé :
```sql
-- Vérifier RLS
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

---

## 📞 Support

### Documentation Vercel
- https://vercel.com/docs
- https://vercel.com/docs/frameworks/vite

### Documentation Supabase
- https://supabase.com/docs

### EduTrack Support
- GitHub Issues: https://github.com/votre-org/edutrack/issues

---

## ✅ Post-Déploiement

Une fois déployé avec succès :

1. ✅ Tester la connexion
2. ✅ Vérifier toutes les pages
3. ✅ Tester la déconnexion
4. ✅ Vérifier les performances (Lighthouse)
5. ✅ Configurer un domaine personnalisé (optionnel)
6. ✅ Activer Vercel Analytics
7. ✅ Partager l'URL avec l'équipe

---

**Dernière mise à jour:** 31 Décembre 2025
**Version:** 2.0.0 (Monorepo)
