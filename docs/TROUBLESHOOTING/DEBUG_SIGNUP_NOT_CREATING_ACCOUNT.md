# 🐛 Debug : Compte Non Créé dans Supabase

**Problème** : Formulaire d'inscription rempli, mais aucun compte n'apparaît dans Supabase

**URL Hub** : https://edutrack-cm-hub.vercel.app/

---

## 🔍 Diagnostics Possibles

### 1️⃣ Variables d'Environnement Manquantes sur Vercel

**Cause Probable** : Les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` ne sont pas configurées sur Vercel.

**Vérification** :
1. Ouvrir https://vercel.com/dashboard
2. Projet `edutrack-cm-hub` → Settings → Environment Variables
3. Vérifier si `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` existent

**Solution** :
```bash
# Ajouter ces variables sur Vercel :
VITE_SUPABASE_URL=https://lbqwbnclknwszdnlxaxz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxicXdibmNsa253c3pkbmx4YXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODMwNzEsImV4cCI6MjA3NzA1OTA3MX0.Jy7Vx_satR9CUGqMWSydr7Z6mwODNDTp3dD5PGmLq1w
```

**Après avoir ajouté** : Redéployer l'app sur Vercel

---

### 2️⃣ Configuration Supabase - Site URL Incorrecte

**Cause** : L'URL de redirection n'est pas autorisée dans Supabase.

**Vérification** :
1. Ouvrir https://supabase.com/dashboard
2. Projet → Settings → Authentication → URL Configuration
3. Vérifier **Site URL** et **Redirect URLs**

**Solution** :

**Site URL** :
```
https://edutrack-cm-hub.vercel.app
```

**Redirect URLs** (ajouter toutes) :
```
https://edutrack-cm-hub.vercel.app/**
https://edutrack.cm/**
https://edu-track-cm-admin.vercel.app/**
http://localhost:5173/**
http://localhost:5174/**
```

---

### 3️⃣ Email Confirmation Activée mais Email Non Reçu

**Cause** : Supabase attend que l'email soit confirmé avant de créer le compte.

**Vérification** :
1. Supabase Dashboard → Authentication → Providers → Email
2. Vérifier si "Confirm email" est **coché**

**Solution A** : Vérifier les spams

**Solution B** : Désactiver temporairement la confirmation email (DEV uniquement)
1. Décocher "Confirm email"
2. Tester l'inscription
3. **⚠️ Réactiver en production**

---

### 4️⃣ CORS ou Erreur Réseau

**Cause** : Supabase bloque les requêtes depuis Vercel.

**Vérification** :
1. Ouvrir https://edutrack-cm-hub.vercel.app/signup
2. Ouvrir Console Développeur (F12)
3. Remplir le formulaire et créer un compte
4. Regarder l'onglet **Console** et **Network**

**Erreurs à chercher** :
```
❌ CORS error
❌ 403 Forbidden
❌ Network request failed
❌ Missing Supabase URL
```

---

### 5️⃣ Code Build Incorrect (Variables Non Incluses)

**Cause** : Vite ne compile pas les variables d'environnement dans le build.

**Vérification** :
```bash
# Vérifier que les variables sont bien injectées lors du build
grep -r "VITE_SUPABASE_URL" apps/hub/dist/
```

**Solution** : Redéployer avec les bonnes variables

---

## 🧪 Test de Diagnostic Complet

### Étape 1 : Console Développeur

1. Ouvrir https://edutrack-cm-hub.vercel.app/signup
2. Appuyer sur **F12** → Onglet **Console**
3. Remplir le formulaire
4. Cliquer "Créer Mon Compte"

**Vérifier** :
- ✅ Aucune erreur dans la console
- ✅ Requête vers `https://lbqwbnclknwszdnlxaxz.supabase.co/auth/v1/signup`
- ✅ Réponse 200 OK

