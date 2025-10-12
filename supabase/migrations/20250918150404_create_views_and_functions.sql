-- =====================================================
-- MIGRATION: Vues et fonctions utilitaires
-- Date: 2025-10-12
-- Description: Vues complexes et fonctions pour faciliter les requêtes
-- =====================================================

-- =====================================================
-- VUES POUR TABLEAUX DE BORD ET STATISTIQUES
-- =====================================================

-- Vue complète des élèves avec toutes les informations utiles
CREATE OR REPLACE VIEW student_complete_view AS
SELECT 
    s.id,
    s.matricule,
    s.full_name,
    s.email,
    s.phone,
    s.date_of_birth,
    s.address,
    s.photo_url,
    s.current_class,
    s.enrollment_date,
    s.status as student_status,
    s.school_id,
    
    -- Informations école
    sc.name as school_name,
    sc.address as school_address,
    
    -- Informations parent
    u.full_name as parent_name,
    u.phone as parent_phone,
    u.email as parent_email,
    
    -- Informations classe
    c.name as class_name,
    c.level as class_level,
    c.teacher_id as class_teacher_id,
    
    -- Carte scolaire
    card.card_number,
    card.status as card_status,
    card.expiry_date as card_expiry,
    
    -- Statistiques
    (SELECT COUNT(*) FROM absences WHERE student_id = s.id AND date_absence >= date_trunc('month', CURRENT_DATE)) as monthly_absences,
    (SELECT COUNT(*) FROM payments WHERE student_id = s.id AND status = 'pending') as pending_payments,
    (SELECT AVG(score) FROM grades WHERE student_id = s.id AND academic_year = (SELECT year FROM school_years WHERE is_current = true AND school_id = s.school_id LIMIT 1)) as average_grade,
    
    s.created_at,
    s.updated_at
FROM students s
LEFT JOIN schools sc ON s.school_id = sc.id
LEFT JOIN users u ON s.parent_id = u.id
LEFT JOIN classes c ON s.current_class = c.name AND c.school_id = s.school_id
LEFT JOIN student_cards card ON s.id = card.student_id;

-- Vue des tâches avec priorité et informations contextuelles
CREATE OR REPLACE VIEW tasks_dashboard_view AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.priority,
    t.status,
    t.category,
    t.due_date,
    t.due_time,
    t.school_id,
    
    -- Informations utilisateur assigné
    u_assigned.full_name as assigned_to_name,
    u_assigned.role as assigned_to_role,
    
    -- Informations créateur
    u_creator.full_name as created_by_name,
    u_creator.role as created_by_role,
    
    -- Informations élève lié
    s.full_name as student_name,
    s.current_class as student_class,
    
    -- Calculs
    CASE 
        WHEN t.due_date < CURRENT_DATE THEN 'overdue'
        WHEN t.due_date = CURRENT_DATE THEN 'today'
        WHEN t.due_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'soon'
        ELSE 'future'
    END as urgency_level,
    
    CASE
        WHEN t.status = 'completed' THEN 100
        WHEN t.status = 'in_progress' THEN 50
        ELSE 0
    END as progress_percentage,
    
    t.created_at,
    t.updated_at
FROM tasks t
LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
LEFT JOIN users u_creator ON t.created_by = u_creator.id
LEFT JOIN students s ON t.student_related = s.id;

-- Vue des paiements avec informations complètes
CREATE OR REPLACE VIEW payments_complete_view AS
SELECT 
    p.id,
    p.amount,
    p.status,
    p.payment_method,
    p.transaction_id,
    p.due_date,
    p.completed_at,
    p.school_id,
    
    -- Informations élève
    s.full_name as student_name,
    s.matricule as student_matricule,
    s.current_class as student_class,
    
    -- Informations parent
    u.full_name as parent_name,
    u.phone as parent_phone,
    u.email as parent_email,
    
    -- Informations frais
    f.name as fee_name,
    f.category as fee_category,
    f.frequency as fee_frequency,
    
    -- Calculs
    CASE 
        WHEN p.status = 'pending' AND p.due_date < CURRENT_DATE THEN 'overdue'
        WHEN p.status = 'pending' AND p.due_date = CURRENT_DATE THEN 'due_today'
        WHEN p.status = 'pending' THEN 'pending'
        WHEN p.status = 'completed' THEN 'paid'
        ELSE p.status
    END as payment_urgency,
    
    EXTRACT(DAY FROM (CURRENT_DATE - p.due_date)) as days_overdue,
    
    p.created_at,
    p.updated_at
