-- =====================================================
-- MIGRATION: Sécurité RLS (Row Level Security)
-- Date: 2025-10-12
-- Description: Politiques de sécurité pour isolation par établissement
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FONCTIONS UTILITAIRES POUR RLS
-- =====================================================

-- Fonction pour obtenir l'ID de l'école de l'utilisateur actuel
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT school_id 
        FROM users 
        WHERE auth.uid() IS NOT NULL 
        AND id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role IN ('admin', 'super_admin') 
        FROM users 
        WHERE auth.uid() IS NOT NULL 
        AND id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si l'utilisateur appartient à l'école
CREATE OR REPLACE FUNCTION user_belongs_to_school(target_school_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT school_id = target_school_id
        FROM users 
        WHERE auth.uid() IS NOT NULL 
        AND id = auth.uid()
    ) OR is_admin_user();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLITIQUES RLS POUR CLASSES
-- =====================================================

-- SELECT: Utilisateurs de la même école ou admins
CREATE POLICY "classes_select_policy" ON classes
    FOR SELECT USING (
        user_belongs_to_school(school_id)
    );

-- INSERT: Utilisateurs administratifs de la même école
CREATE POLICY "classes_insert_policy" ON classes
    FOR INSERT WITH CHECK (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

-- UPDATE: Utilisateurs administratifs de la même école
CREATE POLICY "classes_update_policy" ON classes
    FOR UPDATE USING (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

-- DELETE: Principaux et admins seulement
CREATE POLICY "classes_delete_policy" ON classes
    FOR DELETE USING (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

-- =====================================================
-- POLITIQUES RLS POUR SCHOOL_YEARS
-- =====================================================

CREATE POLICY "school_years_select_policy" ON school_years
    FOR SELECT USING (user_belongs_to_school(school_id));

CREATE POLICY "school_years_insert_policy" ON school_years
    FOR INSERT WITH CHECK (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

CREATE POLICY "school_years_update_policy" ON school_years
    FOR UPDATE USING (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

CREATE POLICY "school_years_delete_policy" ON school_years
    FOR DELETE USING (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

-- =====================================================
-- POLITIQUES RLS POUR SUBJECTS
-- =====================================================

CREATE POLICY "subjects_select_policy" ON subjects
    FOR SELECT USING (user_belongs_to_school(school_id));

CREATE POLICY "subjects_insert_policy" ON subjects
    FOR INSERT WITH CHECK (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

CREATE POLICY "subjects_update_policy" ON subjects
    FOR UPDATE USING (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

CREATE POLICY "subjects_delete_policy" ON subjects
    FOR DELETE USING (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

-- =====================================================
-- POLITIQUES RLS POUR TEACHERS
-- =====================================================

CREATE POLICY "teachers_select_policy" ON teachers
    FOR SELECT USING (user_belongs_to_school(school_id));

CREATE POLICY "teachers_insert_policy" ON teachers
    FOR INSERT WITH CHECK (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

CREATE POLICY "teachers_update_policy" ON teachers
    FOR UPDATE USING (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'secretary', 'teacher', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid()) AND
        (user_id = auth.uid() OR 
         (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "teachers_delete_policy" ON teachers
    FOR DELETE USING (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

-- =====================================================
-- POLITIQUES RLS POUR TASKS
-- =====================================================

CREATE POLICY "tasks_select_policy" ON tasks
    FOR SELECT USING (
        user_belongs_to_school(school_id) AND
        (assigned_to = auth.uid() OR created_by = auth.uid() OR
         (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "tasks_insert_policy" ON tasks
    FOR INSERT WITH CHECK (
        user_belongs_to_school(school_id) AND
        created_by = auth.uid()
    );

CREATE POLICY "tasks_update_policy" ON tasks
    FOR UPDATE USING (
        user_belongs_to_school(school_id) AND
        (assigned_to = auth.uid() OR created_by = auth.uid() OR
         (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "tasks_delete_policy" ON tasks
    FOR DELETE USING (
        user_belongs_to_school(school_id) AND
        (created_by = auth.uid() OR
         (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

-- =====================================================
-- POLITIQUES RLS POUR STUDENT_CARDS
-- =====================================================

CREATE POLICY "student_cards_select_policy" ON student_cards
    FOR SELECT USING (user_belongs_to_school(school_id));

CREATE POLICY "student_cards_insert_policy" ON student_cards
    FOR INSERT WITH CHECK (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

CREATE POLICY "student_cards_update_policy" ON student_cards
    FOR UPDATE USING (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

CREATE POLICY "student_cards_delete_policy" ON student_cards
    FOR DELETE USING (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

-- =====================================================
-- POLITIQUES RLS POUR FEES
-- =====================================================

CREATE POLICY "fees_select_policy" ON fees
    FOR SELECT USING (user_belongs_to_school(school_id));

CREATE POLICY "fees_insert_policy" ON fees
    FOR INSERT WITH CHECK (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

CREATE POLICY "fees_update_policy" ON fees
    FOR UPDATE USING (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

CREATE POLICY "fees_delete_policy" ON fees
    FOR DELETE USING (
        user_belongs_to_school(school_id) AND
        (SELECT role IN ('principal', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

-- =====================================================
-- POLITIQUES RLS POUR APPOINTMENTS
-- =====================================================

CREATE POLICY "appointments_select_policy" ON appointments
    FOR SELECT USING (
        user_belongs_to_school(school_id) AND
        (organizer_id = auth.uid() OR 
         participants ? auth.uid()::text OR
         (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "appointments_insert_policy" ON appointments
    FOR INSERT WITH CHECK (
        user_belongs_to_school(school_id) AND
        organizer_id = auth.uid()
    );

CREATE POLICY "appointments_update_policy" ON appointments
    FOR UPDATE USING (
        user_belongs_to_school(school_id) AND
        (organizer_id = auth.uid() OR
         (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "appointments_delete_policy" ON appointments
    FOR DELETE USING (
        user_belongs_to_school(school_id) AND
        (organizer_id = auth.uid() OR
         (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

-- =====================================================
-- POLITIQUES RLS POUR EVENTS
-- =====================================================

CREATE POLICY "events_select_policy" ON events
    FOR SELECT USING (
        user_belongs_to_school(school_id) AND
        (visibility = 'public' OR
         organizer_id = auth.uid() OR
         (SELECT role IN ('principal', 'secretary', 'teacher', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "events_insert_policy" ON events
    FOR INSERT WITH CHECK (
        user_belongs_to_school(school_id) AND
        organizer_id = auth.uid()
    );

CREATE POLICY "events_update_policy" ON events
    FOR UPDATE USING (
        user_belongs_to_school(school_id) AND
        (organizer_id = auth.uid() OR
         (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "events_delete_policy" ON events
    FOR DELETE USING (
        user_belongs_to_school(school_id) AND
        (organizer_id = auth.uid() OR
         (SELECT role IN ('principal', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

-- =====================================================
-- POLITIQUES RLS POUR DOCUMENTS
-- =====================================================

CREATE POLICY "documents_select_policy" ON documents
    FOR SELECT USING (
        user_belongs_to_school(school_id) AND
        (access_level = 'public' OR
         created_by = auth.uid() OR
         student_related IN (
             SELECT id FROM students 
             WHERE school_id = get_user_school_id()
         ) OR
         (SELECT role IN ('principal', 'secretary', 'teacher', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "documents_insert_policy" ON documents
    FOR INSERT WITH CHECK (
        user_belongs_to_school(school_id) AND
        created_by = auth.uid()
    );

CREATE POLICY "documents_update_policy" ON documents
    FOR UPDATE USING (
        user_belongs_to_school(school_id) AND
        (created_by = auth.uid() OR
         (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "documents_delete_policy" ON documents
    FOR DELETE USING (
        user_belongs_to_school(school_id) AND
        (created_by = auth.uid() OR
         (SELECT role IN ('principal', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

-- =====================================================
-- POLITIQUES RLS POUR DOCUMENT_TEMPLATES
-- =====================================================

CREATE POLICY "document_templates_select_policy" ON document_templates
    FOR SELECT USING (user_belongs_to_school(school_id));

CREATE POLICY "document_templates_insert_policy" ON document_templates
    FOR INSERT WITH CHECK (
        user_belongs_to_school(school_id) AND
        created_by = auth.uid() AND
        (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
         FROM users WHERE id = auth.uid())
    );

CREATE POLICY "document_templates_update_policy" ON document_templates
    FOR UPDATE USING (
        user_belongs_to_school(school_id) AND
        (created_by = auth.uid() OR
         (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "document_templates_delete_policy" ON document_templates
    FOR DELETE USING (
        user_belongs_to_school(school_id) AND
        (created_by = auth.uid() OR
         (SELECT role IN ('principal', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

-- =====================================================
-- POLITIQUES RLS POUR MESSAGES
-- =====================================================

CREATE POLICY "messages_select_policy" ON messages
    FOR SELECT USING (
        user_belongs_to_school(school_id) AND
        (sender_id = auth.uid() OR
         recipients ? auth.uid()::text OR
         (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "messages_insert_policy" ON messages
    FOR INSERT WITH CHECK (
        user_belongs_to_school(school_id) AND
        sender_id = auth.uid()
    );

CREATE POLICY "messages_update_policy" ON messages
    FOR UPDATE USING (
        user_belongs_to_school(school_id) AND
        (sender_id = auth.uid() OR
         (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "messages_delete_policy" ON messages
    FOR DELETE USING (
        user_belongs_to_school(school_id) AND
        (sender_id = auth.uid() OR
         (SELECT role IN ('principal', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

-- =====================================================
-- POLITIQUES RLS POUR MESSAGE_RECIPIENTS
-- =====================================================

CREATE POLICY "message_recipients_select_policy" ON message_recipients
    FOR SELECT USING (
        user_belongs_to_school(school_id) AND
        (recipient_id = auth.uid() OR
         (SELECT sender_id FROM messages WHERE id = message_id) = auth.uid() OR
         (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "message_recipients_insert_policy" ON message_recipients
    FOR INSERT WITH CHECK (
        user_belongs_to_school(school_id) AND
        (SELECT sender_id FROM messages WHERE id = message_id) = auth.uid()
    );

CREATE POLICY "message_recipients_update_policy" ON message_recipients
    FOR UPDATE USING (
        user_belongs_to_school(school_id) AND
        (recipient_id = auth.uid() OR
         (SELECT sender_id FROM messages WHERE id = message_id) = auth.uid() OR
         (SELECT role IN ('principal', 'secretary', 'admin', 'super_admin') 
          FROM users WHERE id = auth.uid()))
    );

-- =====================================================
-- COMMENTAIRES SUR LES POLITIQUES
-- =====================================================

COMMENT ON POLICY "classes_select_policy" ON classes IS 'Permet la lecture aux utilisateurs de la même école';
COMMENT ON POLICY "tasks_select_policy" ON tasks IS 'Permet la lecture des tâches assignées ou créées par l''utilisateur';
COMMENT ON POLICY "documents_select_policy" ON documents IS 'Contrôle l''accès aux documents selon le niveau de confidentialité';
COMMENT ON POLICY "messages_select_policy" ON messages IS 'Permet l''accès aux messages envoyés ou reçus par l''utilisateur';