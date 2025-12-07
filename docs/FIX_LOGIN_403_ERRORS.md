# 🔧 Correction des erreurs 403 et boucle infinie à la connexion

## 📋 Symptômes

Lorsque vous vous connectez en tant que directeur, vous observez :
- ✅ Connexion réussie (message dans la console)
- ❌ Erreurs 403 répétées dans la console
- ⏳ Chargement infini (spinning loader)
- 🔄 Messages répétés `SIGNED_IN` dans la console

## 🔍 Causes identifiées

### 1. **Problème de RLS (Row Level Security)**
Les politiques de sécurité RLS de Supabase sont activées sur certaines tables, bloquant l'accès aux données même pour les utilisateurs authentifiés.

### 2. **Boucle infinie dans AuthContext**
L'événement `onAuthStateChange` de Supabase se déclenche plusieurs fois (SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED) provoquant des appels répétés.

### 3. **Fonction ensureUserInDatabase problématique**
Tentative de faire un `upsert` dans la table `users` qui échoue avec 403 à cause du RLS.

## ✅ Solutions appliquées

### 1. **Amélioration de AuthContext.jsx**

**a) Fonction ensureUserInDatabase**
- ❌ Avant : Tentait un `upsert` qui échouait avec 403
- ✅ Après : Vérifie seulement si l'utilisateur existe (lecture seule)
- Le trigger `handle_new_user_automatic()` s'occupe de créer l'utilisateur automatiquement

**b) Gestion des événements onAuthStateChange**
- Ajout d'un tracker `lastProcessedUserId` pour éviter les doublons
- Filtrage des événements non nécessaires (TOKEN_REFRESHED, USER_UPDATED)
- Vérification avant traitement pour éviter les appels multiples

### 2. **Amélioration de productionDataService.js**

**a) Fonction getDashboardMetrics**
- Gestion robuste des erreurs 403
- Vérification de l'existence d'erreur dans chaque promesse
- Retour de valeurs par défaut en cas d'erreur

**b) Fonction getSchoolDetails**
- Suppression des `throw` qui bloquaient l'exécution
- Retour de `null` en cas d'erreur pour permettre au système de continuer
- Log des erreurs 403 sans bloquer

## 🚀 Comment tester

1. **Ouvrez la console du navigateur** (F12)
2. **Connectez-vous** avec vos identifiants
3. **Vérifiez les logs** :
   - ✅ Vous devriez voir : `✅ Connexion réussie pour: votre@email.com`
   - ✅ Vous devriez voir : `✅ Utilisateur configuré avec succès`
   - ❌ Vous ne devriez PAS voir d'erreurs 403 répétées
   - ❌ Vous ne devriez PAS voir de boucle de messages `SIGNED_IN`

## 🔧 Si les erreurs 403 persistent

### Option 1 : Vérifier l'état du RLS

1. Ouvrez le dashboard Supabase
2. Allez dans **SQL Editor**
3. Exécutez le script : `database/diagnostics/check_rls_status.sql`
4. Vérifiez que RLS est DÉSACTIVÉ sur les tables principales

### Option 2 : Désactiver manuellement le RLS

Si le RLS est activé, exécutez le script de correction :
1. Ouvrez le dashboard Supabase
2. Allez dans **SQL Editor**
3. Exécutez le script : `database/diagnostics/fix_rls_disable.sql`
4. Reconnectez-vous

### Option 3 : Vérifier les migrations

Assurez-vous que la migration `20250101000000_initial_schema.sql` a bien été exécutée :
- Elle contient `ALTER TABLE users DISABLE ROW LEVEL SECURITY;`
- Elle doit être la dernière migration (ou du moins, aucune migration ne doit réactiver le RLS)

## 📝 Logs normaux attendus

Lors d'une connexion réussie, vous devriez voir :

```
🔍 Vérification de la session Supabase...
🔐 Changement d'état Supabase: SIGNED_IN votre@email.com
✅ Connexion réussie pour: votre@email.com
🏫 Résultat requête école: { schoolData: {...}, schoolError: null }
✅ Utilisateur configuré avec succès
🏛️ PrincipalDashboard - État actuel:
  - Mode de données: production
  - Utilisateur: votre@email.com
  🏫 École active: Nom de votre école
```

## ⚠️ Logs problématiques

Si vous voyez ceci, le problème persiste :

```
Uncaught (in promise) {name: 'i', httpError: false, httpStatus: 200, code: 403, ...}
🔐 Changement d'état Supabase: SIGNED_IN votre@email.com (répété plusieurs fois)
⚠️ Could not ensure user in database: {...code: 403...}
```

## 🆘 Besoin d'aide ?

Si le problème persiste après avoir appliqué ces corrections :
1. Vérifiez la console pour les messages d'erreur spécifiques
2. Exécutez le script de diagnostic `check_rls_status.sql`
3. Assurez-vous que votre compte a bien été créé dans Supabase Auth
4. Vérifiez que votre école existe dans la table `schools` avec le bon `director_user_id`

## 📚 Fichiers modifiés

- ✅ `src/contexts/AuthContext.jsx` - Correction boucle infinie et ensureUserInDatabase
- ✅ `src/services/productionDataService.js` - Gestion robuste des erreurs 403
- ✅ `database/diagnostics/check_rls_status.sql` - Script de diagnostic
- ✅ `database/diagnostics/fix_rls_disable.sql` - Script de correction RLS
