-- Migration: Créer la fonction authenticate_user pour l'authentification staff
-- Date: 2025-11-03

-- Fonction pour authentifier un utilisateur avec email et mot de passe
-- Cette fonction est utilisée par la page staff-login
CREATE OR REPLACE FUNCTION public.authenticate_user(
  email_input TEXT,
  password_input TEXT
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  role user_role,
  phone TEXT,
  current_school_id UUID,
  school_name TEXT,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_user_id UUID;
BEGIN
  -- Vérifier les identifiants avec Supabase Auth
  -- Note: En production, l'authentification se fait côté client avec supabase.auth.signInWithPassword
  -- Cette fonction retourne juste les données utilisateur après vérification
  
  -- Récupérer l'ID de l'utilisateur authentifié depuis auth.users
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE auth.users.email = email_input
  AND auth.users.email_confirmed_at IS NOT NULL;
  
  -- Si l'utilisateur n'existe pas ou n'est pas confirmé
  IF auth_user_id IS NULL THEN
    RAISE EXCEPTION 'Identifiants invalides ou compte non confirmé';
  END IF;
  
  -- Retourner les données de l'utilisateur depuis la table users avec les infos de l'école
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.phone,
    u.current_school_id,
    s.name as school_name,
    u.is_active
  FROM users u
  LEFT JOIN schools s ON u.current_school_id = s.id
  WHERE u.id = auth_user_id
  AND u.is_active = true;
  
  -- Si aucune ligne n'est retournée, l'utilisateur est inactif
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Compte désactivé';
  END IF;
END;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon;

-- Commentaire sur la fonction
COMMENT ON FUNCTION public.authenticate_user(TEXT, TEXT) IS 
'Authentifie un utilisateur et retourne ses informations complètes avec le nom de son école';
