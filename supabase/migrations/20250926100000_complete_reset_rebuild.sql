-- EduTrack-CM Complete Database Reset & Rebuild
-- ATTENTION: Ce script supprime TOUTES les données existantes !
-- Date: 2025-09-26
-- Objectif: Reconstruire la base de données selon nos spécifications exactes

-- ========================================
-- 1. NETTOYAGE COMPLET (DANGER ZONE!)
-- ========================================

-- Supprimer toutes les politiques RLS existantes
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all RLS policies
    FOR r IN SELECT schemaname, tablename, policyname 
             FROM pg_policies 
             WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Supprimer toutes les tables dans le bon ordre (relations)
DROP TABLE IF EXISTS public.document_access_log CASCADE;
DROP TABLE IF EXISTS public.document_access_logs CASCADE;
DROP TABLE IF EXISTS public.teacher_documents CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.teacher_assignments CASCADE;
DROP TABLE IF EXISTS public.grades CASCADE;
DROP TABLE IF EXISTS public.parent_student CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.schools CASCADE;

-- Supprimer tous les types personnalisés
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.school_type CASCADE;
DROP TYPE IF EXISTS public.student_status CASCADE;
DROP TYPE IF EXISTS public.class_level CASCADE;
DROP TYPE IF EXISTS public.subject_type CASCADE;
DROP TYPE IF EXISTS public.document_category CASCADE;
DROP TYPE IF EXISTS public.document_type CASCADE;

