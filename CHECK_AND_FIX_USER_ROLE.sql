-- Script pour vérifier et corriger le rôle de l'utilisateur
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier le rôle actuel de l'utilisateur
SELECT
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM users
WHERE email = 'pensezy.si@gmail.com';

-- 2. Si le rôle n'est pas 'admin', le mettre à jour
UPDATE users
SET role = 'admin'
WHERE email = 'pensezy.si@gmail.com'
  AND role != 'admin';

-- 3. Vérifier après mise à jour
SELECT
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM users
WHERE email = 'pensezy.si@gmail.com';

-- 4. Si l'utilisateur n'existe pas du tout, l'insérer
-- (Remplacer YOUR_USER_ID par l'ID de auth.users)
/*
INSERT INTO users (id, email, full_name, role, is_active)
VALUES (
  'YOUR_USER_ID_FROM_AUTH_USERS',  -- Récupérer depuis auth.users
  'pensezy.si@gmail.com',
  'Pensezy Admin',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
*/
