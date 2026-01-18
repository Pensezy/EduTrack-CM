# 🚀 Guide Rapide : Appliquer la Migration RLS V2

## ❌ Problème Actuel

**Apps = 0** dans l'interface Admin alors que **9 apps existent** en base de données.

**Cause :** Aucune politique RLS sur la table `apps` → RLS bloque tout par défaut.

---

## ✅ Solution

Appliquer la migration `20260102_fix_apps_rls_permissions_v2.sql`

Cette migration va :
1. ✅ Supprimer TOUTES les anciennes politiques conflictuelles
2. ✅ Créer 2 politiques pour `apps` (lecture publique, modification admin)
3. ✅ Créer 2 politiques pour `bundles` (lecture publique, modification admin)
4. ✅ Créer 2 politiques pour `school_subscriptions` (lecture selon rôle, modification admin)
5. ✅ Nettoyer les 6 politiques conflictuelles de `school_subscriptions`

---

## 📋 Étapes

### 1. Ouvrir Supabase SQL Editor

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Menu gauche → **SQL Editor**
4. Cliquer **New Query**

### 2. Copier le Script

Ouvrir : `supabase/migrations/20260102_fix_apps_rls_permissions_v2.sql`

**Copier TOUT le contenu** (228 lignes)

### 3. Exécuter

1. Coller dans SQL Editor
2. Cliquer **Run** (ou Ctrl+Enter)
3. Attendre le message de succès

### 4. Vérifier le Message

Vous devriez voir :

```
🔧 Nettoyage des anciennes politiques RLS...
  ❌ Supprimé : [anciennes politiques apps]
  ✅ apps_select_authenticated créée
  ✅ apps_all_admin créée
  ❌ Supprimé : [anciennes politiques bundles]
  ✅ bundles_select_authenticated créée
  ✅ bundles_all_admin créée
  ❌ Supprimé : Only admins can modify subscriptions
  ❌ Supprimé : School admins manage subscriptions
  ❌ Supprimé : Users can insert their school subscriptions
  ❌ Supprimé : Users can read their school subscriptions
  ❌ Supprimé : Users view their school subscriptions
  ❌ Supprimé : Users can view their school subscriptions
  ❌ Supprimé : Users can update their school subscriptions
  ✅ subscriptions_select_by_role créée
  ✅ subscriptions_all_admin créée

═══════════════════════════════════════════════════════════
✅ POLITIQUES RLS RECRÉÉES AVEC SUCCÈS!
═══════════════════════════════════════════════════════════

📊 Données disponibles :
   - apps : 9 lignes
   - bundles : 4 lignes
   - school_subscriptions : 2 lignes

🔒 Politiques par table :
   - apps : 2 politiques (SELECT public, ALL admin)
   - bundles : 2 politiques (SELECT public, ALL admin)
   - school_subscriptions : 2 politiques (SELECT by role, ALL admin)

✅ Permissions :
   - LECTURE apps/bundles : Tous les utilisateurs authentifiés
   - LECTURE subscriptions : Selon rôle (admin=tout, autres=leur école)
   - MODIFICATION : Admins uniquement

🔄 Prochaine étape : Rafraîchir l'application (F5)
```

### 5. Rafraîchir l'Application

1. Dans EduTrack Admin, **appuyer sur F5**
2. Les apps devraient maintenant s'afficher dans App Store ✅
3. Mes Apps devrait afficher les abonnements ✅

---

## 🧪 Test de Validation

### Admin
```javascript
// Console doit afficher :
apps (catalogue complet): 9  // ✅ au lieu de 0
bundles: 4  // ✅
activeApps: X  // selon abonnements
```

### Directeur
```javascript
// Console doit afficher :
apps (catalogue complet): 9  // ✅
bundles: 4  // ✅
subscriptions: X  // seulement son école
```

---

## 📊 Résultat Attendu

| Table | Politiques Avant | Politiques Après |
|-------|------------------|------------------|
| `apps` | **0** ❌ | **2** ✅ |
| `bundles` | **0** ❌ | **2** ✅ |
| `school_subscriptions` | **7** ⚠️ (conflits) | **2** ✅ |

**Total :** 7 politiques conflictuelles → **6 politiques propres**

---

## ❓ Si ça ne Marche Pas

### 1. Vérifier que la migration s'est bien exécutée

```sql
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'apps';
-- Doit retourner : 2
```

### 2. Vérifier les noms des politiques

```sql
SELECT policyname FROM pg_policies WHERE tablename = 'apps';
-- Doit retourner :
-- apps_select_authenticated
-- apps_all_admin
```

### 3. Tester l'accès

```sql
-- En tant qu'admin connecté
SELECT COUNT(*) FROM apps;
-- Doit retourner : 9
```

### 4. Si toujours 0 apps

Vérifier que RLS est bien activé :
```sql
SELECT rowsecurity FROM pg_tables WHERE tablename = 'apps';
-- Doit retourner : true
```

Si `false`, activer RLS :
```sql
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
```

---

**Temps estimé :** 2 minutes
**Complexité :** Facile (copier/coller)
**Risque :** Aucun (supprime et recrée uniquement les politiques RLS)

---

**Fichier :** `supabase/migrations/20260102_fix_apps_rls_permissions_v2.sql`
**Auteur :** Claude Sonnet 4.5
**Date :** 2 janvier 2026
