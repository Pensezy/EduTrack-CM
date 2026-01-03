# Instructions de Migration - Champs Parents

## Migration à Appliquer

Pour que la création des parents fonctionne correctement avec les champs `profession` et `address`, vous devez exécuter la migration SQL suivante.

### Étapes:

1. **Ouvrez le SQL Editor de Supabase**
   - Allez sur: https://supabase.com/dashboard/project/lbqwbnclknwszdnlxaxz/sql/new

2. **Copiez et collez le SQL ci-dessous**

3. **Cliquez sur "Run" pour exécuter**

### SQL à Exécuter:

```sql
-- ============================================================================
-- Migration: Ajout des champs profession et address pour les parents
-- Date: 2026-01-03
-- Description: Ajoute les colonnes manquantes dans la table users pour les parents
-- ============================================================================

-- Ajouter la colonne profession (si elle n'existe pas déjà)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'profession'
  ) THEN
    ALTER TABLE users ADD COLUMN profession TEXT;
  END IF;
END $$;

-- Ajouter la colonne address (si elle n'existe pas déjà)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'address'
  ) THEN
    ALTER TABLE users ADD COLUMN address TEXT;
  END IF;
END $$;

-- Ajouter des commentaires pour documentation
COMMENT ON COLUMN users.profession IS 'Profession du parent/tuteur (optionnel)';
COMMENT ON COLUMN users.address IS 'Adresse du parent/tuteur (optionnel)';

-- ============================================================================
-- Fin de la migration
-- ============================================================================
```

### Vérification:

Après exécution, vous devriez voir le message de succès dans Supabase.

Pour vérifier que les colonnes ont bien été ajoutées, exécutez:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('profession', 'address');
```

Vous devriez voir:
```
column_name | data_type
------------|----------
profession  | text
address     | text
```

### Que fait cette migration?

- Ajoute la colonne `profession` (TEXT) à la table `users`
- Ajoute la colonne `address` (TEXT) à la table `users`
- Ces colonnes sont optionnelles et utilisées pour stocker les informations des parents
- La migration est sécurisée: elle vérifie d'abord si les colonnes existent déjà

## Après la Migration

Une fois la migration appliquée, vous pourrez créer des parents avec les champs profession et adresse dans l'interface admin.
