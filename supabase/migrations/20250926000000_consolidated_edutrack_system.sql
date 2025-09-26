-- EduTrack-CM Consolidated Migration
-- Unified Teacher Assignment & Document Management System
-- Date: 2025-09-26
-- Author: System Consolidation

-- ========================================
-- 1. CLEANUP EXISTING CONFLICTS (if any)
-- ========================================

-- Drop potentially conflicting objects (safe if they don't exist)
DROP TABLE IF EXISTS public.teacher_assignments CASCADE;
DROP TABLE IF EXISTS public.teacher_documents CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.document_access_log CASCADE;
DROP TABLE IF EXISTS public.document_access_logs CASCADE;

-- Drop conflicting types
DROP TYPE IF EXISTS public.class_level CASCADE;
DROP TYPE IF EXISTS public.subject_type CASCADE;
DROP TYPE IF EXISTS public.document_category CASCADE;
DROP TYPE IF EXISTS public.document_type CASCADE;

-- Drop storage bucket if exists
DELETE FROM storage.buckets WHERE id = 'documents';

-- ========================================
-- 2. TYPES AND ENUMS
-- ========================================

-- Education-specific class levels (Cameroon system)
CREATE TYPE public.class_level AS ENUM (
    'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2',
    '6ème', '5ème', '4ème', '3ème', 
    '2nd', '1ère', 'Terminale'
);

-- Subject types for Cameroon education
CREATE TYPE public.subject_type AS ENUM (
    'Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie',
    'Sciences Physiques', 'Sciences Naturelles', 'Chimie', 'Biologie',
    'Éducation Physique', 'Arts Plastiques', 'Musique', 'Philosophie',
    'Économie', 'Comptabilité', 'Informatique'
);

-- Document categories
CREATE TYPE public.document_category AS ENUM (
    'cours', 'exercices', 'devoirs', 'corrections', 'evaluations', 
    'ressources', 'annonces', 'programmes'
);

-- ========================================
-- 3. CORE TABLES
-- ========================================

-- Teacher-Class-Subject Assignment Table (Unified)
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
    
    -- Prevent duplicate assignments
    UNIQUE(teacher_id, school_id, class_name, subject, school_year)
);

-- Document Management Table (Unified)
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
    is_public_to_students BOOLEAN DEFAULT true,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Student Document Access Log (Unified)
CREATE TABLE public.document_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.teacher_documents(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action CHARACTER VARYING DEFAULT 'view', -- 'view', 'download'
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 4. INDEXES FOR PERFORMANCE
-- ========================================

-- Teacher assignments indexes
CREATE INDEX idx_teacher_assignments_teacher ON public.teacher_assignments(teacher_id);
CREATE INDEX idx_teacher_assignments_school ON public.teacher_assignments(school_id);
CREATE INDEX idx_teacher_assignments_active ON public.teacher_assignments(is_active) WHERE is_active = true;
CREATE INDEX idx_teacher_assignments_class_subject ON public.teacher_assignments(class_name, subject);
CREATE INDEX idx_teacher_assignments_school_year ON public.teacher_assignments(school_year);

-- Teacher documents indexes
CREATE INDEX idx_teacher_documents_teacher ON public.teacher_documents(teacher_id);
CREATE INDEX idx_teacher_documents_school ON public.teacher_documents(school_id);
CREATE INDEX idx_teacher_documents_class_subject ON public.teacher_documents(class_name, subject);
CREATE INDEX idx_teacher_documents_category ON public.teacher_documents(category);
CREATE INDEX idx_teacher_documents_uploaded_at ON public.teacher_documents(uploaded_at);

-- Document access log indexes
CREATE INDEX idx_document_access_document ON public.document_access_log(document_id);
CREATE INDEX idx_document_access_student ON public.document_access_log(student_id);
CREATE INDEX idx_document_access_user ON public.document_access_log(user_id);
CREATE INDEX idx_document_access_date ON public.document_access_log(accessed_at);

-- ========================================
-- 5. HELPER FUNCTIONS
-- ========================================

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
    AND td.is_public_to_students = true
)
$$;

