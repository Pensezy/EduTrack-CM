# Instructions d'Application - Migration Architecture Modulaire

## 📋 Fichier de Migration

`20251231_modular_architecture_setup.sql`

## 🎯 Objectif

Cette migration crée l'infrastructure complète pour le système d'applications modulaires d'EduTrack CM, incluant:
- 3 tables principales (apps, bundles, school_subscriptions)
- 4 fonctions SQL
- Politiques RLS
- Données de seed (8 apps + 3 bundles)

## 🔧 Méthodes d'Application

### Option 1: Via Supabase Dashboard (Recommandé)

1. Connectez-vous à [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet EduTrack CM
3. Allez dans **SQL Editor**
4. Créez une nouvelle requête
5. Copiez-collez le contenu complet du fichier `20251231_modular_architecture_setup.sql`
6. Cliquez sur **Run** (F5)
7. Vérifiez qu'il n'y a pas d'erreurs

### Option 2: Via Supabase CLI

```bash
# Installer Supabase CLI si nécessaire
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref your-project-id

# Appliquer la migration
supabase db push
```

### Option 3: Via psql (Connexion directe)

```bash
# Utiliser l'URL de connexion directe
psql "postgresql://postgres.your-project-id:YOUR_PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres"

# Dans psql
\i supabase/migrations/20251231_modular_architecture_setup.sql
```

## ✅ Vérification Post-Migration

Après application, exécutez ces requêtes de vérification dans SQL Editor:

```sql
-- 1. Vérifier que les tables existent
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('apps', 'bundles', 'school_subscriptions');

-- 2. Vérifier que les 8 apps sont créées
SELECT id, name, category, price_yearly, is_core
FROM apps
ORDER BY sort_order;

-- 3. Vérifier les 3 bundles
SELECT id, name, price_yearly, savings, array_length(app_ids, 1) as nb_apps
FROM bundles
ORDER BY price_yearly;

-- 4. Tester la fonction has_active_app (doit retourner true pour app core)
SELECT has_active_app(
  (SELECT id FROM schools LIMIT 1),
  'core'
) as has_core_access;

-- 5. Tester get_school_active_apps
SELECT get_school_active_apps(
  (SELECT id FROM schools LIMIT 1)
);

-- 6. Vérifier les politiques RLS
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('apps', 'bundles', 'school_subscriptions');
```

## 📊 Résultats Attendus

### Apps créées (8 total):
1. **core** (gratuit) - Dashboard base
2. **academic** (15 000 FCFA/an) - Notes, bulletins
3. **financial** (20 000 FCFA/an) - Paiements, reçus
4. **discipline** (10 000 FCFA/an) - Absences, sanctions
5. **schedule** (12 000 FCFA/an) - Emploi du temps
6. **communication** (8 000 FCFA/an) - SMS, messagerie
7. **reporting** (15 000 FCFA/an) - Rapports, exports
8. **hr** (18 000 FCFA/an) - Gestion RH

### Bundles créés (3 total):
1. **starter** (25 000 FCFA/an) - Academic + Discipline
2. **standard** (50 000 FCFA/an) - 4 apps principales
3. **premium** (80 000 FCFA/an) - Toutes les apps

## 🚨 En Cas d'Erreur

### Erreur: "function get_user_school_id() does not exist" ✅ CORRIGÉ
**Cause**: Les fonctions helper n'existaient pas.
**Solution**: Cette erreur a été corrigée - la migration inclut maintenant les fonctions `get_user_school_id()` et `get_user_role()`.

### Erreur: "relation schools does not exist"
**Solution**: La table `schools` doit exister avant cette migration. Appliquez d'abord `20250101000000_initial_schema.sql`.

### Erreur: "function uuid_generate_v4 does not exist"
**Solution**: Activez l'extension UUID dans Supabase:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Erreur: "permission denied for table auth.users"
**Solution**: Utilisez la clé `service_role` au lieu de `anon` pour exécuter la migration.

### Erreur: Conflit de clés
**Solution**: Si les tables existent déjà, supprimez-les d'abord (ATTENTION: perte de données):
```sql
DROP TABLE IF EXISTS school_subscriptions CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;
DROP TABLE IF EXISTS apps CASCADE;
```

## 🔄 Rollback (Annulation)

Si vous devez annuler cette migration:

```sql
-- Supprimer les fonctions
DROP FUNCTION IF EXISTS has_active_app(UUID, TEXT);
DROP FUNCTION IF EXISTS get_school_active_apps(UUID);
DROP FUNCTION IF EXISTS start_trial(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS activate_subscription(UUID, TEXT, INTEGER, TEXT, TEXT, UUID);

-- Supprimer les vues
DROP VIEW IF EXISTS v_apps_catalog;
DROP VIEW IF EXISTS v_bundles_catalog;

-- Supprimer les tables (ATTENTION: perte de données)
DROP TABLE IF EXISTS school_subscriptions CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;
DROP TABLE IF EXISTS apps CASCADE;
```

## 📝 Notes

- **Temps d'exécution estimé**: 2-5 secondes
- **Données affectées**: Aucune donnée existante n'est modifiée
- **Backup recommandé**: Oui, faire un snapshot Supabase avant migration
- **Environnement de test**: Tester d'abord sur un projet Supabase de développement

## ✨ Prochaine Étape

Après application réussie de cette migration, passez à:
- **Phase 1 Semaine 3-4**: Création des hooks React (`useAppAccess`, `useFeatureAccess`, etc.)
- **Phase 2**: Interface utilisateur App Store

## 📞 Support

En cas de problème, vérifiez:
1. Les logs Supabase (Dashboard > Logs)
2. La console PostgreSQL
3. Les permissions RLS
