-- 🔍 Requêtes de Test pour Diagnostiquer les Problèmes

-- ================================================
-- 1. VÉRIFIER LA STRUCTURE DES TABLES
-- ================================================

-- Vérifier que les tables de packs existent
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('bundle_access_requests', 'school_bundle_subscriptions', 'bundles');
-- Devrait retourner 3 lignes

-- Vérifier les colonnes de la table users
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('full_name', 'first_name', 'last_name');
-- Devrait retourner 1 ligne: full_name

-- Vérifier que is_active existe dans bundles
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'bundles'
  AND column_name = 'is_active';
-- Devrait retourner: is_active | boolean | true

-- ================================================
-- 2. VÉRIFIER LES DONNÉES DE BASE
-- ================================================

-- Compter les écoles
SELECT COUNT(*) as total_schools FROM schools;

-- Compter les utilisateurs par rôle
SELECT role, COUNT(*) as count
FROM users
GROUP BY role
ORDER BY count DESC;

-- Compter les élèves
SELECT COUNT(*) as total_students FROM students;

-- Compter les classes
SELECT COUNT(*) as total_classes FROM classes;

-- ================================================
-- 3. VÉRIFIER LES PACKS
-- ================================================

-- Liste de tous les packs avec leur statut
SELECT id, name, is_active, price_yearly, savings, sort_order
FROM bundles
ORDER BY sort_order;

-- Compter packs actifs vs inactifs
SELECT is_active, COUNT(*) as count
FROM bundles
GROUP BY is_active;

-- ================================================
-- 4. VÉRIFIER LES ABONNEMENTS ET DEMANDES
-- ================================================

-- Compter les abonnements apps actifs
SELECT COUNT(*) as active_app_subscriptions
FROM school_subscriptions
WHERE status IN ('active', 'trial');

-- Compter les abonnements packs actifs
SELECT COUNT(*) as active_bundle_subscriptions
FROM school_bundle_subscriptions
WHERE status IN ('active', 'trial');

-- Compter les demandes d'apps en attente
SELECT COUNT(*) as pending_app_requests
FROM app_access_requests
WHERE status = 'pending';

-- Compter les demandes de packs en attente
SELECT COUNT(*) as pending_bundle_requests
FROM bundle_access_requests
WHERE status = 'pending';

-- Compter les demandes d'inscription en attente
SELECT COUNT(*) as pending_enrollments
FROM enrollment_requests
WHERE status = 'pending';

-- ================================================
-- 5. VÉRIFIER LES DEMANDES DE PACKS (DÉTAILLÉES)
-- ================================================

-- Toutes les demandes de packs avec détails
SELECT
  bar.id,
  bar.status,
  bar.created_at,
  s.name as school_name,
  u_req.full_name as requester_name,
  u_req.email as requester_email,
  b.name as bundle_name,
  b.price_yearly,
  u_rev.full_name as reviewer_name,
  bar.review_message,
  bar.reviewed_at
FROM bundle_access_requests bar
LEFT JOIN schools s ON s.id = bar.school_id
LEFT JOIN users u_req ON u_req.id = bar.requested_by
LEFT JOIN bundles b ON b.id = bar.bundle_id
LEFT JOIN users u_rev ON u_rev.id = bar.reviewed_by
ORDER BY bar.created_at DESC
LIMIT 20;

-- ================================================
-- 6. VÉRIFIER LES FONCTIONS POSTGRESQL
-- ================================================

-- Liste des fonctions de packs
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('activate_bundle', 'approve_bundle_request', 'reject_bundle_request');
-- Devrait retourner 3 lignes (FUNCTION)

-- ================================================
-- 7. TESTER L'ACTIVATION D'UN PACK (SIMULATION)
-- ================================================

-- ATTENTION: NE PAS EXÉCUTER SANS VÉRIFICATION
-- Exemple de test de la fonction activate_bundle (COMMENTÉ):
/*
SELECT activate_bundle(
  p_school_id => '00000000-0000-0000-0000-000000000000'::UUID, -- Remplacer par ID école
  p_bundle_id => 'complete-management', -- Remplacer par ID pack
  p_duration_years => 1
);
*/

-- ================================================
-- 8. VÉRIFIER LES REVENUS
-- ================================================

-- Revenus des apps
SELECT
  COUNT(*) as total_subscriptions,
  SUM(amount_paid) as total_revenue
FROM school_subscriptions
WHERE status IN ('active', 'trial');

-- Revenus des packs
SELECT
  COUNT(*) as total_bundle_subscriptions,
  SUM(amount_paid) as total_bundle_revenue
FROM school_bundle_subscriptions
WHERE status IN ('active', 'trial');

-- Revenus totaux
SELECT
  (
    SELECT COALESCE(SUM(amount_paid), 0)
    FROM school_subscriptions
    WHERE status IN ('active', 'trial')
  ) + (
    SELECT COALESCE(SUM(amount_paid), 0)
    FROM school_bundle_subscriptions
    WHERE status IN ('active', 'trial')
  ) as total_platform_revenue;

-- ================================================
-- 9. VÉRIFIER LES POLITIQUES RLS
-- ================================================

-- Liste des politiques RLS sur bundle_access_requests
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'bundle_access_requests';

-- Liste des politiques RLS sur school_bundle_subscriptions
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'school_bundle_subscriptions';

-- ================================================
-- 10. DIAGNOSTIQUER PROBLÈMES SPÉCIFIQUES
-- ================================================

-- Vérifier si un utilisateur spécifique est admin
-- Remplacer par votre email:
SELECT id, email, role, current_school_id
FROM users
WHERE email = 'admin@edutrack.cm';
-- role devrait être 'admin'

-- Vérifier combien de packs une école a
-- Remplacer par ID école:
/*
SELECT
  b.name as bundle_name,
  sbs.status,
  sbs.activated_at,
  sbs.expires_at,
  sbs.amount_paid
FROM school_bundle_subscriptions sbs
JOIN bundles b ON b.id = sbs.bundle_id
WHERE sbs.school_id = '00000000-0000-0000-0000-000000000000'::UUID
ORDER BY sbs.activated_at DESC;
*/

-- Vérifier les apps d'un pack spécifique
SELECT
  id,
  name,
  app_ids, -- Array d'IDs des apps
  price_yearly,
  savings,
  is_active
FROM bundles
WHERE id = 'complete-management'; -- Remplacer par ID pack

-- ================================================
-- 11. NETTOYER DES DONNÉES DE TEST (SI NÉCESSAIRE)
-- ================================================

-- ⚠️ ATTENTION: Ces requêtes SUPPRIMENT des données
-- Décommenter UNIQUEMENT si vous voulez tout réinitialiser

-- Supprimer toutes les demandes de packs
-- DELETE FROM bundle_access_requests;

-- Supprimer tous les abonnements packs
-- DELETE FROM school_bundle_subscriptions;

-- ================================================
-- FIN DES REQUÊTES DE TEST
-- ================================================
