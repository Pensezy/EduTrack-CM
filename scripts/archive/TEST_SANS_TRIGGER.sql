-- ==========================================
-- TEST : DESACTIVER LE TRIGGER TEMPORAIREMENT
-- ==========================================

-- 1. Desactiver le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'TRIGGER DESACTIVE';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Testez maintenant la creation de compte.';
    RAISE NOTICE 'Si ca marche = le probleme vient du trigger SQL';
    RAISE NOTICE 'Si ca ne marche pas = le probleme vient d''ailleurs';
    RAISE NOTICE '==========================================';
END $$;

-- Pour reactiver le trigger plus tard, executez :
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW
--     EXECUTE FUNCTION public.handle_new_user_automatic();
