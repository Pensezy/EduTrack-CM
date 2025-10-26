-- ==========================================
-- SOLUTION RADICALE - SYNCHRONISATION AUTOMATIQUE AUTH
-- ==========================================
-- Ce fichier cree un trigger qui synchronise AUTOMATIQUEMENT
-- Supabase Auth avec les tables users et schools
-- Plus besoin de code JavaScript pour inserer manuellement !

-- ==========================================
-- ETAPE 1 : ACTIVER RLS SUR TOUTES LES TABLES
-- ==========================================

-- Activer RLS seulement sur les tables qui existent
DO $$ 
BEGIN
    -- Tables principales
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'schools') THEN
        ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'students') THEN
        ALTER TABLE students ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'teachers') THEN
        ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'parents') THEN
        ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'classes') THEN
        ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subjects') THEN
        ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'grades') THEN
        ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'academic_years') THEN
        ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'parent_student_schools') THEN
        ALTER TABLE parent_student_schools ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ==========================================
-- ETAPE 2 : SUPPRIMER TOUTES LES ANCIENNES POLITIQUES
-- ==========================================

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own data" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their own data" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own data" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profile" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own account during signup" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "New users can read their auth data" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Directors can view their own school" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Directors can update their own school" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Directors can insert their own school" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Directors can view their school" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Directors can update their school" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Directors can create their own school during signup" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can check school code uniqueness" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "School members can view students" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Directors and secretaries can create students" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Directors and secretaries can update students" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "School members can view teachers" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Directors can create teachers" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "School members can view classes" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Directors can create classes" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "School members can view subjects" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Directors can create subjects" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "School members can view grades" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Teachers can create grades" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their notifications" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their notifications" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "School members can view academic years" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Directors can create academic years" ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- ==========================================
-- ETAPE 3 : CREER LE TRIGGER AUTOMATIQUE
-- ==========================================

-- Fonction qui s'execute AUTOMATIQUEMENT quand un utilisateur s'inscrit
CREATE OR REPLACE FUNCTION public.handle_new_user_automatic()
RETURNS TRIGGER AS $$
DECLARE
    school_data jsonb;
    school_uuid uuid;
BEGIN
    -- 1. Inserer AUTOMATIQUEMENT dans la table users
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

    -- 2. Si c'est un directeur, creer AUTOMATIQUEMENT son ecole
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'principal' THEN
        -- Extraire les donnees de l'ecole depuis user_metadata
        school_data := NEW.raw_user_meta_data->'school';
        
        IF school_data IS NOT NULL THEN
            -- Generer un UUID pour l'ecole
            school_uuid := gen_random_uuid();
            
            -- Inserer l'ecole
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
            
            -- Mettre a jour current_school_id dans users
            UPDATE public.users
            SET current_school_id = school_uuid
            WHERE id = NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Creer le nouveau trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_automatic();

-- ==========================================
-- ETAPE 4 : POLITIQUES RLS SIMPLIFIEES
-- ==========================================

-- USERS : Acces complet pour tous les utilisateurs authentifies
CREATE POLICY "Allow all for authenticated users" ON users
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- USERS : Lecture anonyme pour permettre les verifications pendant signup
CREATE POLICY "Allow read for anon during signup" ON users
    FOR SELECT TO anon
    USING (true);

-- SCHOOLS : Acces complet pour tous les utilisateurs authentifies
CREATE POLICY "Allow all for authenticated users" ON schools
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- SCHOOLS : Lecture anonyme pour verifier l'unicite du code
CREATE POLICY "Allow read for anon to check uniqueness" ON schools
    FOR SELECT TO anon
    USING (true);

