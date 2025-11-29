-- ====================================
-- CRÉATION D'UN ENSEIGNANT DE TEST
-- À exécuter APRÈS avoir vérifié les données existantes
-- ====================================

-- ⚠️ IMPORTANT : Remplacez les valeurs ci-dessous par vos IDs réels
-- Utilisez check_existing_data.sql pour obtenir les IDs de votre école et année scolaire

-- ====================================
-- ÉTAPE 1 : Créer l'utilisateur dans users
-- ====================================

INSERT INTO users (id, email, full_name, role, current_school_id, is_active, phone)
VALUES (
  gen_random_uuid(), -- Générera automatiquement un UUID
  'rose.tchoukoua@ecole.cm', -- ⚠️ MODIFIER avec un email réel
  'Rose Tchoukoua',
  'teacher',
  (SELECT id FROM schools LIMIT 1), -- Prend la première école (⚠️ ou spécifiez un ID)
  true,
  '+237 6 XX XX XX XX' -- ⚠️ MODIFIER avec un vrai numéro
)
ON CONFLICT (email) DO NOTHING -- Évite l'erreur si l'email existe déjà
RETURNING id, email, full_name;

-- ====================================
-- ÉTAPE 2 : Créer l'entrée dans teachers
-- ====================================

INSERT INTO teachers (school_id, user_id, first_name, last_name, specialty, is_active, hire_date)
SELECT 
  (SELECT id FROM schools LIMIT 1), -- ⚠️ Remplacer par votre school_id réel
  u.id,
  'Rose',
  'Tchoukoua',
  'Mathématiques',
  true,
  CURRENT_DATE
FROM users u
WHERE u.email = 'rose.tchoukoua@ecole.cm'
  AND NOT EXISTS (
    -- Évite de créer un doublon si le teacher existe déjà
    SELECT 1 FROM teachers t WHERE t.user_id = u.id
  )
RETURNING id, first_name || ' ' || last_name AS full_name, specialty;

-- ====================================
-- ÉTAPE 3 : Vérifier la création
-- ====================================

SELECT 
    t.id AS teacher_id,
    t.first_name || ' ' || t.last_name AS teacher_name,
    t.specialty,
    s.name AS school_name,
    u.email,
    u.phone
FROM teachers t
JOIN schools s ON t.school_id = s.id
JOIN users u ON t.user_id = u.id
WHERE u.email = 'rose.tchoukoua@ecole.cm';

-- ====================================
-- AFFICHAGE DU RÉSULTAT
-- ====================================

DO $$ 
DECLARE
    teacher_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM teachers t
        JOIN users u ON t.user_id = u.id
        WHERE u.email = 'rose.tchoukoua@ecole.cm'
    ) INTO teacher_exists;
    
    IF teacher_exists THEN
        RAISE NOTICE '';
        RAISE NOTICE '✅ ========================================';
        RAISE NOTICE '✅ Enseignant créé/vérifié avec succès !';
        RAISE NOTICE '✅ Email: rose.tchoukoua@ecole.cm';
        RAISE NOTICE '✅ ========================================';
        RAISE NOTICE '';
        RAISE NOTICE '📋 Prochaines étapes :';
        RAISE NOTICE '1. Exécutez create_teacher_assignments.sql';
        RAISE NOTICE '2. Créez des assignations avec create_sample_assignment.sql';
        RAISE NOTICE '3. Testez le dashboard enseignant';
    ELSE
        RAISE WARNING '';
        RAISE WARNING '❌ ========================================';
        RAISE WARNING '❌ Échec de la création de l''enseignant';
        RAISE WARNING '❌ Vérifiez que vous avez au moins une école dans la base';
        RAISE WARNING '❌ Exécutez check_existing_data.sql pour voir les données';
        RAISE WARNING '❌ ========================================';
    END IF;
END $$;

-- ====================================
-- NOTES IMPORTANTES
-- ====================================

/*
⚠️ AVANT D'EXÉCUTER CE SCRIPT :

1. Vérifiez que vous avez au moins UNE école :
   SELECT * FROM schools;

2. Vérifiez que vous avez au moins UNE année scolaire :
   SELECT * FROM academic_years;

3. Si vous n'avez pas d'école, créez-en une d'abord :
   INSERT INTO schools (name, code, type, director_name, phone, email, status)
   VALUES ('Lycée Bilingue Biyem-Assi', 'LBB-001', 'lycee', 'M. Directeur', '+237...', 'direction@lycee.cm', 'active')
   RETURNING id, name;

4. Modifiez les valeurs dans ce fichier selon vos besoins :
   - Email de l'enseignant
   - Nom et prénom
   - Spécialité
   - Téléphone
   - School ID (si vous en avez plusieurs)
*/
