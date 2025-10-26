# Historique des Migrations Supabase

Ce fichier documente toutes les migrations appliquées au projet EduTrack-CM.

## 📋 Migrations Appliquées

### 20250101000000_initial_schema.sql
**Date :** Janvier 2025  
**Description :** Création du schéma complet EduTrack-CM (22 tables)  
**Status :** ✅ Appliqué

**Tables créées :**
- users, schools, academic_years, classes, subjects
- teachers, students, parents, secretaries
- parent_student_schools, teacher_subjects, class_subjects
- grades, attendances, payments, notifications, audit_logs
- evaluation_periods, grade_types, attendance_types, payment_types, user_roles

**Enums créés :**
- school_type, user_role, class_level, gender
- attendance_status, payment_status, notification_type

**Indexes créés :**
- Indexes sur les clés étrangères
- Indexes pour les requêtes fréquentes

---

### 20250102000000_auth_trigger.sql
**Date :** Janvier 2025  
**Description :** Configuration du trigger d'authentification automatique  
**Status :** ✅ Appliqué

**Fonctionnalités :**
- Trigger `on_auth_user_created` sur `auth.users`
- Fonction `handle_new_user_automatic()` avec SECURITY DEFINER
- Auto-insertion dans `users` pour tous les rôles
- Auto-création de l'école pour les directeurs
- Initialisation des types par défaut (notes, présences, paiements)
- Configuration des périodes d'évaluation (trimestres/semestres)
- Désactivation RLS sur 8 tables

**Résolution de problèmes :**
- ✅ Ajout de `SET search_path = public, auth` pour accès aux deux schémas
- ✅ SECURITY DEFINER pour permissions élevées
- ✅ RLS désactivé pour éviter les conflits de permissions
- ✅ Gestion d'erreurs avec EXCEPTION pour ne pas bloquer la création de compte

---

## 🔄 Migrations Futures

### Template pour nouvelles migrations

```sql
-- YYYYMMDDHHMMSS_description.sql
-- Description: [Description détaillée du changement]
-- Date: [Date]
-- Auteur: [Nom]

-- Migration UP
BEGIN;

-- Vos changements ici
ALTER TABLE example ADD COLUMN new_field TEXT;

COMMIT;

-- Migration DOWN (optionnel, pour rollback)
-- ALTER TABLE example DROP COLUMN new_field;
```

### Convention de nommage

Format : `YYYYMMDDHHMMSS_description.sql`

Exemples :
- `20250103120000_add_student_photos.sql`
- `20250104093000_create_homework_table.sql`
- `20250105150000_add_indexes_performance.sql`

## 📝 Checklist avant migration

- [ ] Tester sur base de données locale/dev
- [ ] Vérifier les dépendances (foreign keys, indexes)
- [ ] Prévoir un rollback si nécessaire
- [ ] Documenter les changements
- [ ] Synchroniser Prisma après migration
- [ ] Mettre à jour database/README.md

## 🚀 Appliquer une nouvelle migration

### 1. Via Supabase SQL Editor (Recommandé pour production)

```bash
# 1. Créer le fichier de migration
# 2. Copier le contenu
# 3. Coller dans Supabase SQL Editor
# 4. Exécuter
```

### 2. Via Supabase CLI (Pour développement local)

```bash
# Créer une migration
supabase migration new description

# Éditer le fichier généré
# puis appliquer
supabase db push
```

### 3. Synchroniser Prisma

```bash
npx prisma db pull
npx prisma generate
```

## 🔍 Vérification post-migration

```sql
-- Vérifier que la migration est appliquée
SELECT * FROM supabase_migrations ORDER BY version DESC LIMIT 5;

-- Vérifier les tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Vérifier les triggers
SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgname LIKE '%edutrack%';

-- Vérifier les indexes
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
```

## ⚠️ Rollback

En cas de problème, contacter l'administrateur de la base de données pour restaurer un snapshot ou exécuter une migration DOWN si elle existe.

**Sauvegardes Supabase :**
- Snapshots automatiques quotidiens (7 jours de rétention)
- Point-in-time recovery disponible

---

**Dernière mise à jour :** Octobre 2025  
**Migrations appliquées :** 2  
**Prochaine migration :** TBD
