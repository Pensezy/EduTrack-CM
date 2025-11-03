-- Diagnostic des tables liées aux différents rôles
-- Date: 2025-10-29

-- =====================================================
-- 1. LISTER TOUTES LES TABLES DU SCHÉMA PUBLIC
-- =====================================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- 2. VÉRIFIER SI DES TABLES SPÉCIFIQUES EXISTENT
-- =====================================================
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('teachers', 'enseignants') THEN '👨‍🏫 Table Enseignants'
    WHEN table_name IN ('students', 'eleves', 'étudiants') THEN '🎓 Table Élèves'
    WHEN table_name IN ('parents') THEN '👪 Table Parents'
    WHEN table_name IN ('secretaries', 'secrétaires') THEN '📋 Table Secrétaires'
    WHEN table_name IN ('users', 'utilisateurs') THEN '👥 Table Utilisateurs (tous)'
    WHEN table_name IN ('schools', 'ecoles', 'établissements') THEN '🏫 Table Écoles'
    ELSE '📦 Autre table'
  END as type_table
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- 3. COMPTER LES UTILISATEURS PAR RÔLE
-- =====================================================
SELECT 
  role,
  COUNT(*) as nombre_comptes,
  COUNT(CASE WHEN is_active = true THEN 1 END) as comptes_actifs,
  COUNT(CASE WHEN is_active = false THEN 1 END) as comptes_inactifs
FROM users
GROUP BY role
ORDER BY role;

-- =====================================================
-- 4. VÉRIFIER SI LA TABLE TEACHERS EXISTE
-- =====================================================
SELECT 
  EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'teachers'
  ) as table_teachers_existe;

-- =====================================================
-- 5. VÉRIFIER SI LA TABLE STUDENTS EXISTE
-- =====================================================
SELECT 
  EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'students'
  ) as table_students_existe;

-- =====================================================
-- 6. VÉRIFIER SI LA TABLE PARENTS EXISTE
-- =====================================================
SELECT 
  EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'parents'
  ) as table_parents_existe;

-- =====================================================
-- 7. STRUCTURE DE LA TABLE USERS - ENUM ROLE
-- =====================================================
SELECT 
  t.typname as enum_name,
  e.enumlabel as valeur_possible
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;
