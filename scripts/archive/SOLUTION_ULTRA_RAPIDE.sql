-- ==========================================
-- SOLUTION ULTRA-RAPIDE - DESACTIVER RLS
-- ==========================================
-- Ceci desactive RLS temporairement pour tester

-- Desactiver RLS sur users et schools
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Fonction trigger MINIMALISTE (sans erreur possible)
CREATE OR REPLACE FUNCTION public.handle_new_user_automatic()
RETURNS TRIGGER AS $$
BEGIN
    -- Juste inserer dans users, rien d'autre
    INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Creer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_automatic();

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'CONFIGURATION ULTRA-RAPIDE APPLIQUEE';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'RLS desactive sur users et schools';
    RAISE NOTICE 'Trigger minimaliste cree';
    RAISE NOTICE 'Vous pouvez maintenant tester la creation de compte';
    RAISE NOTICE '===========================================';
END $$;
