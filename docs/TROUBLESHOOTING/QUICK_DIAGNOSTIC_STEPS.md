# 🔍 Diagnostic Rapide - Compte Non Créé

**Situation** : Variables Vercel configurées, mais compte toujours pas créé dans Supabase

---

## 🧪 Test à Faire Maintenant

### Étape 1 : Test avec Console Ouverte

1. **Ouvrir** : https://edutrack-cm-hub.vercel.app/signup
2. **Appuyer sur F12** → Onglet **Console**
3. **Remplir le formulaire** avec un nouvel email (pas déjà utilisé)
4. **Cliquer "Créer Mon Compte"**

### Étape 2 : Vérifier les Erreurs

**Dans la Console, cherchez** :

#### Erreur 1 : Variables Manquantes
```
❌ Missing Supabase environment variables
```
**Solution** : Les variables ne sont pas dans le build
→ Redéployer après avoir ajouté les variables

#### Erreur 2 : Email Déjà Utilisé
```
❌ User already registered
```
**Solution** : Cet email existe déjà dans Supabase
→ Essayer avec un autre email

#### Erreur 3 : Rate Limit
```
❌ Email rate limit exceeded
```
**Solution** : Trop d'inscriptions récentes
→ Attendre 1 heure ou utiliser un autre email

#### Erreur 4 : Confirmation Email Requise
```
✅ User created (pas d'erreur)
```
**Mais** : User n'apparaît pas dans Supabase
→ Vérifier les logs Supabase Auth

---

## 🔎 Vérifications Supplémentaires

### Vérif 1 : Logs Supabase

1. **Ouvrir** : https://supabase.com/dashboard
2. **Projet** → **Logs** → **Auth Logs**
3. **Chercher** des tentatives d'inscription récentes

**Ce que vous devriez voir** :
```
POST /auth/v1/signup
Status: 200 OK
Email: votre-email@test.com
```

**Si aucun log** :
→ La requête n'atteint pas Supabase
→ Problème de configuration

### Vérif 2 : Table auth.users

1. **Supabase Dashboard** → **Table Editor** → **auth.users**
2. **Chercher** l'email que vous avez utilisé
3. **Filtrer** par : `email = 'votre-email@test.com'`

**Si le user existe avec `email_confirmed_at = NULL`** :
→ ✅ Le compte a été créé !
→ ⚠️ Mais l'email n'est pas confirmé
→ Vérifier votre boîte email (+ spams)

### Vérif 3 : Configuration Email Supabase

1. **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
2. **Vérifier** :
   - ✅ Email Auth activé
   - ⚠️ "Confirm email" est **coché** ou **décoché** ?

**Si "Confirm email" est coché** :
→ L'utilisateur DOIT confirmer son email avant que le compte soit actif
→ Vérifier si l'email de confirmation a été envoyé

**Si "Confirm email" est décoché** :
→ Le compte devrait être créé immédiatement
→ Si pas créé, problème ailleurs

### Vérif 4 : Redirect URLs Supabase

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Vérifier "Redirect URLs"** contient :
   ```
   https://edutrack-cm-hub.vercel.app/**
   ```

**Si manquant** :
→ Ajouter cette URL
→ Retester

---

## 📊 Scénarios Possibles

### Scénario A : User Créé mais Email Non Confirmé

**Symptômes** :
- ✅ User existe dans `auth.users`
- ❌ `email_confirmed_at` = NULL
- ❌ User ne peut pas se connecter

**Cause** : Confirmation email activée
**Solution** : Vérifier email ou désactiver confirmation (dev)

### Scénario B : User Pas Créé du Tout

**Symptômes** :
- ❌ Aucun user dans `auth.users`
- ❌ Aucun log dans Supabase Auth

**Causes possibles** :
1. Variables Vercel mal configurées
2. CORS bloqué
3. URL de redirection non autorisée
4. Erreur dans le code

### Scénario C : Erreur Silencieuse

**Symptômes** :
- Page de confirmation s'affiche
- Mais aucun user créé
- Aucune erreur visible

**Cause** : Erreur interceptée mais pas affichée
**Solution** : Vérifier console + Network tab

---

## 🚀 Test de Contournement Rapide

Pour isoler le problème, **désactivons temporairement** la confirmation email :

### Désactiver Confirmation Email (TEST UNIQUEMENT)

1. **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
2. **Décocher** "Confirm email"
3. **Save**
4. **Retester** l'inscription sur https://edutrack-cm-hub.vercel.app/signup

**Si ça marche maintenant** :
→ ✅ Le problème était la confirmation email
→ Le compte est créé mais l'email de confirmation n'arrive pas
→ Vérifier configuration email Supabase

**Si ça ne marche toujours pas** :
→ ❌ Problème plus profond
→ Variables, CORS, ou code

**⚠️ IMPORTANT** : Réactiver "Confirm email" après le test

---

## 📸 Informations à Fournir

Si le problème persiste, fournissez :

1. **Screenshot Console** (F12) lors de l'inscription
2. **Screenshot Network Tab** (F12) → Requête `signup`
3. **Screenshot Logs Supabase** (Auth Logs)
4. **Screenshot Variables Vercel**
5. **Email utilisé** pour l'inscription
6. **Message d'erreur exact** (si affiché)

---

## ✅ Checklist Complète

### Configuration Supabase
- [ ] Email Auth activé
- [ ] Site URL = `https://edutrack-cm-hub.vercel.app`
- [ ] Redirect URLs contient `https://edutrack-cm-hub.vercel.app/**`
- [ ] "Confirm email" coché/décoché (noter l'état)

### Configuration Vercel
- [ ] `VITE_SUPABASE_URL` ajoutée
- [ ] `VITE_SUPABASE_ANON_KEY` ajoutée
- [ ] Variables appliquées à **Production**
- [ ] App redéployée après ajout variables

### Test Fonctionnel
- [ ] Console ouverte (F12)
- [ ] Email UNIQUE utilisé (jamais utilisé avant)
- [ ] Pas d'erreur dans console
- [ ] Redirection vers `/email-verification`
- [ ] User créé dans `auth.users` (vérifier Supabase)
- [ ] Log visible dans Auth Logs (vérifier Supabase)

---

**Dernière mise à jour** : 2026-01-01
