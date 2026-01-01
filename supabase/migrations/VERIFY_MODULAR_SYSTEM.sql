-- =====================================================
-- SCRIPT DE VÉRIFICATION : Système Modulaire
-- Date: 2026-01-01
-- Usage: Exécuter dans Supabase SQL Editor pour vérifier l'état du système
-- =====================================================

-- =====================================================
-- 1. VÉRIFIER LES TABLES
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '1️⃣ VÉRIFICATION DES TABLES';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- Table apps
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'apps')
    THEN '✅ Table apps existe'
    ELSE '❌ Table apps MANQUANTE'
  END AS status;

-- Table bundles
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bundles')
    THEN '✅ Table bundles existe'
    ELSE '❌ Table bundles MANQUANTE'
  END AS status;

-- Table school_subscriptions
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'school_subscriptions')
    THEN '✅ Table school_subscriptions existe'
    ELSE '❌ Table school_subscriptions MANQUANTE'
  END AS status;

-- =====================================================
-- 2. VÉRIFIER LES DONNÉES SEED
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '2️⃣ VÉRIFICATION DES DONNÉES SEED';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- Compter les apps
DO $$
DECLARE
  app_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO app_count FROM apps;

  IF app_count = 8 THEN
    RAISE NOTICE '✅ Apps: % apps présentes (attendu: 8)', app_count;
  ELSIF app_count = 0 THEN
    RAISE WARNING '❌ Apps: AUCUNE app trouvée! Exécuter SEED DATA';
  ELSE
    RAISE WARNING '⚠️ Apps: % apps trouvées (attendu: 8)', app_count;
  END IF;
END $$;

-- Compter les bundles
DO $$
DECLARE
  bundle_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bundle_count FROM bundles;

  IF bundle_count = 3 THEN
    RAISE NOTICE '✅ Bundles: % bundles présents (attendu: 3)', bundle_count;
  ELSIF bundle_count = 0 THEN
    RAISE WARNING '❌ Bundles: AUCUN bundle trouvé! Exécuter SEED DATA';
  ELSE
    RAISE WARNING '⚠️ Bundles: % bundles trouvés (attendu: 3)', bundle_count;
  END IF;
END $$;

-- Afficher les apps
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📱 APPLICATIONS DISPONIBLES:';
END $$;

SELECT
  id,
  name,
  CASE
    WHEN is_core THEN '🆓 GRATUIT'
    ELSE price_yearly || ' FCFA/an'
  END AS price,
  category
FROM apps
ORDER BY sort_order;

-- Afficher les bundles
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📦 BUNDLES DISPONIBLES:';
END $$;

SELECT
  id,
  name,
  price_yearly || ' FCFA/an' AS price,
  'Économie: ' || savings || ' FCFA' AS savings
FROM bundles
ORDER BY sort_order;

-- =====================================================
-- 3. VÉRIFIER LES VUES
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '3️⃣ VÉRIFICATION DES VUES';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- Vue v_apps_catalog
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'v_apps_catalog')
    THEN '✅ Vue v_apps_catalog existe'
    ELSE '❌ Vue v_apps_catalog MANQUANTE'
  END AS status;

-- Vue v_bundles_catalog
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'v_bundles_catalog')
    THEN '✅ Vue v_bundles_catalog existe'
    ELSE '❌ Vue v_bundles_catalog MANQUANTE'
  END AS status;

-- Test vue apps
DO $$
DECLARE
  view_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO view_count FROM v_apps_catalog;
  RAISE NOTICE '   → v_apps_catalog retourne % lignes', view_count;
END $$;

-- Test vue bundles
DO $$
DECLARE
  view_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO view_count FROM v_bundles_catalog;
  RAISE NOTICE '   → v_bundles_catalog retourne % lignes', view_count;
END $$;

-- =====================================================
-- 4. VÉRIFIER LES FONCTIONS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '4️⃣ VÉRIFICATION DES FONCTIONS SQL';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- Fonction has_active_app
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'has_active_app'
    )
    THEN '✅ Fonction has_active_app() existe'
    ELSE '❌ Fonction has_active_app() MANQUANTE'
  END AS status;

-- Fonction get_school_active_apps
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'get_school_active_apps'
    )
    THEN '✅ Fonction get_school_active_apps() existe'
    ELSE '❌ Fonction get_school_active_apps() MANQUANTE'
  END AS status;

-- Fonction start_trial
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'start_trial'
    )
    THEN '✅ Fonction start_trial() existe'
    ELSE '❌ Fonction start_trial() MANQUANTE'
  END AS status;

-- Fonction activate_subscription
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'activate_subscription'
    )
    THEN '✅ Fonction activate_subscription() existe'
    ELSE '❌ Fonction activate_subscription() MANQUANTE'
  END AS status;

-- =====================================================
-- 5. VÉRIFIER LE TRIGGER AUTO-ACTIVATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '5️⃣ VÉRIFICATION TRIGGER AUTO-ACTIVATION';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- Fonction auto_activate_core_app
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'auto_activate_core_app'
    )
    THEN '✅ Fonction auto_activate_core_app() existe'
    ELSE '❌ Fonction auto_activate_core_app() MANQUANTE'
  END AS status;

-- Trigger on_school_created
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'on_school_created'
    )
    THEN '✅ Trigger on_school_created existe'
    ELSE '❌ Trigger on_school_created MANQUANT'
  END AS status;

-- =====================================================
-- 6. VÉRIFIER L'ACTIVATION DE L'APP CORE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '6️⃣ VÉRIFICATION ACTIVATION APP CORE';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

