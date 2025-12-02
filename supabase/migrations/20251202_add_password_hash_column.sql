-- Ajouter la colonne password_hash pour les comptes locaux (sans Supabase Auth)
-- Utilisée pour les étudiants, parents, enseignants, secrétaires

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Ajouter un commentaire pour documenter l'usage
COMMENT ON COLUMN users.password_hash IS 'Mot de passe stocké en clair (temporaire) pour les comptes sans Supabase Auth. À sécuriser avec bcrypt plus tard.';

-- Créer un index pour améliorer les performances de connexion
CREATE INDEX IF NOT EXISTS idx_users_email_password ON users(email, password_hash) WHERE password_hash IS NOT NULL;
