-- ====================================
-- Migration: Ajouter la colonne place_of_birth à la table students
-- Date: 2025-12-10
-- Description: Ajoute le lieu de naissance pour les élèves
-- ====================================

-- Ajouter la colonne place_of_birth si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'place_of_birth'
    ) THEN
        ALTER TABLE students ADD COLUMN place_of_birth TEXT;
        RAISE NOTICE 'Colonne place_of_birth ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne place_of_birth existe déjà';
    END IF;
END $$;

-- Commenter la colonne
COMMENT ON COLUMN students.place_of_birth IS 'Lieu de naissance de l''élève';