-- Supprimer les fonctions personnalisées
DROP FUNCTION IF EXISTS public.user_has_role(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.teacher_assigned_to_class_subject(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.student_can_access_document(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.log_document_access(UUID, TEXT, INET, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_school() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

-- Supprimer les buckets de stockage
DELETE FROM storage.objects WHERE bucket_id = 'documents';
DELETE FROM storage.buckets WHERE id = 'documents';

-- ========================================
-- 2. RECREATION COMPLETE DU SCHEMA
-- ========================================

-- Types et énumérations
CREATE TYPE public.user_role AS ENUM (
    'admin', 'principal', 'secretary', 'teacher', 'student', 'parent', 'school_director'
);

CREATE TYPE public.school_type AS ENUM (
    'maternelle', 'primaire', 'college', 'lycee', 'technique', 'prive', 'public'
);

CREATE TYPE public.student_status AS ENUM (
    'active', 'suspended', 'transferred', 'graduated', 'dropped'
);

CREATE TYPE public.class_level AS ENUM (
    'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2',
    '6ème', '5ème', '4ème', '3ème', 
    '2nd', '1ère', 'Terminale'
);

CREATE TYPE public.subject_type AS ENUM (
    'Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie',
    'Sciences Physiques', 'Sciences Naturelles', 'Chimie', 'Biologie',
    'Éducation Physique', 'Arts Plastiques', 'Musique', 'Philosophie',
    'Économie', 'Comptabilité', 'Informatique'
);

CREATE TYPE public.document_category AS ENUM (
    'cours', 'exercices', 'devoirs', 'corrections', 'evaluations', 
    'ressources', 'annonces', 'programmes'
);

-- ========================================
-- 3. TABLES PRINCIPALES
-- ========================================

-- 🏫 SCHOOLS (Établissements scolaires)
CREATE TABLE public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name CHARACTER VARYING NOT NULL,
    code CHARACTER VARYING UNIQUE,
    type public.school_type NOT NULL,
    director_name CHARACTER VARYING,
    director_user_id UUID, -- FK vers users (ajoutée après)
    phone CHARACTER VARYING,
    email CHARACTER VARYING,
    address TEXT,
    city CHARACTER VARYING,
    country CHARACTER VARYING DEFAULT 'Cameroun',
    available_classes TEXT[], -- Classes disponibles
    status CHARACTER VARYING DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 👥 USERS (Utilisateurs du système)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name CHARACTER VARYING NOT NULL,
    email CHARACTER VARYING UNIQUE,
    phone CHARACTER VARYING,
    role public.user_role NOT NULL,
    password_hash TEXT,
    pin_code CHARACTER VARYING(6),
    avatar_url TEXT,
    language CHARACTER VARYING DEFAULT 'fr',
    current_school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Ajouter la contrainte FK pour director après création de users
ALTER TABLE public.schools 
ADD CONSTRAINT fk_schools_director 
FOREIGN KEY (director_user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 🎓 STUDENTS (Élèves)
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    matricule CHARACTER VARYING UNIQUE,
    current_school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    current_class CHARACTER VARYING NOT NULL,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    birth_date DATE,
    birth_place CHARACTER VARYING,
    parent_name CHARACTER VARYING,
    parent_phone CHARACTER VARYING,
    parent_email CHARACTER VARYING,
    emergency_contact CHARACTER VARYING,
    emergency_phone CHARACTER VARYING,
    medical_info TEXT,
    status public.student_status DEFAULT 'active',
    academic_year CHARACTER VARYING DEFAULT '2024-2025',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 👨‍👩‍👧‍👦 PARENT_STUDENT (Relations parent-enfant)
CREATE TABLE public.parent_student (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    relationship CHARACTER VARYING DEFAULT 'parent',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_id, student_id)
);

-- 📊 GRADES (Notes et évaluations)
CREATE TABLE public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    subject CHARACTER VARYING NOT NULL,
    grade DECIMAL(4,2) NOT NULL,
    grade_out_of DECIMAL(4,2) DEFAULT 20.00,
    grade_type CHARACTER VARYING DEFAULT 'exam',
    description TEXT,
    date_recorded DATE DEFAULT CURRENT_DATE,
    academic_year CHARACTER VARYING DEFAULT '2024-2025',
    term CHARACTER VARYING,
    teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 👨‍🏫 TEACHER_ASSIGNMENTS (Affectations enseignants)
CREATE TABLE public.teacher_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    class_name public.class_level NOT NULL,
    subject public.subject_type NOT NULL,
    school_year CHARACTER VARYING NOT NULL DEFAULT '2024-2025',
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, school_id, class_name, subject, school_year)
);

-- 📄 TEACHER_DOCUMENTS (Documents pédagogiques)
CREATE TABLE public.teacher_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    title CHARACTER VARYING NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_name CHARACTER VARYING NOT NULL,
    file_size BIGINT,
    mime_type CHARACTER VARYING,
    category public.document_category NOT NULL,
    class_name public.class_level NOT NULL,
    subject public.subject_type NOT NULL,
    is_public_to_parents BOOLEAN DEFAULT false,
    is_public_to_students BOOLEAN DEFAULT true,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 📈 DOCUMENT_ACCESS_LOG (Suivi d'accès aux documents)
CREATE TABLE public.document_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.teacher_documents(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action CHARACTER VARYING DEFAULT 'view',
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 4. INDEX DE PERFORMANCE
-- ========================================

-- Schools
CREATE INDEX idx_schools_type ON public.schools(type);
CREATE INDEX idx_schools_status ON public.schools(status);

-- Users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_school ON public.users(current_school_id);

-- Students
CREATE INDEX idx_students_user ON public.students(user_id);
CREATE INDEX idx_students_school ON public.students(current_school_id);
CREATE INDEX idx_students_class ON public.students(current_class);
CREATE INDEX idx_students_matricule ON public.students(matricule);

-- Teacher Assignments
CREATE INDEX idx_teacher_assignments_teacher ON public.teacher_assignments(teacher_id);
CREATE INDEX idx_teacher_assignments_school ON public.teacher_assignments(school_id);
CREATE INDEX idx_teacher_assignments_active ON public.teacher_assignments(is_active) WHERE is_active = true;

-- Documents
CREATE INDEX idx_teacher_documents_teacher ON public.teacher_documents(teacher_id);
CREATE INDEX idx_teacher_documents_school ON public.teacher_documents(school_id);
CREATE INDEX idx_teacher_documents_category ON public.teacher_documents(category);

-- Grades
CREATE INDEX idx_grades_student ON public.grades(student_id);
CREATE INDEX idx_grades_school ON public.grades(school_id);
CREATE INDEX idx_grades_subject ON public.grades(subject);

-- ========================================
-- 5. FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour vérifier le rôle utilisateur
CREATE OR REPLACE FUNCTION public.user_has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role::TEXT = required_role
)
$$;

-- Fonction pour récupérer l'école de l'utilisateur
CREATE OR REPLACE FUNCTION public.get_user_school()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT current_school_id FROM public.users WHERE id = auth.uid()
$$;

-- Fonction trigger pour mise à jour automatique
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ========================================
-- 6. TRIGGERS
-- ========================================

CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON public.schools
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_teacher_assignments_updated_at
    BEFORE UPDATE ON public.teacher_assignments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_teacher_documents_updated_at
    BEFORE UPDATE ON public.teacher_documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ========================================
-- 7. ROW LEVEL SECURITY
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_log ENABLE ROW LEVEL SECURITY;

-- Politiques pour USERS (accès de base)
CREATE POLICY "users_view_own_profile"
ON public.users FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "users_update_own_profile"
ON public.users FOR UPDATE TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Politiques pour SCHOOLS
CREATE POLICY "admin_manage_all_schools"
ON public.schools FOR ALL TO authenticated
USING (public.user_has_role('admin'))
WITH CHECK (public.user_has_role('admin'));

CREATE POLICY "school_staff_view_own_school"
ON public.schools FOR SELECT TO authenticated
USING (
    id = public.get_user_school()
    OR director_user_id = auth.uid()
);

-- Politiques pour STUDENTS
CREATE POLICY "students_view_own_profile"
ON public.students FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "parents_view_children"
ON public.students FOR SELECT TO authenticated
USING (
    id IN (
        SELECT ps.student_id FROM public.parent_student ps 
        WHERE ps.parent_id = auth.uid()
    )
);

CREATE POLICY "school_staff_manage_students"
ON public.students FOR ALL TO authenticated
USING (
    current_school_id = public.get_user_school()
    AND EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role IN ('principal', 'secretary', 'teacher')
    )
)
WITH CHECK (
    current_school_id = public.get_user_school()
    AND EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role IN ('principal', 'secretary', 'teacher')
    )
);

-- Politiques pour GRADES
CREATE POLICY "students_view_own_grades"
ON public.grades FOR SELECT TO authenticated
USING (
    student_id IN (
        SELECT s.id FROM public.students s WHERE s.user_id = auth.uid()
    )
);

CREATE POLICY "parents_view_children_grades"
ON public.grades FOR SELECT TO authenticated
USING (
    student_id IN (
        SELECT ps.student_id FROM public.parent_student ps 
        WHERE ps.parent_id = auth.uid()
    )
);

CREATE POLICY "teachers_manage_grades"
ON public.grades FOR ALL TO authenticated
USING (
    school_id = public.get_user_school()
    AND public.user_has_role('teacher')
)
WITH CHECK (
    school_id = public.get_user_school()
    AND public.user_has_role('teacher')
);

-- Politiques pour TEACHER_ASSIGNMENTS
CREATE POLICY "teachers_view_own_assignments"
ON public.teacher_assignments FOR SELECT TO authenticated
USING (teacher_id = auth.uid());

CREATE POLICY "admin_manage_assignments"
ON public.teacher_assignments FOR ALL TO authenticated
USING (
    school_id = public.get_user_school()
    AND public.user_has_role('principal')
)
WITH CHECK (
    school_id = public.get_user_school()
    AND public.user_has_role('principal')
);

-- Politiques pour TEACHER_DOCUMENTS
CREATE POLICY "teachers_manage_own_documents"
ON public.teacher_documents FOR ALL TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "students_view_class_documents"
ON public.teacher_documents FOR SELECT TO authenticated
USING (
    is_public_to_students = true
    AND EXISTS (
        SELECT 1 FROM public.students s 
        WHERE s.user_id = auth.uid() 
        AND s.current_class = class_name::TEXT
        AND s.current_school_id = school_id
    )
);

-- ========================================
-- 8. BUCKET DE STOCKAGE
-- ========================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents', 
    false,
    52428800, -- 50MB
    ARRAY[
        'application/pdf',
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg', 'image/png', 'image/webp',
        'text/plain'
    ]
);

