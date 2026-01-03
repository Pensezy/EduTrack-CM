-- ============================================================================
-- Migration: Ajout des colonnes personnalisées pour la table classes
-- Date: 2026-01-03
-- Description: Ajoute grade_level, section, school_year, max_students si elles n'existent pas
-- ============================================================================

-- 1. Ajouter la colonne grade_level (niveau de classe) si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'classes'
      AND column_name = 'grade_level'
  ) THEN
    ALTER TABLE classes ADD COLUMN grade_level TEXT;
    COMMENT ON COLUMN classes.grade_level IS 'Niveau de la classe (6eme, CM1, seconde, etc.)';
  END IF;
END $$;

-- 2. Ajouter la colonne section si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'classes'
      AND column_name = 'section'
  ) THEN
    ALTER TABLE classes ADD COLUMN section TEXT;
    COMMENT ON COLUMN classes.section IS 'Section ou série de la classe (A, B, S, L, etc.)';
  END IF;
END $$;

-- 3. Ajouter la colonne school_year si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'classes'
      AND column_name = 'school_year'
  ) THEN
    ALTER TABLE classes ADD COLUMN school_year TEXT;
    COMMENT ON COLUMN classes.school_year IS 'Année scolaire au format YYYY-YYYY (ex: 2024-2025)';
  END IF;
END $$;

-- 4. Ajouter la colonne max_students si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'classes'
      AND column_name = 'max_students'
  ) THEN
    ALTER TABLE classes ADD COLUMN max_students INTEGER DEFAULT 40;
    COMMENT ON COLUMN classes.max_students IS 'Nombre maximum d''élèves autorisés dans cette classe';
  END IF;
END $$;

-- 5. Migrer les données existantes de 'level' vers 'grade_level' si nécessaire
UPDATE classes
SET grade_level = level
WHERE grade_level IS NULL AND level IS NOT NULL;

-- 6. Créer un index sur school_year pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_classes_school_year ON classes(school_year);
CREATE INDEX IF NOT EXISTS idx_classes_grade_level ON classes(grade_level);

-- ============================================================================
-- Fin de la migration
-- ============================================================================
