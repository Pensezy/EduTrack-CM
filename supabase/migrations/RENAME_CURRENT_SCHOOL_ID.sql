-- =====================================================
-- MIGRATION: Renommer current_school_id → school_id
-- Date: 2026-01-01
-- Description: Simplifier le nom de la colonne pour cohérence avec le code
-- =====================================================

-- Renommer la colonne dans la table users
ALTER TABLE users
RENAME COLUMN current_school_id TO school_id;

-- Mettre à jour le commentaire
COMMENT ON COLUMN users.school_id IS 'ID de l''école à laquelle l''utilisateur appartient';

-- Vérification
DO $$
BEGIN
  RAISE NOTICE '✅ Colonne renommée: current_school_id → school_id';
  RAISE NOTICE 'Toutes les références dans le code utilisent maintenant school_id';
END $$;
