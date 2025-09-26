-- Migration: Suppression du système PIN et amélioration de l'authentification
-- Date: 2025-09-26
-- Objectif: Passer d'un système PIN à email/password + phone comme backup

-- ========================================
-- 0. ACTIVATION DE L'EXTENSION PGCRYPTO
-- ========================================

-- Activer l'extension pour le hachage sécurisé des mots de passe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========================================
-- 1. MODIFICATIONS DE LA TABLE USERS
-- ========================================

-- Supprimer la colonne pin_code (devenue obsolète)
ALTER TABLE public.users DROP COLUMN IF EXISTS pin_code;

-- Améliorer les contraintes d'authentification
ALTER TABLE public.users ALTER COLUMN email SET NOT NULL;
ALTER TABLE public.users ALTER COLUMN password_hash SET NOT NULL;

-- Ajouter une contrainte pour s'assurer que l'email est valide
ALTER TABLE public.users ADD CONSTRAINT valid_email 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Rendre le téléphone unique (authentification alternative)
ALTER TABLE public.users ADD CONSTRAINT unique_phone UNIQUE (phone);

-- Ajouter des colonnes pour la sécurité
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

-- ========================================
-- 2. FONCTION DE VALIDATION D'EMAIL
-- ========================================

CREATE OR REPLACE FUNCTION public.is_valid_email(email_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN email_input ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- ========================================
-- 3. FONCTION DE VALIDATION DE TÉLÉPHONE CAMEROUNAIS
-- ========================================

CREATE OR REPLACE FUNCTION public.is_valid_cameroon_phone(phone_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Format Cameroun: +237XXXXXXXXX ou 237XXXXXXXXX ou 6XXXXXXXX
    RETURN phone_input ~* '^(\+237|237)?[67][0-9]{8}$';
END;
$$;

-- ========================================
-- 4. FONCTION D'AUTHENTIFICATION PAR EMAIL
-- ========================================

CREATE OR REPLACE FUNCTION public.authenticate_user(
    email_input TEXT,
    password_input TEXT
)
RETURNS TABLE(
    user_id UUID,
    full_name TEXT,
    role TEXT,
    school_id UUID,
    is_locked BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record public.users%ROWTYPE;
    is_password_valid BOOLEAN := false;
BEGIN
    -- Récupérer l'utilisateur par email
    SELECT * INTO user_record 
    FROM public.users 
    WHERE email = email_input AND is_active = true;
    
    -- Vérifier si l'utilisateur existe
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::UUID, 
            false::BOOLEAN,
            'Email incorrect ou compte inexistant'::TEXT;
        RETURN;
    END IF;
    
    -- Vérifier si le compte est verrouillé
    IF user_record.locked_until IS NOT NULL AND user_record.locked_until > NOW() THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::UUID, 
            true::BOOLEAN,
            'Compte temporairement verrouillé. Réessayez plus tard.'::TEXT;
        RETURN;
    END IF;
    
    -- Vérifier le mot de passe (en utilisant la fonction crypt de PostgreSQL)
    SELECT (user_record.password_hash = crypt(password_input, user_record.password_hash)) INTO is_password_valid;
    
    IF is_password_valid THEN
        -- Connexion réussie - réinitialiser les tentatives
        UPDATE public.users 
        SET 
            failed_login_attempts = 0,
            locked_until = NULL,
            last_login = NOW()
        WHERE id = user_record.id;
        
        RETURN QUERY SELECT 
            user_record.id,
            user_record.full_name,
            user_record.role::TEXT,
            user_record.current_school_id,
            false::BOOLEAN,
            'Connexion réussie'::TEXT;
    ELSE
        -- Mot de passe incorrect - incrémenter les tentatives
        UPDATE public.users 
        SET 
            failed_login_attempts = failed_login_attempts + 1,
            locked_until = CASE 
                WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
                ELSE NULL 
            END
        WHERE id = user_record.id;
        
        RETURN QUERY SELECT 
            NULL::UUID, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::UUID, 
            false::BOOLEAN,
            CASE 
                WHEN user_record.failed_login_attempts + 1 >= 5 THEN 
                    'Trop de tentatives. Compte verrouillé pour 30 minutes.'
                ELSE 
                    'Mot de passe incorrect. Tentative ' || (user_record.failed_login_attempts + 1)::TEXT || '/5'
            END::TEXT;
    END IF;
END;
$$;

-- ========================================
-- 5. FONCTION D'AUTHENTIFICATION PAR TÉLÉPHONE (BACKUP)
-- ========================================

CREATE OR REPLACE FUNCTION public.authenticate_user_by_phone(
    phone_input TEXT,
    password_input TEXT
)
RETURNS TABLE(
    user_id UUID,
    full_name TEXT,
    role TEXT,
    school_id UUID,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record public.users%ROWTYPE;
    is_password_valid BOOLEAN := false;
    normalized_phone TEXT;
BEGIN
    -- Normaliser le numéro de téléphone
    normalized_phone := regexp_replace(phone_input, '^(\+237|237)', '+237');
    IF NOT (normalized_phone ~ '^\+237[67][0-9]{8}$') THEN
        normalized_phone := '+237' || regexp_replace(phone_input, '^[^67]*', '');
    END IF;
    
    -- Récupérer l'utilisateur par téléphone
    SELECT * INTO user_record 
    FROM public.users 
    WHERE phone = normalized_phone AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::UUID, 
            'Numéro de téléphone incorrect ou compte inexistant'::TEXT;
        RETURN;
    END IF;
    
    -- Vérifier le mot de passe
    SELECT (user_record.password_hash = crypt(password_input, user_record.password_hash)) INTO is_password_valid;
    
    IF is_password_valid THEN
        UPDATE public.users 
        SET last_login = NOW()
        WHERE id = user_record.id;
        
        RETURN QUERY SELECT 
            user_record.id,
            user_record.full_name,
            user_record.role::TEXT,
            user_record.current_school_id,
            'Connexion par téléphone réussie'::TEXT;
    ELSE
        RETURN QUERY SELECT 
            NULL::UUID, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::UUID, 
            'Mot de passe incorrect'::TEXT;
    END IF;
END;
$$;

-- ========================================
-- 6. FONCTION DE CRÉATION D'UTILISATEUR SÉCURISÉE
-- ========================================

CREATE OR REPLACE FUNCTION public.create_user_secure(
    full_name_input TEXT,
    email_input TEXT,
    phone_input TEXT,
    password_input TEXT,
    role_input TEXT,
    school_id_input UUID DEFAULT NULL
)
RETURNS TABLE(
    user_id UUID,
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    normalized_phone TEXT;
    password_hash_result TEXT;
BEGIN
    -- Validation de l'email
    IF NOT public.is_valid_email(email_input) THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            false::BOOLEAN, 
            'Format d''email invalide'::TEXT;
        RETURN;
    END IF;
    
    -- Validation du téléphone
    IF NOT public.is_valid_cameroon_phone(phone_input) THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            false::BOOLEAN, 
            'Format de téléphone camerounais invalide (+237XXXXXXXXX)'::TEXT;
        RETURN;
    END IF;
    
    -- Normaliser le téléphone
    normalized_phone := regexp_replace(phone_input, '^(\+237|237)', '+237');
    IF NOT (normalized_phone ~ '^\+237[67][0-9]{8}$') THEN
        normalized_phone := '+237' || regexp_replace(phone_input, '^[^67]*', '');
    END IF;
    
    -- Validation du mot de passe (minimum 8 caractères)
    IF LENGTH(password_input) < 8 THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            false::BOOLEAN, 
            'Le mot de passe doit contenir au moins 8 caractères'::TEXT;
        RETURN;
    END IF;
    
    -- Hachage du mot de passe
    SELECT crypt(password_input, gen_salt('bf', 10)) INTO password_hash_result;
    
    -- Création de l'utilisateur
    BEGIN
        INSERT INTO public.users (
            full_name, 
            email, 
            phone, 
            password_hash, 
            role, 
            current_school_id,
            email_verified,
            phone_verified
        ) VALUES (
            full_name_input,
            email_input,
            normalized_phone,
            password_hash_result,
            role_input::public.user_role,
            school_id_input,
            false, -- Email à vérifier
            false  -- Téléphone à vérifier
        ) RETURNING id INTO new_user_id;
        
        RETURN QUERY SELECT 
            new_user_id, 
            true::BOOLEAN, 
            'Utilisateur créé avec succès'::TEXT;
            
    EXCEPTION
        WHEN unique_violation THEN
            RETURN QUERY SELECT 
                NULL::UUID, 
                false::BOOLEAN, 
                'Email ou téléphone déjà utilisé'::TEXT;
        WHEN OTHERS THEN
            RETURN QUERY SELECT 
                NULL::UUID, 
                false::BOOLEAN, 
                'Erreur lors de la création: ' || SQLERRM;
    END;
END;
$$;

-- ========================================
-- 7. MISE À JOUR DES DONNÉES EXISTANTES
-- ========================================

-- Mettre à jour les utilisateurs de démo avec des mots de passe sécurisés
DO $$
BEGIN
    -- Principal: admin123 -> mot de passe sécurisé
    UPDATE public.users 
    SET 
        password_hash = crypt('Directeur2024!', gen_salt('bf', 10)),
        email_verified = true,
        phone_verified = true
    WHERE role = 'principal' AND email LIKE '%proviseur%';
    
    -- Enseignant: prof123 -> mot de passe sécurisé  
    UPDATE public.users 
    SET 
        password_hash = crypt('Professeur2024!', gen_salt('bf', 10)),
        email_verified = true,
        phone_verified = true
    WHERE role = 'teacher' AND email LIKE '%prof%';
    
    -- Étudiant: student123 -> mot de passe sécurisé
    UPDATE public.users 
    SET 
        password_hash = crypt('Etudiant2024!', gen_salt('bf', 10)),
        email_verified = true,
        phone_verified = true
    WHERE role = 'student';
    
    -- Parent: parent123 -> mot de passe sécurisé
    UPDATE public.users 
    SET 
        password_hash = crypt('Parent2024!', gen_salt('bf', 10)),
        email_verified = true,
        phone_verified = true
    WHERE role = 'parent';
    
    RAISE NOTICE '✅ Système d''authentification mis à jour:';
    RAISE NOTICE '   🔐 Principal: Directeur2024!';
    RAISE NOTICE '   🔐 Enseignant: Professeur2024!'; 
    RAISE NOTICE '   🔐 Étudiant: Etudiant2024!';
    RAISE NOTICE '   🔐 Parent: Parent2024!';
    RAISE NOTICE '   📧 Connexion par email + mot de passe';
    RAISE NOTICE '   📱 Connexion alternative par téléphone + mot de passe';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur lors de la mise à jour: %', SQLERRM;
END $$;