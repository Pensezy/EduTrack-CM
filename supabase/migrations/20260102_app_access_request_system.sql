-- =====================================================
-- Migration: Système de Demandes d'Accès aux Applications
-- Date: 2026-01-02
-- Description:
--   - Créer table app_access_requests
--   - Workflow: Directeur demande → Admin valide → Abonnement créé
--   - Seules les apps ready/beta peuvent être demandées
-- =====================================================

-- =====================================================
-- 1. CRÉER LA TABLE app_access_requests
-- =====================================================

CREATE TABLE IF NOT EXISTS app_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
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

  -- Contrainte: Une seule demande active par école+app
  CONSTRAINT unique_pending_request UNIQUE (school_id, app_id, status)
);

CREATE INDEX idx_app_requests_school ON app_access_requests(school_id);
CREATE INDEX idx_app_requests_app ON app_access_requests(app_id);
CREATE INDEX idx_app_requests_status ON app_access_requests(status);
CREATE INDEX idx_app_requests_requested_by ON app_access_requests(requested_by);

COMMENT ON TABLE app_access_requests IS 'Demandes d''accès aux applications par les directeurs d''école';
COMMENT ON COLUMN app_access_requests.status IS 'pending: En attente, approved: Approuvée (abonnement créé), rejected: Rejetée';
COMMENT ON COLUMN app_access_requests.request_message IS 'Message optionnel du directeur expliquant la demande';
COMMENT ON COLUMN app_access_requests.review_message IS 'Réponse de l''admin (raison du rejet ou commentaire)';

-- =====================================================
-- 2. TRIGGER updated_at
-- =====================================================

CREATE TRIGGER update_app_access_requests_updated_at
  BEFORE UPDATE ON app_access_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. POLITIQUES RLS
-- =====================================================

ALTER TABLE app_access_requests ENABLE ROW LEVEL SECURITY;

-- Directeurs: Voir uniquement les demandes de leur école
CREATE POLICY "app_requests_select_principal"
  ON app_access_requests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'principal'
        AND users.current_school_id = app_access_requests.school_id
    )
  );

-- Directeurs: Créer des demandes pour leur école (seulement apps ready/beta)
CREATE POLICY "app_requests_insert_principal"
  ON app_access_requests FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'principal'
        AND users.current_school_id = app_access_requests.school_id
    )
    AND EXISTS (
      SELECT 1 FROM apps
      WHERE apps.id = app_access_requests.app_id
        AND apps.development_status IN ('ready', 'beta')
    )
  );

-- Directeurs: Annuler leurs propres demandes en attente
CREATE POLICY "app_requests_update_principal"
  ON app_access_requests FOR UPDATE TO authenticated
  USING (
    requested_by = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    requested_by = auth.uid()
    AND status = 'pending'
  );

-- Admins: Tout voir
CREATE POLICY "app_requests_select_admin"
  ON app_access_requests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Admins: Modifier (approuver/rejeter)
CREATE POLICY "app_requests_update_admin"
  ON app_access_requests FOR UPDATE TO authenticated
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

-- Admins: Supprimer
CREATE POLICY "app_requests_delete_admin"
  ON app_access_requests FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- =====================================================
-- 4. FONCTION: Approuver une demande
-- =====================================================

CREATE OR REPLACE FUNCTION approve_app_request(
  p_request_id UUID,
  p_admin_id UUID,
  p_review_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request app_access_requests%ROWTYPE;
  v_subscription_id UUID;
  v_result JSONB;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent approuver des demandes';
  END IF;

  -- Récupérer la demande
  SELECT * INTO v_request
  FROM app_access_requests
  WHERE id = p_request_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demande introuvable ou déjà traitée';
  END IF;

  -- Vérifier qu'il n'y a pas déjà un abonnement actif
  IF EXISTS (
    SELECT 1 FROM school_subscriptions
    WHERE school_id = v_request.school_id
      AND app_id = v_request.app_id
      AND status IN ('active', 'trial')
  ) THEN
    RAISE EXCEPTION 'Cette école a déjà un abonnement actif pour cette application';
  END IF;

  -- Créer l'abonnement
  INSERT INTO school_subscriptions (
    school_id,
    app_id,
    status,
    activated_at,
    expires_at
  ) VALUES (
    v_request.school_id,
    v_request.app_id,
    'active',
    now(),
    now() + interval '1 year'
  )
  RETURNING id INTO v_subscription_id;

  -- Marquer la demande comme approuvée
  UPDATE app_access_requests
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
    'subscription_id', v_subscription_id,
    'message', 'Demande approuvée et abonnement créé'
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION approve_app_request IS 'Approuve une demande d''accès et crée automatiquement l''abonnement';

-- =====================================================
-- 5. FONCTION: Rejeter une demande
-- =====================================================

CREATE OR REPLACE FUNCTION reject_app_request(
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
  UPDATE app_access_requests
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
    'message', 'Demande rejetée'
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION reject_app_request IS 'Rejette une demande d''accès à une application';

-- =====================================================
-- 6. VUE: Demandes avec détails complets
-- =====================================================

CREATE OR REPLACE VIEW v_app_access_requests AS
SELECT
  r.id,
  r.school_id,
  s.name as school_name,
  s.code as school_code,
  r.app_id,
  a.name as app_name,
  a.icon as app_icon,
  a.development_status,
  a.price_yearly,
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
FROM app_access_requests r
JOIN schools s ON s.id = r.school_id
JOIN apps a ON a.id = r.app_id
JOIN users u ON u.id = r.requested_by
LEFT JOIN users admin ON admin.id = r.reviewed_by;

COMMENT ON VIEW v_app_access_requests IS 'Vue complète des demandes d''accès avec tous les détails (école, app, demandeur, reviewer)';

-- =====================================================
-- 7. VÉRIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ SYSTÈME DE DEMANDES D''ACCÈS AUX APPLICATIONS';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Table créée:';
  RAISE NOTICE '   - app_access_requests (avec RLS)';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Fonctions créées:';
  RAISE NOTICE '   - approve_app_request(request_id, admin_id, message)';
  RAISE NOTICE '   - reject_app_request(request_id, admin_id, message)';
  RAISE NOTICE '';
  RAISE NOTICE '👁️  Vue créée:';
  RAISE NOTICE '   - v_app_access_requests (détails complets)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Politiques RLS:';
  RAISE NOTICE '   - Directeurs: Voir/Créer demandes de leur école';
  RAISE NOTICE '   - Admins: Tout voir, approuver, rejeter';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  WORKFLOW:';
  RAISE NOTICE '   1. Directeur demande accès (apps ready/beta seulement)';
  RAISE NOTICE '   2. Admin voit la demande et peut:';
  RAISE NOTICE '      - Approuver → Crée subscription automatiquement';
  RAISE NOTICE '      - Rejeter → Demande marquée rejected';
  RAISE NOTICE '   3. Directeur reçoit notification du résultat';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration terminée avec succès!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;
