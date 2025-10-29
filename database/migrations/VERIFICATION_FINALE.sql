-- ====================================
-- VÉRIFICATION FINALE DU SYSTÈME DE TRAÇABILITÉ
-- ====================================
-- Exécute ces requêtes pour vérifier que tout fonctionne

-- 1. Vérifier que toutes les colonnes de traçabilité existent dans users
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('created_by_user_id', 'deactivated_at', 'deactivated_by_user_id');

-- 2. Vérifier que toutes les colonnes de traçabilité existent dans students
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'students' 
  AND column_name IN ('created_by_user_id', 'updated_by_user_id');

-- 3. Vérifier que toutes les colonnes existent dans payments
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'payments' 
  AND column_name IN ('payment_type_id', 'created_by_user_id', 'updated_by_user_id', 
                      'payment_method', 'reference_number', 'notes', 'status', 'payment_date');

-- 4. Vérifier que toutes les FK existent pour students
SELECT conname as constraint_name
FROM pg_constraint 
WHERE conrelid = 'students'::regclass 
  AND contype = 'f'
  AND conname IN ('fk_students_created_by', 'fk_students_updated_by');

-- 5. Vérifier que toutes les FK existent pour payments
SELECT conname as constraint_name
FROM pg_constraint 
WHERE conrelid = 'payments'::regclass 
  AND contype = 'f'
  AND conname IN ('payments_payment_type_id_fkey', 'payments_created_by_user_id_fkey', 
                  'payments_updated_by_user_id_fkey');

-- 6. Vérifier que les tables ont été créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('payment_types', 'justifications', 'student_cards', 'communications');

-- 7. Vérifier que les fonctions existent
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('deactivate_user_account', 'reactivate_user_account');

-- 8. Vérifier que les politiques RLS existent
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('payment_types', 'payments', 'justifications', 'student_cards', 'communications');

-- Si TOUT est OK, affiche un résumé
SELECT 
    'Système de traçabilité installé avec succès!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('payment_types', 'justifications', 'student_cards', 'communications')) as nouvelles_tables,
    (SELECT COUNT(*) FROM pg_constraint WHERE conname LIKE '%created_by%' OR conname LIKE '%updated_by%' OR conname LIKE '%deactivated_by%') as contraintes_tracabilite,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name IN ('deactivate_user_account', 'reactivate_user_account')) as fonctions_gestion_comptes;
