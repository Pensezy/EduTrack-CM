-- =====================================================
-- Migration: Système de Gestion des Packs (Bundles)
-- Date: 2026-01-02
-- Description:
--   - Ajouter is_active aux bundles (admin peut activer/désactiver)
--   - Table bundle_access_requests (demandes de packs)
--   - Table school_bundle_subscriptions (abonnements aux packs)
--   - Fonction activate_bundle (active pack + toutes ses apps automatiquement)
--   - Workflow: Directeur demande → Admin approuve → Pack + Apps activés
-- =====================================================

-- =====================================================
-- 1. AJOUTER is_active AUX BUNDLES
-- =====================================================

ALTER TABLE bundles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

COMMENT ON COLUMN bundles.is_active IS 'true = Pack visible dans le catalogue, false = Pack masqué';

-- Par défaut, tous les packs existants sont actifs
UPDATE bundles SET is_active = true WHERE is_active IS NULL;

-- =====================================================
-- 2. TABLE: bundle_access_requests
-- =====================================================

CREATE TABLE IF NOT EXISTS bundle_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  bundle_id TEXT NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Message de demande du directeur
  request_message TEXT,

  -- Réponse de l'admin
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  review_message TEXT,
  reviewed_at TIMESTAMPTZ,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Contrainte: Une seule demande pending par école+bundle
  CONSTRAINT unique_pending_bundle_request UNIQUE (school_id, bundle_id, status)
);

CREATE INDEX idx_bundle_requests_school ON bundle_access_requests(school_id);
CREATE INDEX idx_bundle_requests_bundle ON bundle_access_requests(bundle_id);
CREATE INDEX idx_bundle_requests_status ON bundle_access_requests(status);
CREATE INDEX idx_bundle_requests_requested_by ON bundle_access_requests(requested_by);

COMMENT ON TABLE bundle_access_requests IS 'Demandes d''accès aux packs par les directeurs d''école';

-- Trigger updated_at
CREATE TRIGGER update_bundle_access_requests_updated_at
  BEFORE UPDATE ON bundle_access_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. TABLE: school_bundle_subscriptions
-- =====================================================

CREATE TABLE IF NOT EXISTS school_bundle_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  bundle_id TEXT NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trial', 'expired', 'cancelled')),

  -- Dates
  activated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  trial_ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Paiement
  amount_paid INTEGER DEFAULT 0,
  payment_method TEXT,
  payment_reference TEXT,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Contrainte: Un seul abonnement actif par école+bundle
  CONSTRAINT unique_active_bundle_subscription UNIQUE (school_id, bundle_id)
);

CREATE INDEX idx_bundle_subs_school ON school_bundle_subscriptions(school_id);
CREATE INDEX idx_bundle_subs_bundle ON school_bundle_subscriptions(bundle_id);
CREATE INDEX idx_bundle_subs_status ON school_bundle_subscriptions(status);
CREATE INDEX idx_bundle_subs_expires ON school_bundle_subscriptions(expires_at);

COMMENT ON TABLE school_bundle_subscriptions IS 'Abonnements des écoles aux packs (bundles)';

-- Trigger updated_at
CREATE TRIGGER update_school_bundle_subscriptions_updated_at
  BEFORE UPDATE ON school_bundle_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. POLITIQUES RLS - bundle_access_requests
-- =====================================================

ALTER TABLE bundle_access_requests ENABLE ROW LEVEL SECURITY;

-- Directeurs: Voir leurs demandes
CREATE POLICY "bundle_requests_select_principal"
  ON bundle_access_requests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'principal'
        AND users.current_school_id = bundle_access_requests.school_id
    )
  );

-- Directeurs: Créer des demandes
CREATE POLICY "bundle_requests_insert_principal"
  ON bundle_access_requests FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'principal'
        AND users.current_school_id = bundle_access_requests.school_id
    )
    AND EXISTS (
      SELECT 1 FROM bundles
      WHERE bundles.id = bundle_access_requests.bundle_id
        AND bundles.is_active = true
    )
  );

-- Admins: Tout voir
CREATE POLICY "bundle_requests_select_admin"
  ON bundle_access_requests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Admins: Modifier
CREATE POLICY "bundle_requests_update_admin"
  ON bundle_access_requests FOR UPDATE TO authenticated
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

-- =====================================================
-- 5. POLITIQUES RLS - school_bundle_subscriptions
-- =====================================================

ALTER TABLE school_bundle_subscriptions ENABLE ROW LEVEL SECURITY;

