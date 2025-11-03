-- Diagnostic des structures des tables spécifiques
-- Date: 2025-10-29

-- =====================================================
-- 1. STRUCTURE DE LA TABLE SECRETARIES
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'secretaries'
ORDER BY ordinal_position;

-- =====================================================
-- 2. STRUCTURE DE LA TABLE TEACHERS
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'teachers'
ORDER BY ordinal_position;

-- =====================================================
-- 3. STRUCTURE DE LA TABLE STUDENTS
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- =====================================================
-- 4. STRUCTURE DE LA TABLE PARENTS
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'parents'
ORDER BY ordinal_position;
