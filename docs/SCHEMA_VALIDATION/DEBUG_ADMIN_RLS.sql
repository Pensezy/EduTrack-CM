-- ============================================================================
-- Debug : Pourquoi l'admin ne voit pas les apps ?
-- ============================================================================

-- Vérifier l'utilisateur admin actuel
SELECT
  '👤 UTILISATEUR ACTUEL' as section,
  auth.uid() as user_id,
  auth.role() as auth_role;

SELECT
  id,
  email,
  role,
  current_school_id
FROM users
WHERE id = auth.uid();

-- Vérifier TOUTES les politiques RLS sur apps
SELECT
  '🔒 POLITIQUES RLS APPS' as section;

SELECT
  policyname,
  cmd as command,
  permissive,
  roles,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'apps'
ORDER BY cmd, policyname;

-- Tester si l'admin peut lire les apps
SELECT
  '📊 TEST LECTURE APPS PAR ADMIN' as section;

-- Si cette requête retourne 0 lignes malgré 9 apps en BDD,
-- c'est que les politiques RLS bloquent l'admin
SELECT COUNT(*) as apps_visibles_par_admin
FROM apps;

-- Détail des apps (si visible)
SELECT
  id,
  name,
  status
FROM apps
LIMIT 3;

-- Vérifier si l'admin est bien reconnu comme admin
SELECT
  '✅ VÉRIFICATION RÔLE ADMIN' as section;

SELECT
  CASE
    WHEN auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    THEN 'OUI - Admin détecté'
    ELSE 'NON - Admin non détecté'
  END as admin_detecte;

-- Liste tous les admins
SELECT
  id,
  email,
  role
FROM users
WHERE role = 'admin';
