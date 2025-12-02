-- Migration: Fonctions de gestion des comptes utilisateurs
-- Date: 2025-12-02
-- Description: Ajoute les fonctions pour désactiver/réactiver/débloquer les comptes

-- Fonction pour désactiver un compte utilisateur
CREATE OR REPLACE FUNCTION deactivate_user_account(
  p_user_id UUID,
  p_deactivated_by UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Vérifier que l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Utilisateur introuvable'
    );
  END IF;

  -- Désactiver le compte
  UPDATE users
  SET 
    is_active = false,
    deactivated_at = NOW(),
    deactivated_by = p_deactivated_by,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Retourner le résultat
  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'deactivated_at', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour réactiver un compte utilisateur
CREATE OR REPLACE FUNCTION reactivate_user_account(
  p_user_id UUID,
  p_reactivated_by UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Vérifier que l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Utilisateur introuvable'
    );
  END IF;

  -- Réactiver le compte
  UPDATE users
  SET 
    is_active = true,
    deactivated_at = NULL,
    deactivated_by = NULL,
    reactivated_at = NOW(),
    reactivated_by = p_reactivated_by,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Retourner le résultat
  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'reactivated_at', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour débloquer un compte utilisateur
CREATE OR REPLACE FUNCTION unlock_user_account(
  p_user_id UUID,
  p_unlocked_by UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Vérifier que l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Utilisateur introuvable'
    );
  END IF;

  -- Débloquer le compte en réinitialisant les tentatives de connexion
  UPDATE users
  SET 
    login_attempts = 0,
    is_locked = false,
    locked_at = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Retourner le résultat
  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'unlocked_at', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS deactivated_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS reactivated_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_is_locked ON users(is_locked);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Commentaires
COMMENT ON FUNCTION deactivate_user_account IS 'Désactive un compte utilisateur (soft delete)';
COMMENT ON FUNCTION reactivate_user_account IS 'Réactive un compte utilisateur précédemment désactivé';
COMMENT ON FUNCTION unlock_user_account IS 'Débloque un compte utilisateur verrouillé après trop de tentatives';

COMMENT ON COLUMN users.deactivated_at IS 'Date de désactivation du compte';
COMMENT ON COLUMN users.deactivated_by IS 'ID de l\'utilisateur qui a désactivé ce compte';
COMMENT ON COLUMN users.reactivated_at IS 'Date de réactivation du compte';
COMMENT ON COLUMN users.reactivated_by IS 'ID de l\'utilisateur qui a réactivé ce compte';
COMMENT ON COLUMN users.login_attempts IS 'Nombre de tentatives de connexion échouées';
COMMENT ON COLUMN users.is_locked IS 'Indique si le compte est verrouillé';
COMMENT ON COLUMN users.locked_at IS 'Date de verrouillage du compte';
COMMENT ON COLUMN users.last_login IS 'Date de la dernière connexion réussie';
