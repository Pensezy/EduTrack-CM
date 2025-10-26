-- ==========================================
-- VERSION MINIMALE - JUSTE CE QUI EST NECESSAIRE
-- ==========================================
-- Cette version active UNIQUEMENT users et schools
-- et cree le trigger automatique

-- ==========================================
-- ETAPE 1 : ACTIVER RLS SUR USERS ET SCHOOLS
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ETAPE 2 : SUPPRIMER LES ANCIENNES POLITIQUES
-- ==========================================

-- Supprimer politiques users
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own account during signup" ON users;
DROP POLICY IF EXISTS "New users can read their auth data" ON users;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow read for anon during signup" ON users;

-- Supprimer politiques schools
DROP POLICY IF EXISTS "Directors can view their own school" ON schools;
DROP POLICY IF EXISTS "Directors can update their own school" ON schools;
DROP POLICY IF EXISTS "Directors can insert their own school" ON schools;
DROP POLICY IF EXISTS "Directors can view their school" ON schools;
DROP POLICY IF EXISTS "Directors can update their school" ON schools;
DROP POLICY IF EXISTS "Directors can create their own school during signup" ON schools;
DROP POLICY IF EXISTS "Anyone can check school code uniqueness" ON schools;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON schools;
DROP POLICY IF EXISTS "Allow read for anon to check uniqueness" ON schools;

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
-- ETAPE 4 : POLITIQUES RLS ULTRA-PERMISSIVES
-- ==========================================

-- USERS : Tout le monde peut TOUT faire
CREATE POLICY "Allow all operations for everyone" ON users
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- SCHOOLS : Tout le monde peut TOUT faire
CREATE POLICY "Allow all operations for everyone" ON schools
    FOR ALL 
    USING (true)
    WITH CHECK (true);

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
-- FIN DE LA VERSION MINIMALE
-- ==========================================

-- VERIFICATION : Executer cette requete pour voir l'etat de la synchronisation
-- SELECT * FROM check_auth_sync();
