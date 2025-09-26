-- Migration: Mise à jour de la fonction de création de compte principal
-- Date: 2025-09-26
-- Description: Adapter la fonction pour travailler avec Supabase Auth

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS create_principal_account;

-- Fonction pour créer une école et lier au directeur
CREATE OR REPLACE FUNCTION create_principal_school(
    director_name TEXT,
    email_input TEXT,
    phone_input TEXT,
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
    existing_user_id UUID;
    new_school_id UUID;
    school_code TEXT;
BEGIN
    -- Rechercher l'utilisateur existant par email (créé par Supabase Auth)
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = email_input;

    IF existing_user_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Utilisateur non trouvé dans le système d''authentification'::TEXT, NULL::UUID, NULL::UUID;
        RETURN;
    END IF;

    -- Vérifier si l'utilisateur a déjà une école
    IF EXISTS (SELECT 1 FROM public.schools WHERE director_user_id = existing_user_id) THEN
        RETURN QUERY SELECT FALSE, 'Cet utilisateur a déjà une école associée'::TEXT, NULL::UUID, NULL::UUID;
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
        -- 1. Créer l'école
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
            status,
            director_user_id
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
            'active',
            existing_user_id
        )
        RETURNING id INTO new_school_id;

        -- 2. Mettre à jour l'utilisateur dans la table publique (si elle existe)
        INSERT INTO public.users (
            id,
            full_name,
            email,
            phone,
            role,
            current_school_id,
            is_active
        ) VALUES (
            existing_user_id,
            director_name,
            email_input,
            phone_input,
            'principal',
            new_school_id,
            TRUE
        )
        ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            role = EXCLUDED.role,
            current_school_id = EXCLUDED.current_school_id;

        -- Retourner le succès
        RETURN QUERY SELECT TRUE, 'École créée et liée avec succès'::TEXT, existing_user_id, new_school_id;

    EXCEPTION WHEN OTHERS THEN
        -- En cas d'erreur, faire un rollback et retourner l'erreur
        RAISE WARNING 'Erreur lors de la création de l''école: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Erreur lors de la création: ' || SQLERRM)::TEXT, NULL::UUID, NULL::UUID;
    END;
END;
$$;

-- Commentaire sur la fonction
COMMENT ON FUNCTION create_principal_school IS 'Crée une école et la lie à un directeur existant dans Supabase Auth';