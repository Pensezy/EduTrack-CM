# 🚀 GUIDE COMPLET DE MIGRATION PRISMA → SUPABASE

## 📋 **Vue d'Ensemble**

Ce guide vous permet de migrer votre base de données **depuis Prisma vers Supabase** en créant toutes les tables, relations, et politiques RLS nécessaires.

---

## ⚙️ **Prérequis**

- ✅ Un projet Supabase créé (nouveau ou existant)
- ✅ Accès au SQL Editor de Supabase
- ✅ Les fichiers SQL de migration dans votre dossier `EduTrack-CM`

---

## 📂 **Fichiers de Migration (4 fichiers)**

| Fichier | Rôle | Ordre |
|---------|------|-------|
| `migration_prisma_to_supabase.sql` | Crée toutes les tables + enums + triggers | **1️⃣** |
| `auto_sync_supabase_auth.sql` | Synchronisation Auth → Users | **2️⃣** |
| `fix_rls_permissions_v2.sql` | Politiques RLS corrigées | **3️⃣** |
| `secretary_features.sql` | Fonctionnalités secrétaires (optionnel) | **4️⃣** |

---

## 🔄 **PROCESSUS DE MIGRATION (Étape par Étape)**

### 🏗️ **ÉTAPE 1 : Créer le Schéma Complet**

1. **Aller dans Supabase Dashboard**
2. **Cliquer sur "SQL Editor"** (menu gauche)
3. **Ouvrir le fichier `migration_prisma_to_supabase.sql`**
4. **Copier TOUT le contenu** (Ctrl+A → Ctrl+C)
5. **Coller dans SQL Editor**
6. **Cliquer sur "Run"** ▶️

**✅ Résultat Attendu :**
```
Success. No rows returned.
```

**🔍 Vérification :**
```sql
-- Lister toutes les tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Vous devriez voir **22 tables** :
- `users`, `schools`, `students`, `teachers`, `classes`, `subjects`, `grades`, `attendances`, `payments`, `parents`, `parent_student_schools`, `academic_years`, `evaluation_periods`, `notifications`, `audit_logs`, `grade_types`, `user_roles`, `attendance_types`, `payment_types`, `class_subjects`, `teacher_subjects`

---

### 🔄 **ÉTAPE 2 : Synchronisation Automatique Auth**

1. **Toujours dans SQL Editor**
2. **Ouvrir `auto_sync_supabase_auth.sql`**
3. **Copier TOUT le contenu**
4. **Coller et cliquer sur "Run"** ▶️

**✅ Ce Que Ça Fait :**
- Crée un trigger qui insère automatiquement dans `users` quand un compte Auth est créé
- Ajoute des fonctions RPC pour finaliser la création d'école
- Ajoute une fonction de diagnostic

**🔍 Vérification :**
```sql
-- Vérifier que le trigger existe
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

---

### 🔒 **ÉTAPE 3 : Politiques RLS (CRITIQUE)**

1. **Toujours dans SQL Editor**
2. **Ouvrir `fix_rls_permissions_v2.sql`** (⚠️ **V2 = VERSION CORRIGÉE**)
3. **Copier TOUT le contenu**
4. **Coller et cliquer sur "Run"** ▶️

**✅ Ce Que Ça Fait :**
- Active RLS sur toutes les tables
- Crée des politiques permettant l'auto-inscription
- Corrige les erreurs 401/42501

**🔍 Vérification :**
```sql
-- Vérifier les politiques RLS
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'schools')
ORDER BY tablename, policyname;
```

Vous devriez voir au minimum :
- `Users can insert their own account during signup`
- `Directors can create their own school during signup`
- `Anyone can check school code uniqueness`

---

### 👩‍💼 **ÉTAPE 4 : Fonctionnalités Secrétaires (Optionnel)**

1. **Ouvrir `secretary_features.sql`**
2. **Copier et exécuter**

**⚠️ Note :** Ce fichier est optionnel si vous n'utilisez pas les fonctionnalités secrétaires.

---

## 🔌 **ÉTAPE 5 : Mettre à Jour Votre Application**

### 5.1 Récupérer les Nouvelles Clés API

1. **Aller dans "Settings" > "API"**
2. **Copier ces valeurs :**
   - **Project URL :** `https://[votre-id].supabase.co`
   - **anon public :** `eyJ...`
   - **service_role :** `eyJ...` (⚠️ à garder secrète !)

### 5.2 Mettre à Jour `.env`

```env
# Nouvelles clés Supabase
VITE_SUPABASE_URL=https://[votre-nouveau-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ[votre-nouvelle-cle-publique]
SUPABASE_SERVICE_ROLE_KEY=eyJ[votre-nouvelle-cle-secrete]

# Nouvelles URLs de connexion database
DATABASE_URL="postgresql://postgres.[nouveau-id]:[mot-de-passe]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[nouveau-id]:[mot-de-passe]@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"
```

**📍 Où trouver ces URLs ?**
- Dans Supabase Dashboard → Settings → Database → Connection String

### 5.3 Redémarrer l'Application

