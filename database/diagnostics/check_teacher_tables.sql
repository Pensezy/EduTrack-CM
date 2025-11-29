-- ====================================
-- SCRIPT DE VÉRIFICATION - DASHBOARD ENSEIGNANT
-- À exécuter dans Supabase SQL Editor pour vérifier les tables/colonnes existantes
-- ====================================

-- ====================================
-- PARTIE 1 : VÉRIFIER LES TABLES DE BASE
-- ====================================

SELECT 
  'TABLE users' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

SELECT 
  'TABLE schools' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schools') 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

SELECT 
  'TABLE teachers' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teachers') 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

SELECT 
  'TABLE classes' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'classes') 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

SELECT 
  'TABLE subjects' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subjects') 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

SELECT 
  'TABLE students' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

SELECT 
  'TABLE academic_years' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'academic_years') 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

-- ====================================
-- PARTIE 2 : VÉRIFIER LES TABLES FONCTIONNELLES
-- ====================================

SELECT 
  'TABLE grades' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'grades') 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

SELECT 
  'TABLE attendances' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendances') 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

SELECT 
  'TABLE assignments' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments') 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

SELECT 
  'TABLE documents' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

SELECT 
  'TABLE communications' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'communications') 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

-- ====================================
-- PARTIE 3 : VÉRIFIER LES TABLES SPÉCIFIQUES ENSEIGNANT
-- ====================================

SELECT 
  'TABLE teacher_assignments' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_assignments') 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE - À CRÉER' 
  END AS status;

SELECT 
  'TABLE teacher_schedules' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_schedules') 
    THEN '✅ EXISTE' 
    ELSE '⚠️ OPTIONNELLE - Peut utiliser schedule JSONB dans teacher_assignments' 
  END AS status;

-- ====================================
-- PARTIE 4 : VÉRIFIER LES COLONNES DANS documents
-- ====================================

SELECT 
  'COLONNE documents.visibility' AS check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'visibility'
  ) 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

SELECT 
  'COLONNE documents.target_student_id' AS check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'target_student_id'
  ) 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

SELECT 
  'COLONNE documents.target_class_id' AS check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'target_class_id'
  ) 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

SELECT 
  'COLONNE documents.is_public' AS check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'is_public'
  ) 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END AS status;

-- ====================================
-- PARTIE 5 : RÉCAPITULATIF GLOBAL
-- ====================================

DO $$ 
DECLARE
    missing_tables TEXT[];
    table_name_check TEXT;
BEGIN
    -- Liste des tables requises
    FOR table_name_check IN 
        SELECT unnest(ARRAY[
            'users', 'schools', 'teachers', 'classes', 'subjects', 
            'students', 'academic_years', 'grades', 'attendances', 
            'assignments', 'documents', 'communications'
        ])
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name_check) THEN
            missing_tables := array_append(missing_tables, table_name_check);
        END IF;
    END LOOP;
    
    -- Afficher le résultat
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '';
        RAISE WARNING '⚠️ ========================================';
        RAISE WARNING '⚠️ TABLES MANQUANTES : %', array_to_string(missing_tables, ', ');
        RAISE WARNING '⚠️ Exécutez : supabase/migrations/20250101000000_initial_schema.sql';
        RAISE WARNING '⚠️ ========================================';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '✅ ========================================';
        RAISE NOTICE '✅ TOUTES LES TABLES DE BASE EXISTENT !';
        RAISE NOTICE '✅ ========================================';
        
        -- Vérifier teacher_assignments
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_assignments') THEN
            RAISE NOTICE '';
            RAISE WARNING '⚠️ TABLE MANQUANTE : teacher_assignments';
            RAISE WARNING '⚠️ Cette table est NÉCESSAIRE pour le dashboard enseignant';
            RAISE WARNING '⚠️ Exécutez le SQL ci-dessous dans la section CRÉATION';
        ELSE
            RAISE NOTICE '✅ Table teacher_assignments existe';
        END IF;
    END IF;
END $$;

-- ====================================
-- PARTIE 6 : STRUCTURE DES TABLES PRINCIPALES
-- ====================================

-- Afficher les colonnes de la table teachers
SELECT 
    '📋 STRUCTURE TABLE teachers' AS info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'teachers'
ORDER BY ordinal_position;

-- Afficher les colonnes de la table classes
SELECT 
    '📋 STRUCTURE TABLE classes' AS info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'classes'
ORDER BY ordinal_position;

-- Afficher les colonnes de la table students
SELECT 
    '📋 STRUCTURE TABLE students' AS info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;
