-- ====================================
-- MIGRATION 04 FINALE - SOLUTION DÉFINITIVE
-- ====================================
-- Cette migration ajoute les colonnes manquantes aux tables existantes
-- puis crée les nouvelles tables nécessaires
-- ====================================

-- ÉTAPE 1: CRÉER payment_types D'ABORD (si elle n'existe pas)
-- ====================================

CREATE TABLE IF NOT EXISTS payment_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(10, 2),
    description TEXT,
    is_mandatory BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(school_id, name)
);

-- ÉTAPE 2: AJOUTER LES COLONNES MANQUANTES À payments
-- ====================================

DO $$ 
BEGIN
    -- Ajouter payment_type_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'payment_type_id') THEN
        ALTER TABLE payments ADD COLUMN payment_type_id UUID;
        RAISE NOTICE 'Colonne payment_type_id ajoutée';
    END IF;
    
    -- Ajouter payment_method
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'payment_method') THEN
        ALTER TABLE payments ADD COLUMN payment_method TEXT;
        RAISE NOTICE 'Colonne payment_method ajoutée';
    END IF;
    
    -- Ajouter reference_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'reference_number') THEN
        ALTER TABLE payments ADD COLUMN reference_number TEXT;
        RAISE NOTICE 'Colonne reference_number ajoutée';
    END IF;
    
    -- Ajouter notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'notes') THEN
        ALTER TABLE payments ADD COLUMN notes TEXT;
        RAISE NOTICE 'Colonne notes ajoutée';
    END IF;
    
    -- Ajouter status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'status') THEN
        ALTER TABLE payments ADD COLUMN status TEXT DEFAULT 'completed';
        RAISE NOTICE 'Colonne status ajoutée';
    END IF;
    
    -- Ajouter created_by_user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'created_by_user_id') THEN
        ALTER TABLE payments ADD COLUMN created_by_user_id UUID;
        RAISE NOTICE 'Colonne created_by_user_id ajoutée';
    END IF;
    
    -- Ajouter updated_by_user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'updated_by_user_id') THEN
        ALTER TABLE payments ADD COLUMN updated_by_user_id UUID;
        RAISE NOTICE 'Colonne updated_by_user_id ajoutée';
    END IF;
    
    -- Ajouter payment_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'payment_date') THEN
        ALTER TABLE payments ADD COLUMN payment_date TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Colonne payment_date ajoutée';
    END IF;
END $$;

-- ÉTAPE 3: AJOUTER LES FOREIGN KEYS SUR payments
-- ====================================

DO $$ 
BEGIN
    -- FK vers payment_types
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_payment_type_id_fkey') THEN
        ALTER TABLE payments ADD CONSTRAINT payments_payment_type_id_fkey 
        FOREIGN KEY (payment_type_id) REFERENCES payment_types(id) ON DELETE SET NULL;
        RAISE NOTICE 'FK payments_payment_type_id_fkey ajoutée';
    END IF;
    
    -- FK vers users (created_by)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_created_by_user_id_fkey') THEN
        ALTER TABLE payments ADD CONSTRAINT payments_created_by_user_id_fkey 
        FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
        RAISE NOTICE 'FK payments_created_by_user_id_fkey ajoutée';
    END IF;
    
    -- FK vers users (updated_by)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_updated_by_user_id_fkey') THEN
        ALTER TABLE payments ADD CONSTRAINT payments_updated_by_user_id_fkey 
        FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
        RAISE NOTICE 'FK payments_updated_by_user_id_fkey ajoutée';
    END IF;
END $$;

-- ÉTAPE 4: CRÉER LES AUTRES TABLES
-- ====================================

-- 4.1 Table JUSTIFICATIONS
CREATE TABLE IF NOT EXISTS justifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    absence_date DATE NOT NULL,
    reason TEXT NOT NULL,
    justification_document TEXT,
    status TEXT DEFAULT 'pending',
    submitted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    processed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.2 Table STUDENT_CARDS
