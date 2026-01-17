-- ============================================================================
-- Migration: Ajouter notification_preferences à la table users
-- Date: 2026-01-17
-- Description: Ajoute la colonne pour stocker les préférences de notification
--              utilisées par la page Settings
-- ============================================================================

-- 1. Ajouter la colonne notification_preferences si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE users ADD COLUMN notification_preferences JSONB DEFAULT '{
      "email_notifications": true,
      "new_registrations": true,
      "weekly_reports": false
    }'::jsonb;

    COMMENT ON COLUMN users.notification_preferences IS 'Préférences de notification utilisateur (email, inscriptions, rapports)';
  END IF;
END $$;

-- 2. Créer un index pour les requêtes sur les préférences
CREATE INDEX IF NOT EXISTS idx_users_notification_preferences
ON users USING GIN (notification_preferences);

-- ============================================================================
-- Fin de la migration
-- ============================================================================
