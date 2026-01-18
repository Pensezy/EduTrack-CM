-- ============================================================================
-- Liste TOUTES les politiques RLS actuelles
-- ============================================================================

-- Apps policies
SELECT
  'APPS' as table_name,
  policyname,
  cmd,
  permissive,
  roles,
  SUBSTRING(qual::text, 1, 100) as using_short,
  SUBSTRING(with_check::text, 1, 100) as check_short
FROM pg_policies
WHERE tablename = 'apps'
ORDER BY cmd;

-- Bundles policies
SELECT
  'BUNDLES' as table_name,
  policyname,
  cmd,
  permissive,
  roles,
  SUBSTRING(qual::text, 1, 100) as using_short,
  SUBSTRING(with_check::text, 1, 100) as check_short
FROM pg_policies
WHERE tablename = 'bundles'
ORDER BY cmd;

-- School_subscriptions policies
SELECT
  'SCHOOL_SUBSCRIPTIONS' as table_name,
  policyname,
  cmd,
  permissive,
  roles,
  SUBSTRING(qual::text, 1, 100) as using_short,
  SUBSTRING(with_check::text, 1, 100) as check_short
FROM pg_policies
WHERE tablename = 'school_subscriptions'
ORDER BY cmd;