```cmd
npm run dev
```

---

## 🧪 **ÉTAPE 6 : Tests de Vérification**

### Test 1 : Créer un Compte Directeur

**Via l'interface de votre application :**
1. Aller sur la page d'inscription
2. Remplir le formulaire (école + directeur)
3. Soumettre

**✅ Résultat Attendu :**
```
✅ Compte Auth créé avec succès
✅ Utilisateur synchronisé dans la table users
✅ École créée avec succès
✅ Année académique créée
```

**❌ Plus d'erreurs 401/42501 !**

### Test 2 : Vérifier la Synchronisation

**Dans SQL Editor :**
```sql
-- Remplacer par l'email du compte test
SELECT * FROM check_user_sync('directeur@test.cm');
```

**✅ Résultat Attendu :**
```json
{
  "email": "directeur@test.cm",
  "auth_user_exists": true,
  "table_user_exists": true,
  "school_exists": true,
  "sync_status": "complete"
}
```

### Test 3 : Vérifier les Tables

```sql
-- Vérifier qu'il y a des données
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM schools) as schools_count,
  (SELECT COUNT(*) FROM academic_years) as academic_years_count;
```

---

## 🔧 **Dépannage**

### Problème : Erreur "type user_role already exists"

**Solution :**
```sql
-- Supprimer les types existants avant de relancer la migration
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS school_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS notification_priority CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;
DROP TYPE IF EXISTS grade_type CASCADE;
DROP TYPE IF EXISTS gender CASCADE;
```

### Problème : Erreur 401/403 persiste

**Solutions :**
1. Vérifier que `fix_rls_permissions_v2.sql` a bien été exécuté
2. Vérifier les politiques :
```sql
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
```
3. Réexécuter `fix_rls_permissions_v2.sql`

### Problème : Trigger ne fonctionne pas

**Vérification :**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

**Si vide, réexécuter :**
```sql
-- Contenu de auto_sync_supabase_auth.sql
```

---

## 📊 **Comparaison Avant/Après Migration**

| Aspect | Avant (Prisma local) | Après (Supabase) |
|--------|----------------------|------------------|
| **Base de données** | Local PostgreSQL | Supabase Cloud |
| **Authentification** | Supabase Auth uniquement | Auth + Sync auto vers tables |
| **Permissions** | RLS basique | RLS avec auto-inscription |
| **Erreurs 401** | ✅ Fréquentes | ❌ Corrigées |
| **Synchronisation** | ⚠️ Manuelle | ✅ Automatique (trigger) |
| **Scalabilité** | ⚠️ Limitée | ✅ Cloud native |

---

## 🎯 **Checklist Finale**

Avant de considérer la migration terminée :

- [ ] Toutes les tables sont créées (22 tables minimum)
- [ ] Les types ENUM sont créés (7 types)
- [ ] Le trigger `on_auth_user_created` existe
- [ ] Les politiques RLS sont en place (minimum 15 politiques)
- [ ] Les clés API sont mises à jour dans `.env`
- [ ] L'application démarre sans erreur
- [ ] Un compte directeur peut être créé sans erreur 401
- [ ] Les données sont visibles dans Supabase Table Editor

---

## 📝 **Résumé de l'Ordre d'Exécution**

```
1️⃣ migration_prisma_to_supabase.sql
   ↓ (Crée tables + enums + triggers)
   
2️⃣ auto_sync_supabase_auth.sql
   ↓ (Synchronisation Auth → Users)
   
3️⃣ fix_rls_permissions_v2.sql
   ↓ (Politiques RLS corrigées)
   
4️⃣ secretary_features.sql (optionnel)
   ↓ (Fonctionnalités secrétaires)
   
✅ MIGRATION TERMINÉE !
```

---

## 🚀 **Prochaines Étapes**

Après la migration réussie :

1. **Tester toutes les fonctionnalités** de l'application
2. **Migrer les données** (si vous avez déjà des données en local)
3. **Configurer les sauvegardes** automatiques dans Supabase
4. **Surveiller les performances** avec Supabase Dashboard

---

## 💡 **Avantages de Cette Migration**

✅ **Plus de problèmes RLS 401/42501**  
✅ **Synchronisation automatique Auth ↔ Tables**  
✅ **Base de données cloud scalable**  
✅ **Politiques de sécurité robustes**  
✅ **Triggers automatiques pour updated_at**  
✅ **Index optimisés pour performances**  

---

## ⚠️ **IMPORTANT**

**Avant de migrer un projet en production :**
1. **Sauvegarder** toutes vos données existantes
2. **Tester** sur un projet Supabase de développement d'abord
3. **Vérifier** que toutes les fonctionnalités marchent
4. **Planifier** une fenêtre de maintenance si nécessaire

---

## 📞 **Besoin d'Aide ?**

Si vous rencontrez des problèmes :
1. Vérifier les logs dans SQL Editor
2. Consulter la documentation Supabase
3. Vérifier que tous les fichiers SQL ont été exécutés dans l'ordre

---

**Bonne migration ! 🎉**
