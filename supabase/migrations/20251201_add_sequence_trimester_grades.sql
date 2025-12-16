-- ====================================
-- MIGRATION: Ajouter séquences et trimestres aux notes
-- Date: 2025-12-01
-- Description: Adaptation du système de notation au système camerounais
-- ====================================

-- Ajouter les colonnes sequence et trimester à la table grades
ALTER TABLE grades
  ADD COLUMN IF NOT EXISTS sequence INTEGER CHECK (sequence >= 1 AND sequence <= 6),
  ADD COLUMN IF NOT EXISTS trimester INTEGER CHECK (trimester >= 1 AND trimester <= 3);

-- Créer des index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_grades_sequence ON grades(sequence);
CREATE INDEX IF NOT EXISTS idx_grades_trimester ON grades(trimester);
CREATE INDEX IF NOT EXISTS idx_grades_sequence_trimester ON grades(sequence, trimester);

-- Commentaires
COMMENT ON COLUMN grades.sequence IS 'Séquence (1-6) selon le système camerounais: 2 séquences par trimestre';
COMMENT ON COLUMN grades.trimester IS 'Trimestre (1-3) calculé automatiquement selon la séquence';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ Migration réussie: Séquences et trimestres ajoutés aux notes';
  RAISE NOTICE '  - Colonne sequence (1-6)';
  RAISE NOTICE '  - Colonne trimester (1-3)';
  RAISE NOTICE '  - Index créés pour les performances';
  RAISE NOTICE '====================================';
END $$;
