-- ====================================
-- CRÉATION D'UNE ASSIGNATION ENSEIGNANT DE TEST
-- À exécuter APRÈS avoir créé la table teacher_assignments ET un enseignant
-- ====================================

-- ⚠️ PRÉREQUIS :
-- 1. Table teacher_assignments existe (exécutez create_teacher_assignments.sql)
-- 2. Au moins un enseignant existe (exécutez create_sample_teacher.sql)
-- 3. Au moins une classe existe
-- 4. Au moins une matière existe

-- ====================================
-- VÉRIFICATION DES PRÉREQUIS
-- ====================================

DO $$ 
DECLARE
    has_teachers BOOLEAN;
    has_classes BOOLEAN;
    has_subjects BOOLEAN;
    has_academic_years BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM teachers WHERE is_active = true) INTO has_teachers;
    SELECT EXISTS(SELECT 1 FROM classes) INTO has_classes;
    SELECT EXISTS(SELECT 1 FROM subjects) INTO has_subjects;
    SELECT EXISTS(SELECT 1 FROM academic_years WHERE is_current = true) INTO has_academic_years;
    
    IF NOT has_teachers THEN
        RAISE EXCEPTION '❌ AUCUN ENSEIGNANT ACTIF - Exécutez create_sample_teacher.sql d''abord';
    END IF;
    
    IF NOT has_classes THEN
        RAISE EXCEPTION '❌ AUCUNE CLASSE - Créez des classes avant de continuer';
    END IF;
    
    IF NOT has_subjects THEN
        RAISE EXCEPTION '❌ AUCUNE MATIÈRE - Créez des matières avant de continuer';
    END IF;
    
    IF NOT has_academic_years THEN
        RAISE EXCEPTION '❌ AUCUNE ANNÉE SCOLAIRE ACTIVE - Créez une année scolaire avant de continuer';
    END IF;
    
    RAISE NOTICE '✅ Tous les prérequis sont remplis, création de l''assignation...';
END $$;

-- ====================================
-- CRÉATION DE L'ASSIGNATION
-- ====================================

INSERT INTO teacher_assignments (
  school_id,
  teacher_id,
  class_id,
  subject_id,
  academic_year_id,
  class_name,
  subject_name,
  schedule,
  is_active,
  start_date,
  end_date,
  created_by_user_id
)
SELECT 
  t.school_id,
  t.id AS teacher_id,
  c.id AS class_id,
  s.id AS subject_id,
  ay.id AS academic_year_id,
  c.name AS class_name,
  s.name AS subject_name,
  '[
    {"day": "Lundi", "time": "08:00-09:30", "room": "Salle 12"},
    {"day": "Mercredi", "time": "10:00-11:30", "room": "Salle 12"},
    {"day": "Vendredi", "time": "14:00-15:30", "room": "Salle 15"}
  ]'::jsonb AS schedule,
  true AS is_active,
  ay.start_date,
  ay.end_date,
  u.id AS created_by_user_id
FROM teachers t
JOIN users u ON t.user_id = u.id
CROSS JOIN LATERAL (
  SELECT * FROM classes 
  WHERE school_id = t.school_id 
  LIMIT 1
) c
CROSS JOIN LATERAL (
  SELECT * FROM subjects 
  WHERE school_id = t.school_id 
  LIMIT 1
) s
CROSS JOIN LATERAL (
  SELECT * FROM academic_years 
  WHERE school_id = t.school_id AND is_current = true
  LIMIT 1
) ay
WHERE u.email = 'rose.tchoukoua@ecole.cm' -- ⚠️ MODIFIER si vous avez utilisé un autre email
  AND NOT EXISTS (
    -- Évite de créer un doublon
    SELECT 1 FROM teacher_assignments ta
    WHERE ta.teacher_id = t.id
      AND ta.class_id = c.id
      AND ta.subject_id = s.id
      AND ta.academic_year_id = ay.id
      AND ta.is_active = true
  )
LIMIT 1 -- Une seule assignation de test
RETURNING 
  id,
  class_name,
  subject_name,
  schedule;

-- ====================================
-- VÉRIFICATION DE LA CRÉATION
-- ====================================

SELECT 
    ta.id AS assignment_id,
    t.first_name || ' ' || t.last_name AS teacher_name,
    ta.class_name,
    ta.subject_name,
    ta.schedule,
    ta.is_active,
    ta.start_date,
    ta.end_date,
    s.name AS school_name
FROM teacher_assignments ta
JOIN teachers t ON ta.teacher_id = t.id
JOIN schools s ON ta.school_id = s.id
JOIN users u ON t.user_id = u.id
WHERE u.email = 'rose.tchoukoua@ecole.cm' -- ⚠️ MODIFIER si nécessaire
ORDER BY ta.created_at DESC
LIMIT 5;

-- ====================================
-- AFFICHAGE DU RÉSULTAT
-- ====================================

DO $$ 
DECLARE
    assignment_count INT;
BEGIN
    SELECT COUNT(*) INTO assignment_count
    FROM teacher_assignments ta
    JOIN teachers t ON ta.teacher_id = t.id
    JOIN users u ON t.user_id = u.id
    WHERE u.email = 'rose.tchoukoua@ecole.cm';
    
    IF assignment_count > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '✅ ========================================';
        RAISE NOTICE '✅ Assignation(s) créée(s) avec succès !';
        RAISE NOTICE '✅ Total assignations : %', assignment_count;
        RAISE NOTICE '✅ ========================================';
        RAISE NOTICE '';
        RAISE NOTICE '📋 Prochaines étapes :';
        RAISE NOTICE '1. Testez le dashboard enseignant';
        RAISE NOTICE '2. Connectez-vous avec: rose.tchoukoua@ecole.cm';
        RAISE NOTICE '3. Vérifiez que les classes s''affichent';
        RAISE NOTICE '4. Testez la saisie de notes et absences';
    ELSE
        RAISE WARNING '';
        RAISE WARNING '⚠️ ========================================';
        RAISE WARNING '⚠️ Aucune assignation créée';
        RAISE WARNING '⚠️ Vérifiez les prérequis avec check_existing_data.sql';
        RAISE WARNING '⚠️ ========================================';
    END IF;
END $$;

-- ====================================
-- REQUÊTES UTILES POUR DEBUG
-- ====================================

-- Voir toutes les assignations par enseignant
/*
SELECT 
    u.email,
    t.first_name || ' ' || t.last_name AS teacher,
    ta.class_name,
    ta.subject_name,
    ta.is_active,
    jsonb_array_length(ta.schedule) AS nb_slots
FROM teacher_assignments ta
JOIN teachers t ON ta.teacher_id = t.id
JOIN users u ON t.user_id = u.id
ORDER BY u.email, ta.class_name;
*/

-- Compter les assignations par enseignant
/*
SELECT 
    u.email,
    t.first_name || ' ' || t.last_name AS teacher,
    COUNT(*) AS total_assignments,
    COUNT(*) FILTER (WHERE ta.is_active = true) AS active_assignments
FROM teachers t
JOIN users u ON t.user_id = u.id
LEFT JOIN teacher_assignments ta ON t.id = ta.teacher_id
GROUP BY u.email, t.first_name, t.last_name
ORDER BY total_assignments DESC;
*/
