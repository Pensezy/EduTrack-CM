-- Migration: Créer la table student_cards pour les cartes scolaires
-- Date: 2025-11-04

-- Créer le type ENUM pour les statuts de cartes
DO $$ BEGIN
  CREATE TYPE card_status AS ENUM ('draft', 'pending_validation', 'issued', 'printed', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Créer la table student_cards
CREATE TABLE IF NOT EXISTS student_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  card_number TEXT UNIQUE NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  status card_status DEFAULT 'draft',
  printed_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte : un étudiant ne peut avoir qu'une seule carte active
  CONSTRAINT one_active_card_per_student UNIQUE NULLS NOT DISTINCT (student_id, status) 
    WHERE status IN ('draft', 'pending_validation', 'issued', 'printed')
);

-- Créer les index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_student_cards_student_id ON student_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_student_cards_school_id ON student_cards(school_id);
CREATE INDEX IF NOT EXISTS idx_student_cards_status ON student_cards(status);
CREATE INDEX IF NOT EXISTS idx_student_cards_card_number ON student_cards(card_number);
CREATE INDEX IF NOT EXISTS idx_student_cards_expiry_date ON student_cards(expiry_date);

-- Activer RLS
ALTER TABLE student_cards ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir les cartes de leur école
CREATE POLICY "Users can view cards from their school"
  ON student_cards FOR SELECT
  USING (
    school_id IN (
      SELECT current_school_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

-- Politique : Les secrétaires et directeurs peuvent créer des cartes
CREATE POLICY "Secretaries and principals can create cards"
  ON student_cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('secretary', 'principal', 'admin')
      AND current_school_id = student_cards.school_id
    )
  );

-- Politique : Les secrétaires et directeurs peuvent modifier les cartes
CREATE POLICY "Secretaries and principals can update cards"
  ON student_cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('secretary', 'principal', 'admin')
      AND current_school_id = student_cards.school_id
    )
  );

-- Politique : Les secrétaires et directeurs peuvent supprimer les cartes
CREATE POLICY "Secretaries and principals can delete cards"
  ON student_cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('secretary', 'principal', 'admin')
      AND current_school_id = student_cards.school_id
    )
  );

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_student_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS student_cards_updated_at_trigger ON student_cards;
CREATE TRIGGER student_cards_updated_at_trigger
  BEFORE UPDATE ON student_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_student_cards_updated_at();

-- Fonction pour marquer les cartes expirées
CREATE OR REPLACE FUNCTION check_expired_cards()
RETURNS void AS $$
BEGIN
  UPDATE student_cards
  SET status = 'expired'
  WHERE expiry_date < CURRENT_DATE
  AND status IN ('issued', 'printed');
END;
$$ LANGUAGE plpgsql;

-- Commentaires
COMMENT ON TABLE student_cards IS 'Cartes scolaires des élèves';
COMMENT ON COLUMN student_cards.card_number IS 'Numéro unique de la carte (ex: CM2024001)';
COMMENT ON COLUMN student_cards.status IS 'Statut: draft, pending_validation, issued, printed, expired';
COMMENT ON COLUMN student_cards.issue_date IS 'Date d''émission de la carte';
COMMENT ON COLUMN student_cards.expiry_date IS 'Date d''expiration (fin d''année scolaire)';
COMMENT ON COLUMN student_cards.printed_at IS 'Date et heure d''impression';
COMMENT ON COLUMN student_cards.validated_at IS 'Date et heure de validation';
