-- EduTrack-CM Base Schema Migration
-- Creates foundational tables required for the education management system
-- Date: 2025-09-26
-- Author: System Foundation

-- ========================================
-- 1. CORE ENUMS AND TYPES
-- ========================================

-- User roles in the education system
CREATE TYPE public.user_role AS ENUM (
    'admin', 'principal', 'secretary', 'teacher', 'student', 'parent', 'school_director'
);

-- School types for Cameroon education system
CREATE TYPE public.school_type AS ENUM (
    'maternelle', 'primaire', 'college', 'lycee', 'technique', 'prive', 'public'
);

-- Student status
CREATE TYPE public.student_status AS ENUM (
    'active', 'suspended', 'transferred', 'graduated', 'dropped'
);

-- ========================================
-- 2. FOUNDATIONAL TABLES
-- ========================================

-- Schools table (must be first due to foreign key references)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name CHARACTER VARYING NOT NULL,
    code CHARACTER VARYING UNIQUE, -- School identifier code
    type public.school_type NOT NULL,
    director_name CHARACTER VARYING,
    director_user_id UUID, -- Will be linked after users table creation
    phone CHARACTER VARYING,
    email CHARACTER VARYING,
    address TEXT,
    city CHARACTER VARYING,
    country CHARACTER VARYING DEFAULT 'Cameroun',
    available_classes TEXT[], -- Array of available class levels
    status CHARACTER VARYING DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Users table (core authentication and user management)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name CHARACTER VARYING NOT NULL,
    email CHARACTER VARYING UNIQUE,
    phone CHARACTER VARYING,
    role public.user_role NOT NULL,
    password_hash TEXT, -- For local authentication
    pin_code CHARACTER VARYING(6), -- For quick access
    avatar_url TEXT,
    language CHARACTER VARYING DEFAULT 'fr',
    current_school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for school directors
ALTER TABLE public.schools 
ADD CONSTRAINT fk_schools_director 
FOREIGN KEY (director_user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Students table (linked to users and schools)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    matricule CHARACTER VARYING UNIQUE, -- Student registration number
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

-- Parent-Student relationships (many-to-many)
CREATE TABLE IF NOT EXISTS public.parent_student (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    relationship CHARACTER VARYING DEFAULT 'parent', -- 'parent', 'guardian', 'tutor'
    is_primary BOOLEAN DEFAULT false, -- Primary contact
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate relationships
    UNIQUE(parent_id, student_id)
);

-- Grades table (for academic performance tracking)
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    subject CHARACTER VARYING NOT NULL,
    grade DECIMAL(4,2) NOT NULL, -- e.g., 15.75
    grade_out_of DECIMAL(4,2) DEFAULT 20.00, -- Total points possible
    grade_type CHARACTER VARYING DEFAULT 'exam', -- 'exam', 'homework', 'quiz', 'project'
    description TEXT,
    date_recorded DATE DEFAULT CURRENT_DATE,
    academic_year CHARACTER VARYING DEFAULT '2024-2025',
    term CHARACTER VARYING, -- '1st', '2nd', '3rd'
    teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 3. INDEXES FOR PERFORMANCE
-- ========================================

-- Schools indexes
CREATE INDEX idx_schools_type ON public.schools(type);
CREATE INDEX idx_schools_status ON public.schools(status);
CREATE INDEX idx_schools_director ON public.schools(director_user_id);

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_school ON public.users(current_school_id);
CREATE INDEX idx_users_active ON public.users(is_active) WHERE is_active = true;

-- Students indexes
CREATE INDEX idx_students_user ON public.students(user_id);
CREATE INDEX idx_students_school ON public.students(current_school_id);
CREATE INDEX idx_students_class ON public.students(current_class);
CREATE INDEX idx_students_matricule ON public.students(matricule);
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_students_academic_year ON public.students(academic_year);

-- Parent-Student indexes
CREATE INDEX idx_parent_student_parent ON public.parent_student(parent_id);
CREATE INDEX idx_parent_student_student ON public.parent_student(student_id);
CREATE INDEX idx_parent_student_primary ON public.parent_student(is_primary) WHERE is_primary = true;

-- Grades indexes
CREATE INDEX idx_grades_student ON public.grades(student_id);
CREATE INDEX idx_grades_school ON public.grades(school_id);
CREATE INDEX idx_grades_subject ON public.grades(subject);
CREATE INDEX idx_grades_date ON public.grades(date_recorded);
CREATE INDEX idx_grades_academic_year ON public.grades(academic_year);
CREATE INDEX idx_grades_teacher ON public.grades(teacher_id);

-- ========================================
-- 4. ROW LEVEL SECURITY SETUP
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. BASIC RLS POLICIES
-- ========================================

-- SCHOOLS POLICIES
CREATE POLICY "admin_manage_all_schools"
ON public.schools
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

CREATE POLICY "directors_manage_own_school"
ON public.schools
FOR ALL
TO authenticated
USING (director_user_id = auth.uid())
WITH CHECK (director_user_id = auth.uid());

CREATE POLICY "school_staff_view_own_school"
ON public.schools
FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT current_school_id FROM public.users 
        WHERE id = auth.uid()
    )
);

