-- ====================================
-- VÉRIFICATION DES DONNÉES EXISTANTES
-- Pour voir si vous avez déjà des enseignants, classes, etc.
-- ====================================

-- 1. Compter les enregistrements dans chaque table
SELECT 'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'schools', COUNT(*) FROM schools
UNION ALL
SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'classes', COUNT(*) FROM classes
UNION ALL
SELECT 'subjects', COUNT(*) FROM subjects
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'academic_years', COUNT(*) FROM academic_years
UNION ALL
SELECT 'grades', COUNT(*) FROM grades
UNION ALL
SELECT 'attendances', COUNT(*) FROM attendances
UNION ALL
SELECT 'assignments', COUNT(*) FROM assignments
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'communications', COUNT(*) FROM communications
ORDER BY table_name;

-- ====================================
-- 2. Voir les enseignants existants
-- ====================================

SELECT 
    t.id AS teacher_id,
    t.first_name || ' ' || t.last_name AS teacher_name,
    t.specialty,
    t.is_active,
    s.name AS school_name,
    u.email AS email
FROM teachers t
LEFT JOIN schools s ON t.school_id = s.id
LEFT JOIN users u ON t.user_id = u.id
ORDER BY t.last_name;

-- ====================================
-- 3. Voir les classes existantes
-- ====================================

SELECT 
    c.id AS class_id,
    c.name AS class_name,
    c.level,
    s.name AS school_name,
    ay.name AS academic_year,
    ay.is_current
FROM classes c
LEFT JOIN schools s ON c.school_id = s.id
LEFT JOIN academic_years ay ON c.academic_year_id = ay.id
ORDER BY s.name, c.level, c.name;

-- ====================================
-- 4. Voir les matières existantes
-- ====================================

SELECT 
    sub.id AS subject_id,
    sub.name AS subject_name,
    sub.code,
    s.name AS school_name
FROM subjects sub
LEFT JOIN schools s ON sub.school_id = s.id
ORDER BY s.name, sub.name;

-- ====================================
-- 5. Voir les années scolaires
-- ====================================

SELECT 
    ay.id AS academic_year_id,
    ay.name AS year_name,
    ay.start_date,
    ay.end_date,
    ay.is_current,
    s.name AS school_name
FROM academic_years ay
LEFT JOIN schools s ON ay.school_id = s.id
ORDER BY ay.start_date DESC;

-- ====================================
-- 6. Statistiques globales
-- ====================================

DO $$ 
DECLARE
    total_schools INT;
    total_teachers INT;
    total_classes INT;
    total_students INT;
    total_subjects INT;
BEGIN
    SELECT COUNT(*) INTO total_schools FROM schools;
    SELECT COUNT(*) INTO total_teachers FROM teachers WHERE is_active = true;
    SELECT COUNT(*) INTO total_classes FROM classes;
    SELECT COUNT(*) INTO total_students FROM students WHERE is_active = true;
    SELECT COUNT(*) INTO total_subjects FROM subjects;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 ========================================';
    RAISE NOTICE '📊 STATISTIQUES DE VOTRE BASE DE DONNÉES';
    RAISE NOTICE '📊 ========================================';
    RAISE NOTICE '🏫 Écoles : %', total_schools;
    RAISE NOTICE '👨‍🏫 Enseignants actifs : %', total_teachers;
    RAISE NOTICE '📚 Classes : %', total_classes;
    RAISE NOTICE '👨‍🎓 Élèves actifs : %', total_students;
    RAISE NOTICE '📖 Matières : %', total_subjects;
    RAISE NOTICE '📊 ========================================';
    
    IF total_teachers = 0 THEN
        RAISE NOTICE '';
        RAISE WARNING '⚠️ AUCUN ENSEIGNANT TROUVÉ';
        RAISE WARNING '⚠️ Vous devez créer des enseignants avant de créer des assignations';
        RAISE WARNING '⚠️ Utilisez le fichier: create_sample_teacher.sql';
    END IF;
    
    IF total_classes = 0 THEN
        RAISE NOTICE '';
        RAISE WARNING '⚠️ AUCUNE CLASSE TROUVÉE';
        RAISE WARNING '⚠️ Vous devez créer des classes avant de créer des assignations';
    END IF;
END $$;
