-- Document Management System Migration
-- Schema Analysis: Educational system with users, students, schools exists
-- Integration Type: addition - new document tables referencing existing schema  
-- Dependencies: users, students, schools tables

-- 1. ENUMS AND TYPES
CREATE TYPE public.document_type AS ENUM (
    'assignment', 'lesson', 'exam', 'resource', 'announcement', 'other'
);

-- 2. TEACHER ASSIGNMENTS TABLE 
CREATE TABLE public.teacher_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    class_name CHARACTER VARYING NOT NULL,
    subject CHARACTER VARYING NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. DOCUMENTS TABLE
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title CHARACTER VARYING NOT NULL,
    description TEXT,
    file_name CHARACTER VARYING NOT NULL,
    file_path CHARACTER VARYING NOT NULL,
    file_size BIGINT,
    mime_type CHARACTER VARYING,
    document_type public.document_type DEFAULT 'resource'::public.document_type,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    class_name CHARACTER VARYING NOT NULL,
    subject CHARACTER VARYING NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. DOCUMENT ACCESS LOG TABLE
CREATE TABLE public.document_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action CHARACTER VARYING NOT NULL, -- 'view', 'download'
    accessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- 5. INDEXES
CREATE INDEX idx_teacher_assignments_teacher_id ON public.teacher_assignments(teacher_id);
CREATE INDEX idx_teacher_assignments_school_id ON public.teacher_assignments(school_id);
CREATE INDEX idx_teacher_assignments_class_subject ON public.teacher_assignments(class_name, subject);
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX idx_documents_school_class_subject ON public.documents(school_id, class_name, subject);
CREATE INDEX idx_documents_type ON public.documents(document_type);
CREATE INDEX idx_document_access_logs_document_id ON public.document_access_logs(document_id);
CREATE INDEX idx_document_access_logs_user_id ON public.document_access_logs(user_id);

-- 6. STORAGE BUCKET SETUP
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents', 
    false,  -- Private bucket for document security
    52428800, -- 50MB limit per file
    ARRAY[
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg', 'image/png', 'image/jpg', 'image/webp'
    ]
);

-- 7. ENABLE RLS
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES

-- Teacher Assignments Policies
CREATE POLICY "teachers_view_own_assignments"
ON public.teacher_assignments
FOR SELECT
TO authenticated
USING (teacher_id = auth.uid());

CREATE POLICY "principals_manage_teacher_assignments"
ON public.teacher_assignments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'principal'
        AND u.current_school_id = school_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'principal'
        AND u.current_school_id = school_id
    )
);

CREATE POLICY "secretaries_manage_teacher_assignments"
ON public.teacher_assignments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'secretary'
        AND u.current_school_id = school_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'secretary'
        AND u.current_school_id = school_id
    )
);

-- Documents Policies
CREATE POLICY "teachers_manage_own_documents"
ON public.documents
FOR ALL
TO authenticated
USING (uploaded_by = auth.uid())
WITH CHECK (uploaded_by = auth.uid());

-- Students can view documents from their classes
CREATE POLICY "students_view_class_documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.user_id = auth.uid()
        AND s.current_school_id = school_id
        AND s.current_class = class_name
    )
);

-- Parents can view documents from their children's classes  
CREATE POLICY "parents_view_children_documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.parent_student ps
        JOIN public.students s ON ps.student_id = s.id
        WHERE ps.parent_id = auth.uid()
        AND s.current_school_id = school_id
        AND s.current_class = class_name
    )
);

-- Document Access Logs Policies
CREATE POLICY "users_view_own_access_logs"
ON public.document_access_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "teachers_view_document_access_logs"
ON public.document_access_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.id = document_id
        AND d.uploaded_by = auth.uid()
    )
);

-- Storage Policies
CREATE POLICY "teachers_upload_documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents'
    AND EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND u.role = 'teacher'
    )
);

CREATE POLICY "teachers_view_own_documents_storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents'
    AND owner = auth.uid()
);

CREATE POLICY "students_view_class_documents_storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents'
    AND EXISTS (
        SELECT 1 FROM public.documents d
        JOIN public.students s ON s.current_school_id = d.school_id
        WHERE d.file_path = name
        AND s.user_id = auth.uid()
        AND s.current_class = d.class_name
    )
);

