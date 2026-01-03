-- ============================================================================
-- Migration: Ajout des champs profession et address pour les parents
-- Date: 2026-01-03
-- Description: Ajoute les colonnes manquantes dans la table users pour les parents
-- ============================================================================

-- Ajouter la colonne profession (si elle n'existe pas déjà)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'profession'
  ) THEN
    ALTER TABLE users ADD COLUMN profession TEXT;
  END IF;
END $$;

-- Ajouter la colonne address (si elle n'existe pas déjà)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'address'
  ) THEN
    ALTER TABLE users ADD COLUMN address TEXT;
  END IF;
END $$;

-- Ajouter des commentaires pour documentation
COMMENT ON COLUMN users.profession IS 'Profession du parent/tuteur (optionnel)';
COMMENT ON COLUMN users.address IS 'Adresse du parent/tuteur (optionnel)';

-- ============================================================================
-- Fin de la migration
-- ============================================================================