-- Tous: Voir les abonnements de leur école
CREATE POLICY "bundle_subs_select_by_school"
  ON school_bundle_subscriptions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND (
          users.role = 'admin'
          OR users.current_school_id = school_bundle_subscriptions.school_id
        )
    )
  );

-- Admins: Tout modifier
CREATE POLICY "bundle_subs_all_admin"
  ON school_bundle_subscriptions FOR ALL TO authenticated
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

-- =====================================================
-- 6. FONCTION: Activer un pack (avec toutes ses apps)
-- =====================================================

CREATE OR REPLACE FUNCTION activate_bundle(
  p_school_id UUID,
  p_bundle_id TEXT,
  p_duration_years INTEGER DEFAULT 1,
  p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bundle bundles%ROWTYPE;
  v_app_id TEXT;
  v_subscription_id UUID;
  v_apps_activated INTEGER := 0;
  v_result JSONB;
BEGIN
  -- Récupérer le bundle
  SELECT * INTO v_bundle FROM bundles WHERE id = p_bundle_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bundle introuvable: %', p_bundle_id;
  END IF;

  -- Vérifier si le bundle est actif
  IF NOT v_bundle.is_active THEN
    RAISE EXCEPTION 'Ce pack n''est pas disponible actuellement';
  END IF;

  -- Vérifier si l'école a déjà un abonnement actif
  IF EXISTS (
    SELECT 1 FROM school_bundle_subscriptions
    WHERE school_id = p_school_id
      AND bundle_id = p_bundle_id
      AND status IN ('active', 'trial')
  ) THEN
    RAISE EXCEPTION 'Cette école a déjà un abonnement actif pour ce pack';
  END IF;

  -- Créer l'abonnement au bundle
  INSERT INTO school_bundle_subscriptions (
    school_id,
    bundle_id,
    status,
    activated_at,
    expires_at,
    amount_paid
  ) VALUES (
    p_school_id,
    p_bundle_id,
    'active',
    now(),
    now() + (p_duration_years || ' years')::INTERVAL,
    v_bundle.price_yearly
  )
  RETURNING id INTO v_subscription_id;

  -- Activer automatiquement toutes les apps du bundle
  FOREACH v_app_id IN ARRAY v_bundle.app_ids
  LOOP
    -- Vérifier si l'app existe déjà
    IF NOT EXISTS (
      SELECT 1 FROM school_subscriptions
      WHERE school_id = p_school_id
        AND app_id = v_app_id
        AND status IN ('active', 'trial')
    ) THEN
      -- Créer l'abonnement à l'app
      INSERT INTO school_subscriptions (
        school_id,
        app_id,
        status,
        activated_at,
        expires_at
      ) VALUES (
        p_school_id,
        v_app_id,
        'active',
        now(),
        now() + (p_duration_years || ' years')::INTERVAL
      );

      v_apps_activated := v_apps_activated + 1;
    END IF;
  END LOOP;

  -- Retourner le résultat
  v_result := jsonb_build_object(
    'success', true,
    'bundle_subscription_id', v_subscription_id,
    'bundle_id', p_bundle_id,
    'bundle_name', v_bundle.name,
    'apps_activated', v_apps_activated,
    'total_apps', array_length(v_bundle.app_ids, 1),
    'expires_at', now() + (p_duration_years || ' years')::INTERVAL,
    'message', format('Pack "%s" activé avec %s applications', v_bundle.name, v_apps_activated)
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION activate_bundle IS 'Active un pack pour une école et active automatiquement toutes les applications incluses';

-- =====================================================
-- 7. FONCTION: Approuver demande de pack
-- =====================================================

CREATE OR REPLACE FUNCTION approve_bundle_request(
  p_request_id UUID,
  p_admin_id UUID,
  p_review_message TEXT DEFAULT NULL,
  p_duration_years INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request bundle_access_requests%ROWTYPE;
  v_activation_result JSONB;
  v_result JSONB;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent approuver des demandes';
  END IF;

  -- Récupérer la demande
  SELECT * INTO v_request
  FROM bundle_access_requests
  WHERE id = p_request_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demande introuvable ou déjà traitée';
  END IF;

  -- Activer le bundle (qui active aussi toutes les apps)
  v_activation_result := activate_bundle(
    v_request.school_id,
    v_request.bundle_id,
    p_duration_years,
    p_admin_id
  );

  -- Marquer la demande comme approuvée
  UPDATE bundle_access_requests
  SET
    status = 'approved',
    reviewed_by = p_admin_id,
    review_message = p_review_message,
    reviewed_at = now(),
    updated_at = now()
  WHERE id = p_request_id;

  -- Retourner le résultat
  v_result := jsonb_build_object(
    'success', true,
    'request_id', p_request_id,
    'activation', v_activation_result,
    'message', 'Demande approuvée et pack activé avec toutes ses applications'
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION approve_bundle_request IS 'Approuve une demande de pack et active automatiquement le pack + toutes ses apps';

-- =====================================================
-- 8. FONCTION: Rejeter demande de pack
-- =====================================================

CREATE OR REPLACE FUNCTION reject_bundle_request(
  p_request_id UUID,
  p_admin_id UUID,
  p_review_message TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent rejeter des demandes';
  END IF;

  -- Marquer la demande comme rejetée
  UPDATE bundle_access_requests
  SET
    status = 'rejected',
    reviewed_by = p_admin_id,
    review_message = COALESCE(p_review_message, 'Demande rejetée'),
    reviewed_at = now(),
    updated_at = now()
  WHERE id = p_request_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demande introuvable ou déjà traitée';
  END IF;

  -- Retourner le résultat
  v_result := jsonb_build_object(
    'success', true,
    'request_id', p_request_id,
    'message', 'Demande de pack rejetée'
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION reject_bundle_request IS 'Rejette une demande d''accès à un pack';

-- =====================================================
-- 9. VUE: Demandes de packs avec détails
-- =====================================================

CREATE OR REPLACE VIEW v_bundle_access_requests AS
SELECT
  r.id,
  r.school_id,
  s.name as school_name,
  s.code as school_code,
  r.bundle_id,
  b.name as bundle_name,
  b.price_yearly,
  b.savings,
  b.is_active as bundle_is_active,
  r.requested_by,
  u.full_name as requester_name,
  u.email as requester_email,
  r.status,
  r.request_message,
  r.reviewed_by,
  admin.full_name as reviewer_name,
  r.review_message,
  r.reviewed_at,
  r.created_at,
  r.updated_at
FROM bundle_access_requests r
JOIN schools s ON s.id = r.school_id
JOIN bundles b ON b.id = r.bundle_id
JOIN users u ON u.id = r.requested_by
LEFT JOIN users admin ON admin.id = r.reviewed_by;

COMMENT ON VIEW v_bundle_access_requests IS 'Vue complète des demandes d''accès aux packs avec tous les détails';

-- =====================================================
-- 10. VUE: Catalogue de packs (seulement actifs)
-- =====================================================

DROP VIEW IF EXISTS v_bundles_catalog CASCADE;

CREATE OR REPLACE VIEW v_bundles_catalog AS
SELECT
  b.*,
  CASE
    WHEN b.price_yearly > 0 THEN b.price_yearly || ' FCFA/an'
    ELSE 'Prix sur demande'
  END as price_display,
  CASE
    WHEN b.savings > 0 THEN 'Économisez ' || b.savings || ' FCFA'
    ELSE NULL
  END as savings_display
FROM bundles b
WHERE b.is_active = true
ORDER BY b.sort_order;

COMMENT ON VIEW v_bundles_catalog IS 'Catalogue des packs actifs uniquement';

-- =====================================================
-- 11. VÉRIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ SYSTÈME DE GESTION DES PACKS (BUNDLES)';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Tables créées:';
  RAISE NOTICE '   - bundle_access_requests (demandes de packs)';
  RAISE NOTICE '   - school_bundle_subscriptions (abonnements aux packs)';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Fonctions créées:';
  RAISE NOTICE '   - activate_bundle(school, bundle, duration)';
  RAISE NOTICE '   - approve_bundle_request(request_id, admin_id)';
  RAISE NOTICE '   - reject_bundle_request(request_id, admin_id)';
  RAISE NOTICE '';
  RAISE NOTICE '👁️  Vues créées:';
  RAISE NOTICE '   - v_bundle_access_requests (détails demandes)';
  RAISE NOTICE '   - v_bundles_catalog (packs actifs uniquement)';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Fonctionnalités:';
  RAISE NOTICE '   - Admin peut activer/désactiver packs (is_active)';
  RAISE NOTICE '   - Directeur demande pack → Admin approuve';
  RAISE NOTICE '   - Quand pack activé → Toutes apps activées auto';
  RAISE NOTICE '   - Compte à rebours (expires_at) pour pack et apps';
  RAISE NOTICE '   - Admin peut donner pack directement';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration terminée avec succès!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;
