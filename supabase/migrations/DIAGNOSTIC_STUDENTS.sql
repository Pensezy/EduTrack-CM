-- ============================================
-- DIAGNOSTIC COMPLET DES ÉLÈVES
-- ============================================

-- 1. Vérifier la structure de la table students
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- 2. Compter le nombre total d'élèves
SELECT COUNT(*) as total_students FROM students;

-- 3. Lister tous les élèves avec leurs informations
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  date_of_birth,
  enrollment_date,
  class_name,
  is_active,
  school_id,
  parent_id,
  created_at
FROM students
ORDER BY created_at DESC;

-- 4. Vérifier les élèves avec leurs parents
SELECT 
  s.id as student_id,
  s.first_name as student_first_name,
  s.last_name as student_last_name,
  s.class_name,
  s.school_id,
  p.id as parent_id,
  p.first_name as parent_first_name,
  p.last_name as parent_last_name,
  p.email as parent_email,
  p.phone as parent_phone
FROM students s
LEFT JOIN parents p ON s.parent_id = p.id
ORDER BY s.created_at DESC;

-- 5. Compter les élèves par école
SELECT 
  school_id,
  COUNT(*) as student_count
FROM students
GROUP BY school_id;

-- 6. Vérifier les élèves sans parent
SELECT 
  id,
  first_name,
  last_name,
  parent_id
FROM students
WHERE parent_id IS NULL;

-- 7. Vérifier les élèves sans school_id
SELECT 
  id,
  first_name,
  last_name,
  school_id
FROM students
WHERE school_id IS NULL;

-- 8. Informations sur les écoles
SELECT 
  id,
  name,
  type,
  available_classes
FROM schools;

-- 9. Vérifier les user_id des secrétaires
SELECT 
  u.id as user_id,
  u.email,
  u.role,
  u.current_school_id,
  s.id as secretary_id,
  s.first_name,
  s.last_name
FROM users u
LEFT JOIN secretaries s ON u.id = s.user_id
WHERE u.role = 'secretary';
