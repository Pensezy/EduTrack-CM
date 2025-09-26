-- Script de vérification après migration complète
-- À exécuter dans l'éditeur SQL de Supabase pour vérifier que tout fonctionne

-- 1. Vérifier que toutes les tables existent
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Vérifier les types ENUM créés
SELECT typname as enum_name, enumlabel as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('school_type', 'user_role', 'payment_status', 'attendance_status', 'document_type', 'notification_type')
ORDER BY t.typname, e.enumsortorder;

-- 3. Vérifier les fonctions créées
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_principal_school', 'get_principal_details', 'list_principals', 'get_principals_stats')
ORDER BY routine_name;

-- 4. Vérifier la vue des directeurs
SELECT * FROM information_schema.views WHERE table_name = 'principals_view';

-- 5. Vérifier les triggers de synchronisation
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' OR event_object_schema = 'auth'
ORDER BY event_object_table, trigger_name;

-- 6. Test de la fonction create_principal_school (nécessite d'abord un utilisateur auth)
-- Cette requête va échouer car pas d'utilisateur auth, mais c'est normal
-- SELECT create_principal_school('Test Director', 'test@example.com', '+237123456789', 'Test School', 'primaire', '123 Test St', 'Yaoundé', 'Cameroun', ARRAY['CP', 'CE1']);

-- 7. Vérifier la structure des principales tables
\d public.schools;
\d public.users;
\d public.students;

-- 8. Vérifier les index créés
SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Message de confirmation
SELECT 'Base de données EduTrack-CM prête et opérationnelle !' as status;