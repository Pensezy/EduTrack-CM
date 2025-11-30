-- Migration: Système hybride pour la gestion des élèves et amélioration des parents
-- Date: 2025-11-30
-- Description: Ajoute les colonnes nécessaires pour gérer les élèves du primaire (sans compte)
--              et du secondaire (avec compte)
--              Ajoute profession et adresse pour les parents
--              Rend le téléphone obligatoire et l'email optionnel pour les parents

-- Ajouter les colonnes manquantes à la table students
ALTER TABLE students
  -- Matricule unique pour les élèves du secondaire
  ADD COLUMN IF NOT EXISTS matricule TEXT UNIQUE,
  
  -- Niveau scolaire : 'primary' (sans compte) ou 'secondary' (avec compte)
  ADD COLUMN IF NOT EXISTS school_level TEXT DEFAULT 'primary' CHECK (school_level IN ('primary', 'secondary')),
  
  -- Classe de l'élève (référence à la table classes)
  ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  
  -- Informations du parent/tuteur (pour contact direct)
  ADD COLUMN IF NOT EXISTS parent_name TEXT,
  ADD COLUMN IF NOT EXISTS parent_phone TEXT,
  ADD COLUMN IF NOT EXISTS parent_email TEXT;

-- Amélioration de la table parents
ALTER TABLE parents
  -- Ajouter la profession du parent
  ADD COLUMN IF NOT EXISTS profession TEXT,
  
  -- Ajouter l'adresse/lieu d'habitation du parent
  ADD COLUMN IF NOT EXISTS address TEXT,
  
  -- Rendre le téléphone obligatoire (NOT NULL)
  ALTER COLUMN phone SET NOT NULL,
  
  -- Rendre l'email optionnel (DROP NOT NULL si existe)
  ALTER COLUMN email DROP NOT NULL;

-- Modifier la contrainte user_id pour permettre NULL (élèves du primaire)
ALTER TABLE students
  ALTER COLUMN user_id DROP NOT NULL;

-- Créer un index sur le matricule pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_students_matricule ON students(matricule);

-- Créer un index sur school_level pour filtrage
CREATE INDEX IF NOT EXISTS idx_students_school_level ON students(school_level);

-- Créer un index sur class_id
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);

-- Créer un index composite pour recherche par école et niveau
CREATE INDEX IF NOT EXISTS idx_students_school_level ON students(school_id, school_level);

-- Ajouter un commentaire sur la table
COMMENT ON TABLE students IS 'Élèves de l''établissement. Les élèves du primaire n''ont pas de user_id (pas de compte), les élèves du secondaire ont un user_id (compte avec connexion)';

COMMENT ON COLUMN students.school_level IS 'Niveau scolaire : primary (maternelle à CM2, sans compte) ou secondary (6ème à Terminale, avec compte)';
COMMENT ON COLUMN students.matricule IS 'Matricule unique pour les élèves du secondaire (format: STD2025XXX). NULL pour primaire.';
COMMENT ON COLUMN students.user_id IS 'Référence au compte utilisateur. NULL pour élèves du primaire (pas de connexion), UUID pour secondaire (connexion personnelle)';
COMMENT ON COLUMN students.parent_name IS 'Nom complet du parent/tuteur pour contact direct';
COMMENT ON COLUMN students.parent_phone IS 'Numéro de téléphone du parent/tuteur (obligatoire pour communication)';
COMMENT ON COLUMN students.parent_email IS 'Email du parent/tuteur (optionnel)';

-- Commentaires sur la table parents
COMMENT ON TABLE parents IS 'Parents/tuteurs des élèves. Un parent peut avoir plusieurs enfants dans plusieurs établissements.';
COMMENT ON COLUMN parents.phone IS 'Numéro de téléphone du parent (OBLIGATOIRE - moyen de contact principal)';
COMMENT ON COLUMN parents.email IS 'Email du parent (OPTIONNEL - certains parents peuvent ne pas avoir d''email)';
COMMENT ON COLUMN parents.profession IS 'Profession du parent (optionnel)';
COMMENT ON COLUMN parents.address IS 'Adresse/lieu d''habitation du parent (optionnel)';
COMMENT ON COLUMN parents.global_parent_id IS 'Identifiant unique global du parent permettant de lier un même parent à plusieurs établissements';

-- Fonction trigger pour valider les contraintes métier
CREATE OR REPLACE FUNCTION validate_student_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Pour élève du secondaire : matricule et user_id obligatoires
  IF NEW.school_level = 'secondary' THEN
    IF NEW.matricule IS NULL THEN
      RAISE EXCEPTION 'Le matricule est obligatoire pour les élèves du secondaire';
    END IF;
    IF NEW.user_id IS NULL THEN
      RAISE EXCEPTION 'Le compte utilisateur (user_id) est obligatoire pour les élèves du secondaire';
    END IF;
  END IF;
  
  -- Pour élève du primaire : user_id doit être NULL
  IF NEW.school_level = 'primary' THEN
    IF NEW.user_id IS NOT NULL THEN
      RAISE EXCEPTION 'Les élèves du primaire ne doivent pas avoir de compte utilisateur (user_id doit être NULL)';
    END IF;
  END IF;
  
  -- Téléphone du parent obligatoire pour tous
  IF NEW.parent_phone IS NULL OR NEW.parent_phone = '' THEN
    RAISE WARNING 'Le téléphone du parent est fortement recommandé pour la communication';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger de validation
DROP TRIGGER IF EXISTS validate_student_data_trigger ON students;
CREATE TRIGGER validate_student_data_trigger
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION validate_student_data();

-- Vue pour faciliter les requêtes sur les élèves avec leurs infos complètes
CREATE OR REPLACE VIEW students_with_details AS
SELECT 
  s.id,
  s.school_id,
  s.user_id,
  s.matricule,
  s.first_name,
  s.last_name,
  s.first_name || ' ' || s.last_name AS full_name,
  s.school_level,
  s.date_of_birth,
  s.class_id,
  c.name AS class_name,
  c.level AS class_level,
  s.parent_name,
  s.parent_phone,
  s.parent_email,
  s.is_active,
  s.created_at,
  s.updated_at,
  u.email AS student_email,
  CASE 
    WHEN s.school_level = 'secondary' THEN true
    ELSE false
  END AS has_account
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN users u ON s.user_id = u.id;

COMMENT ON VIEW students_with_details IS 'Vue complète des élèves avec leurs informations de classe et de compte';

-- Donner les permissions nécessaires
GRANT SELECT ON students_with_details TO authenticated;
