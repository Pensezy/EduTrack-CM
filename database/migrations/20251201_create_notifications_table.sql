-- Migration: Créer la table notifications
-- Date: 2025-12-01
-- Description: Table pour gérer les notifications envoyées aux utilisateurs

-- Supprimer la table si elle existe déjà (pour éviter les conflits)
DROP TABLE IF EXISTS notifications CASCADE;

-- Créer la table notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target TEXT NOT NULL CHECK (target IN ('all', 'parents', 'students', 'teachers', 'staff')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recipients_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_notifications_school_id ON notifications(school_id);
CREATE INDEX idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX idx_notifications_target ON notifications(target);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre aux utilisateurs de voir les notifications de leur école
CREATE POLICY "Utilisateurs peuvent voir notifications de leur école"
ON notifications FOR SELECT
USING (
  notifications.school_id IN (
    SELECT current_school_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Policy pour permettre aux principaux/secrétaires d'insérer des notifications
CREATE POLICY "Principaux et secrétaires peuvent créer notifications"
ON notifications FOR INSERT
WITH CHECK (
  notifications.school_id IN (
    SELECT current_school_id 
    FROM users 
    WHERE id = auth.uid() 
    AND role IN ('principal', 'secretary')
  )
);

-- Policy pour permettre aux principaux/secrétaires de modifier leurs notifications
CREATE POLICY "Principaux et secrétaires peuvent modifier leurs notifications"
ON notifications FOR UPDATE
USING (
  notifications.sender_id = auth.uid()
  AND notifications.school_id IN (
    SELECT current_school_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Policy pour permettre aux principaux de supprimer des notifications
CREATE POLICY "Principaux peuvent supprimer notifications"
ON notifications FOR DELETE
USING (
  notifications.school_id IN (
    SELECT current_school_id 
    FROM users 
    WHERE id = auth.uid() 
    AND role = 'principal'
  )
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notifications_updated_at();

-- Commentaires
COMMENT ON TABLE notifications IS 'Table pour stocker les notifications envoyées aux utilisateurs';
COMMENT ON COLUMN notifications.target IS 'Destinataires: all, parents, students, teachers, staff';
COMMENT ON COLUMN notifications.priority IS 'Priorité: low, normal, high, urgent';
COMMENT ON COLUMN notifications.type IS 'Type: info, success, warning, error';
COMMENT ON COLUMN notifications.status IS 'Statut: draft, sent, failed';
COMMENT ON COLUMN notifications.recipients_count IS 'Nombre de destinataires qui ont reçu la notification';