-- USERS POLICIES
CREATE POLICY "admin_manage_all_users"
ON public.users
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

CREATE POLICY "users_view_own_profile"
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "users_update_own_profile"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "school_admin_manage_school_users"
ON public.users
FOR ALL
TO authenticated
USING (
    current_school_id IN (
        SELECT s.id FROM public.schools s 
        WHERE s.director_user_id = auth.uid()
    )
    OR 
    (
        role IN ('principal', 'secretary') 
        AND current_school_id = (
            SELECT current_school_id FROM public.users 
            WHERE id = auth.uid()
        )
    )
)
WITH CHECK (
    current_school_id IN (
        SELECT s.id FROM public.schools s 
        WHERE s.director_user_id = auth.uid()
    )
    OR 
    (
        role IN ('principal', 'secretary') 
        AND current_school_id = (
            SELECT current_school_id FROM public.users 
            WHERE id = auth.uid()
        )
    )
);

-- STUDENTS POLICIES
CREATE POLICY "admin_manage_all_students"
ON public.students
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

CREATE POLICY "students_view_own_profile"
ON public.students
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "parents_view_children"
ON public.students
FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT ps.student_id FROM public.parent_student ps 
        WHERE ps.parent_id = auth.uid()
    )
);

CREATE POLICY "school_staff_manage_school_students"
ON public.students
FOR ALL
TO authenticated
USING (
    current_school_id IN (
        SELECT current_school_id FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('principal', 'secretary', 'teacher')
    )
)
WITH CHECK (
    current_school_id IN (
        SELECT current_school_id FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('principal', 'secretary', 'teacher')
    )
);

-- PARENT-STUDENT POLICIES
CREATE POLICY "parents_manage_own_children"
ON public.parent_student
FOR ALL
TO authenticated
USING (parent_id = auth.uid())
WITH CHECK (parent_id = auth.uid());

CREATE POLICY "admin_manage_all_parent_student"
ON public.parent_student
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- GRADES POLICIES
CREATE POLICY "students_view_own_grades"
ON public.grades
FOR SELECT
TO authenticated
USING (
    student_id IN (
        SELECT s.id FROM public.students s 
        WHERE s.user_id = auth.uid()
    )
);

CREATE POLICY "parents_view_children_grades"
ON public.grades
FOR SELECT
TO authenticated
USING (
    student_id IN (
        SELECT ps.student_id FROM public.parent_student ps 
        WHERE ps.parent_id = auth.uid()
    )
);

CREATE POLICY "teachers_manage_school_grades"
ON public.grades
FOR ALL
TO authenticated
USING (
    school_id IN (
        SELECT current_school_id FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('teacher', 'principal', 'secretary')
    )
)
WITH CHECK (
    school_id IN (
        SELECT current_school_id FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('teacher', 'principal', 'secretary')
    )
);

-- ========================================
-- 6. UTILITY FUNCTIONS
-- ========================================

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT role::TEXT FROM public.users WHERE id = auth.uid()
$$;

-- Function to get user's current school
CREATE OR REPLACE FUNCTION public.get_user_school()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT current_school_id FROM public.users WHERE id = auth.uid()
$$;

-- ========================================
-- 7. TRIGGERS FOR MAINTENANCE
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

-- Apply update triggers
CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON public.schools
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_grades_updated_at
    BEFORE UPDATE ON public.grades
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- ========================================
-- 8. SAMPLE DATA FOR TESTING
-- ========================================

DO $$
DECLARE
    demo_school_id UUID := gen_random_uuid();
    principal_user_id UUID := gen_random_uuid();
    teacher_user_id UUID := gen_random_uuid();
    student_user_id UUID := gen_random_uuid();
    parent_user_id UUID := gen_random_uuid();
    student_id UUID := gen_random_uuid();
