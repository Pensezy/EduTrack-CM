-- ====================================
-- MIGRATION OPTIMISÉE - DASHBOARD ÉTUDIANT
-- Basée sur la structure existante de la BDD
-- ====================================

-- ====================================
-- PARTIE 1 : CRÉER LES 5 TABLES MANQUANTES
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

CREATE INDEX idx_assignments_school ON assignments(school_id);
CREATE INDEX idx_assignments_class ON assignments(class_id);
CREATE INDEX idx_assignments_subject ON assignments(subject_id);
CREATE INDEX idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);

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

CREATE INDEX idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX idx_assignment_submissions_status ON assignment_submissions(status);

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

CREATE INDEX idx_student_achievements_school ON student_achievements(school_id);
CREATE INDEX idx_student_achievements_student ON student_achievements(student_id);
CREATE INDEX idx_student_achievements_category ON student_achievements(category);
CREATE INDEX idx_student_achievements_date ON student_achievements(date);

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

CREATE INDEX idx_behavior_assessments_school ON behavior_assessments(school_id);
CREATE INDEX idx_behavior_assessments_student ON behavior_assessments(student_id);
CREATE INDEX idx_behavior_assessments_teacher ON behavior_assessments(teacher_id);
CREATE INDEX idx_behavior_assessments_date ON behavior_assessments(date);
CREATE INDEX idx_behavior_assessments_category ON behavior_assessments(category);

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

CREATE INDEX idx_schedules_school ON schedules(school_id);
CREATE INDEX idx_schedules_class ON schedules(class_id);
CREATE INDEX idx_schedules_subject ON schedules(subject_id);
CREATE INDEX idx_schedules_teacher ON schedules(teacher_id);
CREATE INDEX idx_schedules_day ON schedules(day_of_week);

-- ====================================
-- PARTIE 2 : AJOUTER LES COLONNES MANQUANTES
-- ====================================

-- Colonnes pour students (ne pas ajouter class_id car current_class existe)
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS medical_notes TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Ajouter contrainte CHECK pour status si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'students_status_check'
  ) THEN
    ALTER TABLE students ADD CONSTRAINT students_status_check 
    CHECK (status IN ('active', 'inactive', 'transferred', 'graduated', 'suspended'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- Colonnes pour classes
ALTER TABLE classes ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS description TEXT;

-- Colonne pour grades (seulement coefficient manque)
ALTER TABLE grades ADD COLUMN IF NOT EXISTS coefficient DECIMAL(3, 2) DEFAULT 1.0;

-- Colonnes pour attendances
ALTER TABLE attendances ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE attendances ADD COLUMN IF NOT EXISTS period TEXT DEFAULT 'full_day';

-- Ajouter contrainte CHECK pour period
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'attendances_period_check'
  ) THEN
    ALTER TABLE attendances ADD CONSTRAINT attendances_period_check 
    CHECK (period IN ('full_day', 'morning', 'afternoon'));
  END IF;
END $$;

-- Colonnes pour notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE CASCADE;

-- Ajouter contrainte CHECK pour type
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notifications_type_check'
  ) THEN
    ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN ('info', 'success', 'warning', 'error', 'grades', 'assignments', 'meetings', 'announcements', 'attendance'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ====================================
-- PARTIE 3 : VUE NORMALISÉE POUR grades
-- ====================================

-- Vue pour mapper les colonnes existantes vers les noms attendus par studentService.js
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
  value as grade,                    -- Mapper value → grade
  max_value as max_grade,            -- Mapper max_value → max_grade
  coefficient,                       -- Nouvelle colonne ajoutée
  type::text as grade_type,          -- Utiliser type comme grade_type
  description as comment,            -- Mapper description → comment
  date,
  created_at,
  updated_at
FROM grades;

-- Vue normalisée pour students (mapper current_class → class_id)
CREATE OR REPLACE VIEW students_normalized AS
SELECT 
  id,
  school_id,
  user_id,
  first_name,
  last_name,
  date_of_birth,
  gender,
  registration_number,
  enrollment_date,
  is_active,
  created_at,
  updated_at,
  created_by_user_id,
  updated_by_user_id,
  current_class as class_id,         -- Mapper current_class → class_id
  photo_url,
  parent_phone,
  parent_email,
  address,
  blood_group,
  medical_notes,
  status
FROM students;

-- Vue normalisée pour notifications (mapper is_read → read)
CREATE OR REPLACE VIEW notifications_normalized AS
SELECT 
  id,
  school_id,
  user_id,
  title,
  message,
  priority,
  is_read as read,                   -- Mapper is_read → read
  read_at,
  data,
  created_at,
  type,
  student_id
FROM notifications;

-- ====================================
-- PARTIE 4 : COMMENTAIRES
-- ====================================

COMMENT ON TABLE assignments IS 'Devoirs et travaux assignés aux classes';
COMMENT ON TABLE assignment_submissions IS 'Soumissions de devoirs par les élèves';
COMMENT ON TABLE student_achievements IS 'Accomplissements et badges des élèves';
COMMENT ON TABLE behavior_assessments IS 'Évaluations comportementales des élèves';
COMMENT ON TABLE schedules IS 'Emploi du temps des classes';

COMMENT ON VIEW grades_normalized IS 'Vue normalisée : value→grade, max_value→max_grade, description→comment';
COMMENT ON VIEW students_normalized IS 'Vue normalisée : current_class→class_id';
COMMENT ON VIEW notifications_normalized IS 'Vue normalisée : is_read→read';

-- ====================================
-- MIGRATION TERMINÉE ✅
-- ====================================

SELECT 'Migration complétée avec succès ! 5 tables créées, colonnes ajoutées, 3 vues normalisées créées.' as status;
