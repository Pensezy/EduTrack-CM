-- ============================================================================
-- Migration: Fonction pour récupérer les statistiques d'un établissement
-- ============================================================================

-- Fonction pour obtenir les stats d'une école (pour admin)
CREATE OR REPLACE FUNCTION get_school_stats(p_school_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSONB;
  v_total_users INTEGER;
  v_total_students INTEGER;
  v_total_teachers INTEGER;
  v_total_classes INTEGER;
BEGIN
  -- Compter les utilisateurs
  SELECT COUNT(*) INTO v_total_users
  FROM users
  WHERE current_school_id = p_school_id;

  -- Compter les élèves
  SELECT COUNT(*) INTO v_total_students
  FROM students
  WHERE school_id = p_school_id;

  -- Compter les enseignants
  SELECT COUNT(*) INTO v_total_teachers
  FROM users
  WHERE current_school_id = p_school_id
    AND role = 'teacher';

  -- Compter les classes
  SELECT COUNT(*) INTO v_total_classes
  FROM classes
  WHERE school_id = p_school_id;

  -- Construire le résultat JSON
  v_stats := jsonb_build_object(
    'total_users', COALESCE(v_total_users, 0),
    'total_students', COALESCE(v_total_students, 0),
    'total_teachers', COALESCE(v_total_teachers, 0),
    'total_classes', COALESCE(v_total_classes, 0)
  );

  RETURN v_stats;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION get_school_stats(UUID) IS 'Retourne les statistiques complètes d''un établissement (utilisateurs, élèves, enseignants, classes)';
