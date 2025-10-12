-- =====================================================
-- MIGRATION: Tables communication, planning et documents
-- Date: 2025-10-12
-- Description: Tables pour planning, documents et communication
-- =====================================================

-- =====================================================
-- TABLE: appointments - Rendez-vous et événements planning
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_type VARCHAR(50) DEFAULT 'meeting', -- meeting, parent_conference, event, maintenance
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(200),
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, confirmed, cancelled, completed, rescheduled
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    
    -- Participants
    participants JSONB DEFAULT '[]', -- Array d'IDs participants
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    
    -- Récurrence
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB, -- Pattern de récurrence (daily, weekly, monthly)
    recurrence_end DATE,
    parent_appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    
    -- Notifications
    reminder_sent BOOLEAN DEFAULT false,
    notification_settings JSONB DEFAULT '{"email": true, "sms": false, "in_app": true}',
    
    -- Relations
    student_related UUID REFERENCES students(id) ON DELETE SET NULL,
    teacher_related UUID REFERENCES users(id) ON DELETE SET NULL,
    class_related UUID REFERENCES classes(id) ON DELETE SET NULL,
    
    -- Métadonnées
    color VARCHAR(7) DEFAULT '#3B82F6',
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: events - Événements scolaires
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Type et catégorie
    event_type VARCHAR(50) DEFAULT 'school', -- school, class, sports, cultural, administrative
    category VARCHAR(50) DEFAULT 'general', -- assembly, sports_day, parents_meeting, celebration
    
    -- Dates et heures
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    all_day BOOLEAN DEFAULT false,
    
    -- Lieu et participants
    location VARCHAR(200),
    target_audience TEXT[], -- parents, students, teachers, all
    classes_involved UUID[], -- IDs des classes concernées
    
    -- Statut et visibilité
    status VARCHAR(20) DEFAULT 'planned', -- planned, ongoing, completed, cancelled, postponed
    visibility VARCHAR(20) DEFAULT 'public', -- public, private, restricted
    requires_permission BOOLEAN DEFAULT false,
    
    -- Ressources et logistique
    resources_needed TEXT[],
    budget DECIMAL(10,2),
    max_participants INTEGER,
    registration_required BOOLEAN DEFAULT false,
    registration_deadline DATE,
    
    -- Communication
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    notification_sent BOOLEAN DEFAULT false,
    
    -- Métadonnées
    banner_image TEXT,
    color VARCHAR(7) DEFAULT '#10B981',
    tags TEXT[],
    external_link TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: documents - Gestion des documents
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Type et catégorie
    document_type VARCHAR(50) NOT NULL, -- certificate, report, form, letter, official
    category VARCHAR(50) DEFAULT 'general', -- administrative, academic, medical, legal
    
    -- Contenu du document
    content TEXT, -- Contenu textuel pour recherche
    file_url TEXT, -- URL du fichier stocké
    file_name VARCHAR(200),
    file_size INTEGER, -- Taille en bytes
    file_type VARCHAR(20), -- pdf, doc, docx, jpg, png
    
    -- Template et génération
    template_id UUID REFERENCES document_templates(id) ON DELETE SET NULL,
    is_generated BOOLEAN DEFAULT false,
    generation_data JSONB, -- Données utilisées pour la génération
    
    -- Relations
    student_related UUID REFERENCES students(id) ON DELETE SET NULL,
    teacher_related UUID REFERENCES users(id) ON DELETE SET NULL,
    parent_related UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Statut et versioning
    status VARCHAR(20) DEFAULT 'draft', -- draft, review, approved, published, archived
    version INTEGER DEFAULT 1,
    is_current_version BOOLEAN DEFAULT true,
    parent_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    
    -- Sécurité et accès
    access_level VARCHAR(20) DEFAULT 'internal', -- public, internal, restricted, confidential
    requires_signature BOOLEAN DEFAULT false,
    signed BOOLEAN DEFAULT false,
    signature_data JSONB,
    
    -- Validité et archivage
    valid_from DATE,
    valid_until DATE,
    archived BOOLEAN DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,
    
    -- Métadonnées
    tags TEXT[],
    reference_number VARCHAR(50),
    language VARCHAR(10) DEFAULT 'fr',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: document_templates - Templates de documents
