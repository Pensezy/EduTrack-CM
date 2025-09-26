-- Requêtes de test pour les directeurs d'école
-- Utilisables dans l'interface Supabase ou pgAdmin

-- 1. Voir tous les directeurs avec leurs écoles
SELECT * FROM principals_view ORDER BY account_created DESC;

-- 2. Compter les directeurs par pays
SELECT 
    school_country as "Pays",
    COUNT(*) as "Nombre de directeurs",
    COUNT(*) FILTER (WHERE is_active = true) as "Actifs"
FROM principals_view 
WHERE school_country IS NOT NULL
GROUP BY school_country
ORDER BY COUNT(*) DESC;

-- 3. Directeurs par type d'établissement
SELECT 
    school_type as "Type d'établissement",
    COUNT(*) as "Nombre d'établissements"
FROM principals_view 
WHERE school_type IS NOT NULL
GROUP BY school_type
ORDER BY COUNT(*) DESC;

-- 4. Directeurs avec le plus d'élèves
SELECT 
    director_name as "Directeur",
    school_name as "École",
    school_city as "Ville",
    total_students as "Nombre d'élèves",
    total_teachers as "Nombre d'enseignants"
FROM principals_view 
WHERE total_students > 0
ORDER BY total_students DESC
LIMIT 10;

-- 5. Écoles créées récemment
SELECT 
    director_name as "Directeur",
    school_name as "École",
    school_city as "Ville",
    school_country as "Pays",
    account_created as "Date de création"
FROM principals_view 
ORDER BY account_created DESC
LIMIT 10;

-- 6. Directeurs inactifs
SELECT 
    director_name as "Directeur",
    director_email as "Email",
    school_name as "École",
    last_login as "Dernière connexion"
FROM principals_view 
WHERE is_active = false
ORDER BY last_login DESC NULLS LAST;

-- 7. Statistiques par ville (Top 10)
SELECT 
    school_city as "Ville",
    school_country as "Pays",
    COUNT(*) as "Nombre d'écoles",
    SUM(total_students) as "Total élèves",
    SUM(total_teachers) as "Total enseignants"
FROM principals_view 
WHERE school_city IS NOT NULL
GROUP BY school_city, school_country
ORDER BY COUNT(*) DESC
LIMIT 10;

-- 8. Utilisation des fonctions personnalisées

-- Obtenir les détails d'un directeur spécifique
-- SELECT * FROM get_principal_details('directeur@monecole.cm');

-- Lister les directeurs (première page)
-- SELECT * FROM list_principals(0, 10);

-- Lister les directeurs du Cameroun uniquement
-- SELECT * FROM list_principals(0, 10, 'Cameroun', NULL);

-- Obtenir les statistiques globales
-- SELECT * FROM get_principals_stats();