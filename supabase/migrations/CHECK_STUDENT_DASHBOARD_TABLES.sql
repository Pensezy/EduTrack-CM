-- ====================================
-- VÉRIFICATION DES TABLES POUR LE DASHBOARD ÉTUDIANT
-- ====================================

-- 1. Vérifier la table students et ses colonnes
SELECT 
  'students' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- 2. Vérifier la table classes et ses colonnes
SELECT 
  'classes' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'classes'
ORDER BY ordinal_position;

-- 3. Vérifier la table grades et ses colonnes
SELECT 
  'grades' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'grades'
ORDER BY ordinal_position;

-- 4. Vérifier la table attendances et ses colonnes
SELECT 
  'attendances' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'attendances'
ORDER BY ordinal_position;

-- 5. Vérifier si la table assignments existe
SELECT 
  'assignments' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'assignments'
ORDER BY ordinal_position;

-- 6. Vérifier si la table student_achievements existe
SELECT 
  'student_achievements' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'student_achievements'
ORDER BY ordinal_position;

-- 7. Vérifier si la table behavior_assessments existe
SELECT 
  'behavior_assessments' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'behavior_assessments'
ORDER BY ordinal_position;

-- 8. Vérifier la table notifications
SELECT 
  'notifications' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- 9. Vérifier la table subjects
SELECT 
  'subjects' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'subjects'
ORDER BY ordinal_position;

-- 10. Vérifier la table teachers
SELECT 
  'teachers' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'teachers'
ORDER BY ordinal_position;

-- 11. Lister toutes les tables disponibles
SELECT 
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
