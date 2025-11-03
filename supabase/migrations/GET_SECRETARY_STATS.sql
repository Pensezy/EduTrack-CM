-- Requête pour obtenir les statistiques réelles du dashboard secrétaire
-- Date: 2025-11-04

-- =====================================================
-- 1. STATISTIQUES ÉLÈVES
-- =====================================================
SELECT 
  COUNT(*) as total_students,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_students
FROM students
WHERE school_id = 'VOTRE_SCHOOL_ID'; -- Remplacer par l'ID de l'école

-- =====================================================
-- 2. VÉRIFIER SI TABLE JUSTIFICATIONS EXISTE
-- =====================================================
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'justifications'
) as justifications_table_exists;

-- =====================================================
-- 3. VÉRIFIER SI TABLE PAYMENTS EXISTE
-- =====================================================
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'payments'
) as payments_table_exists;

-- =====================================================
-- 4. VÉRIFIER SI TABLE PARENT_CALLS EXISTE
-- =====================================================
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'parent_calls'
) as parent_calls_table_exists;

-- =====================================================
-- 5. LISTER TOUTES LES TABLES EXISTANTES
-- =====================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- 6. COMPTER LES ÉTUDIANTS PAR ÉCOLE
-- =====================================================
SELECT 
  s.name as school_name,
  COUNT(st.id) as student_count
FROM schools s
LEFT JOIN students st ON st.school_id = s.id
GROUP BY s.id, s.name
ORDER BY s.name;
