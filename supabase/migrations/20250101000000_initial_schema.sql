-- ====================================
-- MIGRATION COMPLETE 100% - NOUVEAU PROJET SUPABASE
-- EduTrack CM - TOUTES LES TABLES (22 tables)
-- Sans RLS, avec Trigger Automatique
-- ====================================

-- ====================================
-- ETAPE 1 : EXTENSIONS
-- ====================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================
-- ETAPE 2 : TYPES ENUM
-- ====================================

DO $$ BEGIN CREATE TYPE school_type AS ENUM ('public', 'prive', 'maternelle', 'primaire', 'college', 'lycee', 'college_lycee', 'universite', 'formation_professionnelle'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'principal', 'teacher', 'secretary', 'student', 'parent'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE grade_type AS ENUM ('homework', 'quiz', 'exam', 'project', 'participation'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE gender AS ENUM ('male', 'female', 'other'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ====================================
-- ETAPE 3 : TABLES (dans l'ordre des dependances)
-- ====================================

-- 1. users
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

-- 2. schools
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

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_current_school_id_fkey;
ALTER TABLE users ADD CONSTRAINT users_current_school_id_fkey FOREIGN KEY (current_school_id) REFERENCES schools(id) ON DELETE SET NULL;

-- 3. academic_years
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

-- 4. classes
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

-- 5. subjects
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

-- 6. teachers
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

-- 7. students
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

-- 8. parents
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

-- 9. parent_student_schools
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

-- 10. payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  status payment_status DEFAULT 'pending' NOT NULL,
  method TEXT,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 11. attendances
CREATE TABLE IF NOT EXISTS attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  class_id UUID NOT NULL,
  student_id UUID NOT NULL,
  date DATE NOT NULL,
  status attendance_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE (student_id, class_id, date)
);

-- 12. grades
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  class_id UUID NOT NULL,
  student_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  type grade_type NOT NULL,
  value DECIMAL(5, 2) NOT NULL,
  max_value DECIMAL(5, 2) DEFAULT 20 NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- 13. notifications
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

-- 14. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 15. evaluation_periods
CREATE TABLE IF NOT EXISTS evaluation_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  UNIQUE (school_id, academic_year_id, name)
);

-- 16. grade_types
CREATE TABLE IF NOT EXISTS grade_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  coefficient DECIMAL(3, 2) DEFAULT 1.0 NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  UNIQUE (school_id, code)
);

-- 17. user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  permissions JSONB DEFAULT '[]' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  UNIQUE (school_id, code)
);

-- 18. attendance_types
CREATE TABLE IF NOT EXISTS attendance_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  UNIQUE (school_id, code)
);

-- 19. payment_types
CREATE TABLE IF NOT EXISTS payment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  amount DECIMAL(10, 2),
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  UNIQUE (school_id, code)
);

