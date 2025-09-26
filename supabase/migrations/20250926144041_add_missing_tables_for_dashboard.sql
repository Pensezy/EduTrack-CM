-- =====================================================================
-- Migration: Ajout des tables manquantes pour le dashboard
-- Date: 2025-09-26
-- Description: Ajouter les tables grades, subjects, et classes pour 
--             permettre l'affichage correct du dashboard en mode production
-- =====================================================================

-- =============================================================================
-- TABLE: SUBJECTS (Matières)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    
    -- Informations de base
    name TEXT NOT NULL,
    code TEXT, -- Code abrégé (ex: MATH, FR, ANG)
    description TEXT,
    color TEXT, -- Couleur pour l'affichage
    
    -- Configuration
    coefficient DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(school_id, name),
    UNIQUE(school_id, code)
);

CREATE INDEX IF NOT EXISTS idx_subjects_school ON public.subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON public.subjects(is_active);

-- =============================================================================
-- TABLE: CLASSES (Classes/Niveaux)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    
    -- Informations de base
    name TEXT NOT NULL, -- Ex: "6ème A", "5ème B"
    level TEXT NOT NULL, -- Ex: "6", "5", "4", "3"
    section TEXT, -- Ex: "A", "B", "C"
    
    -- Enseignant principal
    main_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    
    -- Configuration
    max_students INTEGER DEFAULT 40,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(school_id, name, academic_year_id)
);

CREATE INDEX idx_classes_school ON public.classes(school_id);
CREATE INDEX idx_classes_level ON public.classes(level);
CREATE INDEX idx_classes_teacher ON public.classes(main_teacher_id);
CREATE INDEX idx_classes_active ON public.classes(is_active);

-- =============================================================================
-- TABLE: GRADES (Notes)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relations
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    
    -- Note
    value DECIMAL(5,2) NOT NULL CHECK (value >= 0 AND value <= 100),
    max_value DECIMAL(5,2) DEFAULT 100,
    
    -- Métadonnées
    evaluation_type TEXT DEFAULT 'devoir', -- devoir, controle, examen, participation
    evaluation_name TEXT, -- "Devoir 1", "Contrôle continu"
    period TEXT DEFAULT 'trimestre1', -- trimestre1, trimestre2, trimestre3
    coefficient DECIMAL(3,2) DEFAULT 1.0,
    
    -- Détails
    subject TEXT, -- Nom de la matière (dénormalisé pour compatibilité)
    notes TEXT, -- Commentaires
    
    -- Dates
    evaluation_date DATE DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grades_student ON public.grades(student_id);
CREATE INDEX idx_grades_subject ON public.grades(subject_id);
CREATE INDEX idx_grades_class ON public.grades(class_id);
CREATE INDEX idx_grades_school ON public.grades(school_id);
CREATE INDEX idx_grades_period ON public.grades(period);
CREATE INDEX idx_grades_eval_date ON public.grades(evaluation_date);

-- =============================================================================
-- TABLE: CLASS_SUBJECTS (Relations Classes-Matières)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.class_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    
    -- Configuration
    hours_per_week INTEGER DEFAULT 2,
    coefficient DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(class_id, subject_id)
);

CREATE INDEX idx_class_subjects_class ON public.class_subjects(class_id);
CREATE INDEX idx_class_subjects_subject ON public.class_subjects(subject_id);
CREATE INDEX idx_class_subjects_teacher ON public.class_subjects(teacher_id);

-- =============================================================================
-- VUES POUR FACILITER LES REQUÊTES DU DASHBOARD
-- =============================================================================

-- Vue pour les moyennes par classe
CREATE OR REPLACE VIEW public.class_averages AS
SELECT 
    c.id as class_id,
    c.name as class_name,
    c.level as class_level,
    c.section as class_section,
    s.name as subject_name,
    s.id as subject_id,
    AVG(g.value) as average_grade,
    COUNT(g.id) as grade_count,
    g.period
FROM public.classes c
LEFT JOIN public.grades g ON g.class_id = c.id
LEFT JOIN public.subjects s ON g.subject_id = s.id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.level, c.section, s.name, s.id, g.period;

-- Vue pour les statistiques d'assiduité par classe
CREATE OR REPLACE VIEW public.attendance_stats AS
SELECT 
    c.id as class_id,
    c.name as class_name,
    c.level as class_level,
    DATE(a.date) as attendance_date,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
    COUNT(CASE WHEN a.status = 'excused' THEN 1 END) as excused_count,
    COUNT(*) as total_count
FROM public.classes c
LEFT JOIN public.students st ON st.class_level = c.level
LEFT JOIN public.attendance a ON a.student_id = st.id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.level, DATE(a.date);

-- =============================================================================
-- FONCTION POUR AJOUTER DES DONNÉES DE TEST
-- =============================================================================

