-- Migration: Créer la table communications pour l'historique des messages
-- Date: 2025-11-09

-- Créer les types ENUM pour les communications
DO $$ BEGIN
  CREATE TYPE communication_type AS ENUM ('sms', 'email', 'both');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE communication_status AS ENUM ('pending', 'delivered', 'failed', 'partial');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Créer la table communications
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Type et contenu du message
  message_type communication_type NOT NULL DEFAULT 'sms',
  subject TEXT,
  content TEXT NOT NULL,
  template_used TEXT, -- Nom du template utilisé
  
  -- Informations des destinataires (JSON pour flexibilité)
  recipients_data JSONB NOT NULL DEFAULT '[]', -- [{id, name, phone, email, student_name}]
  recipient_count INTEGER NOT NULL DEFAULT 0,
  
  -- Statut de livraison
  status communication_status NOT NULL DEFAULT 'pending',
  delivery_count INTEGER DEFAULT 0, -- Nombre de messages effectivement livrés
  
  -- Métadonnées d'envoi
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_attempts INTEGER DEFAULT 1,
  error_message TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_communications_school_id ON communications(school_id);
CREATE INDEX IF NOT EXISTS idx_communications_sender_id ON communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_communications_sent_at ON communications(sent_at);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_message_type ON communications(message_type);

-- Activer RLS
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir les communications de leur école
CREATE POLICY "Users can view communications from their school"
  ON communications FOR SELECT
  USING (
    school_id IN (
      SELECT current_school_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

-- Politique : Les secrétaires et directeurs peuvent créer des communications
CREATE POLICY "Staff can create communications"
  ON communications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('secretary', 'principal', 'admin')
      AND current_school_id = communications.school_id
    )
  );

-- Politique : Les secrétaires et directeurs peuvent modifier leurs communications
CREATE POLICY "Staff can update their communications"
  ON communications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.current_school_id = communications.school_id
      AND (
        -- Directeurs peuvent modifier toutes les communications
        u.role IN ('principal', 'admin') OR
        -- Secrétaires peuvent modifier leurs propres communications
        (u.role = 'secretary' AND communications.sender_id = u.id)
      )
    )
  );

-- Politique : Seuls les directeurs peuvent supprimer des communications
CREATE POLICY "Principals can delete communications"
  ON communications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('principal', 'admin')
      AND current_school_id = communications.school_id
    )
  );

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_communications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS communications_updated_at_trigger ON communications;
CREATE TRIGGER communications_updated_at_trigger
  BEFORE UPDATE ON communications
  FOR EACH ROW
  EXECUTE FUNCTION update_communications_updated_at();

-- Fonction pour calculer automatiquement recipient_count
CREATE OR REPLACE FUNCTION calculate_recipient_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.recipient_count = COALESCE(jsonb_array_length(NEW.recipients_data), 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour recipient_count
DROP TRIGGER IF EXISTS communications_recipient_count_trigger ON communications;
CREATE TRIGGER communications_recipient_count_trigger
  BEFORE INSERT OR UPDATE ON communications
  FOR EACH ROW
  EXECUTE FUNCTION calculate_recipient_count();

-- Créer la table message_templates pour les templates personnalisés
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'absence', 'payment', 'meeting', etc.
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}', -- Variables disponibles comme {STUDENT_NAME}
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les templates
CREATE INDEX IF NOT EXISTS idx_message_templates_school_id ON message_templates(school_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates(category);

-- RLS pour les templates
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates from their school"
  ON message_templates FOR SELECT
  USING (
    school_id IN (
      SELECT current_school_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage templates"
  ON message_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('secretary', 'principal', 'admin')
      AND current_school_id = message_templates.school_id
    )
  );

-- Trigger pour updated_at des templates
DROP TRIGGER IF EXISTS message_templates_updated_at_trigger ON message_templates;
CREATE TRIGGER message_templates_updated_at_trigger
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_communications_updated_at();

-- Commentaires
COMMENT ON TABLE communications IS 'Historique des communications SMS/Email envoyées aux parents';
COMMENT ON COLUMN communications.message_type IS 'Type: sms, email, both';
COMMENT ON COLUMN communications.recipients_data IS 'Données des destinataires (format JSON)';
COMMENT ON COLUMN communications.delivery_count IS 'Nombre de messages effectivement livrés';
COMMENT ON COLUMN communications.template_used IS 'Nom du template utilisé si applicable';

COMMENT ON TABLE message_templates IS 'Templates de messages personnalisés par école';
COMMENT ON COLUMN message_templates.variables IS 'Variables disponibles dans le template';

-- Insérer quelques templates par défaut pour les écoles existantes
INSERT INTO message_templates (school_id, name, category, content, variables)
SELECT 
  s.id as school_id,
  'Notification absence',
  'absence',
  'Bonjour, nous vous informons que votre enfant {STUDENT_NAME} a été absent(e) aujourd''hui. Si cette absence était prévue, merci de nous en informer. Cordialement, L''équipe pédagogique',
  ARRAY['STUDENT_NAME']
FROM schools s 
WHERE s.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO message_templates (school_id, name, category, content, variables)
SELECT 
  s.id as school_id,
  'Rappel paiement',
  'payment',
  'Bonjour, nous vous rappelons que le paiement des frais de scolarité pour {STUDENT_NAME} est dû le {DUE_DATE}. Montant: {AMOUNT} FCFA. Merci de régulariser votre situation. Cordialement, Le secrétariat',
  ARRAY['STUDENT_NAME', 'DUE_DATE', 'AMOUNT']
FROM schools s 
WHERE s.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO message_templates (school_id, name, category, content, variables)
SELECT 
  s.id as school_id,
  'Convocation réunion',
  'meeting',
  'Bonjour, vous êtes convié(e) à une réunion concernant {STUDENT_NAME}. Date: {DATE}, Heure: {TIME}, Lieu: {LOCATION}. Merci de confirmer votre présence. Cordialement, L''équipe pédagogique',
  ARRAY['STUDENT_NAME', 'DATE', 'TIME', 'LOCATION']
FROM schools s 
WHERE s.status = 'active'
ON CONFLICT DO NOTHING;