DO $$
DECLARE
  total_schools INTEGER;
  schools_with_core INTEGER;
BEGIN
  -- Compter écoles actives
  SELECT COUNT(*) INTO total_schools
  FROM schools
  WHERE status = 'active';

  -- Compter écoles avec app core
  SELECT COUNT(DISTINCT school_id) INTO schools_with_core
  FROM school_subscriptions
  WHERE app_id = 'core' AND status = 'active';

  RAISE NOTICE 'Total écoles actives: %', total_schools;
  RAISE NOTICE 'Écoles avec app "core": %', schools_with_core;

  IF total_schools = schools_with_core THEN
    RAISE NOTICE '✅ Toutes les écoles ont l''app "core" activée';
  ELSIF schools_with_core = 0 THEN
    RAISE WARNING '❌ AUCUNE école n''a l''app "core"! Exécuter migration 20260101_auto_activate_core_app.sql';
  ELSE
    RAISE WARNING '⚠️ % écoles sans app "core"', (total_schools - schools_with_core);
  END IF;
END $$;

-- Détail des écoles avec/sans core
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🏫 DÉTAIL DES ÉCOLES:';
END $$;

SELECT
  s.name AS school_name,
  CASE
    WHEN ss.id IS NOT NULL THEN '✅ App core active'
    ELSE '❌ App core MANQUANTE'
  END AS core_status,
  ss.activated_at
FROM schools s
LEFT JOIN school_subscriptions ss
  ON ss.school_id = s.id
  AND ss.app_id = 'core'
WHERE s.status = 'active'
ORDER BY s.name;

-- =====================================================
-- 7. RÉSUMÉ FINAL
-- =====================================================

DO $$
DECLARE
  tables_ok BOOLEAN;
  apps_ok BOOLEAN;
  bundles_ok BOOLEAN;
  views_ok BOOLEAN;
  functions_ok BOOLEAN;
  trigger_ok BOOLEAN;
  core_ok BOOLEAN;

  app_count INTEGER;
  bundle_count INTEGER;
  total_schools INTEGER;
  schools_with_core INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '📊 RÉSUMÉ FINAL';
  RAISE NOTICE '═══════════════════════════════════════════════════════';

  -- Vérifier tables
  tables_ok := (
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'apps') AND
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bundles') AND
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'school_subscriptions')
  );

  -- Vérifier données
  SELECT COUNT(*) INTO app_count FROM apps;
  SELECT COUNT(*) INTO bundle_count FROM bundles;
  apps_ok := (app_count = 8);
  bundles_ok := (bundle_count = 3);

  -- Vérifier vues
  views_ok := (
    EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'v_apps_catalog') AND
    EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'v_bundles_catalog')
  );

  -- Vérifier fonctions
  functions_ok := (
    EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'has_active_app') AND
    EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_school_active_apps') AND
    EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'start_trial')
  );

  -- Vérifier trigger
  trigger_ok := EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_school_created');

  -- Vérifier app core
  SELECT COUNT(*) INTO total_schools FROM schools WHERE status = 'active';
  SELECT COUNT(DISTINCT school_id) INTO schools_with_core
  FROM school_subscriptions
  WHERE app_id = 'core' AND status = 'active';
  core_ok := (total_schools = schools_with_core);

  -- Afficher résumé
  IF tables_ok THEN
    RAISE NOTICE '✅ Tables: OK';
  ELSE
    RAISE WARNING '❌ Tables: PROBLÈME';
  END IF;

  IF apps_ok THEN
    RAISE NOTICE '✅ Apps seed: OK (% apps)', app_count;
  ELSE
    RAISE WARNING '❌ Apps seed: PROBLÈME (% apps au lieu de 8)', app_count;
  END IF;

  IF bundles_ok THEN
    RAISE NOTICE '✅ Bundles seed: OK (% bundles)', bundle_count;
  ELSE
    RAISE WARNING '❌ Bundles seed: PROBLÈME (% bundles au lieu de 3)', bundle_count;
  END IF;

  IF views_ok THEN
    RAISE NOTICE '✅ Vues: OK';
  ELSE
    RAISE WARNING '❌ Vues: PROBLÈME';
  END IF;

  IF functions_ok THEN
    RAISE NOTICE '✅ Fonctions SQL: OK';
  ELSE
    RAISE WARNING '❌ Fonctions SQL: PROBLÈME';
  END IF;

  IF trigger_ok THEN
    RAISE NOTICE '✅ Trigger auto-activation: OK';
  ELSE
    RAISE WARNING '❌ Trigger auto-activation: MANQUANT';
  END IF;

  IF core_ok THEN
    RAISE NOTICE '✅ App core activée: OK (% écoles)', schools_with_core;
  ELSE
    RAISE WARNING '❌ App core activée: PROBLÈME (% / % écoles)', schools_with_core, total_schools;
  END IF;

  RAISE NOTICE '';
  IF tables_ok AND apps_ok AND bundles_ok AND views_ok AND functions_ok AND trigger_ok AND core_ok THEN
    RAISE NOTICE '🎉 SYSTÈME MODULAIRE: 100% OPÉRATIONNEL';
  ELSE
    RAISE WARNING '⚠️ SYSTÈME MODULAIRE: PROBLÈMES DÉTECTÉS';
    RAISE NOTICE '   → Consulter le guide: docs/DEPLOYMENT/APPLY_MIGRATIONS_SUPABASE.md';
  END IF;
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
