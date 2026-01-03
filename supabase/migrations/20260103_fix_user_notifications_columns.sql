-- ============================================================================
-- Migration: Correction des colonnes manquantes dans user_notifications
-- Date: 2026-01-03
-- Description: Ajoute les colonnes action_url et metadata si elles n'existent pas
-- ============================================================================

-- 1. Ajouter la colonne action_url si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_notifications'
      AND column_name = 'action_url'
  ) THEN
    ALTER TABLE user_notifications ADD COLUMN action_url TEXT;
    COMMENT ON COLUMN user_notifications.action_url IS 'URL vers laquelle rediriger au clic (optionnel)';
  END IF;
END $$;

-- 2. Ajouter la colonne metadata si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_notifications'
      AND column_name = 'metadata'
  ) THEN
    ALTER TABLE user_notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    COMMENT ON COLUMN user_notifications.metadata IS 'Données supplémentaires en JSON (ex: entity_id, entity_type)';
  END IF;
END $$;

-- 3. Ajouter la colonne priority si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_notifications'
      AND column_name = 'priority'
  ) THEN
    ALTER TABLE user_notifications ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium';

    -- Ajouter la contrainte CHECK pour priority
    ALTER TABLE user_notifications
    ADD CONSTRAINT user_notifications_priority_check
    CHECK (priority IN ('low', 'medium', 'high'));

    COMMENT ON COLUMN user_notifications.priority IS 'Priorité: low, medium, high';
  END IF;
END $$;

-- 4. Vérifier et créer les index s'ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread ON user_notifications(user_id, is_read) WHERE is_read = false;

-- 5. Recréer la fonction create_user_notification avec les nouvelles colonnes
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

-- 6. Recréer la fonction create_bulk_user_notifications
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

-- 7. Ajouter les commentaires
COMMENT ON FUNCTION create_user_notification IS 'Crée une notification pour un utilisateur spécifique';
COMMENT ON FUNCTION create_bulk_user_notifications IS 'Crée des notifications en masse pour plusieurs utilisateurs';

-- ============================================================================
-- Fin de la migration
-- ============================================================================
