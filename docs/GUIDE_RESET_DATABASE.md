# 🗑️ Guide de Reset Complet de la Base de Données

## ⚠️ AVERTISSEMENT

Ce guide permet de **supprimer TOUTES les données** de votre base de données tout en **conservant la structure** (tables, colonnes, contraintes, politiques RLS).

---

## 📋 Étape 1 : Lister Toutes les Tables (Optionnel)

Pour voir toutes vos 42 tables avant de les vider :

1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. Collez et exécutez :

```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

3. Vous verrez la liste complète de vos tables avec leur taille

---

## 🔄 Étape 2 : Vider TOUTES les Données

### Script Automatique (RECOMMANDÉ)

Ce script parcourt **automatiquement** les 42 tables et vide chacune :

1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. **Créez une nouvelle requête**
3. Collez le contenu du fichier **`scripts/reset-all-data.sql`** :

```sql
DO $$
DECLARE
  table_record RECORD;
  total_tables INTEGER := 0;
  total_rows_deleted BIGINT := 0;
BEGIN
  RAISE NOTICE '🔄 Début du nettoyage de la base de données...';
  RAISE NOTICE '';

  -- Désactiver temporairement les triggers
  SET session_replication_role = 'replica';

  -- Parcourir TOUTES les tables du schéma public
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  LOOP
    BEGIN
      DECLARE
        row_count BIGINT;
      BEGIN
        EXECUTE format('SELECT COUNT(*) FROM public.%I', table_record.tablename) INTO row_count;

        IF row_count > 0 THEN
          EXECUTE format('TRUNCATE TABLE public.%I CASCADE', table_record.tablename);
          total_tables := total_tables + 1;
          total_rows_deleted := total_rows_deleted + row_count;
          RAISE NOTICE '✅ Table "%" vidée (% lignes)', table_record.tablename, row_count;
        ELSE
          RAISE NOTICE '⚪ Table "%" déjà vide', table_record.tablename;
        END IF;
      END;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur sur table "%": %', table_record.tablename, SQLERRM;
    END;
  END LOOP;

  -- Réactiver les triggers
  SET session_replication_role = 'origin';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ NETTOYAGE TERMINÉ !';
  RAISE NOTICE 'Tables vidées : %', total_tables;
  RAISE NOTICE 'Lignes supprimées : %', total_rows_deleted;
  RAISE NOTICE '========================================';
END $$;
```

4. **Cliquez sur "RUN"** ▶️

5. Vous verrez un log détaillé montrant chaque table vidée

---

## ✅ Étape 3 : Vérifier que Tout est Vide

Pour confirmer que TOUTES les tables sont bien vides :

1. Exécutez le script **`scripts/verify-empty-database.sql`** :

```sql
DO $$
DECLARE
  table_record RECORD;
  row_count BIGINT;
  total_rows BIGINT := 0;
BEGIN
  FOR table_record IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM public.%I', table_record.tablename) INTO row_count;
    IF row_count > 0 THEN
      RAISE NOTICE '⚠️  Table "%" contient % lignes', table_record.tablename, row_count;
      total_rows := total_rows + row_count;
    END IF;
  END LOOP;

  IF total_rows = 0 THEN
    RAISE NOTICE '✅ BASE DE DONNÉES VIDE !';
  ELSE
    RAISE NOTICE '⚠️  Total lignes restantes : %', total_rows;
  END IF;
END $$;
```

2. Résultat attendu : **"✅ BASE DE DONNÉES VIDE !"**

---

## 🔐 Étape 4 : Supprimer les Utilisateurs Auth

Les utilisateurs dans `auth.users` ne sont PAS supprimés automatiquement :

1. Allez dans **Supabase Dashboard** → **Authentication** → **Users**
2. **Cochez la case en haut** pour sélectionner tous les utilisateurs
3. Cliquez sur **"Delete user(s)"**
4. Confirmez la suppression

---

## 🎯 Étape 5 : Tester le Parcours Complet

Maintenant que tout est vide, testez l'inscription depuis zéro :

### 5.1 Démarrer les Apps

```bash
# Terminal 1 - App Hub (port 5173)
pnpm --filter hub dev

# Terminal 2 - App Admin (port 5174)
pnpm --filter admin dev
```

### 5.2 Parcours de Test

1. **Ouvrir** `http://localhost:5173`
2. **Cliquer** sur "Créer Mon Compte"
3. **Remplir le formulaire** :
   - Étape 1 : Infos établissement
   - Étape 2 : Infos directeur
   - Étape 3 : Classes disponibles
4. **Soumettre** → Devrait créer :
   - ✅ Utilisateur dans `auth.users`
   - ✅ École dans `schools`
   - ✅ Métadonnées dans `user_metadata`
5. **Page Onboarding** s'affiche (4 étapes)
6. **Cliquer** "Accéder au Dashboard"
7. **Redirection** vers `http://localhost:5174` (Admin)
8. **Dashboard Admin** s'affiche ✅

---

## 📊 Étape 6 : Vérifier les Nouvelles Données

Après l'inscription, vérifiez que les données sont bien créées :

```sql
-- Vérifier l'utilisateur
SELECT id, email, created_at, raw_user_meta_data->>'role' as role
FROM auth.users;

-- Vérifier l'école
SELECT id, name, code, type, created_at
FROM public.schools;

-- Compter les lignes dans toutes les tables
SELECT tablename, (SELECT COUNT(*) FROM public.tablename) as rows
FROM pg_tables
WHERE schemaname = 'public';
```

---

## 🔍 Ce qui est CONSERVÉ après le reset

✅ **Structure des tables** (colonnes, types)
✅ **Contraintes** (PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK)
✅ **Index** (performance)
✅ **Politiques RLS** (Row Level Security)
✅ **Triggers** (automatisations)
✅ **Functions** (fonctions SQL)
✅ **Migrations appliquées** (historique dans `schema_migrations`)

---

## ❌ Ce qui est SUPPRIMÉ

❌ **Toutes les lignes** de toutes les tables publiques
❌ **Utilisateurs auth** (à supprimer manuellement via Dashboard)
❌ **Fichiers Storage** (si vous en avez)

---

## 🚨 Troubleshooting

### Erreur : "permission denied for table XXX"

**Cause** : Vous n'avez pas les droits suffisants

**Solution** : Exécutez le script en tant que propriétaire de la base (depuis Supabase Dashboard SQL Editor)

---

### Erreur : "cannot truncate a table referenced in a foreign key constraint"

**Cause** : Les contraintes de clés étrangères bloquent la suppression

**Solution** : Le script utilise `TRUNCATE ... CASCADE` qui gère automatiquement les dépendances

---

### Certaines tables ne se vident pas

**Cause** : Possible erreur silencieuse dans la boucle

**Solution** : Regardez les logs détaillés. Les erreurs s'affichent avec ❌

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans le SQL Editor (onglet "Messages")
2. Notez les tables qui posent problème
3. Exécutez manuellement : `TRUNCATE TABLE nom_table CASCADE;`

---

**Dernière mise à jour** : 2026-01-01
**Version** : 1.0.0

⚠️ **IMPORTANT** : Faites toujours un backup avant d'exécuter ces scripts en production !
