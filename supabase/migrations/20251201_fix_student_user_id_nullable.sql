-- ====================================
-- CORRECTION: Rendre user_id NULLABLE pour les élèves du primaire
-- Date: 2025-12-01
-- Description: Permet aux élèves du primaire de ne pas avoir de compte utilisateur
-- ====================================

-- Supprimer la contrainte NOT NULL sur user_id
ALTER TABLE students 
  ALTER COLUMN user_id DROP NOT NULL;

-- Ajouter un commentaire explicatif
COMMENT ON COLUMN students.user_id IS 'ID utilisateur (NULL pour élèves primaire sans compte, UUID pour élèves secondaire avec compte)';

-- Vérification
DO $$
BEGIN
  RAISE NOTICE '✅ Contrainte NOT NULL supprimée sur students.user_id';
  RAISE NOTICE '   Les élèves du primaire peuvent maintenant être créés sans compte utilisateur';
  RAISE NOTICE '   Les élèves du secondaire auront un compte avec identifiants auto-générés';
END $$;
