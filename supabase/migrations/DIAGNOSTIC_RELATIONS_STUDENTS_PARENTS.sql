-- ============================================
-- DIAGNOSTIC COMPLET RELATIONS STUDENTS-PARENTS
-- ============================================

-- 1. Vérifier la structure de la table students
SELECT 
  'STRUCTURE TABLE STUDENTS' as diagnostic,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- 2. Vérifier la structure de la table parents
SELECT 
  'STRUCTURE TABLE PARENTS' as diagnostic,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'parents'
ORDER BY ordinal_position;

-- 3. Vérifier les FOREIGN KEYS existantes
SELECT
  'FOREIGN KEYS' as diagnostic,
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('students', 'parents');

-- 4. Lister tous les élèves avec leurs données
SELECT 
  'TOUS LES ÉLÈVES' as diagnostic,
  id,
  first_name,
  last_name,
  class_name,
  parent_id,
  school_id,
  is_active
FROM students
ORDER BY created_at DESC;

-- 5. Lister tous les parents
SELECT 
  'TOUS LES PARENTS' as diagnostic,
  id,
  first_name,
  last_name,
  email,
  phone,
  user_id
FROM parents
ORDER BY created_at DESC;

-- 6. Vérifier les élèves AVEC leur parent (JOIN)
SELECT 
  'ÉLÈVES AVEC PARENTS (JOIN)' as diagnostic,
  s.id as student_id,
  s.first_name as student_first_name,
  s.last_name as student_last_name,
  s.class_name,
  s.parent_id,
  p.id as parent_id_found,
  p.first_name as parent_first_name,
  p.last_name as parent_last_name,
  p.email as parent_email,
  p.phone as parent_phone
FROM students s
LEFT JOIN parents p ON s.parent_id = p.id
ORDER BY s.created_at DESC;

-- 7. Compter les élèves sans parent_id
SELECT 
  'ÉLÈVES SANS PARENT_ID' as diagnostic,
  COUNT(*) as count_without_parent_id
FROM students
WHERE parent_id IS NULL;

-- 8. Compter les élèves avec parent_id mais parent inexistant
SELECT 
  'ÉLÈVES AVEC PARENT_ID INVALIDE' as diagnostic,
  COUNT(*) as count_invalid_parent_id
FROM students s
WHERE s.parent_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM parents p WHERE p.id = s.parent_id
  );

-- 9. Vérifier les élèves sans class_name ou avec class_name NULL
SELECT 
  'ÉLÈVES SANS CLASSE' as diagnostic,
  id,
  first_name,
  last_name,
  class_name,
  school_id
FROM students
WHERE class_name IS NULL OR class_name = ''
ORDER BY created_at DESC;

-- 10. Afficher la relation parent-students (table de liaison si elle existe)
SELECT 
  'TABLE PARENT_STUDENTS (si elle existe)' as diagnostic,
  *
FROM parent_students
LIMIT 10;
