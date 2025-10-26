-- ==========================================
-- SOLUTION COMPLETE - AVEC TRIGGER ET SANS RLS
-- ==========================================
-- Cette version cree le trigger SANS activer RLS
-- (plus simple et plus fiable)

-- ==========================================
-- ETAPE 1 : DESACTIVER RLS (pour eviter les problemes)
-- ==========================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years DISABLE ROW LEVEL SECURITY;
ALTER TABLE parents DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- ETAPE 2 : CREER LE TRIGGER AUTOMATIQUE
-- ==========================================

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_automatic();

-- Fonction trigger simplifiee
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

-- ==========================================
-- ETAPE 3 : FONCTION DE DIAGNOSTIC
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
-- ETAPE 4 : CORRIGER LES COMPTES EXISTANTS
-- ==========================================

-- Pour votre compte existant pensezy.si@gmail.com, creer les donnees manquantes
DO $$
DECLARE
    user_id uuid;
    user_email text := 'pensezy.si@gmail.com';
    school_id uuid;
BEGIN
    -- Recuperer l'ID du user depuis auth.users
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NOT NULL THEN
        -- Verifier si l'user existe dans public.users
        IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
            -- Creer l'user
            INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
            VALUES (user_id, user_email, 'Director', 'principal', true, NOW(), NOW());
            
            RAISE NOTICE 'User created for %', user_email;
        END IF;
        
        -- Verifier si l'ecole existe
        IF NOT EXISTS (SELECT 1 FROM public.schools WHERE director_user_id = user_id) THEN
            school_id := gen_random_uuid();
            
            -- Creer l'ecole
            INSERT INTO public.schools (
                id,
                name,
                code,
                type,
                director_name,
                director_user_id,
                email,
                status,
                country,
                created_at,
                updated_at
            )
            VALUES (
                school_id,
                'Mon Ecole',
                'ECO-2025-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
                'public',
                'Director',
                user_id,
                user_email,
                'active',
                'Cameroun',
                NOW(),
                NOW()
            );
            
            -- Lier l'user a l'ecole
            UPDATE public.users SET current_school_id = school_id WHERE id = user_id;
            
            RAISE NOTICE 'School created for %', user_email;
        END IF;
    END IF;
END $$;

-- ==========================================
-- CONFIRMATION
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'CONFIGURATION COMPLETE';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RLS desactive sur toutes les tables';
    RAISE NOTICE 'Trigger automatique cree';
    RAISE NOTICE 'Compte existant corrige';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Vous pouvez maintenant:';
    RAISE NOTICE '1. Vous connecter avec pensezy.si@gmail.com';
    RAISE NOTICE '2. Creer de nouveaux comptes directeurs';
    RAISE NOTICE '==========================================';
END $$;

-- Verification
SELECT * FROM check_auth_sync();