FROM payments p
LEFT JOIN students s ON p.student_id = s.id
LEFT JOIN users u ON s.parent_id = u.id
LEFT JOIN fees f ON p.fee_id = f.id;

-- Vue des événements avec participants
CREATE OR REPLACE VIEW events_calendar_view AS
SELECT 
    e.id,
    e.title,
    e.description,
    e.event_type,
    e.category,
    e.start_date,
    e.end_date,
    e.start_time,
    e.end_time,
    e.all_day,
    e.location,
    e.status,
    e.visibility,
    e.school_id,
    e.color,
    
    -- Informations organisateur
    u.full_name as organizer_name,
    u.role as organizer_role,
    
    -- Calculs
    CASE 
        WHEN e.start_date = CURRENT_DATE THEN 'today'
        WHEN e.start_date = CURRENT_DATE + INTERVAL '1 day' THEN 'tomorrow'
        WHEN e.start_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
        WHEN e.start_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'this_month'
        ELSE 'future'
    END as time_category,
    
    EXTRACT(DAY FROM (e.start_date - CURRENT_DATE)) as days_until_event,
    
    -- Classes impliquées
    COALESCE(array_length(e.classes_involved, 1), 0) as classes_count,
    
    e.created_at,
    e.updated_at
FROM events e
LEFT JOIN users u ON e.organizer_id = u.id;

-- Vue des messages avec statistiques de livraison
CREATE OR REPLACE VIEW messages_stats_view AS
SELECT 
    m.id,
    m.subject,
    m.content,
    m.message_type,
    m.channel,
    m.status,
    m.scheduled_at,
    m.sent_at,
    m.total_recipients,
    m.sent_count,
    m.delivered_count,
    m.failed_count,
    m.read_count,
    m.school_id,
    
    -- Informations expéditeur
    u.full_name as sender_name,
    u.role as sender_role,
    
    -- Calculs de taux
    CASE 
        WHEN m.total_recipients > 0 THEN 
            ROUND((m.sent_count::numeric / m.total_recipients::numeric) * 100, 2)
        ELSE 0 
    END as sent_rate,
    
    CASE 
        WHEN m.sent_count > 0 THEN 
            ROUND((m.delivered_count::numeric / m.sent_count::numeric) * 100, 2)
        ELSE 0 
    END as delivery_rate,
    
    CASE 
        WHEN m.delivered_count > 0 THEN 
            ROUND((m.read_count::numeric / m.delivered_count::numeric) * 100, 2)
        ELSE 0 
    END as read_rate,
    
    m.created_at,
    m.updated_at
FROM messages m
LEFT JOIN users u ON m.sender_id = u.id;

-- =====================================================
-- FONCTIONS UTILITAIRES POUR STATISTIQUES
-- =====================================================

