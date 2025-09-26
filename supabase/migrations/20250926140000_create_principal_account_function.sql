-- Migration: Fonction pour créer un compte principal avec école
-- Date: 2025-09-26
-- Description: Fonction pour créer un directeur d'école et son établissement

-- Assurer que l'extension pgcrypto est activée pour le hachage des mots de passe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fonction pour créer un compte principal avec son école
CREATE OR REPLACE FUNCTION create_principal_account(
    director_name TEXT,
    email_input TEXT,
    phone_input TEXT,
    password_input TEXT,
    school_name TEXT,
    school_type public.school_type,
    school_address TEXT,
    school_city TEXT DEFAULT 'Yaoundé',
    school_country TEXT DEFAULT 'Cameroun',
    available_classes TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    user_id UUID,
    school_id UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    new_school_id UUID;
    school_code TEXT;
BEGIN
    -- Vérifier si l'email existe déjà
    IF EXISTS (SELECT 1 FROM public.users WHERE email = email_input) THEN
        RETURN QUERY SELECT FALSE, 'Cette adresse email est déjà utilisée'::TEXT, NULL::UUID, NULL::UUID;
        RETURN;
    END IF;

    -- Générer un code unique pour l'école
    school_code := UPPER(LEFT(REPLACE(school_name, ' ', ''), 3)) || '-' || 
                   EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || 
                   LPAD((RANDOM() * 999)::INTEGER::TEXT, 3, '0');

    -- Vérifier que le code école est unique
    WHILE EXISTS (SELECT 1 FROM public.schools WHERE code = school_code) LOOP
        school_code := UPPER(LEFT(REPLACE(school_name, ' ', ''), 3)) || '-' || 
                       EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || 
                       LPAD((RANDOM() * 999)::INTEGER::TEXT, 3, '0');
    END LOOP;

    BEGIN
        -- 1. Créer d'abord l'école
        INSERT INTO public.schools (
            name,
            code,
            type,
            director_name,
            phone,
            address,
            city,
            country,
            available_classes,
            status
        ) VALUES (
            school_name,
            school_code,
            school_type,
            director_name,
            phone_input,
            school_address,
            school_city,
            school_country,
            available_classes,
            'active'
        )
        RETURNING id INTO new_school_id;

        -- 2. Créer l'utilisateur principal
        INSERT INTO public.users (
            full_name,
            email,
            phone,
            role,
            password_hash,
            current_school_id,
            is_active
        ) VALUES (
            director_name,
            email_input,
            phone_input,
            'principal',
            crypt(password_input, gen_salt('bf')),
            new_school_id,
            TRUE
        )
        RETURNING id INTO new_user_id;

        -- 3. Lier le directeur à l'école
        UPDATE public.schools 
        SET director_user_id = new_user_id
        WHERE id = new_school_id;

        -- Retourner le succès
        RETURN QUERY SELECT TRUE, 'Compte principal créé avec succès'::TEXT, new_user_id, new_school_id;

    EXCEPTION WHEN OTHERS THEN
        -- En cas d'erreur, faire un rollback et retourner l'erreur
        RAISE WARNING 'Erreur lors de la création du compte: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Erreur lors de la création: ' || SQLERRM)::TEXT, NULL::UUID, NULL::UUID;
    END;
END;
$$;

-- Commentaire sur la fonction
COMMENT ON FUNCTION create_principal_account IS 'Crée un compte directeur avec son établissement scolaire';