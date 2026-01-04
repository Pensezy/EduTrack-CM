-- ============================================================================
-- Migration: Ajout de la colonne region dans schools
-- Date: 2026-01-04
-- Description: Ajoute la colonne region si elle n'existe pas
-- ============================================================================

-- Ajouter la colonne region si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'schools'
      AND column_name = 'region'
  ) THEN
    ALTER TABLE schools ADD COLUMN region TEXT;
    COMMENT ON COLUMN schools.region IS 'Région du Cameroun (centre, littoral, sud, est, ouest, nord, etc.)';
  END IF;
END $$;

-- Créer un index sur la région pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_schools_region ON schools(region);

-- ============================================================================
-- Fin de la migration
-- ============================================================================
