-- ====================================
-- DIAGNOSTIC COMPLET - Verifier ce qui existe vraiment
-- ====================================

-- 1. Verifier si les tables existent
SELECT 
    'TABLES EXISTANTES' as type,
    schemaname,
    tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Verifier si le trigger existe
SELECT 
    'TRIGGERS' as type,
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
   OR event_object_table = 'users';

-- 3. Verifier si la fonction trigger existe
SELECT 
    'FUNCTIONS' as type,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%handle_new_user%';

-- 4. Verifier combien d'utilisateurs existent
SELECT 
    'USERS COUNT' as type,
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM public.users) as public_users;

-- 5. Verifier combien d'ecoles existent
SELECT 
    'SCHOOLS COUNT' as type,
    COUNT(*) as total
FROM public.schools;

-- 6. Verifier le RLS
SELECT 
    'RLS STATUS' as type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'schools')
ORDER BY tablename;