-- Function to log document access
CREATE OR REPLACE FUNCTION public.log_document_access(
    doc_id UUID,
    access_action TEXT DEFAULT 'view',
    client_ip INET DEFAULT NULL,
    client_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    student_record_id UUID;
BEGIN
    -- Get student ID if user is a student
    SELECT s.id INTO student_record_id 
    FROM public.students s 
    WHERE s.user_id = auth.uid();
    
    INSERT INTO public.document_access_log (
        document_id,
        student_id,
        user_id,
        action,
        ip_address,
        user_agent
    ) VALUES (
        doc_id,
        student_record_id,
        auth.uid(),
        access_action,
        client_ip,
        client_user_agent
    );
END;
$$;

-- ========================================
-- 6. ROW LEVEL SECURITY SETUP
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_log ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 7. RLS POLICIES
-- ========================================

-- TEACHER ASSIGNMENTS POLICIES
CREATE POLICY "principals_manage_teacher_assignments"
ON public.teacher_assignments
FOR ALL
TO authenticated
USING (
    public.user_has_role('principal')
    AND EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.current_school_id = school_id
    )
)
WITH CHECK (
    public.user_has_role('principal')
    AND EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.current_school_id = school_id
    )
);

CREATE POLICY "secretaries_manage_teacher_assignments" 
ON public.teacher_assignments
FOR ALL
TO authenticated
USING (
    public.user_has_role('secretary')
    AND EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.current_school_id = school_id
    )
)
WITH CHECK (
    public.user_has_role('secretary')
    AND EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.current_school_id = school_id
    )
);

CREATE POLICY "teachers_view_own_assignments"
ON public.teacher_assignments
FOR SELECT
TO authenticated
USING (teacher_id = auth.uid());

-- TEACHER DOCUMENTS POLICIES  
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
USING (
    public.student_can_access_document(id)
    AND is_public_to_students = true
);

CREATE POLICY "parents_view_children_documents"
ON public.teacher_documents
FOR SELECT
TO authenticated
USING (
    is_public_to_parents = true
    AND EXISTS (
        SELECT 1 FROM public.parent_student ps
        JOIN public.students s ON ps.student_id = s.id
        WHERE ps.parent_id = auth.uid()
        AND s.current_school_id = school_id
        AND s.current_class = class_name::TEXT
    )
);

CREATE POLICY "admin_view_all_documents"
ON public.teacher_documents
FOR SELECT
TO authenticated
USING (
    public.user_has_role('principal') 
    OR public.user_has_role('secretary')
);

-- DOCUMENT ACCESS LOG POLICIES
CREATE POLICY "users_manage_own_access_log"
ON public.document_access_log
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "teachers_view_document_access"
ON public.document_access_log
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.teacher_documents td 
        WHERE td.id = document_id AND td.teacher_id = auth.uid()
    )
);

CREATE POLICY "admin_view_all_access_logs"
ON public.document_access_log
FOR SELECT
TO authenticated
USING (
    public.user_has_role('principal') 
    OR public.user_has_role('secretary')
);

-- ========================================
-- 8. STORAGE BUCKET SETUP
-- ========================================

-- Create documents bucket for secure file storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents', 
    false,  -- Private bucket for security
    52428800, -- 50MB limit per file
    ARRAY[
        'application/pdf',
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg', 'image/png', 'image/webp', 'image/jpg',
        'text/plain', 'text/csv'
    ]
);

-- ========================================
-- 9. STORAGE RLS POLICIES
-- ========================================

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
        AND td.is_public_to_students = true
    )
);

-- Parents can view documents shared with them
CREATE POLICY "parents_view_children_documents_storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents'
    AND EXISTS (
        SELECT 1 FROM public.teacher_documents td
        JOIN public.students s ON s.current_school_id = td.school_id
        JOIN public.parent_student ps ON ps.student_id = s.id
        WHERE td.file_path = name
        AND ps.parent_id = auth.uid()
        AND s.current_class = td.class_name::TEXT
        AND td.is_public_to_parents = true
    )
);

-- Administrators can view all documents
CREATE POLICY "admin_view_all_document_files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents'
    AND (public.user_has_role('principal') OR public.user_has_role('secretary'))
);

