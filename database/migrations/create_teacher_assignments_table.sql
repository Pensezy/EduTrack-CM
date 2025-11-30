-- Migration: Création de la table teacher_assignments
-- Description: Permet de gérer les assignations d'enseignants aux écoles avec matières et classes
-- Date: 2025-11-30

-- Créer la table teacher_assignments si elle n'existe pas
CREATE TABLE IF NOT EXISTS teacher_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    position TEXT DEFAULT 'Enseignant vacataire',
    assignment_type TEXT DEFAULT 'vacataire',
    weekly_hours INTEGER DEFAULT 0,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher_id ON teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_school_id ON teacher_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_class_name ON teacher_assignments(class_name);

-- Ajouter des commentaires
COMMENT ON TABLE teacher_assignments IS 'Stocke les assignations des enseignants aux écoles avec leurs classes et matières';
COMMENT ON COLUMN teacher_assignments.teacher_id IS 'Référence vers l''enseignant (users.id avec role=teacher)';
COMMENT ON COLUMN teacher_assignments.school_id IS 'Référence vers l''école';
COMMENT ON COLUMN teacher_assignments.class_name IS 'Nom de la classe (ex: 6ème A, CM2)';
COMMENT ON COLUMN teacher_assignments.subject IS 'Matière enseignée (ex: Mathématiques, Français)';
COMMENT ON COLUMN teacher_assignments.position IS 'Poste de l''enseignant (titulaire, vacataire, remplaçant)';
COMMENT ON COLUMN teacher_assignments.assignment_type IS 'Type d''assignation (principal, vacataire, remplacement)';
COMMENT ON COLUMN teacher_assignments.weekly_hours IS 'Nombre d''heures par semaine';

-- Vérification
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'teacher_assignments'
ORDER BY ordinal_position;
