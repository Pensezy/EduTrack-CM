-- ====================================
-- POLITIQUES RLS CORRIGEES - VERSION 2
-- EduTrack CM - Permet l'auto-inscription des directeurs
-- ====================================

-- IMPORTANT : Ce fichier corrige le probleme des erreurs 401/42501
-- lors de la creation de compte directeur

-- ====================================
-- ETAPE 1 : ACTIVER RLS SUR LES TABLES
-- ====================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;

-- ====================================
-- ETAPE 2 : NETTOYER LES ANCIENNES POLITIQUES
-- ====================================

DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own account during signup" ON users;
DROP POLICY IF EXISTS "New users can read their auth data" ON users;

DROP POLICY IF EXISTS "Directors can view their own school" ON schools;
DROP POLICY IF EXISTS "Directors can update their own school" ON schools;
DROP POLICY IF EXISTS "Directors can insert their own school" ON schools;
DROP POLICY IF EXISTS "Directors can view their school" ON schools;
DROP POLICY IF EXISTS "Directors can update their school" ON schools;
DROP POLICY IF EXISTS "Directors can create their own school during signup" ON schools;
DROP POLICY IF EXISTS "Anyone can check school code uniqueness" ON schools;

DROP POLICY IF EXISTS "School members can view students" ON students;
DROP POLICY IF EXISTS "Directors and secretaries can create students" ON students;
DROP POLICY IF EXISTS "Directors and secretaries can update students" ON students;

DROP POLICY IF EXISTS "School members can view teachers" ON teachers;
DROP POLICY IF EXISTS "Directors can create teachers" ON teachers;

DROP POLICY IF EXISTS "School members can view classes" ON classes;
DROP POLICY IF EXISTS "Directors can create classes" ON classes;

DROP POLICY IF EXISTS "School members can view subjects" ON subjects;
DROP POLICY IF EXISTS "Directors can create subjects" ON subjects;

DROP POLICY IF EXISTS "School members can view grades" ON grades;
DROP POLICY IF EXISTS "Teachers can create grades" ON grades;

DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

DROP POLICY IF EXISTS "School members can view academic years" ON academic_years;
DROP POLICY IF EXISTS "Directors can create academic years" ON academic_years;

-- ====================================
-- ETAPE 3 : POLITIQUES USERS (PERMETTENT AUTO-INSCRIPTION)
-- ====================================

CREATE POLICY "Users can insert their own account during signup" ON users
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view their own profile" ON users
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "New users can read their auth data" ON users
FOR SELECT TO anon
USING (id = auth.uid());

-- ====================================
-- ETAPE 4 : POLITIQUES SCHOOLS (PERMETTENT CREATION)
-- ====================================

CREATE POLICY "Directors can create their own school during signup" ON schools
FOR INSERT TO authenticated
WITH CHECK (director_user_id = auth.uid());

CREATE POLICY "Directors can view their school" ON schools
FOR SELECT TO authenticated
USING (director_user_id = auth.uid());

CREATE POLICY "Directors can update their school" ON schools
FOR UPDATE TO authenticated
USING (director_user_id = auth.uid())
WITH CHECK (director_user_id = auth.uid());

CREATE POLICY "Anyone can check school code uniqueness" ON schools
FOR SELECT TO anon, authenticated
USING (true);

-- ====================================
-- ETAPE 5 : POLITIQUES POUR LES AUTRES TABLES
-- ====================================

CREATE POLICY "School members can view students" ON students
FOR SELECT TO authenticated
USING (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  ) OR
  school_id IN (
    SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('secretary', 'teacher')
  )
);

CREATE POLICY "Directors and secretaries can create students" ON students
FOR INSERT TO authenticated
WITH CHECK (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  ) OR
  school_id IN (
    SELECT school_id FROM users WHERE id = auth.uid() AND role = 'secretary'
  )
);

CREATE POLICY "Directors and secretaries can update students" ON students
FOR UPDATE TO authenticated
USING (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  ) OR
  school_id IN (
    SELECT school_id FROM users WHERE id = auth.uid() AND role = 'secretary'
  )
);

CREATE POLICY "School members can view teachers" ON teachers
FOR SELECT TO authenticated
USING (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  ) OR
  school_id IN (
    SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('secretary', 'teacher')
  )
);

CREATE POLICY "Directors can create teachers" ON teachers
FOR INSERT TO authenticated
WITH CHECK (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  )
);

CREATE POLICY "School members can view classes" ON classes
FOR SELECT TO authenticated
USING (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  ) OR
  school_id IN (
    SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('secretary', 'teacher')
  )
);

CREATE POLICY "Directors can create classes" ON classes
FOR INSERT TO authenticated
WITH CHECK (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  )
);

CREATE POLICY "School members can view subjects" ON subjects
FOR SELECT TO authenticated
USING (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  ) OR
  school_id IN (
    SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('secretary', 'teacher')
  )
);

CREATE POLICY "Directors can create subjects" ON subjects
FOR INSERT TO authenticated
WITH CHECK (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  )
);

CREATE POLICY "School members can view grades" ON grades
FOR SELECT TO authenticated
USING (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  ) OR
  school_id IN (
    SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('secretary', 'teacher')
  ) OR
  student_id IN (
    SELECT id FROM students WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can create grades" ON grades
FOR INSERT TO authenticated
WITH CHECK (
  teacher_id IN (
    SELECT id FROM teachers WHERE user_id = auth.uid()
  ) OR
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their notifications" ON notifications
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON notifications
FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "School members can view academic years" ON academic_years
FOR SELECT TO authenticated
USING (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  ) OR
  school_id IN (
    SELECT school_id FROM users WHERE id = auth.uid()
  )
);

CREATE POLICY "Directors can create academic years" ON academic_years
FOR INSERT TO authenticated
WITH CHECK (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  )
);

-- ====================================
-- FIN DES POLITIQUES RLS CORRIGEES
-- ====================================