CREATE TABLE IF NOT EXISTS student_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    card_number TEXT NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    photo_url TEXT,
    status TEXT DEFAULT 'active',
    issued_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(school_id, card_number)
);

-- 4.3 Table COMMUNICATIONS
CREATE TABLE IF NOT EXISTS communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    recipient_type TEXT NOT NULL,
    recipient_id UUID,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'sent',
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    sent_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ÉTAPE 5: AJOUTER LES FOREIGN KEYS POUR students
-- ====================================

DO $$ 
BEGIN
    -- FK students -> users (created_by)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_students_created_by') THEN
        ALTER TABLE students ADD CONSTRAINT fk_students_created_by 
        FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
        RAISE NOTICE 'FK fk_students_created_by ajoutée';
    END IF;
    
    -- FK students -> users (updated_by)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_students_updated_by') THEN
        ALTER TABLE students ADD CONSTRAINT fk_students_updated_by 
        FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
        RAISE NOTICE 'FK fk_students_updated_by ajoutée';
    END IF;
END $$;

-- ÉTAPE 6: CRÉER LES INDEX
-- ====================================

CREATE INDEX IF NOT EXISTS idx_payment_types_school ON payment_types(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_by ON payments(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_justifications_school ON justifications(school_id);
CREATE INDEX IF NOT EXISTS idx_justifications_student ON justifications(student_id);
CREATE INDEX IF NOT EXISTS idx_justifications_status ON justifications(status);
CREATE INDEX IF NOT EXISTS idx_justifications_processed_by ON justifications(processed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_student_cards_school ON student_cards(school_id);
CREATE INDEX IF NOT EXISTS idx_student_cards_student ON student_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_student_cards_issued_by ON student_cards(issued_by_user_id);
CREATE INDEX IF NOT EXISTS idx_student_cards_status ON student_cards(status);
CREATE INDEX IF NOT EXISTS idx_communications_school ON communications(school_id);
CREATE INDEX IF NOT EXISTS idx_communications_sent_by ON communications(sent_by_user_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);

-- ÉTAPE 7: CRÉER LES FONCTIONS
-- ====================================

CREATE OR REPLACE FUNCTION deactivate_user_account(
    p_user_id UUID,
    p_deactivated_by UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
        RETURN json_build_object('success', false, 'error', 'Utilisateur non trouvé');
    END IF;
    
    UPDATE users
    SET 
        is_active = false,
        deactivated_at = NOW(),
        deactivated_by_user_id = p_deactivated_by,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN json_build_object('success', true, 'message', 'Compte désactivé avec succès');
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION reactivate_user_account(
    p_user_id UUID,
    p_reactivated_by UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE users
    SET 
        is_active = true,
        deactivated_at = NULL,
        deactivated_by_user_id = NULL,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN json_build_object('success', true, 'message', 'Compte réactivé avec succès');
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ÉTAPE 8: ENABLE RLS
-- ====================================

ALTER TABLE payment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE justifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 9: CRÉER LES POLITIQUES RLS
-- ====================================

DROP POLICY IF EXISTS payment_types_school_policy ON payment_types;
CREATE POLICY payment_types_school_policy ON payment_types
    FOR ALL
    USING (school_id IN (SELECT current_school_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS payments_school_policy ON payments;
CREATE POLICY payments_school_policy ON payments
    FOR ALL
    USING (school_id IN (SELECT current_school_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS justifications_school_policy ON justifications;
CREATE POLICY justifications_school_policy ON justifications
    FOR ALL
    USING (school_id IN (SELECT current_school_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS student_cards_school_policy ON student_cards;
CREATE POLICY student_cards_school_policy ON student_cards
    FOR ALL
    USING (school_id IN (SELECT current_school_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS communications_school_policy ON communications;
CREATE POLICY communications_school_policy ON communications
    FOR ALL
    USING (school_id IN (SELECT current_school_id FROM users WHERE id = auth.uid()));

-- FIN DE LA MIGRATION - SUCCESS!
