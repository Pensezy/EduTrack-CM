-- ============================================================================
-- Migration: Créer la table user_notifications pour notifications individuelles
-- Date: 2026-01-03
-- Description: Table pour les notifications individuelles par utilisateur
--              Différente de la table 'notifications' qui est pour les diffusions
-- ============================================================================

-- Créer la table user_notifications
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'announcement')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread ON user_notifications(user_id, is_read) WHERE is_read = false;

-- Enable Row Level Security
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir uniquement leurs propres notifications
CREATE POLICY "Utilisateurs voient leurs notifications"
ON user_notifications FOR SELECT
USING (user_id = auth.uid());

-- Policy: Les utilisateurs peuvent mettre à jour uniquement leurs propres notifications
CREATE POLICY "Utilisateurs modifient leurs notifications"
ON user_notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Seuls les admins/principals peuvent créer des notifications
CREATE POLICY "Admins créent notifications"
ON user_notifications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'principal', 'secretary')
  )
);

-- Policy: Les utilisateurs peuvent supprimer leurs propres notifications
CREATE POLICY "Utilisateurs suppriment leurs notifications"
ON user_notifications FOR DELETE
USING (user_id = auth.uid());

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_user_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_notifications_updated_at
BEFORE UPDATE ON user_notifications
FOR EACH ROW
EXECUTE FUNCTION update_user_notifications_updated_at();

-- Fonction helper pour créer une notification pour un utilisateur
CREATE OR REPLACE FUNCTION create_user_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_priority TEXT DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO user_notifications (
    user_id,
    title,
    message,
    type,
    priority,
    action_url,
    metadata
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_priority,
    p_action_url,
    p_metadata
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction helper pour créer des notifications en masse
CREATE OR REPLACE FUNCTION create_bulk_user_notifications(
  p_user_ids UUID[],
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_priority TEXT DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_user_id UUID;
BEGIN
  FOREACH v_user_id IN ARRAY p_user_ids
  LOOP
    INSERT INTO user_notifications (
      user_id,
      title,
      message,
      type,
      priority,
      action_url,
      metadata
    ) VALUES (
      v_user_id,
      p_title,
      p_message,
      p_type,
      p_priority,
      p_action_url,
      p_metadata
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires
COMMENT ON TABLE user_notifications IS 'Notifications individuelles par utilisateur (différent de la table notifications pour diffusions)';
COMMENT ON COLUMN user_notifications.type IS 'Type: info, success, warning, error, announcement';
COMMENT ON COLUMN user_notifications.priority IS 'Priorité: low, medium, high';
COMMENT ON COLUMN user_notifications.action_url IS 'URL vers laquelle rediriger au clic (optionnel)';
COMMENT ON COLUMN user_notifications.metadata IS 'Données supplémentaires en JSON (ex: entity_id, entity_type)';

-- ============================================================================
-- Fin de la migration
-- ============================================================================
