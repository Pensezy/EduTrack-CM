-- Fonction RPC pour mettre à jour le mot de passe d'un élève par le parent
-- Cette fonction vérifie que le parent a le droit de modifier l'enfant avant de procéder
-- Note: Cette fonction utilise une extension spéciale qui peut ne pas être disponible en standard

-- Alternative 1: Fonction RPC (nécessite des permissions admin)
-- Cette fonction ne peut PAS directement modifier auth.users sans extension spéciale
-- Elle sert plutôt à valider la relation parent-enfant

CREATE OR REPLACE FUNCTION verify_parent_student_relationship(
  p_parent_user_id UUID,
  p_student_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_parent_id UUID;
  v_student_id UUID;
  v_relationship_exists BOOLEAN;
BEGIN
  -- Récupérer l'ID du parent à partir de son user_id
  SELECT id INTO v_parent_id
  FROM parents
  WHERE user_id = p_parent_user_id;

  IF v_parent_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Récupérer l'ID de l'élève à partir de son user_id
  SELECT id INTO v_student_id
  FROM students
  WHERE user_id = p_student_user_id;

  IF v_student_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Vérifier la relation dans parent_students
  SELECT EXISTS(
    SELECT 1
    FROM parent_students
    WHERE parent_id = v_parent_id
    AND student_id = v_student_id
  ) INTO v_relationship_exists;

  RETURN v_relationship_exists;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION verify_parent_student_relationship IS 
'Vérifie si un parent a le droit de gérer un élève en vérifiant la relation dans parent_students';

-- Note importante:
-- Pour réellement changer le mot de passe dans auth.users, vous devez:
-- 1. Utiliser une Edge Function avec le service_role_key (recommandé)
-- 2. Utiliser l'extension pgsodium si disponible
-- 3. Faire un appel API depuis le frontend vers l'Edge Function

-- Exemple d'utilisation depuis le frontend:
-- const { data, error } = await supabase.rpc('verify_parent_student_relationship', {
--   p_parent_user_id: parentUserId,
--   p_student_user_id: studentUserId
-- });
