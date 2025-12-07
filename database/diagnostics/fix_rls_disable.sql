-- ====================================
-- Script de correction RLS
-- Désactive le RLS sur toutes les tables principales
-- ====================================
-- ATTENTION : À exécuter uniquement si vous rencontrez des erreurs 403

-- Désactiver RLS sur toutes les tables principales
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS academic_years DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS parents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS parent_student_schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendances DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evaluation_periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS grade_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS class_subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teacher_subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS secretaries DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques RLS existantes (au cas où)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Politique supprimée: %.%.%', pol.schemaname, pol.tablename, pol.policyname;
    END LOOP;
END $$;

-- Vérification finale
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '⚠️ ACTIVÉ (problème)' ELSE '✅ DÉSACTIVÉ (OK)' END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'schools', 'students', 'teachers', 'classes', 'secretaries')
ORDER BY tablename;
