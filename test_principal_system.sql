-- Tests pour vérifier le bon fonctionnement du système de création de comptes principaux
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Test de création d'un compte principal de démonstration
SELECT * FROM create_principal_account(
    'Jean Dupont',                    -- director_name
    'jean.dupont@lycee-excellence.cm', -- email_input
    '+237690123456',                  -- phone_input
    'MotDePasse123!',                 -- password_input
    'Lycée d''Excellence de Yaoundé', -- school_name
    'lycee',                          -- school_type
    '123 Avenue Kennedy, Yaoundé',    -- school_address
    'Yaoundé',                        -- school_city
    'Cameroun',                       -- school_country
    ARRAY['Seconde', 'Première', 'Terminale'] -- available_classes
);

-- 2. Vérifier la vue des directeurs
SELECT * FROM principals_view LIMIT 5;

-- 3. Test de la fonction de détails d'un directeur
SELECT * FROM get_principal_details('jean.dupont@lycee-excellence.cm');

-- 4. Test de la liste des directeurs avec pagination
SELECT * FROM list_principals(0, 10, NULL, NULL);

-- 5. Test des statistiques globales
SELECT * FROM get_principals_stats();

-- 6. Vérifier les tables directement
SELECT 
    u.full_name,
    u.email,
    u.role,
    s.name as school_name,
    s.code as school_code,
    s.type as school_type
FROM users u 
LEFT JOIN schools s ON u.current_school_id = s.id 
WHERE u.role = 'principal'
ORDER BY u.created_at DESC
LIMIT 5;

-- 7. Test avec un directeur français
SELECT * FROM create_principal_account(
    'Marie Dubois',                   -- director_name
    'marie.dubois@college-paris.fr',  -- email_input
    '+33123456789',                   -- phone_input
    'SecurePass456!',                 -- password_input
    'Collège International de Paris', -- school_name
    'college',                        -- school_type
    '45 Rue de la République, Paris', -- school_address
    'Paris',                          -- school_city
    'France',                         -- school_country
    ARRAY['6ème', '5ème', '4ème', '3ème'] -- available_classes
);