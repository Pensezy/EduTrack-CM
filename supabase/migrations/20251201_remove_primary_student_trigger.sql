-- Migration: Supprimer le trigger qui empêche les élèves du primaire d'avoir un compte
-- Date: 2024-12-01
-- Description: TOUS les élèves (primaire ET secondaire) doivent avoir un compte utilisateur

-- 1. Supprimer le trigger qui bloque la création
DROP TRIGGER IF EXISTS check_student_user_id_by_level ON students;

-- 2. Supprimer la fonction associée
DROP FUNCTION IF EXISTS check_student_user_id_constraint();

-- 3. Rendre user_id OBLIGATOIRE (NOT NULL)
-- Note: Vérifier d'abord qu'il n'y a pas d'élèves sans user_id
DO $$
BEGIN
  -- Compter les élèves sans user_id
  IF EXISTS (SELECT 1 FROM students WHERE user_id IS NULL) THEN
    RAISE NOTICE 'ATTENTION: % élèves n''ont pas de user_id', 
      (SELECT COUNT(*) FROM students WHERE user_id IS NULL);
    RAISE NOTICE 'Vous devez créer des comptes pour ces élèves avant de rendre user_id obligatoire';
  ELSE
    -- Rendre user_id NOT NULL
    ALTER TABLE students ALTER COLUMN user_id SET NOT NULL;
    RAISE NOTICE '✅ Colonne user_id rendue obligatoire';
  END IF;
END $$;

-- 4. Mettre à jour les commentaires
COMMENT ON TABLE students IS 'Élèves de l''établissement. TOUS les élèves (primaire et secondaire) ont un compte utilisateur avec identifiants de connexion.';

COMMENT ON COLUMN students.user_id IS 'ID utilisateur - OBLIGATOIRE pour tous les élèves (primaire et secondaire). Lien vers la table users pour l''authentification.';

COMMENT ON COLUMN students.registration_number IS 'Matricule unique de l''élève (format: ETK2024XXX). Utilisé comme identifiant de connexion.';

-- 5. Afficher un résumé
DO $$
DECLARE
  total_students INTEGER;
  students_with_account INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_students FROM students;
  SELECT COUNT(*) INTO students_with_account FROM students WHERE user_id IS NOT NULL;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 RÉSUMÉ:';
  RAISE NOTICE '   Total élèves: %', total_students;
  RAISE NOTICE '   Élèves avec compte: %', students_with_account;
  RAISE NOTICE '   Élèves sans compte: %', total_students - students_with_account;
  RAISE NOTICE '';
  
  IF students_with_account = total_students THEN
    RAISE NOTICE '✅ Tous les élèves ont un compte utilisateur';
  ELSE
    RAISE NOTICE '⚠️ Il reste % élèves sans compte - créez-leur des comptes avant de rendre user_id obligatoire', 
      total_students - students_with_account;
  END IF;
END $$;
