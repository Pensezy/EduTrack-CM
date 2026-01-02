-- ============================================================================
-- Script de Vérification : Apps et RLS
-- ============================================================================
-- À exécuter dans Supabase SQL Editor pour diagnostiquer le problème
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : Vérifier si des apps existent dans la table
-- ============================================================================

SELECT
  '1️⃣ VÉRIFICATION DONNÉES APPS' as etape,
  COUNT(*) as nombre_apps
FROM apps;

-- Détail des apps
SELECT
  id,
  name,
  category,
  status,
  price_yearly
FROM apps
ORDER BY sort_order;

-- ============================================================================
-- ÉTAPE 2 : Vérifier les politiques RLS sur la table apps
-- ============================================================================

SELECT
  '2️⃣ VÉRIFICATION POLITIQUES RLS APPS' as etape;

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'apps'
ORDER BY policyname;

-- ============================================================================
-- ÉTAPE 3 : Vérifier si RLS est activé sur la table apps
-- ============================================================================

SELECT
  '3️⃣ VÉRIFICATION RLS ACTIVÉ' as etape;

SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'apps';

-- ============================================================================
-- ÉTAPE 4 : Tester la requête comme utilisateur authentifié
-- ============================================================================

SELECT
  '4️⃣ TEST REQUÊTE AUTHENTIFIÉ' as etape;

-- Voir l'utilisateur actuel
SELECT
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- Voir le profil de l'utilisateur
SELECT
  id,
  email,
  role,
  current_school_id
FROM users
WHERE id = auth.uid();

-- ============================================================================
-- ÉTAPE 5 : Tester l'accès aux apps avec les politiques actuelles
-- ============================================================================

SELECT
  '5️⃣ TEST ACCÈS APPS' as etape;

-- Cette requête devrait retourner des résultats si RLS fonctionne
SELECT
  id,
  name,
  category,
  status
FROM apps
LIMIT 5;

-- ============================================================================
-- ÉTAPE 6 : Vérifier les bundles (pour comparaison)
-- ============================================================================

SELECT
  '6️⃣ VÉRIFICATION BUNDLES (comparaison)' as etape;

SELECT
  COUNT(*) as nombre_bundles
FROM bundles;

SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'bundles'
ORDER BY policyname;

-- ============================================================================
-- DIAGNOSTIC FINAL
-- ============================================================================

SELECT
  '📊 DIAGNOSTIC FINAL' as etape;

-- Si cette requête retourne 0, le problème est soit :
-- 1. Table apps vide (aucune donnée)
-- 2. RLS bloque l'accès malgré les politiques

-- Si > 0 mais frontend vide : problème côté client
SELECT
  (SELECT COUNT(*) FROM apps) as apps_total,
  (SELECT COUNT(*) FROM bundles) as bundles_total,
  (SELECT COUNT(*) FROM school_subscriptions) as subscriptions_total,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'apps') as apps_policies_count,
  (SELECT rowsecurity FROM pg_tables WHERE tablename = 'apps') as apps_rls_enabled;
