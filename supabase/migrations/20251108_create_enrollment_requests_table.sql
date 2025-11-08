-- Migration: Créer la table enrollment_requests pour les demandes d'inscription
-- Date: 2025-11-08

-- Créer le type ENUM pour les statuts des demandes
DO $$ BEGIN
  CREATE TYPE enrollment_request_status AS ENUM ('en_attente', 'en_revision', 'approuvee', 'refusee');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Créer le type ENUM pour les types de demandes
DO $$ BEGIN
  CREATE TYPE enrollment_request_type AS ENUM ('nouvelle_inscription', 'redoublement', 'transfert');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Créer le type ENUM pour les priorités
DO $$ BEGIN
  CREATE TYPE enrollment_priority AS ENUM ('normal', 'urgent', 'faible');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Créer la table enrollment_requests
CREATE TABLE IF NOT EXISTS enrollment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Type et statut de la demande
  request_type enrollment_request_type NOT NULL DEFAULT 'nouvelle_inscription',
  status enrollment_request_status NOT NULL DEFAULT 'en_attente',
  priority enrollment_priority NOT NULL DEFAULT 'normal',
  
  -- Informations de l'élève (pour nouvelles inscriptions)
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  student_first_name TEXT,
  student_last_name TEXT,
  student_birth_date DATE,
  
  -- Informations du parent/tuteur
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  
  -- Classe actuelle et demandée
  current_class TEXT,
  requested_class TEXT NOT NULL,
  
  -- École précédente (pour transferts)
  previous_school TEXT,
  previous_school_address TEXT,
  
  -- Motifs et recommandations
  reason TEXT,
  teacher_recommendation TEXT,
  parent_notes TEXT,
  
  -- Documents fournis (JSON array)
  documents JSONB DEFAULT '[]',
  
  -- Suivi de la demande
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  submitted_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_date TIMESTAMPTZ,
  validation_notes TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer les index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_school_id ON enrollment_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_status ON enrollment_requests(status);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_type ON enrollment_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_priority ON enrollment_requests(priority);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_student_id ON enrollment_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_submitted_date ON enrollment_requests(submitted_date);

-- Activer RLS
ALTER TABLE enrollment_requests ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir les demandes de leur école
CREATE POLICY "Users can view enrollment requests from their school"
  ON enrollment_requests FOR SELECT
  USING (
    school_id IN (
      SELECT current_school_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

-- Politique : Les secrétaires et directeurs peuvent créer des demandes
CREATE POLICY "Staff can create enrollment requests"
  ON enrollment_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('secretary', 'principal', 'admin')
      AND current_school_id = enrollment_requests.school_id
    )
  );

-- Politique : Les directeurs peuvent modifier toutes les demandes, secrétaires seulement celles qu'elles ont créées
CREATE POLICY "Staff can update enrollment requests"
  ON enrollment_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.current_school_id = enrollment_requests.school_id
      AND (
        -- Directeurs peuvent tout modifier
        u.role IN ('principal', 'admin') OR
        -- Secrétaires peuvent modifier leurs propres demandes
        (u.role = 'secretary' AND enrollment_requests.submitted_by = u.id)
      )
    )
  );

-- Politique : Seuls les directeurs peuvent supprimer des demandes
CREATE POLICY "Principals can delete enrollment requests"
  ON enrollment_requests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('principal', 'admin')
      AND current_school_id = enrollment_requests.school_id
    )
  );

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_enrollment_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS enrollment_requests_updated_at_trigger ON enrollment_requests;
CREATE TRIGGER enrollment_requests_updated_at_trigger
  BEFORE UPDATE ON enrollment_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollment_requests_updated_at();

-- Fonction pour auto-affecter la date de révision
CREATE OR REPLACE FUNCTION set_enrollment_request_reviewed_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le statut passe de 'en_attente' à autre chose et qu'il n'y a pas de date de révision
  IF OLD.status = 'en_attente' AND NEW.status != 'en_attente' AND NEW.reviewed_date IS NULL THEN
    NEW.reviewed_date = NOW();
    NEW.reviewed_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-affecter la date de révision
DROP TRIGGER IF EXISTS enrollment_requests_auto_review_trigger ON enrollment_requests;
CREATE TRIGGER enrollment_requests_auto_review_trigger
  BEFORE UPDATE ON enrollment_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_enrollment_request_reviewed_date();

-- Commentaires
COMMENT ON TABLE enrollment_requests IS 'Demandes d''inscription, redoublement et transfert des élèves';
COMMENT ON COLUMN enrollment_requests.request_type IS 'Type: nouvelle_inscription, redoublement, transfert';
COMMENT ON COLUMN enrollment_requests.status IS 'Statut: en_attente, en_revision, approuvee, refusee';
COMMENT ON COLUMN enrollment_requests.priority IS 'Priorité: normal, urgent, faible';
COMMENT ON COLUMN enrollment_requests.documents IS 'Documents fournis (format JSON)';
COMMENT ON COLUMN enrollment_requests.submitted_date IS 'Date de soumission de la demande';
COMMENT ON COLUMN enrollment_requests.reviewed_date IS 'Date de traitement par le directeur';
COMMENT ON COLUMN enrollment_requests.validation_notes IS 'Notes du directeur lors de la validation/refus';

-- Insérer quelques exemples de données pour tester (optionnel)
-- Ces données seront visibles uniquement pour l'école correspondante grâce à RLS
INSERT INTO enrollment_requests (
  school_id,
  request_type,
  status,
  priority,
  student_first_name,
  student_last_name,
  parent_name,
  parent_phone,
  requested_class,
  reason,
  documents,
  submitted_date
) 
SELECT 
  s.id as school_id,
  'nouvelle_inscription',
  'en_attente',
  'normal',
  'Marie',
  'Test',
  'Parent Test',
  '+237 6XX XX XX XX',
  'CE1',
  'Demande d''inscription pour l''année scolaire 2025-2026',
  '[{"name": "Certificat de naissance", "uploaded": true}, {"name": "Carnet de vaccination", "uploaded": false}]',
  NOW() - INTERVAL '2 days'
FROM schools s 
WHERE s.status = 'active'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO enrollment_requests (
  school_id,
  request_type,
  status,
  priority,
  student_first_name,
  student_last_name,
  parent_name,
  parent_phone,
  requested_class,
  current_class,
  reason,
  teacher_recommendation,
  documents,
  submitted_date
) 
SELECT 
  s.id as school_id,
  'redoublement',
  'en_attente',
  'urgent',
  'Jean',
  'Exemple',
  'Tuteur Exemple',
  '+237 6YY YY YY YY',
  'CM1',
  'CM1',
  'Difficultés scolaires importantes',
  'Redoublement recommandé par l''équipe pédagogique',
  '[{"name": "Bulletin scolaire", "uploaded": true}, {"name": "Avis médical", "uploaded": true}]',
  NOW() - INTERVAL '1 day'
FROM schools s 
WHERE s.status = 'active'
LIMIT 1
ON CONFLICT DO NOTHING;