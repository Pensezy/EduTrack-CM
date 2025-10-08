-- Script de diagnostic de la base de données EduTrack CM
-- À exécuter dans l'éditeur SQL de Supabase pour voir l'état actuel

-- ====================================
-- 1. VÉRIFICATION DES TABLES EXISTANTES
-- ====================================

SELECT 
    schemaname as schema,
    tablename as table_name,
    tableowner as owner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ====================================
-- 2. VÉRIFICATION DES COLONNES DE LA TABLE SUBJECTS
-- ====================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subjects' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ====================================
-- 3. VÉRIFICATION DES COLONNES DE LA TABLE CLASSES
-- ====================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'classes' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ====================================
-- 4. VÉRIFICATION DES COLONNES DE LA TABLE USERS
-- ====================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ====================================
-- 5. VÉRIFICATION DES TABLES MANQUANTES
-- ====================================

WITH required_tables AS (
    SELECT unnest(ARRAY[
        'schools',
        'users', 
        'subjects',
        'classes',
        'students',
        'teachers',
        'grades',
        'attendances',
        'academic_years',
        'evaluation_periods',
        'grade_types',
        'user_roles',
        'attendance_types',
        'payment_types'
    ]) AS table_name
),
existing_tables AS (
    SELECT tablename AS table_name
    FROM pg_tables 
    WHERE schemaname = 'public'
)
SELECT 
    r.table_name,
    CASE 
        WHEN e.table_name IS NOT NULL THEN '✅ Existe'
        ELSE '❌ Manquante'
    END AS status
FROM required_tables r
LEFT JOIN existing_tables e ON r.table_name = e.table_name
ORDER BY r.table_name;

-- ====================================
-- 6. VÉRIFICATION DES POLITIQUES RLS
-- ====================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ====================================
-- 7. VÉRIFICATION DU CONTENU DES ÉCOLES
-- ====================================

SELECT 
    id,
    name,
    director_name,
    type,
    status,
    city,
    country,
    created_at
FROM schools 
ORDER BY created_at DESC
LIMIT 10;

-- ====================================
-- 8. STATISTIQUES GÉNÉRALES
-- ====================================

SELECT 
    'schools' as table_name,
    count(*) as record_count
FROM schools
UNION ALL
SELECT 
    'users' as table_name,
    count(*) as record_count
FROM users
UNION ALL
SELECT 
    'subjects' as table_name,
    count(*) as record_count
FROM subjects
UNION ALL
SELECT 
    'classes' as table_name,
    count(*) as record_count
FROM classes
UNION ALL
SELECT 
    'academic_years' as table_name,
    count(*) as record_count
FROM academic_years
ORDER BY table_name;