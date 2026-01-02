-- ============================================================================
-- Fix RLS Permissions pour Apps et Bundles
-- ============================================================================
-- Problème : Les tables apps et bundles sont vides côté frontend
-- Cause : Politiques RLS trop restrictives
-- Solution : Permettre la lecture pour tous les utilisateurs authentifiés
-- ============================================================================

-- ============================================================================
-- TABLE: apps
-- ============================================================================

-- Supprimer les anciennes politiques de lecture
DROP POLICY IF EXISTS "Apps visible par tous" ON apps;
DROP POLICY IF EXISTS "Admins can read all apps" ON apps;
DROP POLICY IF EXISTS "Users can read active apps" ON apps;

-- Politique de LECTURE : Tous les utilisateurs authentifiés peuvent voir toutes les apps
CREATE POLICY "Authenticated users can read all apps"
  ON apps FOR SELECT
  TO authenticated
  USING (true);

-- Politique de MODIFICATION : Seuls les admins peuvent modifier
DROP POLICY IF EXISTS "Only admins can modify apps" ON apps;
CREATE POLICY "Only admins can modify apps"
  ON apps FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: bundles
-- ============================================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Bundles visible par tous" ON bundles;
DROP POLICY IF EXISTS "Admins can read all bundles" ON bundles;
DROP POLICY IF EXISTS "Users can read active bundles" ON bundles;

-- Politique de LECTURE : Tous les utilisateurs authentifiés peuvent voir tous les bundles
CREATE POLICY "Authenticated users can read all bundles"
  ON bundles FOR SELECT
  TO authenticated
  USING (true);

-- Politique de MODIFICATION : Seuls les admins peuvent modifier
DROP POLICY IF EXISTS "Only admins can modify bundles" ON bundles;
CREATE POLICY "Only admins can modify bundles"
  ON bundles FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: school_subscriptions
-- ============================================================================

-- Politique de LECTURE : Admin voit tout, directeur voit son école
DROP POLICY IF EXISTS "Users can read their school subscriptions" ON school_subscriptions;
CREATE POLICY "Users can read their school subscriptions"
  ON school_subscriptions FOR SELECT
  TO authenticated
  USING (
    -- Admin voit tout
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    OR
    -- Directeur voit les abonnements de son école
    (
      school_id IN (
        SELECT current_school_id FROM users
        WHERE id = auth.uid() AND role = 'principal'
      )
    )
    OR
    -- Utilisateurs voient les abonnements de leur école
    (
      school_id IN (
        SELECT current_school_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Politique de MODIFICATION : Seuls les admins
DROP POLICY IF EXISTS "Only admins can modify subscriptions" ON school_subscriptions;
CREATE POLICY "Only admins can modify subscriptions"
  ON school_subscriptions FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- ============================================================================
-- Vérification
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ POLITIQUES RLS CORRIGÉES!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Tables mises à jour :';
  RAISE NOTICE '   - apps (lecture : tous, modification : admins)';
  RAISE NOTICE '   - bundles (lecture : tous, modification : admins)';
  RAISE NOTICE '   - school_subscriptions (lecture selon rôle, modification : admins)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Permissions :';
  RAISE NOTICE '   - Lecture : Tous les utilisateurs authentifiés';
  RAISE NOTICE '   - Modification : Admins uniquement';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Prochaine étape : Rafraîchir l''application';
  RAISE NOTICE '';
END $$;