-- =====================================================
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Type et utilisation
    template_type VARCHAR(50) NOT NULL, -- certificate, report, letter, form
    category VARCHAR(50) DEFAULT 'general',
    
    -- Template content
    template_content TEXT NOT NULL, -- HTML/Markdown content with placeholders
    template_data JSONB DEFAULT '{}', -- Structure des données attendues
    
    -- Configuration
    paper_size VARCHAR(20) DEFAULT 'A4', -- A4, A5, Letter
    orientation VARCHAR(20) DEFAULT 'portrait', -- portrait, landscape
    margins JSONB DEFAULT '{"top": 20, "right": 20, "bottom": 20, "left": 20}',
    
    -- Header/Footer
    header_content TEXT,
    footer_content TEXT,
    include_school_logo BOOLEAN DEFAULT true,
    
    -- Variables disponibles
    available_variables JSONB DEFAULT '[]', -- Liste des variables utilisables
    required_variables JSONB DEFAULT '[]', -- Variables obligatoires
    
    -- Statut
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, archived
    is_default BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    
    -- Utilisation
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(name, school_id, version)
);

-- =====================================================
-- TABLE: messages - Communication et messages
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Type de message
    message_type VARCHAR(20) DEFAULT 'notification', -- notification, announcement, alert, reminder
    channel VARCHAR(20) NOT NULL, -- sms, email, in_app, push
    
    -- Destinataires
    recipients JSONB NOT NULL DEFAULT '[]', -- Array d'IDs ou critères de sélection
    recipient_type VARCHAR(20) DEFAULT 'individual', -- individual, group, class, all_parents, all_teachers
    
    -- Classes/groupes ciblés
    target_classes UUID[], -- IDs des classes
    target_roles TEXT[], -- roles des utilisateurs (parent, teacher, student)
    
    -- Statut d'envoi
    status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, sending, sent, failed, cancelled
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Statistiques d'envoi
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    
    -- Configuration
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    requires_confirmation BOOLEAN DEFAULT false,
    auto_translate BOOLEAN DEFAULT false,
    
    -- Relations
    student_related UUID REFERENCES students(id) ON DELETE SET NULL,
    event_related UUID REFERENCES events(id) ON DELETE SET NULL,
    appointment_related UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    -- Métadonnées
    template_used VARCHAR(100),
    attachments JSONB DEFAULT '[]',
    tags TEXT[],
    
    -- Réponses (pour messages bidirectionnels)
    parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    thread_id UUID,
    allows_replies BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: message_recipients - Suivi des destinataires
-- =====================================================
CREATE TABLE IF NOT EXISTS message_recipients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    
    -- Statut de livraison
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, read, failed
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    
    -- Détails d'envoi
    channel_used VARCHAR(20), -- sms, email, in_app, push
    external_id VARCHAR(100), -- ID externe (opérateur SMS, service email)
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Réponse et confirmation
    confirmed BOOLEAN DEFAULT false,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    response_text TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(message_id, recipient_id)
);

-- =====================================================
-- INDEX pour optimiser les performances
-- =====================================================