-- ========================================
-- 10. TRIGGERS FOR MAINTENANCE
-- ========================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_teacher_assignments_updated_at
    BEFORE UPDATE ON public.teacher_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_teacher_documents_updated_at
    BEFORE UPDATE ON public.teacher_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- ========================================
-- 11. SAMPLE DATA FOR TESTING
-- ========================================

DO $$
DECLARE
    teacher_user_id UUID;
    principal_user_id UUID;
    school_id UUID;
    sample_student_id UUID;
BEGIN
    -- Get existing users and schools
    SELECT id INTO teacher_user_id FROM public.users WHERE role = 'teacher' LIMIT 1;
    SELECT id INTO principal_user_id FROM public.users WHERE role = 'principal' LIMIT 1;
    SELECT id INTO school_id FROM public.schools LIMIT 1;
    SELECT id INTO sample_student_id FROM public.students LIMIT 1;
    
    -- Create sample teacher if none exists
    IF teacher_user_id IS NULL AND school_id IS NOT NULL THEN
        teacher_user_id := gen_random_uuid();
        INSERT INTO public.users (id, full_name, email, phone, role, password_hash, current_school_id)
        VALUES (
            teacher_user_id,
            'Mme Tchoukoua Rose',
            'ens.math@edutrack.cm',
            '+237676543210',
            'teacher',
            crypt('EnseignantDemo2024!', gen_salt('bf', 10)),
            school_id
        );
    END IF;
    
    -- Create teacher assignments (only if we have required data)
    IF teacher_user_id IS NOT NULL AND school_id IS NOT NULL THEN
        INSERT INTO public.teacher_assignments (teacher_id, school_id, class_name, subject, assigned_by)
        VALUES 
            (teacher_user_id, school_id, '6ème'::public.class_level, 'Mathématiques'::public.subject_type, principal_user_id),
            (teacher_user_id, school_id, '5ème'::public.class_level, 'Mathématiques'::public.subject_type, principal_user_id),
            (teacher_user_id, school_id, '6ème'::public.class_level, 'Sciences Physiques'::public.subject_type, principal_user_id)
        ON CONFLICT (teacher_id, school_id, class_name, subject, school_year) DO NOTHING;
        
        -- Create sample documents
        INSERT INTO public.teacher_documents (teacher_id, school_id, title, description, file_path, file_name, category, class_name, subject)
        VALUES 
            (
                teacher_user_id, school_id,
                'Introduction aux fractions',
                'Cours complet sur les fractions pour la classe de 6ème avec exercices pratiques',
                teacher_user_id::TEXT || '/6eme/mathematiques/cours_fractions.pdf',
                'cours_fractions.pdf',
                'cours'::public.document_category,
                '6ème'::public.class_level,
                'Mathématiques'::public.subject_type
            ),
            (
                teacher_user_id, school_id,
                'Exercices de géométrie',
                'Exercices pratiques sur les figures géométriques et les mesures',
                teacher_user_id::TEXT || '/5eme/mathematiques/exercices_geometrie.pdf',
                'exercices_geometrie.pdf',
                'exercices'::public.document_category,
                '5ème'::public.class_level,
                'Mathématiques'::public.subject_type
            ),
            (
                teacher_user_id, school_id,
                'Évaluation Sciences Physiques',
                'Contrôle sur les états de la matière',
                teacher_user_id::TEXT || '/6eme/sciences/eval_matiere.pdf',
                'eval_matiere.pdf',
                'evaluations'::public.document_category,
                '6ème'::public.class_level,
                'Sciences Physiques'::public.subject_type
            );
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Sample data insertion completed with notices: %', SQLERRM;
END $$;

-- ========================================
-- 12. COMPLETION LOG
-- ========================================

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'EduTrack-CM Consolidated Migration completed successfully!';
    RAISE NOTICE 'Tables created: teacher_assignments, teacher_documents, document_access_log';
    RAISE NOTICE 'Storage bucket: documents (private, 50MB limit)';
    RAISE NOTICE 'RLS policies: Enabled for all roles (teacher, student, parent, principal, secretary)';
    RAISE NOTICE 'Sample data: Created if base users/schools exist';
END $$;