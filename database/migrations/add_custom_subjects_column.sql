-- Migration: Ajout de la colonne custom_subjects à la table schools
-- Description: Permet de sauvegarder les matières personnalisées ajoutées par les secrétaires
-- Date: 2025-11-30

-- Vérifier et ajouter la colonne custom_subjects si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'schools' 
        AND column_name = 'custom_subjects'
    ) THEN
        ALTER TABLE schools 
        ADD COLUMN custom_subjects TEXT[] DEFAULT '{}';
        
        RAISE NOTICE 'Colonne custom_subjects ajoutée avec succès à la table schools';
    ELSE
        RAISE NOTICE 'La colonne custom_subjects existe déjà dans la table schools';
    END IF;
END $$;

-- Vérification
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns
WHERE table_name = 'schools' 
AND column_name = 'custom_subjects';