-- Index pour appointments
CREATE INDEX IF NOT EXISTS idx_appointments_school_date ON appointments(school_id, start_datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_organizer ON appointments(organizer_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_student ON appointments(student_related);
CREATE INDEX IF NOT EXISTS idx_appointments_recurring ON appointments(parent_appointment_id);

-- Index pour events
CREATE INDEX IF NOT EXISTS idx_events_school_date ON events(school_id, start_date);
CREATE INDEX IF NOT EXISTS idx_events_type_status ON events(event_type, status);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(published, school_id);

-- Index pour documents
CREATE INDEX IF NOT EXISTS idx_documents_school_type ON documents(school_id, document_type, status);
CREATE INDEX IF NOT EXISTS idx_documents_student ON documents(student_related);
CREATE INDEX IF NOT EXISTS idx_documents_template ON documents(template_id);
CREATE INDEX IF NOT EXISTS idx_documents_reference ON documents(reference_number);

-- Index pour document_templates
CREATE INDEX IF NOT EXISTS idx_templates_school_type ON document_templates(school_id, template_type, status);
CREATE INDEX IF NOT EXISTS idx_templates_default ON document_templates(is_default, school_id);

-- Index pour messages
CREATE INDEX IF NOT EXISTS idx_messages_school_status ON messages(school_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_scheduled ON messages(scheduled_at, status);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type, channel);

-- Index pour message_recipients
CREATE INDEX IF NOT EXISTS idx_message_recipients_message ON message_recipients(message_id, status);
CREATE INDEX IF NOT EXISTS idx_message_recipients_user ON message_recipients(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_message_recipients_school ON message_recipients(school_id);

-- =====================================================
-- TRIGGERS pour updated_at automatique
-- =====================================================

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_recipients_updated_at BEFORE UPDATE ON message_recipients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Insertion de templates de documents de base
-- =====================================================

-- Templates de certificats standard
INSERT INTO document_templates (name, description, school_id, created_by, template_type, category, template_content, available_variables, required_variables)
SELECT 
    templates_data.name,
    templates_data.description,
    schools.id,
    users.id, -- Premier utilisateur admin de l'école
    templates_data.template_type,
    templates_data.category,
    templates_data.template_content,
    templates_data.available_variables,
    templates_data.required_variables
FROM schools
CROSS JOIN (
    SELECT id FROM users WHERE role IN ('principal', 'admin') LIMIT 1
) AS users,
(VALUES 
    (
        'Certificat de Scolarité Standard',
        'Certificat standard attestant de la scolarité d''un élève',
        'certificate',
        'academic',
        '<div style="font-family: Arial, sans-serif; padding: 40px;">
            <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #2563eb;">{{school_name}}</h1>
                <p>{{school_address}}<br>Tel: {{school_phone}}</p>
                <hr style="width: 200px; margin: 20px auto;">
                <h2 style="color: #1f2937;">CERTIFICAT DE SCOLARITÉ</h2>
            </div>
            <p style="margin: 30px 0;">Je soussigné(e) <strong>{{principal_name}}</strong>, Directeur/Directrice de {{school_name}}, certifie que :</p>
            <div style="margin: 30px 0; padding: 20px; background: #f3f4f6; border-left: 4px solid #2563eb;">
                <p><strong>{{student_name}}</strong></p>
                <p>Né(e) le {{student_birth_date}}</p> 
                <p>Matricule : {{student_id}}</p>
            </div>
            <p style="margin: 30px 0;">Est régulièrement inscrit(e) dans notre établissement en classe de <strong>{{student_class}}</strong> pour l''année scolaire {{school_year}}.</p>
            <p style="margin: 30px 0;">Ce certificat est délivré pour servir et valoir ce que de droit.</p>
            <div style="margin-top: 60px; text-align: right;">
                <p>Fait à {{school_city}}, le {{issue_date}}</p>
                <p style="margin-top: 40px;">Le Directeur/La Directrice</p>
                <p style="margin-top: 60px; border-top: 1px solid #000; display: inline-block; padding-top: 10px;">{{principal_name}}</p>
            </div>
        </div>',
        '["school_name", "school_address", "school_phone", "school_city", "principal_name", "student_name", "student_birth_date", "student_id", "student_class", "school_year", "issue_date"]',
        '["school_name", "principal_name", "student_name", "student_class", "school_year", "issue_date"]'
    ),
    (
        'Certificat de Transfert',
        'Certificat pour transfert vers un autre établissement',
        'certificate',
        'administrative',
        '<div style="font-family: Arial, sans-serif; padding: 40px;">
            <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #dc2626;">{{school_name}}</h1>
                <p>{{school_address}}<br>Tel: {{school_phone}}</p>
                <hr style="width: 200px; margin: 20px auto;">
                <h2 style="color: #1f2937;">CERTIFICAT DE TRANSFERT</h2>
            </div>
            <p style="margin: 30px 0;">Je soussigné(e) <strong>{{principal_name}}</strong>, Directeur/Directrice de {{school_name}}, certifie que l''élève :</p>
            <div style="margin: 30px 0; padding: 20px; background: #fef2f2; border-left: 4px solid #dc2626;">
                <p><strong>{{student_name}}</strong></p>
                <p>Né(e) le {{student_birth_date}}</p>
                <p>Matricule : {{student_id}}</p>
                <p>Classe : {{student_class}}</p>
            </div>
            <p style="margin: 30px 0;">A été régulièrement inscrit(e) dans notre établissement et est autorisé(e) à être transféré(e) vers <strong>{{destination_school}}</strong>.</p>
            <p style="margin: 30px 0;"><strong>Motif du transfert :</strong> {{transfer_reason}}</p>
            <p style="margin: 30px 0;"><strong>Date effective du transfert :</strong> {{transfer_date}}</p>
            <div style="margin-top: 60px; text-align: right;">
                <p>Fait à {{school_city}}, le {{issue_date}}</p>
                <p style="margin-top: 40px;">Le Directeur/La Directrice</p>
                <p style="margin-top: 60px; border-top: 1px solid #000; display: inline-block; padding-top: 10px;">{{principal_name}}</p>
            </div>
        </div>',
        '["school_name", "school_address", "school_phone", "school_city", "principal_name", "student_name", "student_birth_date", "student_id", "student_class", "destination_school", "transfer_reason", "transfer_date", "issue_date"]',
        '["school_name", "principal_name", "student_name", "student_class", "destination_school", "transfer_reason", "transfer_date", "issue_date"]'
    )
) AS templates_data(name, description, template_type, category, template_content, available_variables, required_variables)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE appointments IS 'Rendez-vous et événements de planning';
COMMENT ON TABLE events IS 'Événements scolaires et manifestations';
COMMENT ON TABLE documents IS 'Documents générés et stockés';
COMMENT ON TABLE document_templates IS 'Templates pour génération de documents';
COMMENT ON TABLE messages IS 'Messages et communications';
COMMENT ON TABLE message_recipients IS 'Suivi des destinataires de messages';