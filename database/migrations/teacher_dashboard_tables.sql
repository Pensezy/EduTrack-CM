-- ====================================
-- MIGRATION - TABLES POUR DASHBOARD ENSEIGNANT
-- ====================================
-- Tables nécessaires pour le fonctionnement complet du dashboard enseignant
-- Vérifie l'existence avant de créer (IF NOT EXISTS)
-- ====================================

-- ====================================
-- TABLE 1 : teacher_assignments
-- Gestion des assignations enseignant → classe + matière
-- ====================================

CREATE TABLE IF NOT EXISTS teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  
  -- Informations de planning
  class_name TEXT NOT NULL, -- Ex: "3ème A", "Terminale D"
  subject_name TEXT NOT NULL, -- Ex: "Mathématiques", "Français"
  
  -- Planning hebdomadaire (stocké en JSON)
  schedule JSONB DEFAULT '[]'::jsonb, -- [{day: "Lundi", time: "08:00-09:30", room: "Salle 12"}]
  
  -- Assignation
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Qui a créé cette assignation (secrétaire/direction)
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Dates
  start_date DATE,
  end_date DATE,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Contrainte : un enseignant ne peut pas avoir 2 fois la même assignation active
  UNIQUE (teacher_id, class_id, subject_id, academic_year_id, is_active)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_school ON teacher_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher ON teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_class ON teacher_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_subject ON teacher_assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_year ON teacher_assignments(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_active ON teacher_assignments(is_active);

-- ====================================
-- TABLE 2 : teacher_schedules (optionnel si schedule est dans teacher_assignments)
-- Emploi du temps détaillé des enseignants
-- ====================================

CREATE TABLE IF NOT EXISTS teacher_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_assignment_id UUID NOT NULL REFERENCES teacher_assignments(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE (teacher_assignment_id, day_of_week, start_time)
);

CREATE INDEX IF NOT EXISTS idx_teacher_schedules_assignment ON teacher_schedules(teacher_assignment_id);
CREATE INDEX IF NOT EXISTS idx_teacher_schedules_day ON teacher_schedules(day_of_week);

-- ====================================
-- TABLE 3 : Vérifier que documents existe
-- (Peut-être déjà créée par migration précédente)
-- ====================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Type et visibilité
  document_type TEXT NOT NULL, -- 'certificat', 'bulletin', 'cours', 'devoir', etc.
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'class', 'school')),
  is_public BOOLEAN DEFAULT false,
  
  -- Cibles
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  target_student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  target_class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  
  -- Métadonnées
  title TEXT NOT NULL,
  file_name TEXT,
  file_path TEXT,
  mime_type TEXT,
  class_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_school ON documents(school_id);
CREATE INDEX IF NOT EXISTS idx_documents_student ON documents(target_student_id);
CREATE INDEX IF NOT EXISTS idx_documents_class ON documents(target_class_id);
CREATE INDEX IF NOT EXISTS idx_documents_visibility ON documents(visibility);

-- ====================================
-- TABLE 4 : Vérifier que communications existe
-- ====================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'communications') THEN
        CREATE TABLE communications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
          
          -- Type de communication
          type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'whatsapp', 'notification')),
          
          -- Destinataire
          recipient_type TEXT NOT NULL CHECK (recipient_type IN ('student', 'parent', 'teacher', 'class', 'school')),
          recipient_id UUID, -- ID de l'élève, parent, ou enseignant
          class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
          
          -- Contenu
          subject TEXT,
          message TEXT NOT NULL,
          
          -- Statut
          status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'failed', 'read')),
          sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          sent_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
        
        CREATE INDEX idx_communications_school ON communications(school_id);
        CREATE INDEX idx_communications_recipient ON communications(recipient_id);
        CREATE INDEX idx_communications_class ON communications(class_id);
        CREATE INDEX idx_communications_status ON communications(status);
        
        RAISE NOTICE 'Table communications créée';
    ELSE
        RAISE NOTICE 'Table communications existe déjà';
    END IF;
END $$;

-- ====================================
-- VÉRIFICATION DES TABLES EXISTANTES
-- ====================================

-- Vérifier que toutes les tables nécessaires existent
DO $$ 
DECLARE
    missing_tables TEXT[];
BEGIN
    -- Vérifier users
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        missing_tables := array_append(missing_tables, 'users');
    END IF;
    
    -- Vérifier schools
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schools') THEN
        missing_tables := array_append(missing_tables, 'schools');
    END IF;
    
    -- Vérifier teachers
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teachers') THEN
        missing_tables := array_append(missing_tables, 'teachers');
    END IF;
    
    -- Vérifier classes
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'classes') THEN
        missing_tables := array_append(missing_tables, 'classes');
    END IF;
    
    -- Vérifier subjects
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subjects') THEN
        missing_tables := array_append(missing_tables, 'subjects');
    END IF;
    
    -- Vérifier students
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
        missing_tables := array_append(missing_tables, 'students');
    END IF;
    
    -- Vérifier grades
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'grades') THEN
        missing_tables := array_append(missing_tables, 'grades');
    END IF;
    
    -- Vérifier attendances
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendances') THEN
        missing_tables := array_append(missing_tables, 'attendances');
    END IF;
    
    -- Vérifier assignments
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments') THEN
        missing_tables := array_append(missing_tables, 'assignments');
    END IF;
    
    -- Vérifier academic_years
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'academic_years') THEN
        missing_tables := array_append(missing_tables, 'academic_years');
    END IF;
    
    -- Afficher le résultat
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE WARNING '⚠️ TABLES MANQUANTES : %', array_to_string(missing_tables, ', ');
        RAISE WARNING 'Exécutez d''abord la migration : 20250101000000_initial_schema.sql';
    ELSE
        RAISE NOTICE '✅ TOUTES LES TABLES REQUISES EXISTENT';
        RAISE NOTICE '✅ Table teacher_assignments créée/vérifiée';
        RAISE NOTICE '✅ Table teacher_schedules créée/vérifiée';
        RAISE NOTICE '✅ Table documents créée/vérifiée';
        RAISE NOTICE '✅ Table communications créée/vérifiée';
    END IF;
END $$;
