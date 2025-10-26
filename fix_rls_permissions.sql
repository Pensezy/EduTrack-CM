-- ====================================
-- POLITIQUES RLS POUR NOUVEAU PROJET SUPABASE
-- EduTrack CM - Permissions correctes
-- À appliquer APRÈS avoir créé les tables avec new_project_schema.sql
-- ====================================

-- 1. S'assurer que RLS est activé sur toutes les tables importantes
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE secretaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les anciennes politiques (au cas où)
DROP POLICY IF EXISTS "Directors can view their own school" ON schools;
DROP POLICY IF EXISTS "Directors can update their own school" ON schools;
DROP POLICY IF EXISTS "Directors can insert their own school" ON schools;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;

-- 3. POLITIQUES POUR LA TABLE USERS
CREATE POLICY "Users can view their own data" ON users
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own data" ON users
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own data" ON users
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- 4. POLITIQUES POUR LA TABLE SCHOOLS
CREATE POLICY "Directors can view their own school" ON schools
FOR SELECT TO authenticated
USING (director_user_id = auth.uid());

CREATE POLICY "Directors can update their own school" ON schools
FOR UPDATE TO authenticated
USING (director_user_id = auth.uid())
WITH CHECK (director_user_id = auth.uid());

CREATE POLICY "Directors can insert their own school" ON schools
FOR INSERT TO authenticated
WITH CHECK (director_user_id = auth.uid());

-- 5. POLITIQUES POUR LES AUTRES TABLES (basées sur l'école)
-- Les utilisateurs peuvent voir les données de leur école

CREATE POLICY "School users can view students" ON students
FOR SELECT TO authenticated
USING (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  ) OR
  school_id IN (
    SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('secretary', 'teacher')
  )
);

CREATE POLICY "School users can view teachers" ON teachers
FOR SELECT TO authenticated
USING (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  ) OR
  school_id IN (
    SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('secretary', 'teacher')
  )
);

CREATE POLICY "School users can view classes" ON classes
FOR SELECT TO authenticated
USING (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  ) OR
  school_id IN (
    SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('secretary', 'teacher')
  )
);

CREATE POLICY "School users can view subjects" ON subjects
FOR SELECT TO authenticated
USING (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  ) OR
  school_id IN (
    SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('secretary', 'teacher')
  )
);

-- 6. POLITIQUES SPÉCIFIQUES POUR LES SECRÉTAIRES
CREATE POLICY "Secretaries can view their profile" ON secretaries
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Directors can view their secretaries" ON secretaries
FOR SELECT TO authenticated
USING (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  )
);

CREATE POLICY "Directors can create secretaries" ON secretaries
FOR INSERT TO authenticated
WITH CHECK (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  )
);

CREATE POLICY "Directors can update their secretaries" ON secretaries
FOR UPDATE TO authenticated
USING (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  )
);

-- 7. POLITIQUES POUR LES TÂCHES
CREATE POLICY "School users can view tasks" ON tasks
FOR SELECT TO authenticated
USING (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  ) OR
  assigned_to = auth.uid() OR
  school_id IN (
    SELECT school_id FROM users WHERE id = auth.uid() AND role = 'secretary'
  )
);

CREATE POLICY "Directors can create tasks" ON tasks
FOR INSERT TO authenticated
WITH CHECK (
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  )
);

CREATE POLICY "Task assignees can update their tasks" ON tasks
FOR UPDATE TO authenticated
USING (
  assigned_to = auth.uid() OR
  school_id IN (
    SELECT id FROM schools WHERE director_user_id = auth.uid()
  )
);

-- 8. POLITIQUES POUR LES NOTIFICATIONS
CREATE POLICY "Users can view their notifications" ON notifications
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 9. VÉRIFICATION DES POLITIQUES CRÉÉES
-- Exécuter cette requête pour vérifier que tout est en place :
/*
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('schools', 'users', 'students', 'teachers', 'classes', 'subjects', 'secretaries', 'tasks')
ORDER BY tablename, policyname;
*/

-- ====================================
-- FIN DES POLITIQUES RLS
-- ====================================