BEGIN
    -- Create demo school
    INSERT INTO public.schools (id, name, code, type, director_name, phone, email, address, city, available_classes)
    VALUES (
        demo_school_id,
        'Lycée Bilingue de Yaoundé',
        'LBY-2024',
        'lycee',
        'M. Mballa Directeur',
        '+237678123456',
        'direction@lby.edu.cm',
        'Quartier Nlongkak, Yaoundé',
        'Yaoundé',
        ARRAY['6ème', '5ème', '4ème', '3ème', '2nd', '1ère', 'Terminale']
    );

    -- Create principal user
    INSERT INTO public.users (id, full_name, email, phone, role, current_school_id, pin_code, language)
    VALUES (
        principal_user_id,
        'M. Mballa Directeur',
        'proviseur@lby.edu.cm',
        '+237678123456',
        'principal',
        demo_school_id,
        '0000',
        'fr'
    );

    -- Update school director reference
    UPDATE public.schools 
    SET director_user_id = principal_user_id 
    WHERE id = demo_school_id;

    -- Create teacher user
    INSERT INTO public.users (id, full_name, email, phone, role, current_school_id, pin_code, language)
    VALUES (
        teacher_user_id,
        'Mme Tchoukoua Rose',
        'ens.math@lby.edu.cm',
        '+237695123456',
        'teacher',
        demo_school_id,
        '1234',
        'fr'
    );

    -- Create student user
    INSERT INTO public.users (id, full_name, email, phone, role, current_school_id, pin_code, language)
    VALUES (
        student_user_id,
        'Ngatcha Etienne',
        'etienne.n@student.lby.edu.cm',
        '+237654987321',
        'student',
        demo_school_id,
        '5678',
        'fr'
    );

    -- Create parent user
    INSERT INTO public.users (id, full_name, email, phone, role, pin_code, language)
    VALUES (
        parent_user_id,
        'M. Ngatcha Paul',
        'parent.ngatcha@gmail.com',
        '+237698765432',
        'parent',
        '9876',
        'fr'
    );

    -- Create student record
    INSERT INTO public.students (id, user_id, matricule, current_school_id, current_class, birth_date, parent_name, parent_phone, parent_email)
    VALUES (
        student_id,
        student_user_id,
        'LBY-2024-001',
        demo_school_id,
        '6ème A',
        '2010-03-15',
        'M. Ngatcha Paul',
        '+237698765432',
        'parent.ngatcha@gmail.com'
    );

    -- Link parent to student
    INSERT INTO public.parent_student (parent_id, student_id, relationship, is_primary)
    VALUES (parent_user_id, student_id, 'parent', true);

    -- Create sample grades
    INSERT INTO public.grades (student_id, school_id, subject, grade, grade_out_of, grade_type, description, term, teacher_id)
    VALUES 
        (student_id, demo_school_id, 'Mathématiques', 16.50, 20.00, 'exam', 'Contrôle sur les fractions', '1st', teacher_user_id),
        (student_id, demo_school_id, 'Français', 14.00, 20.00, 'homework', 'Rédaction sur les vacances', '1st', teacher_user_id),
        (student_id, demo_school_id, 'Anglais', 15.75, 20.00, 'quiz', 'Vocabulaire et grammaire', '1st', teacher_user_id);

    RAISE NOTICE 'Sample data created successfully!';
    RAISE NOTICE 'School: % (ID: %)', 'Lycée Bilingue de Yaoundé', demo_school_id;
    RAISE NOTICE 'Principal: % (PIN: 0000)', 'M. Mballa Directeur';
    RAISE NOTICE 'Teacher: % (PIN: 1234)', 'Mme Tchoukoua Rose';
    RAISE NOTICE 'Student: % (PIN: 5678)', 'Ngatcha Etienne';
    RAISE NOTICE 'Parent: % (PIN: 9876)', 'M. Ngatcha Paul';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating sample data: %', SQLERRM;
END $$;

-- ========================================
-- 9. COMPLETION LOG
-- ========================================

DO $$
BEGIN
    RAISE NOTICE 'EduTrack-CM Base Schema Migration completed successfully!';
    RAISE NOTICE 'Core tables created: schools, users, students, parent_student, grades';
    RAISE NOTICE 'RLS policies: Enabled for all user roles';
    RAISE NOTICE 'Sample data: Demo school with principal, teacher, student, and parent';
    RAISE NOTICE 'Next step: Run advanced features migration (teacher assignments, documents)';
END $$;