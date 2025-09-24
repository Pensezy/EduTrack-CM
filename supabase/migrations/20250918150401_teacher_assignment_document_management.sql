-- Teacher Assignment Process & Document Management Module
-- Schema Analysis: Extending existing users, schools, students, grades tables
-- Integration Type: Addition - new tables for teacher assignments and documents
-- Dependencies: users(id), schools(id), students(id)

-- 1. TYPES (Education-specific enums)
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

-- 2. CORE TABLES

-- Teacher-Class-Subject Assignment Table
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
    
    -- Prevent duplicate assignments
    UNIQUE(teacher_id, school_id, class_name, subject, school_year)
);

-- Document Management Table  
CREATE TABLE public.teacher_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    title CHARACTER VARYING NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL, -- Path in storage bucket
    file_name CHARACTER VARYING NOT NULL,
    file_size BIGINT,
    mime_type CHARACTER VARYING,
    category public.document_category NOT NULL,
    class_name public.class_level NOT NULL,
    subject public.subject_type NOT NULL,
    is_public_to_parents BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Student Document Access Log (tracking)
CREATE TABLE public.document_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.teacher_documents(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    accessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    action CHARACTER VARYING DEFAULT 'view' -- 'view', 'download'
);

-- 3. ESSENTIAL INDEXES
CREATE INDEX idx_teacher_assignments_teacher ON public.teacher_assignments(teacher_id);
CREATE INDEX idx_teacher_assignments_school ON public.teacher_assignments(school_id);
CREATE INDEX idx_teacher_assignments_active ON public.teacher_assignments(is_active) WHERE is_active = true;
CREATE INDEX idx_teacher_assignments_class_subject ON public.teacher_assignments(class_name, subject);

CREATE INDEX idx_teacher_documents_teacher ON public.teacher_documents(teacher_id);
CREATE INDEX idx_teacher_documents_school ON public.teacher_documents(school_id);
CREATE INDEX idx_teacher_documents_class_subject ON public.teacher_documents(class_name, subject);
CREATE INDEX idx_teacher_documents_category ON public.teacher_documents(category);

CREATE INDEX idx_document_access_document ON public.document_access_log(document_id);
CREATE INDEX idx_document_access_student ON public.document_access_log(student_id);

-- 4. FUNCTIONS (Must be before RLS policies)

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.user_has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = required_role
)
$$;

-- Function to check if teacher is assigned to class/subject
CREATE OR REPLACE FUNCTION public.teacher_assigned_to_class_subject(class_level TEXT, subject_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.teacher_assignments ta
    WHERE ta.teacher_id = auth.uid()
    AND ta.class_name::TEXT = class_level
    AND ta.subject::TEXT = subject_name
    AND ta.is_active = true
)
$$;

-- Function to check if student can access document
CREATE OR REPLACE FUNCTION public.student_can_access_document(doc_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.teacher_documents td
    JOIN public.students s ON s.current_class = td.class_name::TEXT
    WHERE td.id = doc_id
    AND s.user_id = auth.uid()
)
$$;

-- 5. RLS SETUP
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_log ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- Teacher Assignments Policies
CREATE POLICY "principals_manage_teacher_assignments"
ON public.teacher_assignments
FOR ALL
TO authenticated
USING (public.user_has_role('principal'))
WITH CHECK (public.user_has_role('principal'));

CREATE POLICY "secretaries_view_teacher_assignments" 
ON public.teacher_assignments
FOR SELECT
TO authenticated
USING (public.user_has_role('secretary'));

CREATE POLICY "teachers_view_own_assignments"
ON public.teacher_assignments
FOR SELECT
TO authenticated
USING (teacher_id = auth.uid());

-- Teacher Documents Policies  
CREATE POLICY "teachers_manage_own_documents"
ON public.teacher_documents
FOR ALL
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "students_view_class_documents"
ON public.teacher_documents
FOR SELECT
TO authenticated
USING (public.student_can_access_document(id));

CREATE POLICY "principals_secretaries_view_all_documents"
ON public.teacher_documents
FOR SELECT
TO authenticated
USING (public.user_has_role('principal') OR public.user_has_role('secretary'));

-- Document Access Log Policies
CREATE POLICY "users_manage_own_access_log"
ON public.document_access_log
FOR ALL
TO authenticated
USING (
    student_id IN (
        SELECT s.id FROM public.students s WHERE s.user_id = auth.uid()
    )
)
WITH CHECK (
    student_id IN (
        SELECT s.id FROM public.students s WHERE s.user_id = auth.uid()
    )
);

