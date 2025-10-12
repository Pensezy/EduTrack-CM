-- =====================================
-- MIGRATION POUR GESTION CENTRALISÉE DES PARENTS
-- =====================================
-- Cette migration permet à un parent d'avoir des enfants 
-- dans différents établissements avec un seul compte

-- =====================================
-- 1. MISE À JOUR DE LA TABLE PARENTS 
-- =====================================

-- S'assurer que la table parents a les bonnes colonnes
DO $$ 
BEGIN 
    -- Colonne global_parent_id pour identifier un parent unique
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parents' AND column_name = 'global_parent_id') THEN
        ALTER TABLE parents ADD COLUMN global_parent_id UUID DEFAULT gen_random_uuid();
    END IF;
    
    -- Email unique pour identifier un parent existant
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parents' AND column_name = 'email') THEN
        ALTER TABLE parents ADD COLUMN email TEXT;
    END IF;
    
    -- Téléphone unique alternatif
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parents' AND column_name = 'phone') THEN
        ALTER TABLE parents ADD COLUMN phone TEXT;
    END IF;
    
    -- Nom complet
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parents' AND column_name = 'full_name') THEN
        ALTER TABLE parents ADD COLUMN full_name TEXT;
    END IF;
    
    -- Adresse
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parents' AND column_name = 'address') THEN
        ALTER TABLE parents ADD COLUMN address TEXT;
    END IF;
    
    -- Profession
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parents' AND column_name = 'occupation') THEN
        ALTER TABLE parents ADD COLUMN occupation TEXT;
    END IF;
    
    -- Date de création
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parents' AND column_name = 'created_at') THEN
        ALTER TABLE parents ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Date de mise à jour
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parents' AND column_name = 'updated_at') THEN
        ALTER TABLE parents ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- =====================================
-- 2. CRÉATION DE LA TABLE DE LIAISON PARENT-ÉTUDIANT-ÉCOLE
-- =====================================

CREATE TABLE IF NOT EXISTS parent_student_schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    relationship_type TEXT DEFAULT 'parent', -- 'parent', 'guardian', 'tutor'
    is_primary_contact BOOLEAN DEFAULT true,
    can_pickup BOOLEAN DEFAULT true,
    emergency_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte unique : un parent ne peut être lié qu'une fois à un étudiant dans une école
    UNIQUE(parent_id, student_id, school_id)
);

-- =====================================
-- 3. MISE À JOUR DE LA TABLE STUDENTS
-- =====================================

DO $$ 
BEGIN 
    -- S'assurer que student a school_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'school_id') THEN
        ALTER TABLE students ADD COLUMN school_id UUID REFERENCES schools(id);
    END IF;
    
    -- Matricule unique par école
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'matricule') THEN
        ALTER TABLE students ADD COLUMN matricule TEXT;
    END IF;
    
    -- Nom complet
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'full_name') THEN
        ALTER TABLE students ADD COLUMN full_name TEXT;
    END IF;
    
    -- Date de naissance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'date_of_birth') THEN
        ALTER TABLE students ADD COLUMN date_of_birth DATE;
    END IF;
    
    -- Classe actuelle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'current_class_id') THEN
        ALTER TABLE students ADD COLUMN current_class_id UUID REFERENCES classes(id);
    END IF;
    
    -- Statut actif
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'is_active') THEN
        ALTER TABLE students ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Date de création
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'created_at') THEN
        ALTER TABLE students ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Date de mise à jour
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'updated_at') THEN
        ALTER TABLE students ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- =====================================
-- 4. CRÉER LES INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================