CREATE OR REPLACE FUNCTION public.seed_test_data()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    school_uuid UUID;
    academic_year_uuid UUID;
    math_subject_uuid UUID;
    french_subject_uuid UUID;
    science_subject_uuid UUID;
    history_subject_uuid UUID;
    class_6a_uuid UUID;
    class_5a_uuid UUID;
BEGIN
    -- Récupérer l'école par défaut (s'il y en a une)
    SELECT id INTO school_uuid FROM public.schools LIMIT 1;
    
    IF school_uuid IS NULL THEN
        RETURN; -- Pas d'école, on ne peut pas créer de données de test
    END IF;
    
    -- Récupérer l'année académique courante
    SELECT id INTO academic_year_uuid FROM public.academic_years WHERE is_current = true LIMIT 1;
    
    -- Créer des matières de test
    INSERT INTO public.subjects (school_id, name, code, color, coefficient) VALUES
    (school_uuid, 'Mathématiques', 'MATH', '#3B82F6', 2.0),
    (school_uuid, 'Français', 'FR', '#10B981', 2.0),
    (school_uuid, 'Sciences Physiques', 'SCI', '#F59E0B', 1.5),
    (school_uuid, 'Histoire-Géographie', 'HIST', '#EF4444', 1.0)
    ON CONFLICT (school_id, name) DO NOTHING
    RETURNING id INTO math_subject_uuid;
    
    -- Récupérer les IDs des matières
    SELECT id INTO math_subject_uuid FROM public.subjects WHERE school_id = school_uuid AND name = 'Mathématiques';
    SELECT id INTO french_subject_uuid FROM public.subjects WHERE school_id = school_uuid AND name = 'Français';
    SELECT id INTO science_subject_uuid FROM public.subjects WHERE school_id = school_uuid AND name = 'Sciences Physiques';
    SELECT id INTO history_subject_uuid FROM public.subjects WHERE school_id = school_uuid AND name = 'Histoire-Géographie';
    
    -- Créer des classes de test
    INSERT INTO public.classes (school_id, academic_year_id, name, level, section) VALUES
    (school_uuid, academic_year_uuid, '6ème A', '6', 'A'),
    (school_uuid, academic_year_uuid, '5ème A', '5', 'A'),
    (school_uuid, academic_year_uuid, '4ème A', '4', 'A'),
    (school_uuid, academic_year_uuid, '3ème A', '3', 'A')
    ON CONFLICT (school_id, name, academic_year_id) DO NOTHING;
    
    RAISE NOTICE 'Données de test créées avec succès';
END;
$$;

-- =============================================================================
-- TRIGGERS POUR UPDATED_AT
-- =============================================================================

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- RLS (ROW LEVEL SECURITY)
-- =============================================================================

-- Activer RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;

-- Politiques pour subjects
CREATE POLICY "Users can view subjects of their school" ON public.subjects
    FOR SELECT USING (
        school_id IN (
            SELECT DISTINCT current_school_id FROM public.students WHERE user_id = auth.uid()
            UNION
            SELECT DISTINCT current_school_id FROM public.teachers WHERE user_id = auth.uid()
            UNION  
            SELECT id FROM public.schools WHERE director_user_id = auth.uid()
        )
    );

-- Politiques pour classes
CREATE POLICY "Users can view classes of their school" ON public.classes
    FOR SELECT USING (
        school_id IN (
            SELECT DISTINCT current_school_id FROM public.students WHERE user_id = auth.uid()
            UNION
            SELECT DISTINCT current_school_id FROM public.teachers WHERE user_id = auth.uid()
            UNION
            SELECT id FROM public.schools WHERE director_user_id = auth.uid()
        )
    );

-- Politiques pour grades
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

-- Politiques pour class_subjects
CREATE POLICY "Users can view class subjects of their school" ON public.class_subjects
    FOR SELECT USING (
        class_id IN (
            SELECT c.id FROM public.classes c
            WHERE c.school_id IN (
                SELECT DISTINCT current_school_id FROM public.students WHERE user_id = auth.uid()
                UNION
                SELECT DISTINCT current_school_id FROM public.teachers WHERE user_id = auth.uid()
                UNION
                SELECT id FROM public.schools WHERE director_user_id = auth.uid()
            )
        )
    );

-- =============================================================================
-- COMMENTAIRES POUR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE public.subjects IS 'Table des matières enseignées dans chaque école';
COMMENT ON TABLE public.classes IS 'Table des classes avec leurs niveaux et sections';
COMMENT ON TABLE public.grades IS 'Table des notes des étudiants par matière';
COMMENT ON TABLE public.class_subjects IS 'Table de liaison entre classes et matières';

COMMENT ON VIEW public.class_averages IS 'Vue des moyennes par classe et matière';
COMMENT ON VIEW public.attendance_stats IS 'Vue des statistiques d\'assiduité par classe';

COMMENT ON FUNCTION public.seed_test_data() IS 'Fonction pour créer des données de test pour le dashboard';
