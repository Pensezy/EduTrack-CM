-- ====================================
-- Script de diagnostic RLS (Row Level Security)
-- ====================================
-- Ce script vérifie l'état du RLS sur toutes les tables

-- 1. Vérifier l'état RLS sur toutes les tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Lister toutes les politiques RLS actives
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Vérifier les tables critiques
SELECT 
    'Table: ' || tablename || ' - RLS: ' || 
    CASE WHEN rowsecurity THEN 'ENABLED ⚠️' ELSE 'DISABLED ✅' END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'schools', 'students', 'teachers', 'classes', 'secretaries')
ORDER BY tablename;