-- Index sur parents pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_parents_email ON parents(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_parents_phone ON parents(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_parents_global_id ON parents(global_parent_id);

-- Index sur la table de liaison
CREATE INDEX IF NOT EXISTS idx_parent_student_schools_parent ON parent_student_schools(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_schools_student ON parent_student_schools(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_schools_school ON parent_student_schools(school_id);

-- Index sur students
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_matricule ON students(matricule) WHERE matricule IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active) WHERE is_active = true;

-- =====================================
-- 5. CRÉER UNE VUE POUR FACILITER LES REQUÊTES
-- =====================================

CREATE OR REPLACE VIEW parent_students_schools_view AS
SELECT 
    p.id as parent_id,
    p.global_parent_id,
    p.full_name as parent_name,
    p.email as parent_email,
    p.phone as parent_phone,
    p.occupation as parent_occupation,
    
    s.id as student_id,
    s.matricule as student_matricule,
    s.full_name as student_name,
    s.date_of_birth as student_dob,
    s.is_active as student_active,
    
    sc.id as school_id,
    sc.name as school_name,
    sc.code as school_code,
    sc.type as school_type,
    sc.city as school_city,
    
    c.id as class_id,
    c.name as class_name,
    c.level as class_level,
    
    pss.relationship_type,
    pss.is_primary_contact,
    pss.can_pickup,
    pss.emergency_contact,
    pss.created_at as relationship_created_at
    
FROM parent_student_schools pss
JOIN parents p ON pss.parent_id = p.id
JOIN students s ON pss.student_id = s.id
JOIN schools sc ON pss.school_id = sc.id
LEFT JOIN classes c ON s.current_class_id = c.id
WHERE s.is_active = true;

-- =====================================
-- 6. FONCTIONS UTILITAIRES POUR LA GESTION DES PARENTS
-- =====================================

-- Fonction pour vérifier si un parent existe déjà
CREATE OR REPLACE FUNCTION check_existing_parent(
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL
)
RETURNS TABLE(
    parent_id UUID,
    global_parent_id UUID,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    total_children BIGINT,
    schools_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.global_parent_id,
        p.full_name,
        p.email,
        p.phone,
        COUNT(DISTINCT pss.student_id) as total_children,
        COUNT(DISTINCT pss.school_id) as schools_count
    FROM parents p
    LEFT JOIN parent_student_schools pss ON p.id = pss.parent_id
    WHERE 
        (p_email IS NOT NULL AND p.email = p_email) OR
        (p_phone IS NOT NULL AND p.phone = p_phone)
    GROUP BY p.id, p.global_parent_id, p.full_name, p.email, p.phone
    LIMIT 1;
END;
$$;

-- Fonction pour créer ou récupérer un parent
CREATE OR REPLACE FUNCTION get_or_create_parent(
    p_full_name TEXT,
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_occupation TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    existing_parent_id UUID;
    new_parent_id UUID;
BEGIN
    -- Vérifier si le parent existe déjà
    SELECT parent_id INTO existing_parent_id
    FROM check_existing_parent(p_email, p_phone)
    LIMIT 1;
    
    IF existing_parent_id IS NOT NULL THEN
        -- Mettre à jour les informations si nécessaire
        UPDATE parents 
        SET 
            full_name = COALESCE(p_full_name, full_name),
            email = COALESCE(p_email, email),
            phone = COALESCE(p_phone, phone),
            address = COALESCE(p_address, address),
            occupation = COALESCE(p_occupation, occupation),
            updated_at = NOW()
        WHERE id = existing_parent_id;
        
        RETURN existing_parent_id;
    ELSE
        -- Créer un nouveau parent
        INSERT INTO parents (
            global_parent_id,
            full_name,
            email,
            phone,
            address,
            occupation,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            p_full_name,
            p_email,
            p_phone,
            p_address,
            p_occupation,
            NOW(),
            NOW()
        ) RETURNING id INTO new_parent_id;
        
        RETURN new_parent_id;
    END IF;
END;
$$;

-- =====================================
-- 7. POLITIQUES RLS POUR LA SÉCURITÉ
-- =====================================

-- Activer RLS sur les nouvelles tables
ALTER TABLE parent_student_schools ENABLE ROW LEVEL SECURITY;

-- Politique pour parent_student_schools : les parents ne voient que leurs propres relations
CREATE POLICY "Parents can view their own student relationships" 
ON parent_student_schools FOR SELECT 
USING (
    parent_id IN (
        SELECT p.id FROM parents p 
        WHERE p.global_parent_id IN (
            SELECT p2.global_parent_id FROM parents p2
            JOIN users u ON u.id = auth.uid()
            WHERE p2.email = u.email OR p2.phone = u.phone
        )
    )
);

-- Politique pour les écoles : elles voient les relations de leurs étudiants
CREATE POLICY "Schools can view their students' parent relationships" 
ON parent_student_schools FOR SELECT 
USING (
    school_id IN (
        SELECT schools.id FROM schools 
        WHERE schools.director_user_id = auth.uid()
    )
);

-- =====================================
-- 8. TRIGGERS POUR MAINTENIR LES DONNÉES
-- =====================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les tables
CREATE TRIGGER IF NOT EXISTS parents_updated_at
    BEFORE UPDATE ON parents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS parent_student_schools_updated_at
    BEFORE UPDATE ON parent_student_schools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =====================================
-- 9. COMMENTAIRES POUR LA DOCUMENTATION
-- =====================================

COMMENT ON TABLE parents IS 'Table centralisée des parents - un parent peut avoir des enfants dans plusieurs écoles';
COMMENT ON TABLE parent_student_schools IS 'Table de liaison parent-étudiant-école pour gestion multi-établissements';
COMMENT ON VIEW parent_students_schools_view IS 'Vue complète des relations parent-étudiant-école';
COMMENT ON FUNCTION check_existing_parent IS 'Vérifie si un parent existe déjà par email ou téléphone';
COMMENT ON FUNCTION get_or_create_parent IS 'Crée un nouveau parent ou récupère un parent existant';

-- =====================================
-- 10. MESSAGE DE FIN
-- =====================================

DO $$
BEGIN
    RAISE NOTICE '✅ MIGRATION PARENTS MULTI-ÉTABLISSEMENTS TERMINÉE !';
    RAISE NOTICE '📊 Structure créée pour centraliser la gestion des parents';
    RAISE NOTICE '🔗 Un parent peut maintenant avoir des enfants dans plusieurs écoles';
    RAISE NOTICE '🛡️ Politiques RLS configurées pour la sécurité';
    RAISE NOTICE '⚡ Fonctions utilitaires créées pour éviter les doublons';
END $$;