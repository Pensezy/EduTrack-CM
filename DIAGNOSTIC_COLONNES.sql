-- ==========================================
-- DIAGNOSTIC COLONNES MANQUANTES
-- ==========================================

-- Verifier les colonnes de users
SELECT 
    'USERS TABLE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Verifier les colonnes de schools
SELECT 
    'SCHOOLS TABLE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'schools'
ORDER BY ordinal_position;

-- Test d'insertion manuelle dans users (pour voir quelle colonne plante)
DO $$
DECLARE
    test_id uuid := gen_random_uuid();
BEGIN
    -- Essayer l'insertion EXACTE du trigger
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
        test_id,
        'test-trigger@example.com',
        'Test Trigger',
        '+237600000000',
        'principal',
        true,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'SUCCESS: Users insertion works!';
    
    -- Nettoyer
    DELETE FROM public.users WHERE id = test_id;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: %', SQLERRM;
    RAISE NOTICE 'DETAIL: %', SQLSTATE;
END $$;

-- Test d'insertion manuelle dans schools
DO $$
DECLARE
    test_school_id uuid := gen_random_uuid();
    test_user_id uuid := gen_random_uuid();
BEGIN
    -- Creer un user temporaire
    INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
    VALUES (test_user_id, 'test-school@example.com', 'Test School Director', 'principal', true, NOW(), NOW());
    
    -- Essayer l'insertion EXACTE du trigger
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
        test_school_id,
        'Test School',
        'TEST-2025-9999',
        'public',
        'Test School Director',
        test_user_id,
        '+237600000000',
        'test-school@example.com',
        'Test Address',
        'Yaounde',
        'Cameroun',
        'active',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'SUCCESS: Schools insertion works!';
    
    -- Nettoyer
    DELETE FROM public.schools WHERE id = test_school_id;
    DELETE FROM public.users WHERE id = test_user_id;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: %', SQLERRM;
    RAISE NOTICE 'DETAIL: %', SQLSTATE;
    
    -- Essayer de nettoyer
    BEGIN
        DELETE FROM public.schools WHERE id = test_school_id;
        DELETE FROM public.users WHERE id = test_user_id;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
END $$;