-- STUDENTS : Acces par ecole
CREATE POLICY "School access for students" ON students
    FOR ALL TO authenticated
    USING (
        school_id IN (
            SELECT id FROM schools WHERE director_user_id = auth.uid()
        ) OR
        school_id IN (
            SELECT current_school_id FROM users WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        school_id IN (
            SELECT id FROM schools WHERE director_user_id = auth.uid()
        ) OR
        school_id IN (
            SELECT current_school_id FROM users WHERE id = auth.uid()
        )
    );

-- TEACHERS : Acces par ecole
CREATE POLICY "School access for teachers" ON teachers
    FOR ALL TO authenticated
    USING (
        school_id IN (
            SELECT id FROM schools WHERE director_user_id = auth.uid()
        ) OR
        school_id IN (
            SELECT current_school_id FROM users WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        school_id IN (
            SELECT id FROM schools WHERE director_user_id = auth.uid()
        ) OR
        school_id IN (
            SELECT current_school_id FROM users WHERE id = auth.uid()
        )
    );

-- CLASSES : Acces par ecole
CREATE POLICY "School access for classes" ON classes
    FOR ALL TO authenticated
    USING (
        school_id IN (
            SELECT id FROM schools WHERE director_user_id = auth.uid()
        ) OR
        school_id IN (
            SELECT current_school_id FROM users WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        school_id IN (
            SELECT id FROM schools WHERE director_user_id = auth.uid()
        ) OR
        school_id IN (
            SELECT current_school_id FROM users WHERE id = auth.uid()
        )
    );

-- SUBJECTS : Acces par ecole
CREATE POLICY "School access for subjects" ON subjects
    FOR ALL TO authenticated
    USING (
        school_id IN (
            SELECT id FROM schools WHERE director_user_id = auth.uid()
        ) OR
        school_id IN (
            SELECT current_school_id FROM users WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        school_id IN (
            SELECT id FROM schools WHERE director_user_id = auth.uid()
        ) OR
        school_id IN (
            SELECT current_school_id FROM users WHERE id = auth.uid()
        )
    );

-- GRADES : Acces par ecole et etudiant
CREATE POLICY "School access for grades" ON grades
    FOR ALL TO authenticated
    USING (
        school_id IN (
            SELECT id FROM schools WHERE director_user_id = auth.uid()
        ) OR
        school_id IN (
            SELECT current_school_id FROM users WHERE id = auth.uid()
        ) OR
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        school_id IN (
            SELECT id FROM schools WHERE director_user_id = auth.uid()
        ) OR
        school_id IN (
            SELECT current_school_id FROM users WHERE id = auth.uid()
        )
    );

-- NOTIFICATIONS : Acces personnel
CREATE POLICY "Personal access for notifications" ON notifications
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ACADEMIC_YEARS : Acces par ecole
CREATE POLICY "School access for academic years" ON academic_years
    FOR ALL TO authenticated
    USING (
        school_id IN (
            SELECT id FROM schools WHERE director_user_id = auth.uid()
        ) OR
        school_id IN (
            SELECT current_school_id FROM users WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        school_id IN (
            SELECT id FROM schools WHERE director_user_id = auth.uid()
        ) OR
        school_id IN (
            SELECT current_school_id FROM users WHERE id = auth.uid()
        )
    );

-- PARENTS : Acces par utilisateur (pas de school_id direct)
CREATE POLICY "Personal and school access for parents" ON parents
    FOR ALL TO authenticated
    USING (
        user_id = auth.uid() OR
        id IN (
            SELECT parent_id FROM parent_student_schools 
            WHERE school_id IN (
                SELECT id FROM schools WHERE director_user_id = auth.uid()
            )
        ) OR
        id IN (
            SELECT parent_id FROM parent_student_schools 
            WHERE school_id IN (
                SELECT current_school_id FROM users WHERE id = auth.uid()
            )
        )
    )
    WITH CHECK (
        user_id = auth.uid() OR
        id IN (
            SELECT parent_id FROM parent_student_schools 
            WHERE school_id IN (
                SELECT id FROM schools WHERE director_user_id = auth.uid()
            )
        )
    );

-- PARENT_STUDENT_SCHOOLS : Acces par ecole et parent
CREATE POLICY "School and parent access for parent_student_schools" ON parent_student_schools
    FOR ALL TO authenticated
    USING (
        school_id IN (
            SELECT id FROM schools WHERE director_user_id = auth.uid()
        ) OR
        school_id IN (
            SELECT current_school_id FROM users WHERE id = auth.uid()
        ) OR
        parent_id IN (
            SELECT id FROM parents WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        school_id IN (
            SELECT id FROM schools WHERE director_user_id = auth.uid()
        ) OR
        school_id IN (
            SELECT current_school_id FROM users WHERE id = auth.uid()
        ) OR
        parent_id IN (
            SELECT id FROM parents WHERE user_id = auth.uid()
        )
    );

-- ==========================================
-- ETAPE 5 : FONCTION DE DIAGNOSTIC
-- ==========================================

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

-- ==========================================
-- FIN DE LA SOLUTION RADICALE
-- ==========================================

-- VERIFICATION : Executer cette requete pour voir l'etat de la synchronisation
-- SELECT * FROM check_auth_sync();
