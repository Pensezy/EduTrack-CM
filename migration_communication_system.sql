-- Migration pour le système de communication
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Ajouter la colonne current_class à la table students si elle n'existe pas
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS current_class VARCHAR(50);

-- 2. Créer la table communications ou adapter l'existante
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    sent_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('sms', 'email', 'both')),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    recipients_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    recipient_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'delivered', 'failed', 'partial')),
    delivery_count INTEGER NOT NULL DEFAULT 0,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    template_used VARCHAR(100),
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2b. Ajouter les colonnes manquantes à la table existante (non destructif)
ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS recipients_data JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS recipient_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'both';

ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS subject VARCHAR(255);

ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS template_used VARCHAR(100);

ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS error_message TEXT;

ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS delivery_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS content TEXT;

-- 2c. Ajouter les contraintes CHECK si elles n'existent pas
DO $$ BEGIN
    ALTER TABLE public.communications 
    ADD CONSTRAINT communications_message_type_check 
    CHECK (message_type IN ('sms', 'email', 'both'));
EXCEPTION WHEN duplicate_object THEN
    NULL; -- Contrainte existe déjà
END $$;

DO $$ BEGIN
    ALTER TABLE public.communications 
    ADD CONSTRAINT communications_status_check 
    CHECK (status IN ('pending', 'sending', 'delivered', 'failed', 'partial'));
EXCEPTION WHEN duplicate_object THEN
    NULL; -- Contrainte existe déjà
END $$;

-- 3. Créer la table message_templates
CREATE TABLE IF NOT EXISTS public.message_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    subject VARCHAR(255),
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, name)
);