**Erreurs possibles** :
```
❌ Missing Supabase environment variables
   → Variables non configurées sur Vercel

❌ Invalid API key
   → Mauvaise clé dans les variables Vercel

❌ Email rate limit exceeded
   → Trop d'inscriptions récentes avec le même email

❌ User already registered
   → Compte existe déjà dans Supabase
```

---

### Étape 2 : Vérifier les Variables d'Environnement

**Sur Vercel** :
1. https://vercel.com/dashboard
2. Projet `edutrack-cm-hub`
3. Settings → Environment Variables
4. **Vérifier que ces 2 variables existent** :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**Si elles n'existent pas** :
1. Cliquer "Add New"
2. Name: `VITE_SUPABASE_URL`
3. Value: `https://lbqwbnclknwszdnlxaxz.supabase.co`
4. Environment: **Production**, **Preview**, **Development** (cocher les 3)
5. Répéter pour `VITE_SUPABASE_ANON_KEY`
6. **Redéployer** : Deployments → Latest → Redeploy

---

### Étape 3 : Vérifier dans Supabase

**Table auth.users** :
1. Supabase Dashboard → Table Editor → auth.users
2. Chercher l'email utilisé pour l'inscription

**Si le user existe** :
- ✅ Le compte a été créé
- Vérifier `email_confirmed_at` :
  - Si **NULL** → Email pas encore confirmé
  - Si **NOT NULL** → Email confirmé

**Si le user n'existe pas** :
- ❌ La requête n'a pas atteint Supabase
- Vérifier les logs Supabase

---

### Étape 4 : Vérifier les Logs Supabase

1. Supabase Dashboard → Logs → Auth Logs
2. Chercher des tentatives d'inscription récentes

**Log attendu** :
```
✅ POST /auth/v1/signup → 200 OK
   Email: test@example.com
   User ID: uuid-xxx
```

**Si aucun log** :
→ La requête n'atteint jamais Supabase
→ Problème de variables d'environnement ou CORS

---

## ✅ Checklist de Résolution

### Configuration Vercel
- [ ] Variables d'environnement `VITE_SUPABASE_URL` ajoutée
- [ ] Variables d'environnement `VITE_SUPABASE_ANON_KEY` ajoutée
- [ ] Variables appliquées à **Production**
- [ ] App redéployée après ajout des variables

### Configuration Supabase
- [ ] Site URL = `https://edutrack-cm-hub.vercel.app`
- [ ] Redirect URLs contient `https://edutrack-cm-hub.vercel.app/**`
- [ ] Email confirmation activée (ou désactivée pour test)
- [ ] Aucune restriction IP/CORS

### Test
- [ ] Console F12 ouverte pendant inscription
- [ ] Aucune erreur dans la console
- [ ] Requête réseau vers Supabase visible
- [ ] User créé dans `auth.users`
- [ ] Email de confirmation reçu

---

## 🚨 Solution Rapide (Most Likely)

**Le problème le plus probable** : Variables d'environnement manquantes sur Vercel.

### Correction Rapide

1. **Vercel Dashboard** : https://vercel.com/dashboard
2. **Projet** : `edutrack-cm-hub`
3. **Settings** → **Environment Variables**
4. **Ajouter** :
   ```
   VITE_SUPABASE_URL = https://lbqwbnclknwszdnlxaxz.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbG...longue-clé...
   ```
5. **Cocher** : Production + Preview + Development
6. **Redéployer** : Deployments → Redeploy

**Attendre 2-3 minutes** pour le redéploiement.

**Tester** : https://edutrack-cm-hub.vercel.app/signup

---

## 📞 Si le Problème Persiste

**Envoyer ces informations** :
1. Screenshot de la console (F12) lors de l'inscription
2. Screenshot des variables Vercel
3. Screenshot des logs Supabase Auth
4. Message d'erreur exact (si affiché)

---

**Dernière mise à jour** : 2026-01-01
**Status** : 🔍 En diagnostic
