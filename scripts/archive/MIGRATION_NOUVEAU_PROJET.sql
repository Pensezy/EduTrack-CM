-- ====================================
-- MIGRATION COMPLETE - NOUVEAU PROJET SUPABASE
-- EduTrack CM - Sans RLS, avec Trigger Automatique
-- ====================================
-- Ce script peut etre execute sur un NOUVEAU projet Supabase
-- Il cree TOUT ce dont vous avez besoin sans erreur

-- ====================================
-- ETAPE 1 : EXTENSIONS NECESSAIRES
-- ====================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================
-- ETAPE 2 : TYPES ENUM
-- ====================================

DO $$ BEGIN
  CREATE TYPE school_type AS ENUM (
    'public',
    'prive',
    'maternelle',
    'primaire',
    'college',
    'lycee',
    'college_lycee',
    'universite',
    'formation_professionnelle'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'admin',
    'principal',
    'teacher',
    'secretary',
    'student',
    'parent'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM (
    'present',
    'absent',
    'late',
    'excused'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE grade_type AS ENUM (
    'homework',
    'quiz',
    'exam',
    'project',
    'participation'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE gender AS ENUM (
    'male',
    'female',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ====================================
-- ETAPE 3 : TABLES (dans l'ordre des dependances)
-- ====================================

-- Table: users (base, pas de dependance)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role DEFAULT 'student' NOT NULL,
  current_school_id UUID,
  is_active BOOLEAN DEFAULT true NOT NULL,
  photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: schools (depend de users pour director_user_id)
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type school_type DEFAULT 'public' NOT NULL,
  director_name TEXT NOT NULL,
  director_user_id UUID,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Cameroun' NOT NULL,
  website TEXT,
  logo TEXT,
  description TEXT,
  available_classes TEXT[],
  settings JSONB,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (director_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Ajouter la contrainte de foreign key sur users.current_school_id
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS users_current_school_id_fkey;

ALTER TABLE users 
  ADD CONSTRAINT users_current_school_id_fkey 
  FOREIGN KEY (current_school_id) REFERENCES schools(id) ON DELETE SET NULL;

-- Table: academic_years
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_current BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  UNIQUE (school_id, name)
);

-- Table: classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  UNIQUE (school_id, academic_year_id, name)
);

-- Table: subjects
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  UNIQUE (school_id, code)
);

-- Table: teachers
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  user_id UUID UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialty TEXT,
  hire_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: students
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  user_id UUID UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth TIMESTAMP WITH TIME ZONE,
  gender gender,
  registration_number TEXT,
  enrollment_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (school_id, registration_number)
);

-- Table: parents
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  address TEXT,
  profession TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  global_parent_id UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: parent_student_schools (relation many-to-many)
CREATE TABLE IF NOT EXISTS parent_student_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  student_id UUID NOT NULL,
  school_id UUID NOT NULL,
  relationship_type TEXT DEFAULT 'parent' NOT NULL,
  is_primary_contact BOOLEAN DEFAULT true NOT NULL,
  can_pickup BOOLEAN DEFAULT true NOT NULL,
  emergency_contact BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  UNIQUE (parent_id, student_id, school_id)
);

-- Table: grades
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  grade_type grade_type DEFAULT 'exam' NOT NULL,
  score DOUBLE PRECISION NOT NULL,
  max_score DOUBLE PRECISION DEFAULT 100 NOT NULL,
  weight DOUBLE PRECISION DEFAULT 1 NOT NULL,
  comments TEXT,
  graded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority notification_priority DEFAULT 'medium' NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ====================================
-- ETAPE 4 : INDEX POUR PERFORMANCES
-- ====================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_school ON users(current_school_id);
CREATE INDEX IF NOT EXISTS idx_schools_director ON schools(director_user_id);
CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(code);
CREATE INDEX IF NOT EXISTS idx_academic_years_school ON academic_years(school_id);
CREATE INDEX IF NOT EXISTS idx_academic_years_current ON academic_years(is_current);
CREATE INDEX IF NOT EXISTS idx_classes_school ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_year ON classes(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_parents_user ON parents(user_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_schools_parent ON parent_student_schools(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_schools_student ON parent_student_schools(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_schools_school ON parent_student_schools(school_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_teacher ON grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_school ON grades(school_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_school ON notifications(school_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- ====================================
-- ETAPE 5 : FONCTION updated_at AUTOMATIQUE
-- ====================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON academic_years FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parent_student_schools_updated_at BEFORE UPDATE ON parent_student_schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- ETAPE 6 : DESACTIVER RLS (IMPORTANT!)
-- ====================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE parents DISABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- ====================================
-- ETAPE 7 : TRIGGER AUTO-SYNC AUTH → USERS/SCHOOLS
-- ====================================

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_automatic();

-- Fonction trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_automatic()
RETURNS TRIGGER AS $$
DECLARE
    school_data jsonb;
    school_uuid uuid;
BEGIN
    -- 1. Inserer dans users
    INSERT INTO public.users (
        id,
        email,
        full_name,
        phone,
        role,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name),
        phone = COALESCE(EXCLUDED.phone, users.phone),
        role = COALESCE(EXCLUDED.role, users.role),
        updated_at = NOW();

    -- 2. Si c'est un directeur, creer son ecole
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'principal' THEN
        school_data := NEW.raw_user_meta_data->'school';
        
        IF school_data IS NOT NULL THEN
            school_uuid := gen_random_uuid();
            
            INSERT INTO public.schools (
                id,
                name,
                code,
                type,
                director_name,
                director_user_id,
                phone,
                email,
                address,
                city,
                country,
                status,
                created_at,
                updated_at
            )
            VALUES (
                school_uuid,
                school_data->>'name',
                school_data->>'code',
                COALESCE((school_data->>'type')::school_type, 'public'),
                COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
                NEW.id,
                COALESCE(school_data->>'phone', NEW.raw_user_meta_data->>'phone', ''),
                NEW.email,
                COALESCE(school_data->>'address', ''),
                COALESCE(school_data->>'city', ''),
                COALESCE(school_data->>'country', 'Cameroun'),
                'active',
                NOW(),
                NOW()
            )
            ON CONFLICT (code) DO NOTHING;
            
            UPDATE public.users
            SET current_school_id = school_uuid
            WHERE id = NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Creer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_automatic();

-- ====================================
-- ETAPE 8 : FONCTION DE DIAGNOSTIC
-- ====================================

CREATE OR REPLACE FUNCTION public.check_auth_sync()
RETURNS TABLE (
    auth_users_count bigint,
    table_users_count bigint,
    missing_in_table bigint,
    schools_count bigint,
    principals_without_school bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM auth.users)::bigint AS auth_users_count,
        (SELECT COUNT(*) FROM public.users)::bigint AS table_users_count,
        (SELECT COUNT(*) FROM auth.users a WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = a.id))::bigint AS missing_in_table,
        (SELECT COUNT(*) FROM public.schools)::bigint AS schools_count,
        (SELECT COUNT(*) FROM public.users WHERE role = 'principal' AND current_school_id IS NULL)::bigint AS principals_without_school;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- FIN DE LA MIGRATION
-- ====================================

DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'MIGRATION COMPLETE - EDUTRACK CM';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Tables creees: users, schools, academic_years, classes, subjects, teachers, students, parents, grades, notifications';
    RAISE NOTICE 'RLS: DESACTIVE sur toutes les tables';
    RAISE NOTICE 'Trigger: Auto-sync Auth → Users/Schools ACTIVE';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Vous pouvez maintenant:';
    RAISE NOTICE '1. Creer des comptes directeurs';
    RAISE NOTICE '2. Ecoles creees automatiquement';
    RAISE NOTICE '3. Aucune erreur 401/403';
    RAISE NOTICE '==========================================';
END $$;

-- Verification finale
SELECT * FROM check_auth_sync();