-- 4. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_communications_school_id ON public.communications(school_id);
CREATE INDEX IF NOT EXISTS idx_communications_sent_by_user_id ON public.communications(sent_by_user_id);
CREATE INDEX IF NOT EXISTS idx_communications_sent_at ON public.communications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_templates_school_id ON public.message_templates(school_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_active ON public.message_templates(school_id, is_active);

-- 5. Créer la fonction de mise à jour du timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Créer les triggers pour la mise à jour automatique
DROP TRIGGER IF EXISTS update_communications_updated_at ON public.communications;
CREATE TRIGGER update_communications_updated_at
    BEFORE UPDATE ON public.communications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_message_templates_updated_at ON public.message_templates;
CREATE TRIGGER update_message_templates_updated_at
    BEFORE UPDATE ON public.message_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Créer la fonction pour mettre à jour recipient_count automatiquement
CREATE OR REPLACE FUNCTION update_recipient_count()
RETURNS TRIGGER AS $$
BEGIN
    NEW.recipient_count = jsonb_array_length(COALESCE(NEW.recipients_data, '[]'::jsonb));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Créer le trigger pour recipient_count
DROP TRIGGER IF EXISTS update_communications_recipient_count ON public.communications;
CREATE TRIGGER update_communications_recipient_count
    BEFORE INSERT OR UPDATE ON public.communications
    FOR EACH ROW
    EXECUTE FUNCTION update_recipient_count();

-- 9. Activer RLS (Row Level Security)
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- 10. Créer les politiques RLS pour communications
DROP POLICY IF EXISTS "communications_school_access" ON public.communications;
CREATE POLICY "communications_school_access" ON public.communications
    FOR ALL USING (
        school_id IN (
            -- Secrétaires : via table secretaries
            SELECT school_id FROM public.secretaries 
            WHERE user_id = auth.uid()
            UNION
            -- Enseignants : via table teachers  
            SELECT school_id FROM public.teachers
            WHERE user_id = auth.uid()
            UNION
            -- Principals/Admins : via current_school_id dans users
            SELECT current_school_id FROM public.users
            WHERE id = auth.uid() 
            AND role IN ('principal', 'admin')
            AND current_school_id IS NOT NULL
        )
    );

-- 11. Créer les politiques RLS pour message_templates
DROP POLICY IF EXISTS "message_templates_school_access" ON public.message_templates;
CREATE POLICY "message_templates_school_access" ON public.message_templates
    FOR ALL USING (
        school_id IN (
            -- Secrétaires : via table secretaries
            SELECT school_id FROM public.secretaries 
            WHERE user_id = auth.uid()
            UNION
            -- Enseignants : via table teachers  
            SELECT school_id FROM public.teachers
            WHERE user_id = auth.uid()
            UNION
            -- Principals/Admins : via current_school_id dans users
            SELECT current_school_id FROM public.users
            WHERE id = auth.uid() 
            AND role IN ('principal', 'admin')
            AND current_school_id IS NOT NULL
        )
    );

-- 12. Insérer des templates par défaut pour toutes les écoles existantes
-- Utiliser un utilisateur principal ou admin existant, sinon ne pas insérer
INSERT INTO public.message_templates (school_id, name, category, subject, content, variables, created_by)
SELECT 
    s.id as school_id,
    'Absence Justification' as name,
    'attendance' as category,
    'Justification d''absence requise' as subject,
    'Bonjour {parent_name}, votre enfant {student_name} était absent le {date}. Merci de fournir une justification.' as content,
    '["parent_name", "student_name", "date"]'::jsonb as variables,
    u.id as created_by
FROM public.schools s
CROSS JOIN (
    SELECT id FROM public.users 
    WHERE role IN ('admin', 'principal') 
    ORDER BY role DESC, created_at ASC 
    LIMIT 1
) u
WHERE NOT EXISTS (
    SELECT 1 FROM public.message_templates mt 
    WHERE mt.school_id = s.id AND mt.name = 'Absence Justification'
);

INSERT INTO public.message_templates (school_id, name, category, subject, content, variables, created_by)
SELECT 
    s.id as school_id,
    'Payment Reminder' as name,
    'financial' as category,
    'Rappel de paiement' as subject,
    'Cher(e) {parent_name}, un paiement de {amount} est en attente pour {student_name}. Merci de régulariser votre situation.' as content,
    '["parent_name", "student_name", "amount"]'::jsonb as variables,
    u.id as created_by
FROM public.schools s
CROSS JOIN (
    SELECT id FROM public.users 
    WHERE role IN ('admin', 'principal') 
    ORDER BY role DESC, created_at ASC 
    LIMIT 1
) u
WHERE NOT EXISTS (
    SELECT 1 FROM public.message_templates mt 
    WHERE mt.school_id = s.id AND mt.name = 'Payment Reminder'
);

INSERT INTO public.message_templates (school_id, name, category, subject, content, variables, created_by)
SELECT 
    s.id as school_id,
    'General Announcement' as name,
    'general' as category,
    'Annonce importante' as subject,
    'Chers parents, nous souhaitons vous informer que {announcement}. Cordialement, l''administration.' as content,
    '["announcement"]'::jsonb as variables,
    u.id as created_by
FROM public.schools s
CROSS JOIN (
    SELECT id FROM public.users 
    WHERE role IN ('admin', 'principal') 
    ORDER BY role DESC, created_at ASC 
    LIMIT 1
) u
WHERE NOT EXISTS (
    SELECT 1 FROM public.message_templates mt 
    WHERE mt.school_id = s.id AND mt.name = 'General Announcement'
);

INSERT INTO public.message_templates (school_id, name, category, subject, content, variables, created_by)
SELECT 
    s.id as school_id,
    'Custom Message' as name,
    'custom' as category,
    'Message personnalisé' as subject,
    'Votre message personnalisé ici...' as content,
    '[]'::jsonb as variables,
    u.id as created_by
FROM public.schools s
CROSS JOIN (
    SELECT id FROM public.users 
    WHERE role IN ('admin', 'principal') 
    ORDER BY role DESC, created_at ASC 
    LIMIT 1
) u
WHERE NOT EXISTS (
    SELECT 1 FROM public.message_templates mt 
    WHERE mt.school_id = s.id AND mt.name = 'Custom Message'
);

-- 13. Mettre à jour la colonne current_class avec des valeurs par défaut si elle est vide
UPDATE public.students 
SET current_class = 'Non définie'
WHERE current_class IS NULL OR current_class = '';

COMMENT ON TABLE public.communications IS 'Table pour stocker l''historique des communications SMS/Email envoyées';
COMMENT ON TABLE public.message_templates IS 'Templates de messages pour les communications';
COMMENT ON COLUMN public.communications.recipients_data IS 'Données JSON des destinataires avec détails (nom, téléphone, email)';
COMMENT ON COLUMN public.communications.recipient_count IS 'Nombre de destinataires (calculé automatiquement)';
COMMENT ON COLUMN public.communications.metadata IS 'Métadonnées supplémentaires pour le message';
COMMENT ON COLUMN public.message_templates.variables IS 'Variables disponibles pour le template (format JSON array)';

-- Terminer la migration
SELECT 'Migration du système de communication terminée avec succès!' as status;