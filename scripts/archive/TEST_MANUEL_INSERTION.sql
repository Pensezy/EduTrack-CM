-- ==========================================
-- TEST MANUEL - SANS TRIGGER
-- ==========================================
-- Testez manuellement l'insertion pour voir quelle colonne manque

-- Test 1: Inserer dans users
DO $$
DECLARE
    test_id uuid := gen_random_uuid();
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
        test_id,
        'test@example.com',
        'Test User',
        '+237600000000',
        'principal',
        true,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'User inserted successfully with ID: %', test_id;
    
    -- Supprimer le test
    DELETE FROM public.users WHERE id = test_id;
    RAISE NOTICE 'Test user deleted';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR inserting user: %', SQLERRM;
END $$;

-- Test 2: Inserer dans schools
DO $$
DECLARE
    test_school_id uuid := gen_random_uuid();
    test_user_id uuid := gen_random_uuid();
BEGIN
    -- D'abord creer un user
    INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
    VALUES (test_user_id, 'testdirector@example.com', 'Test Director', 'principal', true, NOW(), NOW());
    
    -- Puis creer l'ecole
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
        'TEST-2025-0001',
        'public',
        'Test Director',
        test_user_id,
        '+237600000000',
        'testdirector@example.com',
        'Test Address',
        'Yaounde',
        'Cameroun',
        'active',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'School inserted successfully with ID: %', test_school_id;
    
    -- Supprimer le test
    DELETE FROM public.schools WHERE id = test_school_id;
    DELETE FROM public.users WHERE id = test_user_id;
    RAISE NOTICE 'Test school and user deleted';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR inserting school: %', SQLERRM;
    -- Essayer de nettoyer
    DELETE FROM public.schools WHERE id = test_school_id;
    DELETE FROM public.users WHERE id = test_user_id;
END $$;

-- Test 3: Lister les colonnes manquantes potentielles
SELECT 
    'users' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'schools' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'schools' AND table_schema = 'public'
ORDER BY ordinal_position;
