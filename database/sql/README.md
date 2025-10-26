# Scripts SQL - EduTrack-CM

Ce dossier contient les scripts SQL principaux pour le projet EduTrack-CM.

## 📁 Fichiers SQL

### FIX_TRIGGER_ONLY.sql
**Taille :** 10.5 KB  
**Description :** Solution finale du trigger d'authentification automatique  
**Usage :** À exécuter dans Supabase SQL Editor

**Fonctionnalités :**
- ✅ Trigger `on_auth_user_created` avec SECURITY DEFINER
- ✅ Auto-insertion dans `users` après signup Supabase Auth
- ✅ Création automatique de l'école pour les directeurs
- ✅ Initialisation des types par défaut (notes, présences, paiements)
- ✅ Configuration des périodes d'évaluation (trimestres/semestres)
- ✅ Désactivation RLS sur 8 tables

**Ordre d'exécution :** 2ème (après MIGRATION_COMPLETE_22_TABLES.sql)

---

### MIGRATION_COMPLETE_22_TABLES.sql
**Taille :** 31.8 KB  
**Description :** Schéma complet de la base de données (22 tables)  
**Usage :** À exécuter dans Supabase SQL Editor

**Tables créées :**
1. users
2. schools
3. academic_years
4. classes
5. subjects
6. teachers
7. students
8. parents
9. secretaries
10. parent_student_schools
11. teacher_subjects
12. class_subjects
13. grades
14. attendances
15. payments
16. notifications
17. audit_logs
18. evaluation_periods
19. grade_types
20. attendance_types
21. payment_types
22. user_roles

**Enums créés :**
- school_type (public, primaire, college, lycee, college_lycee)
- user_role (principal, teacher, student, parent, secretary)
- class_level (CP, CE1, CE2, CM1, CM2, 6e, 5e, 4e, 3e, 2nde, 1ere, Tle)
- gender (male, female, other)
- attendance_status, payment_status, notification_type

**Ordre d'exécution :** 1er (avant FIX_TRIGGER_ONLY.sql)

## 🚀 Utilisation

### Installation Initiale

```sql
-- 1. Exécuter dans Supabase SQL Editor
-- Copier et coller le contenu de MIGRATION_COMPLETE_22_TABLES.sql
-- Cliquer sur "Run"

-- 2. Ensuite, exécuter FIX_TRIGGER_ONLY.sql
-- Copier et coller le contenu
-- Cliquer sur "Run"
```

### Synchronisation Prisma

Après avoir exécuté les scripts SQL :

```bash
# Récupérer le schéma depuis Supabase
npx prisma db pull

# Générer le client Prisma
npx prisma generate
```

## 🔗 Copies de Référence

Ces mêmes fichiers existent aussi dans :
- `supabase/migrations/20250101000000_initial_schema.sql` (copie de MIGRATION_COMPLETE_22_TABLES.sql)
- `supabase/migrations/20250102000000_auth_trigger.sql` (copie de FIX_TRIGGER_ONLY.sql)

## ⚠️ Notes Importantes

1. **Ordre d'exécution crucial** : Toujours exécuter MIGRATION_COMPLETE d'abord, puis FIX_TRIGGER
2. **Environnement** : Ces scripts sont pour Supabase PostgreSQL (version 17.6+)
3. **RLS** : Row Level Security est désactivé sur 8 tables en développement
4. **Production** : Activer RLS et configurer les policies avant déploiement

## 📚 Documentation Connexe

- **[database/README.md](../README.md)** - Documentation complète des 22 tables
- **[supabase/README.md](../../supabase/README.md)** - Configuration Supabase
- **[docs/SUPABASE_AUTH.md](../../docs/SUPABASE_AUTH.md)** - Authentification
- **[prisma/README.md](../../prisma/README.md)** - Workflow Prisma

---

**Dernière mise à jour :** Octobre 2025  
**Status :** ✅ Testé et fonctionnel
