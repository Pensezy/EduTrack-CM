-- ====================================
-- CRÉATION TABLE teacher_assignments
-- Basé sur la structure réelle de votre base Supabase
-- N'exécutez CE SQL QUE si la vérification montre que la table n'existe PAS
-- ====================================

-- Table pour gérer les assignations enseignant → classe + matière
CREATE TABLE IF NOT EXISTS teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations principales (toutes vérifiées comme existantes)
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  
  -- Informations dénormalisées pour performance (évite les JOINs)
  class_name TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  
  -- Planning hebdomadaire (JSONB pour flexibilité)
  -- Format: [{"day": "Lundi", "time": "08:00-09:30", "room": "Salle 12"}]
  schedule JSONB DEFAULT '[]'::jsonb,
  
  -- Métadonnées d'assignation
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Qui a créé cette assignation
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Période de validité
  start_date DATE,
  end_date DATE,
  
  -- Notes supplémentaires
  notes TEXT,
  
  -- Audit (même structure que students)
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Contrainte d'unicité : un enseignant ne peut pas avoir 2 fois la même assignation active
  UNIQUE (teacher_id, class_id, subject_id, academic_year_id, is_active)
);

-- ====================================
-- INDEX POUR PERFORMANCES
-- ====================================

-- Index sur les clés étrangères (pour les JOINs rapides)
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_school ON teacher_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher ON teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_class ON teacher_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_subject ON teacher_assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_year ON teacher_assignments(academic_year_id);

-- Index sur les colonnes de filtrage fréquent
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_active ON teacher_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_dates ON teacher_assignments(start_date, end_date);

-- Index composite pour requête enseignant + école active
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher_school_active 
ON teacher_assignments(teacher_id, school_id) WHERE is_active = true;

-- ====================================
-- COMMENTAIRES DE DOCUMENTATION
-- ====================================

COMMENT ON TABLE teacher_assignments IS 'Assignations des enseignants aux classes et matières avec planning';
COMMENT ON COLUMN teacher_assignments.schedule IS 'Planning hebdomadaire JSON: [{"day": "Lundi", "time": "08:00-09:30", "room": "Salle 12"}]';
COMMENT ON COLUMN teacher_assignments.is_active IS 'false = assignation archivée/terminée, true = assignation en cours';
COMMENT ON COLUMN teacher_assignments.class_name IS 'Nom de la classe dénormalisé pour éviter les JOINs (ex: "3ème A")';
COMMENT ON COLUMN teacher_assignments.subject_name IS 'Nom de la matière dénormalisé pour éviter les JOINs (ex: "Mathématiques")';

-- ====================================
-- TRIGGER POUR updated_at
-- ====================================

CREATE OR REPLACE FUNCTION update_teacher_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_teacher_assignments_updated_at
    BEFORE UPDATE ON teacher_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_teacher_assignments_updated_at();

-- ====================================
-- DONNÉES DE TEST (OPTIONNEL)
-- Décommentez si vous voulez créer une assignation de test
-- ====================================

/*
-- Exemple d'insertion (à adapter selon vos IDs réels)
INSERT INTO teacher_assignments (
  school_id,
  teacher_id,
  class_id,
  subject_id,
  academic_year_id,
  class_name,
  subject_name,
  schedule,
  is_active
)
VALUES (
  'votre-school-id'::uuid,
  'votre-teacher-id'::uuid,
  'votre-class-id'::uuid,
  'votre-subject-id'::uuid,
  'votre-academic-year-id'::uuid,
  '3ème A',
  'Mathématiques',
  '[
    {"day": "Lundi", "time": "08:00-09:30", "room": "Salle 12"},
    {"day": "Mercredi", "time": "10:00-11:30", "room": "Salle 12"},
    {"day": "Vendredi", "time": "14:00-15:30", "room": "Salle 15"}
  ]'::jsonb,
  true
);
*/

-- ====================================
-- VÉRIFICATION FINALE
-- ====================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_assignments') THEN
        RAISE NOTICE '';
        RAISE NOTICE '✅ ========================================';
        RAISE NOTICE '✅ Table teacher_assignments créée avec succès !';
        RAISE NOTICE '✅ 8 index créés pour optimiser les performances';
        RAISE NOTICE '✅ Trigger updated_at configuré';
        RAISE NOTICE '✅ ========================================';
        RAISE NOTICE '';
        RAISE NOTICE '📋 Prochaines étapes :';
        RAISE NOTICE '1. Créer des enseignants dans la table teachers';
        RAISE NOTICE '2. Créer des assignations avec INSERT INTO teacher_assignments';
        RAISE NOTICE '3. Tester les requêtes dans votre dashboard';
    END IF;
END $$;
