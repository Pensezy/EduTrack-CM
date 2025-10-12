-- =====================================================
-- SCRIPT: Données de démonstration
-- Date: 2025-10-12
-- Description: Insertion de données fictives pour tests
-- =====================================================

-- Ce script insère des données de test uniquement si aucune donnée n'existe
-- Ne pas exécuter en production !

-- =====================================================
-- INSERTION CONDITIONNELLE DES DONNÉES DE TEST
-- =====================================================

-- Vérifier qu'il n'y a pas déjà de données de test
DO $$
DECLARE
    test_school_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO test_school_count FROM schools WHERE name LIKE '%Test%';
    
    IF test_school_count = 0 THEN
        -- Insérer une école de test
        INSERT INTO schools (id, name, address, phone, email, city, postal_code)
        VALUES (
            'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid,
            'École Primaire de Test',
            '123 Rue des Tests',
            '01.23.45.67.89',
            'contact@ecole-test.edu',
            'Testville',
            '12345'
        );
        
        -- Insérer un directeur de test
        INSERT INTO users (id, full_name, email, phone, role, school_id, pin_code, active)
        VALUES (
            'b1b1b1b1-c2c2-d3d3-e4e4-f5f5f5f5f5f5'::uuid,
            'Jean Directeur',
            'directeur@ecole-test.edu',
            '01.23.45.67.80',
            'principal',
            'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid,
            '0000',
            true
        );
        
        -- Insérer une secrétaire de test
        INSERT INTO users (id, full_name, email, phone, role, school_id, pin_code, active)
        VALUES (
            'c2c2c2c2-d3d3-e4e4-f5f5-a6a6a6a6a6a6'::uuid,
            'Marie Secrétaire',
            'secretaire@ecole-test.edu',
            '01.23.45.67.81',
            'secretary',
            'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid,
            '1234',
            true
        );
        
        -- Insérer des classes de test
        INSERT INTO classes (name, level, school_id, capacity, teacher_id, academic_year)
        VALUES 
            ('CE1A', 1, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, 25, NULL, '2024-2025'),
            ('CE2A', 2, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, 25, NULL, '2024-2025'),
            ('CM1A', 3, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, 25, NULL, '2024-2025'),
            ('CM2A', 4, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, 25, NULL, '2024-2025');
        
        -- Insérer des parents de test
        INSERT INTO users (id, full_name, email, phone, role, school_id, pin_code, active)
        VALUES 
            ('d3d3d3d3-e4e4-f5f5-a6a6-b7b7b7b7b7b7'::uuid, 'Pierre Parent1', 'parent1@test.com', '01.11.11.11.11', 'parent', 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, '2001', true),
            ('e4e4e4e4-f5f5-a6a6-b7b7-c8c8c8c8c8c8'::uuid, 'Sophie Parent2', 'parent2@test.com', '01.22.22.22.22', 'parent', 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, '2002', true),
            ('f5f5f5f5-a6a6-b7b7-c8c8-d9d9d9d9d9d9'::uuid, 'Michel Parent3', 'parent3@test.com', '01.33.33.33.33', 'parent', 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, '2003', true);
        
        -- Insérer des élèves de test
        INSERT INTO students (id, full_name, matricule, email, phone, current_class, school_id, parent_id, date_of_birth, address, enrollment_date, status)
        VALUES 
            ('11111111-2222-3333-4444-555555555555'::uuid, 'Alice Élève', 'ET2024001', 'alice@test.com', '01.11.11.11.12', 'CE1A', 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, 'd3d3d3d3-e4e4-f5f5-a6a6-b7b7b7b7b7b7'::uuid, '2015-03-15', '10 Rue des Élèves', '2024-09-01', 'active'),
            ('22222222-3333-4444-5555-666666666666'::uuid, 'Bob Étudiant', 'ET2024002', 'bob@test.com', '01.22.22.22.23', 'CE2A', 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, 'e4e4e4e4-f5f5-a6a6-b7b7-c8c8c8c8c8c8'::uuid, '2014-07-22', '20 Avenue des Tests', '2024-09-01', 'active'),
            ('33333333-4444-5555-6666-777777777777'::uuid, 'Clara Apprentie', 'ET2024003', 'clara@test.com', '01.33.33.33.34', 'CM1A', 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, 'f5f5f5f5-a6a6-b7b7-c8c8-d9d9d9d9d9d9'::uuid, '2013-11-08', '30 Boulevard de l''École', '2024-09-01', 'active');
        
        -- Insérer des tâches de test
        INSERT INTO tasks (title, description, priority, status, category, assigned_to, created_by, school_id, due_date, student_related)
        VALUES 
            ('Appeler parent Alice', 'Contacter le parent pour absence non justifiée', 'urgent', 'pending', 'appels', 'c2c2c2c2-d3d3-e4e4-f5f5-a6a6a6a6a6a6'::uuid, 'c2c2c2c2-d3d3-e4e4-f5f5-a6a6a6a6a6a6'::uuid, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, CURRENT_DATE + 1, '11111111-2222-3333-4444-555555555555'::uuid),
            ('Préparer certificats', 'Générer les certificats de scolarité pour les nouveaux', 'medium', 'in_progress', 'documents', 'c2c2c2c2-d3d3-e4e4-f5f5-a6a6a6a6a6a6'::uuid, 'c2c2c2c2-d3d3-e4e4-f5f5-a6a6a6a6a6a6'::uuid, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, CURRENT_DATE + 3, NULL),
            ('Vérifier paiements', 'Relancer les parents pour les frais en retard', 'high', 'pending', 'paiements', 'c2c2c2c2-d3d3-e4e4-f5f5-a6a6a6a6a6a6'::uuid, 'b1b1b1b1-c2c2-d3d3-e4e4-f5f5f5f5f5f5'::uuid, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, CURRENT_DATE + 2, NULL);
        
        -- Insérer des cartes d'élèves de test
        INSERT INTO student_cards (student_id, school_id, card_number, issue_date, expiry_date, status)
        VALUES 
            ('11111111-2222-3333-4444-555555555555'::uuid, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, 'ECO2024-0001', '2024-09-01', '2025-08-31', 'active'),
            ('22222222-3333-4444-5555-666666666666'::uuid, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, 'ECO2024-0002', '2024-09-01', '2025-08-31', 'active'),
            ('33333333-4444-5555-6666-777777777777'::uuid, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, 'ECO2024-0003', '2024-09-01', '2025-08-31', 'active');
        
        -- Insérer des paiements de test
        INSERT INTO payments (student_id, amount, status, payment_method, due_date, description, fee_id)
        SELECT 
            students.id,
            fees.amount,
            CASE 
                WHEN random() < 0.3 THEN 'pending'
                WHEN random() < 0.1 THEN 'overdue'
                ELSE 'completed'
            END,
            CASE 
                WHEN random() < 0.5 THEN 'cash'
                WHEN random() < 0.3 THEN 'bank_transfer'
                ELSE 'mobile_money'
            END,
            CURRENT_DATE + (random() * 30)::integer,
            fees.name,
            fees.id
        FROM students
        CROSS JOIN fees
        WHERE students.school_id = 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid
        AND fees.school_id = 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid
        AND fees.mandatory = true;
        
        -- Insérer des absences de test
        INSERT INTO absences (student_id, date_absence, justified, reason, justification_date)
        VALUES 
            ('11111111-2222-3333-4444-555555555555'::uuid, CURRENT_DATE - 5, false, NULL, NULL),
            ('11111111-2222-3333-4444-555555555555'::uuid, CURRENT_DATE - 3, true, 'Maladie', CURRENT_DATE - 2),
            ('22222222-3333-4444-5555-666666666666'::uuid, CURRENT_DATE - 7, true, 'Rendez-vous médical', CURRENT_DATE - 6),
            ('33333333-4444-5555-6666-777777777777'::uuid, CURRENT_DATE - 2, false, NULL, NULL);
        
        -- Insérer des événements de test
        INSERT INTO events (title, description, event_type, category, start_date, end_date, location, organizer_id, school_id, status)
        VALUES 
            ('Réunion parents CE1', 'Réunion trimestrielle avec les parents de CE1', 'school', 'parents_meeting', CURRENT_DATE + 7, CURRENT_DATE + 7, 'Salle polyvalente', 'b1b1b1b1-c2c2-d3d3-e4e4-f5f5f5f5f5f5'::uuid, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, 'planned'),
            ('Fête de l''école', 'Journée portes ouvertes et spectacle des élèves', 'school', 'celebration', CURRENT_DATE + 21, CURRENT_DATE + 21, 'Cour de récréation', 'b1b1b1b1-c2c2-d3d3-e4e4-f5f5f5f5f5f5'::uuid, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, 'planned'),
            ('Formation enseignants', 'Formation continue sur les nouvelles méthodes pédagogiques', 'school', 'training', CURRENT_DATE + 14, CURRENT_DATE + 14, 'Salle de réunion', 'b1b1b1b1-c2c2-d3d3-e4e4-f5f5f5f5f5f5'::uuid, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, 'planned');
        
        -- Insérer des rendez-vous de test
        INSERT INTO appointments (title, description, organizer_id, school_id, start_datetime, end_datetime, appointment_type, status, student_related)
        VALUES 
            ('RDV Parent Alice', 'Entretien avec le parent d''Alice pour discuter de ses résultats', 'c2c2c2c2-d3d3-e4e4-f5f5-a6a6a6a6a6a6'::uuid, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, CURRENT_TIMESTAMP + INTERVAL '3 days 14 hours', CURRENT_TIMESTAMP + INTERVAL '3 days 15 hours', 'parent_conference', 'scheduled', '11111111-2222-3333-4444-555555555555'::uuid),
            ('Visite inspection', 'Visite de l''inspecteur académique', 'b1b1b1b1-c2c2-d3d3-e4e4-f5f5f5f5f5f5'::uuid, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, CURRENT_TIMESTAMP + INTERVAL '10 days 10 hours', CURRENT_TIMESTAMP + INTERVAL '10 days 12 hours', 'meeting', 'scheduled', NULL);
        
        -- Insérer des documents de test
        INSERT INTO documents (title, description, document_type, category, created_by, school_id, student_related, status, content)
        VALUES 
            ('Certificat Alice', 'Certificat de scolarité pour Alice Élève', 'certificate', 'academic', 'c2c2c2c2-d3d3-e4e4-f5f5-a6a6a6a6a6a6'::uuid, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, '11111111-2222-3333-4444-555555555555'::uuid, 'approved', 'Certificat de scolarité pour Alice Élève, classe CE1A, année 2024-2025'),
            ('Rapport mensuel', 'Rapport d''activité mensuel de octobre 2024', 'report', 'administrative', 'c2c2c2c2-d3d3-e4e4-f5f5-a6a6a6a6a6a6'::uuid, 'a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4'::uuid, NULL, 'draft', 'Rapport mensuel des activités de l''école pour octobre 2024');
        
        RAISE NOTICE 'Données de test insérées avec succès pour l''école de test';
    ELSE
        RAISE NOTICE 'Des données de test existent déjà, insertion ignorée';
    END IF;
END $$;