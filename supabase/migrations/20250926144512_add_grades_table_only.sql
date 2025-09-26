-- =====================================================================
-- Migration: Ajouter uniquement la table grades manquante
-- Date: 2025-09-26
-- Description: Créer seulement la table grades qui est nécessaire 
--             pour le dashboard en mode production
-- =====================================================================

-- =============================================================================
-- TABLE: GRADES (Notes) - Version simplifiée
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relations existantes
    student_id UUID NOT NULL,
    school_id UUID NOT NULL,
    
    -- Note et métadonnées
    value DECIMAL(5,2) NOT NULL CHECK (value >= 0 AND value <= 100),
    subject TEXT NOT NULL, -- Nom de la matière (simple string pour commencer)
    
    -- Informations sur l'évaluation
    evaluation_type TEXT DEFAULT 'devoir',
    evaluation_name TEXT,
    period TEXT DEFAULT 'trimestre1',
    
    -- Dates
    evaluation_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_grades_student ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_school ON public.grades(school_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject ON public.grades(subject);
CREATE INDEX IF NOT EXISTS idx_grades_eval_date ON public.grades(evaluation_date);

-- Trigger pour updated_at (seulement si la fonction existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER update_grades_updated_at 
        BEFORE UPDATE ON public.grades 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Le trigger existe déjà
END $$;

-- RLS (seulement si pas déjà activé)
DO $$
BEGIN
    IF NOT (SELECT row_security FROM pg_class WHERE relname = 'grades') THEN
        ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view grades of their school" ON public.grades
            FOR SELECT USING (
                school_id IN (
                    SELECT DISTINCT current_school_id FROM public.students WHERE user_id = auth.uid()
                    UNION
                    SELECT DISTINCT current_school_id FROM public.teachers WHERE user_id = auth.uid()
                    UNION
                    SELECT id FROM public.schools WHERE director_user_id = auth.uid()
                )
            );
    END IF;
EXCEPTION
    WHEN others THEN
        NULL; -- Ignorer les erreurs RLS
END $$;

-- Fonction pour ajouter quelques données de test
CREATE OR REPLACE FUNCTION public.add_sample_grades()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    sample_student_id UUID;
    sample_school_id UUID;
BEGIN
    -- Récupérer un étudiant et une école existants
    SELECT id INTO sample_student_id FROM public.students LIMIT 1;
    SELECT id INTO sample_school_id FROM public.schools LIMIT 1;
    
    -- Si on a des données de base, ajouter quelques notes
    IF sample_student_id IS NOT NULL AND sample_school_id IS NOT NULL THEN
        INSERT INTO public.grades (student_id, school_id, subject, value, evaluation_type) VALUES
        (sample_student_id, sample_school_id, 'Mathématiques', 15.5, 'devoir'),
        (sample_student_id, sample_school_id, 'Français', 14.0, 'controle'),
        (sample_student_id, sample_school_id, 'Sciences', 16.0, 'devoir'),
        (sample_student_id, sample_school_id, 'Histoire', 13.5, 'devoir')
        ON CONFLICT DO NOTHING;
    END IF;
END;
$$;

-- Commentaire
COMMENT ON TABLE public.grades IS 'Table des notes des étudiants (version simplifiée pour dashboard)';