-- Fonction pour obtenir les statistiques du dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats(school_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'students', json_build_object(
            'total', (SELECT COUNT(*) FROM students WHERE school_id = school_uuid AND status = 'active'),
            'new_this_month', (SELECT COUNT(*) FROM students WHERE school_id = school_uuid AND enrollment_date >= date_trunc('month', CURRENT_DATE)),
            'by_class', (
                SELECT json_object_agg(current_class, count)
                FROM (
                    SELECT current_class, COUNT(*) as count
                    FROM students 
                    WHERE school_id = school_uuid AND status = 'active'
                    GROUP BY current_class
                ) t
            )
        ),
        'payments', json_build_object(
            'total_pending', (SELECT COUNT(*) FROM payments p JOIN students s ON p.student_id = s.id WHERE s.school_id = school_uuid AND p.status = 'pending'),
            'overdue', (SELECT COUNT(*) FROM payments p JOIN students s ON p.student_id = s.id WHERE s.school_id = school_uuid AND p.status = 'pending' AND p.due_date < CURRENT_DATE),
            'total_amount_pending', (SELECT COALESCE(SUM(amount), 0) FROM payments p JOIN students s ON p.student_id = s.id WHERE s.school_id = school_uuid AND p.status = 'pending'),
            'collected_this_month', (SELECT COALESCE(SUM(amount), 0) FROM payments p JOIN students s ON p.student_id = s.id WHERE s.school_id = school_uuid AND p.status = 'completed' AND p.completed_at >= date_trunc('month', CURRENT_DATE))
        ),
        'absences', json_build_object(
            'today', (SELECT COUNT(*) FROM absences a JOIN students s ON a.student_id = s.id WHERE s.school_id = school_uuid AND a.date_absence = CURRENT_DATE),
            'this_week', (SELECT COUNT(*) FROM absences a JOIN students s ON a.student_id = s.id WHERE s.school_id = school_uuid AND a.date_absence >= date_trunc('week', CURRENT_DATE)),
            'unjustified', (SELECT COUNT(*) FROM absences a JOIN students s ON a.student_id = s.id WHERE s.school_id = school_uuid AND a.justified = false AND a.date_absence >= CURRENT_DATE - INTERVAL '30 days')
        ),
        'tasks', json_build_object(
            'pending', (SELECT COUNT(*) FROM tasks WHERE school_id = school_uuid AND status = 'pending'),
            'overdue', (SELECT COUNT(*) FROM tasks WHERE school_id = school_uuid AND status = 'pending' AND due_date < CURRENT_DATE),
            'urgent', (SELECT COUNT(*) FROM tasks WHERE school_id = school_uuid AND priority = 'urgent' AND status != 'completed'),
            'completed_today', (SELECT COUNT(*) FROM tasks WHERE school_id = school_uuid AND status = 'completed' AND completed_at::date = CURRENT_DATE)
        ),
        'events', json_build_object(
            'upcoming', (SELECT COUNT(*) FROM events WHERE school_id = school_uuid AND start_date >= CURRENT_DATE AND status = 'planned'),
            'this_week', (SELECT COUNT(*) FROM events WHERE school_id = school_uuid AND start_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'),
            'this_month', (SELECT COUNT(*) FROM events WHERE school_id = school_uuid AND start_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days')
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour générer un numéro de carte scolaire unique
CREATE OR REPLACE FUNCTION generate_card_number(school_uuid UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
    card_number VARCHAR(20);
    school_code VARCHAR(5);
    counter INTEGER;
BEGIN
    -- Obtenir le code de l'école (premiers 3 caractères du nom + année)
    SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z]', '', 'g'), 3)) || EXTRACT(YEAR FROM CURRENT_DATE)::text
    INTO school_code
    FROM schools WHERE id = school_uuid;
    
    -- Obtenir le prochain numéro séquentiel
    SELECT COALESCE(MAX(CAST(RIGHT(card_number, 4) AS INTEGER)), 0) + 1
    INTO counter
    FROM student_cards sc
    JOIN students s ON sc.student_id = s.id
    WHERE s.school_id = school_uuid;
    
    -- Formater le numéro de carte
    card_number := school_code || '-' || LPAD(counter::text, 4, '0');
    
    RETURN card_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour calculer les frais dus pour un élève
CREATE OR REPLACE FUNCTION calculate_student_fees(student_uuid UUID, academic_year_param VARCHAR(20) DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
    current_year VARCHAR(20);
BEGIN
    -- Utiliser l'année courante si non spécifiée
    IF academic_year_param IS NULL THEN
        SELECT year INTO current_year
        FROM school_years 
        WHERE is_current = true 
        AND school_id = (SELECT school_id FROM students WHERE id = student_uuid)
        LIMIT 1;
    ELSE
        current_year := academic_year_param;
    END IF;
    
    SELECT json_build_object(
        'student_id', student_uuid,
        'academic_year', current_year,
        'total_fees', (
            SELECT COALESCE(SUM(f.amount), 0)
            FROM fees f
            JOIN students s ON f.school_id = s.school_id
            WHERE s.id = student_uuid 
            AND f.academic_year = current_year
            AND f.active = true
            AND (f.level_applicable = 'all' OR f.level_applicable = s.current_class)
        ),
        'paid_amount', (
            SELECT COALESCE(SUM(p.amount), 0)
            FROM payments p
            WHERE p.student_id = student_uuid
            AND p.status = 'completed'
            AND EXTRACT(YEAR FROM p.created_at)::text || '-' || (EXTRACT(YEAR FROM p.created_at) + 1)::text = current_year
        ),
        'pending_amount', (
            SELECT COALESCE(SUM(p.amount), 0)
            FROM payments p
            WHERE p.student_id = student_uuid
            AND p.status = 'pending'
        ),
        'overdue_amount', (
            SELECT COALESCE(SUM(p.amount), 0)
            FROM payments p
            WHERE p.student_id = student_uuid
            AND p.status = 'pending'
            AND p.due_date < CURRENT_DATE
        ),
        'fees_breakdown', (
            SELECT json_agg(
                json_build_object(
                    'fee_name', f.name,
                    'amount', f.amount,
                    'category', f.category,
                    'mandatory', f.mandatory,
                    'paid', COALESCE(paid_fees.total_paid, 0),
                    'status', CASE 
                        WHEN COALESCE(paid_fees.total_paid, 0) >= f.amount THEN 'paid'
                        WHEN COALESCE(pending_fees.total_pending, 0) > 0 THEN 'pending'
                        ELSE 'not_charged'
                    END
                )
            )
            FROM fees f
            JOIN students s ON f.school_id = s.school_id
            LEFT JOIN (
                SELECT fee_id, SUM(amount) as total_paid
                FROM payments
                WHERE student_id = student_uuid AND status = 'completed'
                GROUP BY fee_id
            ) paid_fees ON f.id = paid_fees.fee_id
            LEFT JOIN (
                SELECT fee_id, SUM(amount) as total_pending
                FROM payments
                WHERE student_id = student_uuid AND status = 'pending'
                GROUP BY fee_id
            ) pending_fees ON f.id = pending_fees.fee_id
            WHERE s.id = student_uuid
            AND f.academic_year = current_year
            AND f.active = true
            AND (f.level_applicable = 'all' OR f.level_applicable = s.current_class)
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le planning d'une semaine
CREATE OR REPLACE FUNCTION get_weekly_schedule(school_uuid UUID, week_start DATE DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_date DATE;
    end_date DATE;
BEGIN
    -- Utiliser le début de la semaine courante si non spécifié
    IF week_start IS NULL THEN
        start_date := date_trunc('week', CURRENT_DATE);
    ELSE
        start_date := week_start;
    END IF;
    
    end_date := start_date + INTERVAL '6 days';
    
    SELECT json_build_object(
        'week_start', start_date,
        'week_end', end_date,
        'appointments', (
            SELECT json_agg(
                json_build_object(
                    'id', a.id,
                    'title', a.title,
                    'start_datetime', a.start_datetime,
                    'end_datetime', a.end_datetime,
                    'location', a.location,
                    'organizer', u.full_name,
                    'type', a.appointment_type,
                    'status', a.status
                )
            )
            FROM appointments a
            LEFT JOIN users u ON a.organizer_id = u.id
            WHERE a.school_id = school_uuid
            AND a.start_datetime::date BETWEEN start_date AND end_date
            ORDER BY a.start_datetime
        ),
        'events', (
            SELECT json_agg(
                json_build_object(
                    'id', e.id,
                    'title', e.title,
                    'start_date', e.start_date,
                    'end_date', e.end_date,
                    'start_time', e.start_time,
                    'end_time', e.end_time,
                    'location', e.location,
                    'organizer', u.full_name,
                    'type', e.event_type,
                    'status', e.status
                )
            )
            FROM events e
            LEFT JOIN users u ON e.organizer_id = u.id
            WHERE e.school_id = school_uuid
            AND e.start_date BETWEEN start_date AND end_date
            ORDER BY e.start_date, e.start_time
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTAIRES SUR LES VUES ET FONCTIONS
-- =====================================================

COMMENT ON VIEW student_complete_view IS 'Vue complète des élèves avec toutes les informations liées';
COMMENT ON VIEW tasks_dashboard_view IS 'Vue des tâches avec calculs de priorité et urgence';
COMMENT ON VIEW payments_complete_view IS 'Vue des paiements avec informations élèves et parents';
COMMENT ON VIEW events_calendar_view IS 'Vue des événements optimisée pour l''affichage calendrier';
COMMENT ON VIEW messages_stats_view IS 'Vue des messages avec statistiques de livraison';

COMMENT ON FUNCTION get_dashboard_stats IS 'Statistiques complètes pour le tableau de bord d''une école';
COMMENT ON FUNCTION generate_card_number IS 'Génère un numéro unique de carte scolaire';
COMMENT ON FUNCTION calculate_student_fees IS 'Calcule les frais dus et payés pour un élève';
COMMENT ON FUNCTION get_weekly_schedule IS 'Récupère le planning d''une semaine donnée';