CREATE POLICY "parents_view_children_documents_storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents'
    AND EXISTS (
        SELECT 1 FROM public.documents d
        JOIN public.students s ON s.current_school_id = d.school_id
        JOIN public.parent_student ps ON ps.student_id = s.id
        WHERE d.file_path = name
        AND ps.parent_id = auth.uid()
        AND s.current_class = d.class_name
    )
);

CREATE POLICY "teachers_delete_own_documents_storage"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'documents'
    AND owner = auth.uid()
);

-- 9. FUNCTIONS FOR DOCUMENT ACCESS
CREATE OR REPLACE FUNCTION public.log_document_access(
    doc_id UUID,
    access_action TEXT,
    client_ip INET DEFAULT NULL,
    client_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.document_access_logs (
        document_id,
        user_id, 
        action,
        ip_address,
        user_agent
    ) VALUES (
        doc_id,
        auth.uid(),
        access_action,
        client_ip,
        client_user_agent
    );
END;
$$;

-- 10. MOCK DATA
DO $$
DECLARE
    teacher1_id UUID;
    teacher2_id UUID;
    school1_id UUID;
    school2_id UUID;
    doc1_id UUID := gen_random_uuid();
    doc2_id UUID := gen_random_uuid();
    doc3_id UUID := gen_random_uuid();
BEGIN
    -- Get existing users and schools
    SELECT id INTO teacher1_id FROM public.users WHERE role = 'teacher' LIMIT 1;
    SELECT id INTO teacher2_id FROM public.users WHERE role = 'teacher' OFFSET 1 LIMIT 1;
    SELECT id INTO school1_id FROM public.schools LIMIT 1;
    SELECT id INTO school2_id FROM public.schools OFFSET 1 LIMIT 1;

    -- Create mock teacher users if they don't exist
    IF teacher1_id IS NULL THEN
        INSERT INTO public.users (id, full_name, email, phone, role, current_school_id, pin_code, language)
        VALUES (
            gen_random_uuid(),
            'Tchoukoua Rose',
            'ens.math@demo.cm',
            '+237695123456',
            'teacher',
            school1_id,
            '1234',
            'fr'
        )
        RETURNING id INTO teacher1_id;
    END IF;

    IF teacher2_id IS NULL THEN
        INSERT INTO public.users (id, full_name, email, phone, role, current_school_id, pin_code, language)
        VALUES (
            gen_random_uuid(),
            'Mballa Jean',
            'ens.francais@demo.cm',
            '+237695789012',
            'teacher',
            school2_id,
            '5678',
            'fr'
        )
        RETURNING id INTO teacher2_id;
    END IF;

    -- Insert teacher assignments
    INSERT INTO public.teacher_assignments (teacher_id, school_id, class_name, subject, assigned_by) VALUES
        (teacher1_id, school1_id, '6ème A', 'Mathématiques', teacher1_id),
        (teacher1_id, school1_id, '5ème B', 'Mathématiques', teacher1_id),
        (teacher2_id, school2_id, '6ème C', 'Français', teacher2_id),
        (teacher2_id, school2_id, '4ème A', 'Français', teacher2_id);

    -- Insert sample documents
    INSERT INTO public.documents (
        id, title, description, file_name, file_path, file_size, mime_type,
        document_type, uploaded_by, class_name, subject, school_id
    ) VALUES
        (
            doc1_id,
            'Leçon sur les fractions',
            'Introduction aux fractions pour la classe de 6ème',
            'fractions_6eme.pdf',
            'teacher/' || teacher1_id::text || '/math/fractions_6eme.pdf',
            1024000,
            'application/pdf',
            'lesson'::public.document_type,
            teacher1_id,
            '6ème A',
            'Mathématiques',
            school1_id
        ),
        (
            doc2_id,
            'Exercices de conjugaison',
            'Exercices pratiques sur les temps du passé',
            'conjugaison_passe.docx',
            'teacher/' || teacher2_id::text || '/francais/conjugaison_passe.docx',
            756000,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'assignment'::public.document_type,
            teacher2_id,
            '6ème C',
            'Français',
            school2_id
        ),
        (
            doc3_id,
            'Contrôle de géométrie',
            'Évaluation sur les triangles et les parallélogrammes',
            'controle_geometrie.pdf',
            'teacher/' || teacher1_id::text || '/math/controle_geometrie.pdf',
            512000,
            'application/pdf',
            'exam'::public.document_type,
            teacher1_id,
            '5ème B',
            'Mathématiques',
            school1_id
        );

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in mock data creation: %', SQLERRM;
END $$;