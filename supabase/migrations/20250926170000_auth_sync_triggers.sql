-- Migration: Trigger pour synchroniser auth.users avec public.users
-- Date: 2025-09-26
-- Description: Créer automatiquement un enregistrement dans public.users quand un utilisateur s'inscrit

-- Fonction trigger pour synchroniser les utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email, phone, role, is_active, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        TRUE,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour les utilisateurs
CREATE OR REPLACE FUNCTION public.handle_user_update() 
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    UPDATE public.users 
    SET 
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', OLD.raw_user_meta_data->>'full_name', NEW.email),
        email = NEW.email,
        phone = COALESCE(NEW.raw_user_meta_data->>'phone', OLD.raw_user_meta_data->>'phone', NEW.phone),
        role = COALESCE(NEW.raw_user_meta_data->>'role', OLD.raw_user_meta_data->>'role', 'user'),
        updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

-- Créer le trigger de mise à jour
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Commentaires
COMMENT ON FUNCTION public.handle_new_user IS 'Synchronise les nouveaux utilisateurs auth avec la table public.users';
COMMENT ON FUNCTION public.handle_user_update IS 'Met à jour les utilisateurs dans public.users quand auth.users change';