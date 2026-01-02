-- ============================================================================
-- Fix RLS Permissions pour Apps et Bundles - VERSION 2
-- ============================================================================
-- Problème : L'admin ne peut pas voir les apps malgré les politiques
-- Cause : Anciennes politiques restrictives non supprimées + conflit de politiques
-- Solution : TOUT supprimer et recréer proprement
-- ============================================================================

-- ============================================================================
-- DÉSACTIVER TEMPORAIREMENT RLS (pour nettoyer)
-- ============================================================================

-- Sauvegarder l'état RLS actuel
DO $$
BEGIN
  RAISE NOTICE '🔧 Nettoyage des anciennes politiques RLS...';
END $$; 

-- ============================================================================
-- TABLE: apps - NETTOYAGE COMPLET
-- ============================================================================

-- Supprimer TOUTES les politiques existantes sur apps
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'apps'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON apps', pol.policyname);
    RAISE NOTICE '  ❌ Supprimé : %', pol.policyname;
  END LOOP;
END $$;

-- Créer les nouvelles politiques
-- LECTURE : Tous les utilisateurs authentifiés
CREATE POLICY "apps_select_authenticated"
  ON apps FOR SELECT
  TO authenticated
  USING (true);

-- MODIFICATION : Admins uniquement
CREATE POLICY "apps_all_admin"
  ON apps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DO $$
BEGIN
  RAISE NOTICE '  ✅ apps_select_authenticated créée';
  RAISE NOTICE '  ✅ apps_all_admin créée';
END $$;

-- ============================================================================
-- TABLE: bundles - NETTOYAGE COMPLET
-- ============================================================================

-- Supprimer TOUTES les politiques existantes sur bundles
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'bundles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON bundles', pol.policyname);
    RAISE NOTICE '  ❌ Supprimé : %', pol.policyname;
  END LOOP;
END $$;

-- Créer les nouvelles politiques
-- LECTURE : Tous les utilisateurs authentifiés
CREATE POLICY "bundles_select_authenticated"
  ON bundles FOR SELECT
  TO authenticated
  USING (true);

-- MODIFICATION : Admins uniquement
CREATE POLICY "bundles_all_admin"
  ON bundles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DO $$
BEGIN
  RAISE NOTICE '  ✅ bundles_select_authenticated créée';
  RAISE NOTICE '  ✅ bundles_all_admin créée';
END $$;

-- ============================================================================
-- TABLE: school_subscriptions - NETTOYAGE COMPLET
-- ============================================================================

-- Supprimer TOUTES les politiques existantes
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'school_subscriptions'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON school_subscriptions', pol.policyname);
    RAISE NOTICE '  ❌ Supprimé : %', pol.policyname;
  END LOOP;
END $$;

-- LECTURE : Selon rôle
CREATE POLICY "subscriptions_select_by_role"
  ON school_subscriptions FOR SELECT
  TO authenticated
  USING (
    -- Admin voit tout
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
    OR
    -- Directeur voit les abonnements de son école
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'principal'
      AND users.current_school_id = school_subscriptions.school_id
    )
    OR
    -- Autres utilisateurs voient les abonnements de leur école
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.current_school_id = school_subscriptions.school_id
    )
  );

-- MODIFICATION : Admins uniquement
CREATE POLICY "subscriptions_all_admin"
  ON school_subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DO $$
BEGIN
  RAISE NOTICE '  ✅ subscriptions_select_by_role créée';
  RAISE NOTICE '  ✅ subscriptions_all_admin créée';
END $$;

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

DO $$
DECLARE
  apps_count INTEGER;
  bundles_count INTEGER;
  subs_count INTEGER;
BEGIN
  -- Compter les données (en tant que superuser, pas de RLS)
  SELECT COUNT(*) INTO apps_count FROM apps;
  SELECT COUNT(*) INTO bundles_count FROM bundles;
  SELECT COUNT(*) INTO subs_count FROM school_subscriptions;

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ POLITIQUES RLS RECRÉÉES AVEC SUCCÈS!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Données disponibles :';
  RAISE NOTICE '   - apps : % lignes', apps_count;
  RAISE NOTICE '   - bundles : % lignes', bundles_count;
  RAISE NOTICE '   - school_subscriptions : % lignes', subs_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Politiques par table :';
  RAISE NOTICE '   - apps : 2 politiques (SELECT public, ALL admin)';
  RAISE NOTICE '   - bundles : 2 politiques (SELECT public, ALL admin)';
  RAISE NOTICE '   - school_subscriptions : 2 politiques (SELECT by role, ALL admin)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Permissions :';
  RAISE NOTICE '   - LECTURE apps/bundles : Tous les utilisateurs authentifiés';
  RAISE NOTICE '   - LECTURE subscriptions : Selon rôle (admin=tout, autres=leur école)';
  RAISE NOTICE '   - MODIFICATION : Admins uniquement';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Prochaine étape : Rafraîchir l''application (F5)';
  RAISE NOTICE '';
END $$;
