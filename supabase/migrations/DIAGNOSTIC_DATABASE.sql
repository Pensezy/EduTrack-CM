-- DIAGNOSTIC COMPLET DE LA BASE DE DONNÉES
-- Date: 2025-10-29
-- Objectif: Vérifier la structure actuelle avant modification

-- =====================================================
-- 1. VÉRIFIER LA STRUCTURE DE LA TABLE USERS
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- =====================================================
-- 2. VÉRIFIER LA STRUCTURE DE LA TABLE SCHOOLS
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'schools'
ORDER BY ordinal_position;

-- =====================================================
-- 3. VÉRIFIER LES DONNÉES DU DIRECTEUR
-- =====================================================
SELECT 
  id,
  email,
  full_name,
  role,
  phone,
  current_school_id,
  is_active,
  created_at
FROM users
WHERE email = 'kongasandji@gmail.com';

-- =====================================================
-- 4. VÉRIFIER S'IL EXISTE UNE ÉCOLE POUR CE DIRECTEUR
-- =====================================================
-- Cette requête sera ajustée après avoir vu la structure exacte de schools
-- SELECT 
--   id,
--   name,
--   created_at
-- FROM schools
-- LIMIT 5;

-- =====================================================
-- 5. VÉRIFIER TOUTES LES ÉCOLES EXISTANTES
-- =====================================================
SELECT 
  id,
  name,
  created_at
FROM schools
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 6. VÉRIFIER LES CONTRAINTES FOREIGN KEY
-- =====================================================
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (tc.table_name = 'users' OR tc.table_name = 'schools')
ORDER BY tc.table_name, tc.constraint_name;

-- =====================================================
-- 7. VÉRIFIER LES UTILISATEURS AVEC/SANS ÉCOLE
-- =====================================================
SELECT 
  role,
  COUNT(*) as total,
  COUNT(current_school_id) as with_school,
  COUNT(*) - COUNT(current_school_id) as without_school
FROM users
GROUP BY role
ORDER BY role;

-- =====================================================
-- 8. RÉSUMÉ GÉNÉRAL
-- =====================================================
SELECT 
  'Total users' as info,
  COUNT(*)::text as value
FROM users
UNION ALL
SELECT 
  'Total schools',
  COUNT(*)::text
FROM schools
UNION ALL
SELECT 
  'Users without school',
  COUNT(*)::text
FROM users
WHERE current_school_id IS NULL
UNION ALL
SELECT 
  'Directors',
  COUNT(*)::text
FROM users
WHERE role = 'principal'
UNION ALL
SELECT 
  'Secretaries',
  COUNT(*)::text
FROM users
WHERE role = 'secretary';
