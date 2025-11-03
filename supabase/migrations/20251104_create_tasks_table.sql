-- Migration: Créer la table tasks pour le secrétariat
-- Date: 2025-11-04

-- Créer le type ENUM pour les priorités
DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('urgent', 'high', 'medium', 'low');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Créer le type ENUM pour les statuts
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Créer le type ENUM pour les catégories
DO $$ BEGIN
  CREATE TYPE task_category AS ENUM ('general', 'appels', 'documents', 'paiements', 'planning', 'inscriptions');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Créer la table tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  due_date DATE,
  due_time TIME,
  category task_category DEFAULT 'general',
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_related TEXT,
  contact TEXT,
  estimated_duration TEXT,
  completed_at TIMESTAMPTZ,
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer les index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_tasks_school_id ON tasks(school_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Activer RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir les tâches de leur école
CREATE POLICY "Users can view tasks from their school"
  ON tasks FOR SELECT
  USING (
    school_id IN (
      SELECT current_school_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

-- Politique : Les secrétaires et directeurs peuvent créer des tâches
CREATE POLICY "Secretaries and principals can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('secretary', 'principal', 'admin')
      AND current_school_id = tasks.school_id
    )
  );

-- Politique : Les secrétaires et directeurs peuvent modifier les tâches de leur école
CREATE POLICY "Secretaries and principals can update tasks"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('secretary', 'principal', 'admin')
      AND current_school_id = tasks.school_id
    )
  );

-- Politique : Les secrétaires et directeurs peuvent supprimer les tâches
CREATE POLICY "Secretaries and principals can delete tasks"
  ON tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('secretary', 'principal', 'admin')
      AND current_school_id = tasks.school_id
    )
  );

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS tasks_updated_at_trigger ON tasks;
CREATE TRIGGER tasks_updated_at_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- Commentaires
COMMENT ON TABLE tasks IS 'Tâches du secrétariat et de l''administration';
COMMENT ON COLUMN tasks.priority IS 'Priorité: urgent, high, medium, low';
COMMENT ON COLUMN tasks.status IS 'Statut: pending, in_progress, completed, cancelled';
COMMENT ON COLUMN tasks.category IS 'Catégorie: general, appels, documents, paiements, planning, inscriptions';
