-- ====================================
-- MIGRATION FINALE - DASHBOARD ÉTUDIANT
-- Tables et colonnes manquantes uniquement
-- ====================================

-- ====================================
-- PARTIE 1 : CRÉER LES TABLES MANQUANTES
-- ====================================

-- 1. Table assignments (devoirs/travaux)
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignment_type TEXT DEFAULT 'homework' CHECK (assignment_type IN ('homework', 'project', 'presentation', 'essay', 'lab_report', 'quiz')),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_points DECIMAL(5, 2) DEFAULT 20,
  instructions TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assignments_school ON assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);

-- 2. Table assignment_submissions (soumissions de devoirs)
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  content TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  grade DECIMAL(5, 2),
  feedback TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'graded', 'late', 'missing')),
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(status);

-- 3. Table student_achievements (accomplissements/badges)
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'academic' CHECK (category IN ('academic', 'sports', 'arts', 'behavior', 'leadership', 'community', 'attendance', 'excellence')),
  icon TEXT DEFAULT '🏆',
  points INTEGER DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  awarded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_student_achievements_school ON student_achievements(school_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student ON student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_category ON student_achievements(category);
CREATE INDEX IF NOT EXISTS idx_student_achievements_date ON student_achievements(date);

-- 4. Table behavior_assessments (évaluations comportementales)
CREATE TABLE IF NOT EXISTS behavior_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN ('participation', 'respect', 'teamwork', 'autonomy', 'punctuality', 'organization', 'effort', 'attitude')),
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_behavior_assessments_school ON behavior_assessments(school_id);
CREATE INDEX IF NOT EXISTS idx_behavior_assessments_student ON behavior_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_behavior_assessments_teacher ON behavior_assessments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_behavior_assessments_date ON behavior_assessments(date);
CREATE INDEX IF NOT EXISTS idx_behavior_assessments_category ON behavior_assessments(category);

-- 5. Table schedules (emploi du temps)
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (class_id, day_of_week, start_time)
);

CREATE INDEX IF NOT EXISTS idx_schedules_school ON schedules(school_id);
CREATE INDEX IF NOT EXISTS idx_schedules_class ON schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_subject ON schedules(subject_id);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher ON schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day_of_week);

-- ====================================
-- PARTIE 2 : AJOUTER LES COLONNES MANQUANTES
-- ====================================

-- Colonnes pour students
ALTER TABLE students ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS medical_notes TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred', 'graduated', 'suspended'));

CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- Colonnes pour classes
ALTER TABLE classes ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS description TEXT;

-- Colonnes pour grades (vérifier si value/max_value existent déjà)
ALTER TABLE grades ADD COLUMN IF NOT EXISTS grade DECIMAL(5, 2);
ALTER TABLE grades ADD COLUMN IF NOT EXISTS max_grade DECIMAL(5, 2) DEFAULT 20;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS coefficient DECIMAL(3, 2) DEFAULT 1.0;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS grade_type TEXT;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS comment TEXT;

-- Colonnes pour attendances
ALTER TABLE attendances ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE attendances ADD COLUMN IF NOT EXISTS period TEXT DEFAULT 'full_day' CHECK (period IN ('full_day', 'morning', 'afternoon'));

-- Colonnes pour notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'grades', 'assignments', 'meetings', 'announcements', 'attendance'));
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ====================================
-- PARTIE 3 : VUE POUR COMPATIBILITÉ grades
-- ====================================

-- Vue pour mapper value → grade et max_value → max_grade si nécessaire
CREATE OR REPLACE VIEW grades_normalized AS
SELECT 
  id,
  school_id,
  academic_year_id,
  class_id,
  student_id,
  subject_id,
  teacher_id,
  type,
  COALESCE(grade, value) as grade,
  COALESCE(max_grade, max_value) as max_grade,
  COALESCE(coefficient, 1.0) as coefficient,
  COALESCE(grade_type, type::text) as grade_type,
  COALESCE(comment, description) as comment,
  date,
  created_at,
  updated_at
FROM grades;

-- ====================================
-- PARTIE 4 : COMMENTAIRES
-- ====================================

COMMENT ON TABLE assignments IS 'Devoirs et travaux assignés aux classes';
COMMENT ON TABLE assignment_submissions IS 'Soumissions de devoirs par les élèves';
COMMENT ON TABLE student_achievements IS 'Accomplissements et badges des élèves';
COMMENT ON TABLE behavior_assessments IS 'Évaluations comportementales des élèves';
COMMENT ON TABLE schedules IS 'Emploi du temps des classes';

-- ====================================
-- MIGRATION TERMINÉE
-- ====================================
