-- ============================================
-- MIGRATION: Ajout de parent_id et class_name à students
-- Date: 2024-12-04
-- Description: Ajoute parent_id et class_name pour simplifier l'accès aux données
-- ============================================

-- 1. Ajouter la colonne class_name pour stocker le nom de la classe
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS class_name TEXT;

-- 2. Ajouter la colonne parent_id pour faciliter l'accès direct au parent principal
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES parents(id) ON DELETE SET NULL;

-- 3. Créer un index sur parent_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);

-- 4. Créer un index sur class_name pour faciliter le filtrage
CREATE INDEX IF NOT EXISTS idx_students_class_name ON students(class_name);

-- 5. Créer un index sur current_class pour faciliter le filtrage (si pas déjà existant)
CREATE INDEX IF NOT EXISTS idx_students_current_class ON students(current_class);

-- 6. Mettre à jour parent_id avec les données existantes de parent_students
-- Prendre le parent marqué comme is_primary = true, ou le premier parent trouvé
UPDATE students s
SET parent_id = (
  SELECT ps.parent_id
  FROM parent_students ps
  WHERE ps.student_id = s.id
  ORDER BY ps.is_primary DESC, ps.created_at ASC
  LIMIT 1
)
WHERE s.parent_id IS NULL
  AND EXISTS (
    SELECT 1 FROM parent_students ps WHERE ps.student_id = s.id
  );

-- 7. Remplir class_name depuis la table classes si class_id existe
UPDATE students s
SET class_name = (
  SELECT c.name
  FROM classes c
  WHERE c.id = s.class_id
)
WHERE s.class_id IS NOT NULL 
  AND s.class_name IS NULL;

-- 8. Copier current_class vers class_name si class_name est NULL mais current_class existe
UPDATE students
SET class_name = current_class
WHERE class_name IS NULL 
  AND current_class IS NOT NULL 
  AND current_class != '';

-- 6. Créer une fonction trigger pour maintenir parent_id à jour
CREATE OR REPLACE FUNCTION sync_student_parent_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Quand un lien parent-student est créé ou mis à jour
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Si c'est le parent principal ou si l'élève n'a pas encore de parent_id
    UPDATE students
    SET parent_id = NEW.parent_id
    WHERE id = NEW.student_id
      AND (parent_id IS NULL OR NEW.is_primary = true);
  END IF;
  
  -- Quand un lien est supprimé
  IF (TG_OP = 'DELETE') THEN
    -- Réassigner le parent_id au prochain parent disponible
    UPDATE students s
    SET parent_id = (
      SELECT ps.parent_id
      FROM parent_students ps
      WHERE ps.student_id = OLD.student_id
        AND ps.parent_id != OLD.parent_id
      ORDER BY ps.is_primary DESC, ps.created_at ASC
      LIMIT 1
    )
    WHERE s.id = OLD.student_id
      AND s.parent_id = OLD.parent_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 7. Créer le trigger sur parent_students
DROP TRIGGER IF EXISTS trigger_sync_student_parent_id ON parent_students;
CREATE TRIGGER trigger_sync_student_parent_id
  AFTER INSERT OR UPDATE OR DELETE ON parent_students
  FOR EACH ROW
  EXECUTE FUNCTION sync_student_parent_id();

-- 9. Créer une fonction trigger pour maintenir class_name à jour depuis class_id
CREATE OR REPLACE FUNCTION sync_student_class_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Si class_id est modifié et non NULL, mettre à jour class_name
  IF NEW.class_id IS NOT NULL THEN
    NEW.class_name := (SELECT name FROM classes WHERE id = NEW.class_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Créer le trigger sur students
DROP TRIGGER IF EXISTS trigger_sync_student_class_name ON students;
CREATE TRIGGER trigger_sync_student_class_name
  BEFORE INSERT OR UPDATE OF class_id ON students
  FOR EACH ROW
  EXECUTE FUNCTION sync_student_class_name();

-- 11. Créer une fonction trigger pour maintenir current_class à jour depuis class_id
CREATE OR REPLACE FUNCTION sync_student_current_class()
RETURNS TRIGGER AS $$
BEGIN
  -- Si class_id est modifié et non NULL, mettre à jour current_class
  IF NEW.class_id IS NOT NULL AND (OLD.class_id IS NULL OR NEW.class_id != OLD.class_id) THEN
    NEW.current_class := (SELECT name FROM classes WHERE id = NEW.class_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Créer le trigger sur students pour current_class
DROP TRIGGER IF EXISTS trigger_sync_student_current_class ON students;
CREATE TRIGGER trigger_sync_student_current_class
  BEFORE INSERT OR UPDATE OF class_id ON students
  FOR EACH ROW
  EXECUTE FUNCTION sync_student_current_class();

-- 13. Commentaires
COMMENT ON COLUMN students.class_name IS 'Nom de la classe (ex: CM1, 6ème). Synchronisé automatiquement depuis classes.name via class_id';
COMMENT ON COLUMN students.current_class IS 'Nom de la classe (legacy). Synchronisé automatiquement depuis classes.name via class_id';
COMMENT ON COLUMN students.parent_id IS 'Référence au parent principal de l''élève pour accès direct. Synchronisé automatiquement avec parent_students';

-- 14. Afficher un résumé
DO $$
DECLARE
  students_with_parent INTEGER;
  students_with_class_name INTEGER;
  students_with_current_class INTEGER;
  total_students INTEGER;
  pct_parent NUMERIC;
  pct_class_name NUMERIC;
  pct_current_class NUMERIC;
BEGIN
  SELECT COUNT(*) INTO total_students FROM students;
  SELECT COUNT(*) INTO students_with_parent FROM students WHERE parent_id IS NOT NULL;
  SELECT COUNT(*) INTO students_with_class_name FROM students WHERE class_name IS NOT NULL AND class_name != '';
  SELECT COUNT(*) INTO students_with_current_class FROM students WHERE current_class IS NOT NULL AND current_class != '';

  -- Calculer les pourcentages
  pct_parent := CASE WHEN total_students = 0 THEN 0 ELSE ROUND(students_with_parent::NUMERIC / total_students * 100, 2) END;
  pct_class_name := CASE WHEN total_students = 0 THEN 0 ELSE ROUND(students_with_class_name::NUMERIC / total_students * 100, 2) END;
  pct_current_class := CASE WHEN total_students = 0 THEN 0 ELSE ROUND(students_with_current_class::NUMERIC / total_students * 100, 2) END;

  RAISE NOTICE '================================';
  RAISE NOTICE 'MIGRATION TERMINÉE';
  RAISE NOTICE '================================';
  RAISE NOTICE 'Total élèves: %', total_students;
  RAISE NOTICE 'Élèves avec parent_id: % (% %%)', students_with_parent, pct_parent;
  RAISE NOTICE 'Élèves avec class_name: % (% %%)', students_with_class_name, pct_class_name;
  RAISE NOTICE 'Élèves avec current_class: % (% %%)', students_with_current_class, pct_current_class;
  RAISE NOTICE '================================';
END $$;
