-- ============================================================================
-- Migration: Système de demande de création d'établissements
-- Date: 2026-01-04
-- Description: Table pour gérer les demandes de création d'établissements
--              Seuls les utilisateurs avec abonnement payant peuvent faire des demandes
-- ============================================================================

-- 1. Créer la table school_creation_requests
CREATE TABLE IF NOT EXISTS school_creation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Informations de l'établissement demandé
  school_name TEXT NOT NULL,
  school_code TEXT NOT NULL,
  school_type TEXT NOT NULL CHECK (school_type IN ('maternelle', 'primaire', 'college', 'lycee', 'college_lycee')),
  ownership_type TEXT NOT NULL CHECK (ownership_type IN ('private', 'public')),

  -- Localisation
  region TEXT NOT NULL,
  department TEXT,
  city TEXT NOT NULL,
  address TEXT,

  -- Contact
  phone TEXT,
  email TEXT,

  -- Directeur
  director_full_name TEXT NOT NULL,
  director_phone TEXT,
  director_email TEXT NOT NULL,

  -- Justification
  justification TEXT NOT NULL,

  -- Statut et traitement
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by_user_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_school_id UUID REFERENCES schools(id),

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contraintes
  UNIQUE (school_code)
);

-- 2. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_school_requests_requester ON school_creation_requests(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_school_requests_status ON school_creation_requests(status);
CREATE INDEX IF NOT EXISTS idx_school_requests_created_at ON school_creation_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_school_requests_region ON school_creation_requests(region);

-- 3. Enable Row Level Security
ALTER TABLE school_creation_requests ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Les utilisateurs peuvent voir leurs propres demandes
CREATE POLICY "Utilisateurs voient leurs demandes"
ON school_creation_requests FOR SELECT
USING (
  requester_user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Policy: Seuls les utilisateurs avec abonnement payant actif peuvent créer des demandes
CREATE POLICY "Création de demande avec abonnement payant"
ON school_creation_requests FOR INSERT
WITH CHECK (
  -- L'utilisateur doit être connecté
  auth.uid() = requester_user_id
  AND
  -- L'utilisateur doit avoir un abonnement payant actif (non core, non expiré)
  (
    -- Les admins peuvent toujours créer
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    -- Ou avoir un abonnement payant actif
    EXISTS (
      SELECT 1 FROM school_subscriptions
      WHERE status IN ('trial', 'active')
        AND app_id != 'core'
        AND (expires_at IS NULL OR expires_at > NOW())
    )
  )
);

-- 6. Policy: Seuls les admins peuvent mettre à jour les demandes (approuver/rejeter)
CREATE POLICY "Admins modifient les demandes"
ON school_creation_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 7. Policy: Seuls les admins peuvent supprimer les demandes
CREATE POLICY "Admins suppriment les demandes"
ON school_creation_requests FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 8. Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_school_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_school_requests_updated_at
BEFORE UPDATE ON school_creation_requests
FOR EACH ROW
EXECUTE FUNCTION update_school_requests_updated_at();

-- 9. Fonction pour approuver une demande et créer l'établissement
CREATE OR REPLACE FUNCTION approve_school_request(
  p_request_id UUID,
  p_admin_user_id UUID,
  p_review_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_request RECORD;
  v_new_school_id UUID;
  v_director_user_id UUID;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = p_admin_user_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent approuver des demandes';
  END IF;

  -- Récupérer la demande
  SELECT * INTO v_request
  FROM school_creation_requests
  WHERE id = p_request_id AND status = 'pending';

  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Demande introuvable ou déjà traitée';
  END IF;

  -- Créer ou récupérer le compte du directeur
  SELECT id INTO v_director_user_id
  FROM users
  WHERE email = v_request.director_email;

  IF v_director_user_id IS NULL THEN
    -- Créer le compte directeur
    INSERT INTO users (
      email,
      full_name,
      phone,
      role,
      is_active
    ) VALUES (
      v_request.director_email,
      v_request.director_full_name,
      v_request.director_phone,
      'principal',
      true
    )
    RETURNING id INTO v_director_user_id;
  END IF;

  -- Créer l'établissement
  INSERT INTO schools (
    name,
    code,
    type,
    region,
    city,
    address,
    phone,
    email,
    director_user_id,
    status
  ) VALUES (
    v_request.school_name,
    v_request.school_code,
    v_request.school_type,
    v_request.region,
    v_request.city,
    v_request.address,
    v_request.phone,
    v_request.email,
    v_director_user_id,
    'active'
  )
  RETURNING id INTO v_new_school_id;

  -- Mettre à jour current_school_id du directeur
  UPDATE users
  SET current_school_id = v_new_school_id
  WHERE id = v_director_user_id;

  -- Activer l'App Core gratuite pour la nouvelle école
  INSERT INTO school_subscriptions (
    school_id,
    app_id,
    status,
    start_date
  ) VALUES (
    v_new_school_id,
    'core',
    'active',
    NOW()
  );

  -- Mettre à jour la demande
  UPDATE school_creation_requests
  SET
    status = 'approved',
    reviewed_by_user_id = p_admin_user_id,
    reviewed_at = NOW(),
    review_notes = p_review_notes,
    created_school_id = v_new_school_id
  WHERE id = p_request_id;

  -- Notifier le demandeur
  INSERT INTO user_notifications (
    user_id,
    title,
    message,
    type,
    priority,
    action_url,
    metadata
  ) VALUES (
    v_request.requester_user_id,
    'Demande d''établissement approuvée',
    format('Votre demande de création de l''établissement "%s" a été approuvée !', v_request.school_name),
    'success',
    'high',
    '/schools',
    jsonb_build_object('school_id', v_new_school_id)
  );

  RETURN v_new_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Fonction pour rejeter une demande
CREATE OR REPLACE FUNCTION reject_school_request(
  p_request_id UUID,
  p_admin_user_id UUID,
  p_review_notes TEXT
)
RETURNS VOID AS $$
DECLARE
  v_request RECORD;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = p_admin_user_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent rejeter des demandes';
  END IF;

  -- Récupérer la demande
  SELECT * INTO v_request
  FROM school_creation_requests
  WHERE id = p_request_id AND status = 'pending';

  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Demande introuvable ou déjà traitée';
  END IF;

  -- Mettre à jour la demande
  UPDATE school_creation_requests
  SET
    status = 'rejected',
    reviewed_by_user_id = p_admin_user_id,
    reviewed_at = NOW(),
    review_notes = p_review_notes
  WHERE id = p_request_id;

  -- Notifier le demandeur
  INSERT INTO user_notifications (
    user_id,
    title,
    message,
    type,
    priority,
    metadata
  ) VALUES (
    v_request.requester_user_id,
    'Demande d''établissement rejetée',
    format('Votre demande de création de l''établissement "%s" a été rejetée. Raison: %s', v_request.school_name, p_review_notes),
    'error',
    'high',
    jsonb_build_object('request_id', p_request_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Commentaires
COMMENT ON TABLE school_creation_requests IS 'Demandes de création d''établissements scolaires (nécessite abonnement payant)';
COMMENT ON COLUMN school_creation_requests.status IS 'Statut: pending, approved, rejected';
COMMENT ON COLUMN school_creation_requests.school_type IS 'Type: maternelle, primaire, college, lycee, college_lycee';
COMMENT ON COLUMN school_creation_requests.ownership_type IS 'Statut: private, public';
COMMENT ON FUNCTION approve_school_request IS 'Approuve une demande et crée l''établissement automatiquement';
COMMENT ON FUNCTION reject_school_request IS 'Rejette une demande avec une justification';

-- ============================================================================
-- Fin de la migration
-- ============================================================================
