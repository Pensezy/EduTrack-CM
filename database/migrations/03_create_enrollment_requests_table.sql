-- =====================================================
-- Migration : Création de la table enrollment_requests
-- Description : Gestion des demandes d'inscription et de redoublement
-- Date : 2025-10-27
-- =====================================================

-- Création de la table enrollment_requests
CREATE TABLE IF NOT EXISTS enrollment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
  
  -- Type de demande
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('nouvelle_inscription', 'redoublement', 'transfert')),
  
  -- Informations de l'élève (pour nouvelle inscription)
  student_id UUID REFERENCES students(id) ON DELETE CASCADE, -- NULL si nouvelle inscription
  student_first_name VARCHAR(100),
  student_last_name VARCHAR(100),
  student_date_of_birth DATE,
  student_gender VARCHAR(10) CHECK (student_gender IN ('Masculin', 'Féminin', 'M', 'F')),
  
  -- Informations parent/tuteur
  parent_name VARCHAR(200),
  parent_phone VARCHAR(50),
  parent_email VARCHAR(255),
  parent_address TEXT,
  
  -- Classe demandée
  current_class VARCHAR(50), -- Pour redoublement
  requested_class VARCHAR(50) NOT NULL,
  
  -- Détails de la demande
  reason TEXT, -- Raison du redoublement ou transfert
  teacher_recommendation TEXT, -- Recommandation de l'enseignant
  previous_school VARCHAR(200), -- École précédente (pour transferts)
  
  -- Documents fournis
  documents JSONB DEFAULT '[]'::jsonb, -- Liste des documents: [{name: 'Certificat', uploaded: true}]
  
  -- Statut et workflow
  status VARCHAR(50) NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'en_revision', 'approuvee', 'refusee', 'annulee')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('urgent', 'normal', 'faible')),
  
  -- Informations de soumission
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Qui a soumis (secrétaire, parent, etc.)
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Informations de validation
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Principal ou directeur
  reviewed_date TIMESTAMP WITH TIME ZONE,
  validation_notes TEXT, -- Commentaires du validateur
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_student_info CHECK (
    -- Si nouvelle inscription, les infos élève sont requises
    (request_type = 'nouvelle_inscription' AND student_first_name IS NOT NULL AND student_last_name IS NOT NULL AND student_date_of_birth IS NOT NULL)
    OR
    -- Si redoublement, student_id et current_class requis
    (request_type = 'redoublement' AND student_id IS NOT NULL AND current_class IS NOT NULL)
    OR
    -- Si transfert, infos élève ou student_id requis
    (request_type = 'transfert' AND (student_id IS NOT NULL OR (student_first_name IS NOT NULL AND student_last_name IS NOT NULL)))
  )
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_school ON enrollment_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_status ON enrollment_requests(status);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_academic_year ON enrollment_requests(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_student ON enrollment_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_submitted_date ON enrollment_requests(submitted_date DESC);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_priority ON enrollment_requests(priority);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_enrollment_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_enrollment_requests_updated_at
  BEFORE UPDATE ON enrollment_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollment_requests_updated_at();

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE enrollment_requests IS 'Demandes d''inscription, redoublement et transfert des élèves';
COMMENT ON COLUMN enrollment_requests.request_type IS 'Type de demande: nouvelle_inscription, redoublement, transfert';
COMMENT ON COLUMN enrollment_requests.status IS 'Statut: en_attente, en_revision, approuvee, refusee, annulee';
COMMENT ON COLUMN enrollment_requests.priority IS 'Priorité de traitement: urgent, normal, faible';
COMMENT ON COLUMN enrollment_requests.documents IS 'JSON array des documents requis et leur statut';
COMMENT ON COLUMN enrollment_requests.student_id IS 'NULL pour nouvelle inscription, référence pour redoublement';

-- RLS (Row Level Security) - Sécurité au niveau des lignes
ALTER TABLE enrollment_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs ne peuvent voir que les demandes de leur école
CREATE POLICY enrollment_requests_select_policy ON enrollment_requests
  FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Les secrétaires et principaux peuvent créer des demandes
CREATE POLICY enrollment_requests_insert_policy ON enrollment_requests
  FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('principal', 'secretary', 'admin')
    )
  );

-- Policy: Les principaux peuvent mettre à jour les demandes (validation)
CREATE POLICY enrollment_requests_update_policy ON enrollment_requests
  FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('principal', 'admin')
    )
  );

-- Policy: Les principaux peuvent supprimer des demandes annulées
CREATE POLICY enrollment_requests_delete_policy ON enrollment_requests
  FOR DELETE
  USING (
    status = 'annulee' 
    AND school_id IN (
      SELECT school_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('principal', 'admin')
    )
  );

-- Données de test pour démonstration (optionnel, à supprimer en production)
-- Ces données sont ajoutées seulement si on est en environnement de développement

-- Note: En production, cette table sera vide au départ et se remplira avec les vraies demandes
COMMENT ON TABLE enrollment_requests IS 'Table des demandes d''inscription - Créée le 2025-10-27';
