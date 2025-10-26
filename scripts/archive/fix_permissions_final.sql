-- ====================================
-- SCRIPT FINAL DE CORRECTION DES PERMISSIONS
-- À exécuter dans l'éditeur SQL de Supabase
-- ====================================

-- 1. ACTIVER RLS SUR TOUTES LES TABLES
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
ALTER TABLE evaluation_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_types ENABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER LES ANCIENNES POLITIQUES
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

-- 3. POLITIQUES POUR LES UTILISATEURS AUTHENTIFIÉS
CREATE POLICY "Users can insert their own account" ON users
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view their own profile" ON users
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4. POLITIQUES POUR LES ÉCOLES
CREATE POLICY "Directors can create their school" ON schools
FOR INSERT TO authenticated
WITH CHECK (director_user_id = auth.uid());

CREATE POLICY "Directors can view their school" ON schools
FOR SELECT TO authenticated
USING (director_user_id = auth.uid());

CREATE POLICY "Directors can update their school" ON schools
FOR UPDATE TO authenticated
USING (director_user_id = auth.uid())
WITH CHECK (director_user_id = auth.uid());

-- 5. POLITIQUES POUR LES ÉLÈVES
CREATE POLICY "School members can view students" ON students
FOR SELECT TO authenticated
USING (
  school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()) OR
  school_id IN (SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('secretary', 'teacher'))
);

CREATE POLICY "Directors and secretaries can manage students" ON students
FOR ALL TO authenticated
USING (
  school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()) OR
  school_id IN (SELECT school_id FROM users WHERE id = auth.uid() AND role = 'secretary')
)
WITH CHECK (
  school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()) OR
  school_id IN (SELECT school_id FROM users WHERE id = auth.uid() AND role = 'secretary')
);

-- 6. POLITIQUES POUR LES ENSEIGNANTS
CREATE POLICY "School members can view teachers" ON teachers
FOR SELECT TO authenticated
USING (
  school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()) OR
  school_id IN (SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('secretary', 'teacher'))
);

CREATE POLICY "Directors can manage teachers" ON teachers
FOR ALL TO authenticated
USING (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()))
WITH CHECK (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()));

-- 7. POLITIQUES POUR LES CLASSES
CREATE POLICY "School members can view classes" ON classes
FOR SELECT TO authenticated
USING (
  school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()) OR
  school_id IN (SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('secretary', 'teacher'))
);

CREATE POLICY "Directors can manage classes" ON classes
FOR ALL TO authenticated
USING (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()))
WITH CHECK (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()));

-- 8. POLITIQUES POUR LES MATIÈRES
CREATE POLICY "School members can view subjects" ON subjects
FOR SELECT TO authenticated
USING (
  school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()) OR
  school_id IN (SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('secretary', 'teacher'))
);

CREATE POLICY "Directors can manage subjects" ON subjects
FOR ALL TO authenticated
USING (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()))
WITH CHECK (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()));

-- 9. POLITIQUES POUR LES NOTES
CREATE POLICY "School members can view grades" ON grades
FOR SELECT TO authenticated
USING (
  school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()) OR
  school_id IN (SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('secretary', 'teacher')) OR
  student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
);

CREATE POLICY "Teachers can manage grades" ON grades
FOR ALL TO authenticated
USING (
  teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()) OR
  school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid())
)
WITH CHECK (
  teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()) OR
  school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid())
);

-- 10. POLITIQUES POUR LES NOTIFICATIONS
CREATE POLICY "Users can manage their notifications" ON notifications
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 11. POLITIQUES POUR LES ANNÉES ACADEMIQUES
CREATE POLICY "School members can view academic years" ON academic_years
FOR SELECT TO authenticated
USING (
  school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()) OR
  school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Directors can manage academic years" ON academic_years
FOR ALL TO authenticated
USING (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()))
WITH CHECK (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()));

-- 12. POLITIQUES POUR LES PÉRIODES D'ÉVALUATION
CREATE POLICY "School members can view evaluation periods" ON evaluation_periods
FOR SELECT TO authenticated
USING (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()));

CREATE POLICY "Directors can manage evaluation periods" ON evaluation_periods
FOR ALL TO authenticated
USING (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()))
WITH CHECK (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()));

-- 13. POLITIQUES POUR LES TYPES DE NOTES
CREATE POLICY "School members can view grade types" ON grade_types
FOR SELECT TO authenticated
USING (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()));

CREATE POLICY "Directors can manage grade types" ON grade_types
FOR ALL TO authenticated
USING (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()))
WITH CHECK (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()));

-- 14. POLITIQUES POUR LES RÔLES UTILISATEUR
CREATE POLICY "School members can view user roles" ON user_roles
FOR SELECT TO authenticated
USING (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()));

CREATE POLICY "Directors can manage user roles" ON user_roles
FOR ALL TO authenticated
USING (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()))
WITH CHECK (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()));

-- 15. POLITIQUES POUR LES TYPES DE PRÉSENCE
CREATE POLICY "School members can view attendance types" ON attendance_types
FOR SELECT TO authenticated
USING (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()));

CREATE POLICY "Directors can manage attendance types" ON attendance_types
FOR ALL TO authenticated
USING (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()))
WITH CHECK (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()));

-- 16. POLITIQUES POUR LES TYPES DE PAIEMENT
CREATE POLICY "School members can view payment types" ON payment_types
FOR SELECT TO authenticated
USING (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()));

CREATE POLICY "Directors can manage payment types" ON payment_types
FOR ALL TO authenticated
USING (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()))
WITH CHECK (school_id IN (SELECT id FROM schools WHERE director_user_id = auth.uid()));

-- 17. GRANT LES DROITS NÉCESSAIRES
GRANT ALL ON users TO authenticated;
GRANT ALL ON schools TO authenticated;
GRANT ALL ON students TO authenticated;
GRANT ALL ON teachers TO authenticated;
GRANT ALL ON parents TO authenticated;
GRANT ALL ON classes TO authenticated;
GRANT ALL ON subjects TO authenticated;
GRANT ALL ON grades TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON academic_years TO authenticated;
GRANT ALL ON evaluation_periods TO authenticated;
GRANT ALL ON grade_types TO authenticated;
GRANT ALL ON user_roles TO authenticated;
GRANT ALL ON attendance_types TO authenticated;
GRANT ALL ON payment_types TO authenticated;

-- 18. VÉRIFICATION
SELECT tablename, relname, relkind 
FROM pg_class pc 
JOIN pg_namespace pn ON pc.relnamespace = pn.oid 
WHERE pn.nspname = 'public' 
AND relkind = 'r'
AND tablename IN (
  'users', 'schools', 'students', 'teachers', 'parents', 
  'classes', 'subjects', 'grades', 'notifications', 
  'academic_years', 'evaluation_periods', 'grade_types', 
  'user_roles', 'attendance_types', 'payment_types'
);