-- 20. class_subjects (liaison many-to-many)
CREATE TABLE IF NOT EXISTS class_subjects (
  class_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  PRIMARY KEY (class_id, subject_id),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- 21. teacher_subjects (liaison many-to-many)
CREATE TABLE IF NOT EXISTS teacher_subjects (
  teacher_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  PRIMARY KEY (teacher_id, subject_id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- 22. secretaries (si utilise dans votre projet)
CREATE TABLE IF NOT EXISTS secretaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  user_id UUID UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  hire_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ====================================
-- ETAPE 4 : INDEX
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
CREATE INDEX IF NOT EXISTS idx_payments_school ON payments(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_attendances_school ON attendances(school_id);
CREATE INDEX IF NOT EXISTS idx_attendances_student ON attendances(student_id);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(date);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_teacher ON grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_school ON grades(school_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_school ON notifications(school_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_school ON audit_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_secretaries_school ON secretaries(school_id);
CREATE INDEX IF NOT EXISTS idx_secretaries_user ON secretaries(user_id);

-- ====================================
-- ETAPE 5 : FONCTION updated_at
-- ====================================

CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON academic_years FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parent_student_schools_updated_at BEFORE UPDATE ON parent_student_schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendances_updated_at BEFORE UPDATE ON attendances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evaluation_periods_updated_at BEFORE UPDATE ON evaluation_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grade_types_updated_at BEFORE UPDATE ON grade_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_types_updated_at BEFORE UPDATE ON attendance_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_types_updated_at BEFORE UPDATE ON payment_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_secretaries_updated_at BEFORE UPDATE ON secretaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- ETAPE 6 : DESACTIVER RLS
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
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendances DISABLE ROW LEVEL SECURITY;
ALTER TABLE grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE grade_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE secretaries DISABLE ROW LEVEL SECURITY;

-- ====================================
-- ETAPE 7 : TRIGGER AUTO-SYNC
-- ====================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_automatic();

CREATE OR REPLACE FUNCTION public.handle_new_user_automatic()
RETURNS TRIGGER AS $$
DECLARE 
    school_data jsonb; 
    school_uuid uuid;
    academic_year_uuid uuid;
    current_year text;
    next_year text;
BEGIN
    -- 1. Inserer dans users
    INSERT INTO public.users (id, email, full_name, phone, role, is_active, created_at, updated_at)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), COALESCE(NEW.raw_user_meta_data->>'phone', ''), COALESCE(NEW.raw_user_meta_data->>'role', 'student'), true, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = COALESCE(EXCLUDED.full_name, users.full_name), phone = COALESCE(EXCLUDED.phone, users.phone), role = COALESCE(EXCLUDED.role, users.role), updated_at = NOW();
    
    -- 2. Si c'est un directeur, creer son ecole + donnees par defaut
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'principal' THEN
        school_data := NEW.raw_user_meta_data->'school';
        
        IF school_data IS NOT NULL THEN
            school_uuid := gen_random_uuid();
            
            -- 2.1 Creer l'ecole
            INSERT INTO public.schools (id, name, code, type, director_name, director_user_id, phone, email, address, city, country, status, created_at, updated_at)
            VALUES (school_uuid, school_data->>'name', school_data->>'code', COALESCE((school_data->>'type')::school_type, 'public'), COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.id, COALESCE(school_data->>'phone', NEW.raw_user_meta_data->>'phone', ''), NEW.email, COALESCE(school_data->>'address', ''), COALESCE(school_data->>'city', ''), COALESCE(school_data->>'country', 'Cameroun'), 'active', NOW(), NOW())
            ON CONFLICT (code) DO NOTHING;
            
            -- 2.2 Lier l'utilisateur a l'ecole
            UPDATE public.users SET current_school_id = school_uuid WHERE id = NEW.id;
            
            -- 2.3 Creer l'annee academique par defaut (2025-2026)
            current_year := EXTRACT(YEAR FROM NOW())::text;
            next_year := (EXTRACT(YEAR FROM NOW()) + 1)::text;
            academic_year_uuid := gen_random_uuid();
            
            INSERT INTO public.academic_years (id, school_id, name, start_date, end_date, is_current, created_at, updated_at)
            VALUES (academic_year_uuid, school_uuid, current_year || '-' || next_year, (current_year || '-09-01')::date, (next_year || '-07-31')::date, true, NOW(), NOW())
            ON CONFLICT DO NOTHING;
            
            -- 2.4 Creer les types de notes par defaut
            INSERT INTO public.grade_types (school_id, name, code, coefficient, description, is_active, created_at, updated_at)
            VALUES 
                (school_uuid, 'Devoir', 'HOMEWORK', 0.3, 'Travaux a la maison', true, NOW(), NOW()),
                (school_uuid, 'Interrogation', 'QUIZ', 0.2, 'Interrogations ecrites', true, NOW(), NOW()),
                (school_uuid, 'Examen', 'EXAM', 0.5, 'Examens officiels', true, NOW(), NOW()),
                (school_uuid, 'Projet', 'PROJECT', 0.4, 'Projets et travaux pratiques', true, NOW(), NOW()),
                (school_uuid, 'Participation', 'PARTICIPATION', 0.1, 'Participation en classe', true, NOW(), NOW())
            ON CONFLICT DO NOTHING;
            
            -- 2.5 Creer les types de presence par defaut
            INSERT INTO public.attendance_types (school_id, name, code, description, is_active, created_at, updated_at)
            VALUES 
                (school_uuid, 'Present', 'PRESENT', 'Eleve present', true, NOW(), NOW()),
                (school_uuid, 'Absent', 'ABSENT', 'Eleve absent', true, NOW(), NOW()),
                (school_uuid, 'Retard', 'LATE', 'Eleve en retard', true, NOW(), NOW()),
                (school_uuid, 'Absent Excuse', 'EXCUSED', 'Absence justifiee', true, NOW(), NOW())
            ON CONFLICT DO NOTHING;
            
            -- 2.6 Creer les types de paiement par defaut
            INSERT INTO public.payment_types (school_id, name, code, amount, description, is_active, created_at, updated_at)
            VALUES 
                (school_uuid, 'Frais de scolarite', 'TUITION', NULL, 'Frais de scolarite annuels', true, NOW(), NOW()),
                (school_uuid, 'Frais d''inscription', 'REGISTRATION', NULL, 'Frais d''inscription', true, NOW(), NOW()),
                (school_uuid, 'Uniforme', 'UNIFORM', NULL, 'Achat d''uniforme scolaire', true, NOW(), NOW()),
                (school_uuid, 'Livres', 'BOOKS', NULL, 'Achat de livres et fournitures', true, NOW(), NOW()),
                (school_uuid, 'Cantine', 'CANTEEN', NULL, 'Frais de cantine', true, NOW(), NOW()),
                (school_uuid, 'Transport', 'TRANSPORT', NULL, 'Frais de transport scolaire', true, NOW(), NOW())
            ON CONFLICT DO NOTHING;
            
            -- 2.7 Creer les periodes d'evaluation (Trimestres pour primaire/college, Semestres pour lycee)
            IF COALESCE((school_data->>'type')::text, 'public') IN ('primaire', 'college', 'college_lycee') THEN
                -- Trimestres
                INSERT INTO public.evaluation_periods (school_id, academic_year_id, name, start_date, end_date, is_current, created_at, updated_at)
                VALUES 
                    (school_uuid, academic_year_uuid, '1er Trimestre', (current_year || '-09-01')::date, (current_year || '-12-15')::date, true, NOW(), NOW()),
                    (school_uuid, academic_year_uuid, '2e Trimestre', (current_year || '-12-16')::date, (next_year || '-03-31')::date, false, NOW(), NOW()),
                    (school_uuid, academic_year_uuid, '3e Trimestre', (next_year || '-04-01')::date, (next_year || '-07-15')::date, false, NOW(), NOW())
                ON CONFLICT DO NOTHING;
            ELSE
                -- Semestres
                INSERT INTO public.evaluation_periods (school_id, academic_year_id, name, start_date, end_date, is_current, created_at, updated_at)
                VALUES 
                    (school_uuid, academic_year_uuid, '1er Semestre', (current_year || '-09-01')::date, (next_year || '-01-31')::date, true, NOW(), NOW()),
                    (school_uuid, academic_year_uuid, '2e Semestre', (next_year || '-02-01')::date, (next_year || '-07-15')::date, false, NOW(), NOW())
                ON CONFLICT DO NOTHING;
            END IF;
            
            -- 2.8 Creer les roles utilisateur par defaut
            INSERT INTO public.user_roles (school_id, name, code, permissions, is_active, created_at, updated_at)
            VALUES 
                (school_uuid, 'Administrateur', 'ADMIN', '["all"]'::jsonb, true, NOW(), NOW()),
                (school_uuid, 'Directeur', 'PRINCIPAL', '["manage_school", "manage_teachers", "manage_students", "view_reports"]'::jsonb, true, NOW(), NOW()),
                (school_uuid, 'Enseignant', 'TEACHER', '["manage_classes", "manage_grades", "view_students"]'::jsonb, true, NOW(), NOW()),
                (school_uuid, 'Secretaire', 'SECRETARY', '["manage_students", "manage_payments", "view_reports"]'::jsonb, true, NOW(), NOW()),
                (school_uuid, 'Parent', 'PARENT', '["view_children", "view_grades", "view_attendance"]'::jsonb, true, NOW(), NOW()),
                (school_uuid, 'Eleve', 'STUDENT', '["view_own_grades", "view_own_attendance"]'::jsonb, true, NOW(), NOW())
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_automatic();

-- ====================================
-- ETAPE 8 : FONCTION DE DIAGNOSTIC
-- ====================================

CREATE OR REPLACE FUNCTION public.check_auth_sync() RETURNS TABLE (auth_users_count bigint, table_users_count bigint, missing_in_table bigint, schools_count bigint, principals_without_school bigint) AS $$
BEGIN RETURN QUERY SELECT (SELECT COUNT(*) FROM auth.users)::bigint, (SELECT COUNT(*) FROM public.users)::bigint, (SELECT COUNT(*) FROM auth.users a WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = a.id))::bigint, (SELECT COUNT(*) FROM public.schools)::bigint, (SELECT COUNT(*) FROM public.users WHERE role = 'principal' AND current_school_id IS NULL)::bigint;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- FIN
-- ====================================

DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'MIGRATION 100%% COMPLETE - 22 TABLES';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Tables: users, schools, academic_years, classes, subjects, teachers, students, parents, parent_student_schools, payments, attendances, grades, notifications, audit_logs, evaluation_periods, grade_types, user_roles, attendance_types, payment_types, class_subjects, teacher_subjects, secretaries';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Configuration automatique:';
    RAISE NOTICE '- Annee academique (2025-2026)';
    RAISE NOTICE '- 5 types de notes (Devoir, Interrogation, Examen, Projet, Participation)';
    RAISE NOTICE '- 4 types de presence (Present, Absent, Retard, Excuse)';
    RAISE NOTICE '- 6 types de paiement (Scolarite, Inscription, Uniforme, Livres, Cantine, Transport)';
    RAISE NOTICE '- Periodes d''evaluation (Trimestres ou Semestres selon type ecole)';
    RAISE NOTICE '- 6 roles utilisateur (Admin, Directeur, Enseignant, Secretaire, Parent, Eleve)';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RLS: DESACTIVE';
    RAISE NOTICE 'Trigger: Auto-sync ACTIF avec TOUT initialise';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'PROJET 100%% PRET A L''EMPLOI !';
    RAISE NOTICE '==========================================';
END $$;

SELECT * FROM check_auth_sync();
