-- Migration Simplifiée pour Dashboard Principal
-- Date: 2025-09-26
-- Objectif: Ajouter seulement les tables nécessaires qui n'existent pas

-- ========================================
-- 1. TYPES ENUMS
-- ========================================

-- Type pour les statuts de présence
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
    END IF;
END $$;

-- Type pour les années scolaires
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'academic_year_status') THEN
        CREATE TYPE public.academic_year_status AS ENUM ('planning', 'active', 'completed', 'archived');
    END IF;
END $$;

-- ========================================
-- 2. TABLE ATTENDANCE (Présences) - NOUVELLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status public.attendance_status NOT NULL,
    recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index unique pour éviter les doublons étudiant/date
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_student_date_unique 
ON public.attendance(student_id, date);

-- Index de performance
CREATE INDEX IF NOT EXISTS idx_attendance_school_date ON public.attendance(school_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance(status);

-- ========================================
-- 3. TABLE ACADEMIC_YEARS - NOUVELLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    year_name CHARACTER VARYING NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    status public.academic_year_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index unique pour une seule année courante par école
CREATE UNIQUE INDEX IF NOT EXISTS idx_academic_years_current_unique 
ON public.academic_years(school_id) WHERE is_current = true;

CREATE INDEX IF NOT EXISTS idx_academic_years_school ON public.academic_years(school_id);

-- ========================================
-- 4. RLS POLICIES POUR ATTENDANCE
-- ========================================

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Personnel de l'école peut gérer les présences
CREATE POLICY "school_staff_manage_attendance"
ON public.attendance FOR ALL TO authenticated
USING (
    school_id = public.get_user_school()
    AND (public.user_has_role('teacher') OR public.user_has_role('principal') OR public.user_has_role('secretary'))
)
WITH CHECK (
    school_id = public.get_user_school()
    AND (public.user_has_role('teacher') OR public.user_has_role('principal') OR public.user_has_role('secretary'))
);

-- Étudiants voient leurs propres présences
CREATE POLICY "students_view_own_attendance"
ON public.attendance FOR SELECT TO authenticated
USING (
    student_id IN (
        SELECT s.id FROM public.students s WHERE s.user_id = auth.uid()
    )
);

-- Parents voient les présences de leurs enfants
CREATE POLICY "parents_view_children_attendance"
ON public.attendance FOR SELECT TO authenticated
USING (
    student_id IN (
        SELECT ps.student_id FROM public.parent_student ps 
        WHERE ps.parent_id = auth.uid()
    )
);

-- ========================================
-- 5. RLS POLICIES POUR ACADEMIC_YEARS
-- ========================================

ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

CREATE POLICY "school_staff_manage_academic_years"
ON public.academic_years FOR ALL TO authenticated
USING (
    school_id = public.get_user_school()
    AND (public.user_has_role('principal') OR public.user_has_role('secretary'))
)
WITH CHECK (
    school_id = public.get_user_school()
    AND (public.user_has_role('principal') OR public.user_has_role('secretary'))
);

-- Tous les utilisateurs de l'école peuvent voir les années scolaires
CREATE POLICY "school_users_view_academic_years"
ON public.academic_years FOR SELECT TO authenticated
USING (school_id = public.get_user_school());

-- ========================================
-- 6. TRIGGERS
-- ========================================

CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ========================================
-- 7. FONCTIONS UTILITAIRES POUR MÉTRIQUES
-- ========================================

-- Fonction pour calculer le taux de présence
CREATE OR REPLACE FUNCTION public.calculate_attendance_rate(
    school_id_param UUID,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(rate NUMERIC)
LANGUAGE sql
SECURITY DEFINER
AS $$
SELECT 
    ROUND(
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(*), 0), 
        1
    ) as rate
FROM public.attendance a
JOIN public.students s ON a.student_id = s.id
WHERE s.current_school_id = school_id_param
AND a.date >= CURRENT_DATE - INTERVAL '1 day' * days_back;
$$;

-- Fonction pour calculer la moyenne générale de l'école
CREATE OR REPLACE FUNCTION public.calculate_school_average(school_id_param UUID)
RETURNS TABLE(average NUMERIC)
LANGUAGE sql
SECURITY DEFINER
AS $$
SELECT 
    ROUND(
        AVG(g.grade * g.grade_out_of / 20), 
        1
    ) as average
FROM public.grades g
JOIN public.students s ON g.student_id = s.id
WHERE s.current_school_id = school_id_param
AND g.academic_year = '2024-2025';
$$;

-- ========================================
-- 8. DONNÉES DE DEMO
-- ========================================

DO $$
DECLARE
    demo_school_id UUID;
    sample_student_id UUID;
    i INTEGER;
    attendance_status_val public.attendance_status;
BEGIN
    -- Récupérer l'école de démo
    SELECT id INTO demo_school_id FROM public.schools WHERE name LIKE '%Yaoundé%' LIMIT 1;
    
    IF demo_school_id IS NOT NULL THEN
        -- Récupérer un étudiant de démo
        SELECT s.id INTO sample_student_id 
        FROM public.students s 
        WHERE s.current_school_id = demo_school_id 
        LIMIT 1;
        
        IF sample_student_id IS NOT NULL THEN
            -- Créer des présences pour les 30 derniers jours
            FOR i IN 1..30 LOOP
                -- 94% de chances d'être présent, 4% en retard, 2% absent
                CASE 
                    WHEN random() < 0.94 THEN attendance_status_val := 'present';
                    WHEN random() < 0.98 THEN attendance_status_val := 'late';
                    ELSE attendance_status_val := 'absent';
                END CASE;
                
                INSERT INTO public.attendance (
                    student_id, 
                    school_id, 
                    date, 
                    status
                )
                VALUES (
                    sample_student_id,
                    demo_school_id,
                    CURRENT_DATE - INTERVAL '1 day' * i,
                    attendance_status_val
                )
                ON CONFLICT (student_id, date) DO NOTHING;
            END LOOP;
        END IF;
        
        -- Créer année scolaire courante
        INSERT INTO public.academic_years (
            school_id, 
            year_name, 
            start_date, 
            end_date, 
            is_current
        )
        VALUES (
            demo_school_id, 
            '2024-2025', 
            '2024-09-01', 
            '2025-07-31', 
            true
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ Tables attendance et academic_years créées avec données de démo';
        RAISE NOTICE '📊 Fonctions de calcul de métriques ajoutées';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur: %', SQLERRM;
END $$;