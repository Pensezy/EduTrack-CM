-- ==========================================
-- VERSION ULTRA-DEFENSIVE - GESTION D'ERREURS
-- ==========================================
-- Cette version capture et log les erreurs

-- Supprimer l'ancien trigger et fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_automatic();

-- Fonction avec gestion d'erreurs complete
CREATE OR REPLACE FUNCTION public.handle_new_user_automatic()
RETURNS TRIGGER AS $$
DECLARE
    school_data jsonb;
    school_uuid uuid;
    error_msg text;
BEGIN
    -- 1. Inserer dans users avec gestion d'erreurs
    BEGIN
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
        
        RAISE NOTICE 'User inserted successfully: %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        error_msg := SQLERRM;
        RAISE WARNING 'Error inserting user: %', error_msg;
        -- Ne pas bloquer l'inscription meme si erreur
    END;

    -- 2. Si c'est un directeur, creer son ecole
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'principal' THEN
        BEGIN
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
                
                RAISE NOTICE 'School inserted successfully: %', school_uuid;
                
                -- Mettre a jour current_school_id
                UPDATE public.users
                SET current_school_id = school_uuid
                WHERE id = NEW.id;
                
                RAISE NOTICE 'User linked to school: %', school_uuid;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            error_msg := SQLERRM;
            RAISE WARNING 'Error creating school: %', error_msg;
            -- Ne pas bloquer l'inscription meme si erreur
        END;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Capturer toute erreur globale
    error_msg := SQLERRM;
    RAISE WARNING 'Global error in trigger: %', error_msg;
    -- Retourner NEW pour ne pas bloquer l'inscription
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Creer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_automatic();

-- Table pour logger les erreurs
CREATE TABLE IF NOT EXISTS public.trigger_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    error_message TEXT,
    error_detail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonction de diagnostic amelioree
CREATE OR REPLACE FUNCTION public.debug_user_creation(user_email TEXT)
RETURNS TABLE (
    step TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Verifier Auth
    RETURN QUERY
    SELECT 
        'Auth User'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) 
            THEN 'Found' ELSE 'Not Found' END,
        (SELECT id::TEXT FROM auth.users WHERE email = user_email LIMIT 1);
    
    -- Verifier Users table
    RETURN QUERY
    SELECT 
        'Public Users'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM public.users WHERE email = user_email) 
            THEN 'Found' ELSE 'Not Found' END,
        (SELECT id::TEXT FROM public.users WHERE email = user_email LIMIT 1);
    
    -- Verifier Schools table
    RETURN QUERY
    SELECT 
        'Schools'::TEXT,
        CASE WHEN EXISTS (
            SELECT 1 FROM public.schools s 
            JOIN public.users u ON s.director_user_id = u.id 
            WHERE u.email = user_email
        ) THEN 'Found' ELSE 'Not Found' END,
        (SELECT s.id::TEXT FROM public.schools s 
         JOIN public.users u ON s.director_user_id = u.id 
         WHERE u.email = user_email LIMIT 1);
END;
$$ LANGUAGE plpgsql;
