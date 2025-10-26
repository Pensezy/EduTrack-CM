# 🚨 RÉSOLUTION DU PROBLÈME 401/42501 - CRÉATION DE COMPTE DIRECTEUR

## 📋 **Diagnostic du Problème**

### Erreurs Rencontrées
```
❌ GET /rest/v1/schools 401 (Unauthorized)
❌ Code 42501: "permission denied for schema public"
```

### Cause Racine
Les politiques RLS (Row Level Security) bloquaient les nouveaux utilisateurs car :
1. ✅ Le compte Supabase Auth était créé
2. ❌ Mais l'utilisateur n'existait pas encore dans la table `users`
3. ❌ Les politiques vérifiaient l'existence dans `users` avant l'insertion
4. **DEADLOCK** : Impossible de créer l'école sans être dans `users`, impossible d'être dans `users` sans créer l'école

---

## ✅ **Solution Appliquée**

### Fichiers Créés/Modifiés

#### 1. `fix_rls_permissions_v2.sql` (NOUVEAU - VERSION CORRIGÉE)
**🎯 Objectif** : Permettre l'auto-inscription des directeurs

**Principales Corrections** :
- ✅ Politique `Users can insert their own account during signup`
  - Permet l'insertion dans `users` avec `auth.uid()`
- ✅ Politique `Directors can create their own school during signup`
  - Permet la création d'école lors de l'inscription
- ✅ Politique `Anyone can check school code uniqueness`
  - Permet la vérification d'unicité du code école (anon + authenticated)
- ✅ Ajout de `TO anon` pour certaines lectures nécessaires avant confirmation email

**Différence avec v1** :
| Aspect | v1 (Ancien) | v2 (Nouveau) |
|--------|-------------|--------------|
| Inscription | ❌ Bloquée (deadlock) | ✅ Permise |
| Vérif école | ❌ Requiert auth dans users | ✅ Accessible avant insertion |
| Anon access | ❌ Interdit | ✅ Autorisé pour checks |

#### 2. `auto_sync_supabase_auth.sql` (AMÉLIORÉ)
**🎯 Objectif** : Synchronisation automatique Auth → Table `users`

**Améliorations** :
- ✅ Ajout de logs (`RAISE NOTICE`) pour le debug
- ✅ Gestion d'erreurs robuste (`EXCEPTION WHEN OTHERS`)
- ✅ Photo par défaut `/assets/images/no_image.png`
- ✅ `ON CONFLICT` pour éviter les doublons si l'app insère manuellement

**Fonctionnement** :
```sql
Supabase Auth signUp → Trigger → Insertion auto dans users → Succès
```

#### 3. `NOUVEAU_PROJET_GUIDE.md` (MIS À JOUR)
**Changement** : Remplacement de `fix_rls_permissions.sql` par `fix_rls_permissions_v2.sql`

---

## 🔄 **Processus de Création de Compte (Nouvelle Version)**

### Avant (Avec Erreurs 401)
```
1. signUp() → ✅ Auth créé
2. createPrincipalSchool() → ❌ 401 Unauthorized
   └─ SELECT schools → ❌ Permission denied
   └─ INSERT users → ❌ Bloqué par RLS
   └─ INSERT schools → ❌ Bloqué par RLS
```

### Après (Avec Corrections)
```
1. signUp() → ✅ Auth créé
   └─ Trigger → ✅ User inséré automatiquement dans users
2. createPrincipalSchool() → ✅ Succès
   └─ SELECT schools → ✅ Autorisé (anon + authenticated)
   └─ UPSERT users → ✅ Autorisé (ON CONFLICT)
   └─ INSERT schools → ✅ Autorisé (director_user_id = auth.uid())
   └─ INSERT academic_years → ✅ Autorisé
```

---

## 📝 **Instructions pour Appliquer la Correction**

### Option A : Nouveau Projet Supabase (Recommandé)
1. Créer nouveau projet Supabase
2. Exécuter les scripts **dans cet ordre** :
   ```
   1. new_project_schema.sql
   2. auto_sync_supabase_auth.sql
   3. fix_rls_permissions_v2.sql  ⬅️ VERSION CORRIGÉE
   4. secretary_features.sql
   ```

### Option B : Projet Existant (Correction)
1. Aller dans SQL Editor de votre projet actuel
2. Exécuter `fix_rls_permissions_v2.sql` (remplace toutes les anciennes politiques)
3. Exécuter `auto_sync_supabase_auth.sql` (si pas déjà fait)
4. Tester la création de compte directeur

---

## 🧪 **Test de Vérification**

### 1. Créer un Compte Directeur
```javascript
// Devrait maintenant fonctionner sans erreur 401
const { data, error } = await supabase.auth.signUp({
  email: 'test@ecole.cm',
  password: 'motdepasse123',
  options: {
    data: {
      role: 'principal',
      full_name: 'Test Directeur'
    }
  }
});
```

### 2. Vérifier la Synchronisation
```sql
-- Dans SQL Editor Supabase
SELECT check_user_sync('test@ecole.cm');
```

**Résultat Attendu** :
```json
{
  "email": "test@ecole.cm",
  "auth_user_exists": true,
  "table_user_exists": true,
  "school_exists": false,  // Ou true si école créée
  "sync_status": "partial" // Ou "complete" si école créée
}
```

### 3. Console Logs Attendus (Sans Erreurs)
```
✅ Compte Auth créé avec succès
✅ Utilisateur synchronisé dans la table users
✅ École créée avec succès
✅ Année académique créée
```

---

## 🔍 **Dépannage**

### Si Erreur 401 Persiste
1. Vérifier que `fix_rls_permissions_v2.sql` a bien été exécuté
2. Vérifier les politiques créées :
   ```sql
   SELECT tablename, policyname, cmd, roles
   FROM pg_policies 
   WHERE schemaname = 'public'
     AND tablename IN ('users', 'schools')
   ORDER BY tablename, policyname;
   ```
3. Devrait afficher :
   - `Users can insert their own account during signup`
   - `Directors can create their own school during signup`
   - `Anyone can check school code uniqueness`

### Si Trigger Ne Fonctionne Pas
```sql
-- Vérifier que le trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

---

## 📊 **Récapitulatif des Fichiers**

| Fichier | Statut | Rôle |
|---------|--------|------|
| `new_project_schema.sql` | ✅ Existant | Crée les tables |
| `auto_sync_supabase_auth.sql` | ✅ Amélioré | Trigger auto-sync |
| `fix_rls_permissions.sql` | ⚠️ Obsolète | Anciennes politiques (erreurs 401) |
| `fix_rls_permissions_v2.sql` | ✅ NOUVEAU | Politiques corrigées |
| `secretary_features.sql` | ✅ Existant | Fonctionnalités secrétaires |
| `NOUVEAU_PROJET_GUIDE.md` | ✅ Mis à jour | Guide d'installation |

---

## 🎯 **Action Immédiate**

**Pour votre projet actuel** :
1. Aller dans Supabase Dashboard → SQL Editor
2. Copier/coller le contenu de `fix_rls_permissions_v2.sql`
3. Cliquer sur "Run"
4. Retester la création de compte directeur

**Résultat attendu** : Plus d'erreur 401/42501 ! ✅
