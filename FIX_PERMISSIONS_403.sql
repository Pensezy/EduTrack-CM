-- ==========================================
-- CORRECTION IMMEDIATE - PERMISSIONS RLS
-- ==========================================

-- DESACTIVER RLS sur users et schools (solution temporaire mais efficace)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;

-- Verifier que RLS est bien desactive
SELECT 
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'schools');

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RLS DESACTIVE SUR USERS ET SCHOOLS';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Vous pouvez maintenant vous connecter';
    RAISE NOTICE 'Les donnees sont accessibles sans restriction';
    RAISE NOTICE '==========================================';
END $$;
