-- Vérification rapide des données pour le dashboard secrétaire
-- Date: 2025-11-04

-- 1. Vérifier les élèves de l'école "Université de Mendong"
SELECT 
  s.id,
  s.user_id,
  s.first_name,
  s.last_name,
  s.is_active,
  s.school_id,
  sch.name as school_name
FROM students s
LEFT JOIN schools sch ON s.school_id = sch.id
WHERE sch.name = 'Université de Mendong'
ORDER BY s.created_at DESC;

-- 2. Compter les élèves actifs par école
SELECT 
  sch.name as school_name,
  COUNT(s.id) as total_students,
  COUNT(CASE WHEN s.is_active = true THEN 1 END) as active_students
FROM schools sch
LEFT JOIN students s ON s.school_id = sch.id
GROUP BY sch.id, sch.name
ORDER BY sch.name;

-- 3. Vérifier si la secrétaire a un school_id
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.current_school_id,
  sec.school_id as secretary_school_id,
  sch.name as school_name
FROM users u
LEFT JOIN secretaries sec ON sec.user_id = u.id
LEFT JOIN schools sch ON u.current_school_id = sch.id
WHERE u.email = 'pensezy.si@gmail.com';

-- 4. Structure de la table students
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'students'
ORDER BY ordinal_position;