CREATE POLICY "teachers_view_document_access"
ON public.document_access_log
FOR SELECT
TO authenticated
USING (
    document_id IN (
        SELECT td.id FROM public.teacher_documents td WHERE td.teacher_id = auth.uid()
    )
);

-- 7. STORAGE BUCKET SETUP

-- Create private documents bucket for secure file storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents', 
    false,  -- Private bucket for security
    52428800, -- 50MB limit
    ARRAY[
        'application/pdf',
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg', 'image/png', 'image/webp',
        'text/plain'
    ]
);

-- 8. STORAGE RLS POLICIES

-- Teachers can upload documents to their folder
CREATE POLICY "teachers_upload_documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents'
    AND public.user_has_role('teacher')
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Teachers can manage their own documents
CREATE POLICY "teachers_manage_own_document_files"
ON storage.objects
FOR ALL
TO authenticated
USING (
    bucket_id = 'documents'
    AND owner = auth.uid()
    AND public.user_has_role('teacher')
);

-- Students can view documents from their classes
CREATE POLICY "students_view_class_document_files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents'
    AND EXISTS (
        SELECT 1 FROM public.teacher_documents td
        JOIN public.students s ON s.current_class = td.class_name::TEXT
        WHERE td.file_path = name
        AND s.user_id = auth.uid()
    )
);

-- Principals and secretaries can view all documents
CREATE POLICY "admin_view_all_documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents'
    AND (public.user_has_role('principal') OR public.user_has_role('secretary'))
);

-- 9. TRIGGERS FOR AUDIT

-- Update timestamp trigger for documents
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_teacher_documents_updated_at
    BEFORE UPDATE ON public.teacher_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- 10. MOCK DATA FOR TESTING

DO $$
DECLARE
    teacher_user_id UUID;
    principal_user_id UUID;
    school_id UUID;
    assignment_id UUID;
BEGIN
    -- Get existing users and schools
    SELECT id INTO teacher_user_id FROM public.users WHERE role = 'teacher' OR email LIKE '%ens.math%' LIMIT 1;
    SELECT id INTO principal_user_id FROM public.users WHERE role = 'principal' OR email LIKE '%proviseur%' LIMIT 1;
    SELECT id INTO school_id FROM public.schools LIMIT 1;
    
    -- Create teacher if none exists
    IF teacher_user_id IS NULL THEN
        teacher_user_id := gen_random_uuid();
        INSERT INTO public.users (id, full_name, email, phone, role, password_hash, current_school_id)
        VALUES (
            teacher_user_id,
            'Mme Tchoukoua Rose',
            'ens.math@demo.cm',
            '+237676543210',
            'teacher',
            crypt('EnsMath1', gen_salt('bf', 10)),
            school_id
        );
    END IF;
    
    -- Create teacher assignments
    INSERT INTO public.teacher_assignments (teacher_id, school_id, class_name, subject, assigned_by)
    VALUES 
        (teacher_user_id, school_id, '6ème'::public.class_level, 'Mathématiques'::public.subject_type, principal_user_id),
        (teacher_user_id, school_id, '5ème'::public.class_level, 'Mathématiques'::public.subject_type, principal_user_id),
        (teacher_user_id, school_id, '6ème'::public.class_level, 'Sciences Physiques'::public.subject_type, principal_user_id);
    
    -- Create sample documents
    INSERT INTO public.teacher_documents (teacher_id, school_id, title, description, file_path, file_name, category, class_name, subject)
    VALUES 
        (
            teacher_user_id, school_id,
            'Cours sur les fractions',
            'Introduction aux fractions pour la classe de 6ème',
            teacher_user_id::TEXT || '/6eme/mathematiques/cours_fractions.pdf',
            'cours_fractions.pdf',
            'cours'::public.document_category,
            '6ème'::public.class_level,
            'Mathématiques'::public.subject_type
        ),
        (
            teacher_user_id, school_id,
            'Exercices géométrie',
            'Exercices pratiques sur les figures géométriques',
            teacher_user_id::TEXT || '/5eme/mathematiques/exercices_geometrie.pdf',
            'exercices_geometrie.pdf',
            'exercices'::public.document_category,
            '5ème'::public.class_level,
            'Mathématiques'::public.subject_type
        );

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;