-- Politiques de stockage
CREATE POLICY "teachers_manage_documents"
ON storage.objects FOR ALL TO authenticated
USING (
    bucket_id = 'documents'
    AND public.user_has_role('teacher')
    AND owner = auth.uid()
)
WITH CHECK (
    bucket_id = 'documents'
    AND public.user_has_role('teacher')
);

-- ========================================
-- 9. DONNÉES DE DÉMO
-- ========================================

DO $$
DECLARE
    demo_school_id UUID := gen_random_uuid();
    principal_id UUID := gen_random_uuid();
    teacher_id UUID := gen_random_uuid();
    student_user_id UUID := gen_random_uuid();
    parent_id UUID := gen_random_uuid();
    student_id UUID := gen_random_uuid();
BEGIN
    -- École de démonstration
    INSERT INTO public.schools (id, name, code, type, director_name, phone, email, address, city, available_classes)
    VALUES (
        demo_school_id,
        'Lycée Bilingue de Yaoundé',
        'LBY-2024',
        'lycee',
        'M. Mballa Jean',
        '+237678123456',
        'direction@lby.edu.cm',
        'Quartier Nlongkak, Yaoundé',
        'Yaoundé',
        ARRAY['6ème', '5ème', '4ème', '3ème', '2nd', '1ère', 'Terminale']
    );

    -- Utilisateurs de démo
    INSERT INTO public.users (id, full_name, email, phone, role, current_school_id, pin_code, password_hash) VALUES
        (principal_id, 'M. Mballa Jean', 'proviseur@lby.edu.cm', '+237678123456', 'principal', demo_school_id, '0000', crypt('admin123', gen_salt('bf'))),
        (teacher_id, 'Mme Tchoukoua Rose', 'prof.math@lby.edu.cm', '+237695123456', 'teacher', demo_school_id, '1234', crypt('prof123', gen_salt('bf'))),
        (student_user_id, 'Ngatcha Etienne', 'etienne@student.lby.edu.cm', '+237654987321', 'student', demo_school_id, '5678', crypt('student123', gen_salt('bf'))),
        (parent_id, 'M. Ngatcha Paul', 'parent.ngatcha@gmail.com', '+237698765432', 'parent', NULL, '9876', crypt('parent123', gen_salt('bf')));

    -- Lier le directeur à l'école
    UPDATE public.schools SET director_user_id = principal_id WHERE id = demo_school_id;

    -- Élève
    INSERT INTO public.students (id, user_id, matricule, current_school_id, current_class, birth_date, parent_name, parent_phone)
    VALUES (
        student_id,
        student_user_id,
        'LBY-2024-001',
        demo_school_id,
        '6ème A',
        '2010-03-15',
        'M. Ngatcha Paul',
        '+237698765432'
    );

    -- Relation parent-enfant
    INSERT INTO public.parent_student (parent_id, student_id, relationship, is_primary)
    VALUES (parent_id, student_id, 'parent', true);

    -- Affectation enseignant
    INSERT INTO public.teacher_assignments (teacher_id, school_id, class_name, subject, assigned_by)
    VALUES (teacher_id, demo_school_id, '6ème'::public.class_level, 'Mathématiques'::public.subject_type, principal_id);

    -- Notes de démo
    INSERT INTO public.grades (student_id, school_id, subject, grade, grade_type, description, teacher_id) VALUES
        (student_id, demo_school_id, 'Mathématiques', 16.50, 'exam', 'Contrôle fractions', teacher_id),
        (student_id, demo_school_id, 'Français', 14.00, 'homework', 'Rédaction', teacher_id);

    RAISE NOTICE '🎉 Base de données EduTrack-CM reconstruite avec succès !';
    RAISE NOTICE '📊 Données de démo créées:';
    RAISE NOTICE '   🏫 École: Lycée Bilingue de Yaoundé';
    RAISE NOTICE '   👨‍💼 Proviseur: M. Mballa Jean (PIN: 0000)';
    RAISE NOTICE '   👩‍🏫 Enseignant: Mme Tchoukoua Rose (PIN: 1234)';
    RAISE NOTICE '   🎓 Élève: Ngatcha Etienne (PIN: 5678)';
    RAISE NOTICE '   👨‍👧 Parent: M. Ngatcha Paul (PIN: 9876)';
    RAISE NOTICE '✅ Prêt pour les tests et développement !';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur lors de la création des données: %', SQLERRM;
END $$;