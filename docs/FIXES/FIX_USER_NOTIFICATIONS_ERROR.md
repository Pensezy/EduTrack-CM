# 🔧 Correction Erreur user_notifications - Colonnes Manquantes

## ❌ Erreur Rencontrée

```
Error: Failed to run sql query: ERROR: 42703: column "action_url" of relation "user_notifications" does not exist
```

## 🔍 Cause

La table `user_notifications` existe déjà dans la base de données, mais elle ne contient pas toutes les colonnes nécessaires:
- ❌ `action_url` (manquante)
- ❌ `metadata` (probablement manquante)
- ❌ `priority` (probablement manquante)

La migration `20260103_create_user_notifications.sql` essaie de créer la table avec `CREATE TABLE IF NOT EXISTS`, ce qui ne fait rien si la table existe déjà, mais les fonctions `create_user_notification()` et `create_bulk_user_notifications()` tentent d'insérer dans ces colonnes manquantes.

## ✅ Solution

### Étape 1: Appliquer la Migration de Correction

Exécutez le SQL suivant dans le **SQL Editor** de Supabase:

📍 **URL:** https://supabase.com/dashboard/project/lbqwbnclknwszdnlxaxz/sql/new

```sql
-- ============================================================================
-- Migration: Correction des colonnes manquantes dans user_notifications
-- Date: 2026-01-03
-- Description: Ajoute les colonnes action_url et metadata si elles n'existent pas
-- ============================================================================

-- 1. Ajouter la colonne action_url si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_notifications'
      AND column_name = 'action_url'
  ) THEN
    ALTER TABLE user_notifications ADD COLUMN action_url TEXT;
    COMMENT ON COLUMN user_notifications.action_url IS 'URL vers laquelle rediriger au clic (optionnel)';
  END IF;
END $$;

-- 2. Ajouter la colonne metadata si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_notifications'
      AND column_name = 'metadata'
  ) THEN
    ALTER TABLE user_notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    COMMENT ON COLUMN user_notifications.metadata IS 'Données supplémentaires en JSON (ex: entity_id, entity_type)';
  END IF;
END $$;

-- 3. Ajouter la colonne priority si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_notifications'
      AND column_name = 'priority'
  ) THEN
    ALTER TABLE user_notifications ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium';

    -- Ajouter la contrainte CHECK pour priority
    ALTER TABLE user_notifications
    ADD CONSTRAINT user_notifications_priority_check
    CHECK (priority IN ('low', 'medium', 'high'));

    COMMENT ON COLUMN user_notifications.priority IS 'Priorité: low, medium, high';
  END IF;
END $$;

-- 4. Vérifier et créer les index s'ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread ON user_notifications(user_id, is_read) WHERE is_read = false;

-- 5. Recréer la fonction create_user_notification avec les nouvelles colonnes
CREATE OR REPLACE FUNCTION create_user_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_priority TEXT DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO user_notifications (
    user_id,
    title,
    message,
    type,
    priority,
    action_url,
    metadata
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_priority,
    p_action_url,
    p_metadata
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Recréer la fonction create_bulk_user_notifications
CREATE OR REPLACE FUNCTION create_bulk_user_notifications(
  p_user_ids UUID[],
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_priority TEXT DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_user_id UUID;
BEGIN
  FOREACH v_user_id IN ARRAY p_user_ids
  LOOP
    INSERT INTO user_notifications (
      user_id,
      title,
      message,
      type,
      priority,
      action_url,
      metadata
    ) VALUES (
      v_user_id,
      p_title,
      p_message,
      p_type,
      p_priority,
      p_action_url,
      p_metadata
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Ajouter les commentaires
COMMENT ON FUNCTION create_user_notification IS 'Crée une notification pour un utilisateur spécifique';
COMMENT ON FUNCTION create_bulk_user_notifications IS 'Crée des notifications en masse pour plusieurs utilisateurs';

-- ============================================================================
-- Fin de la migration
-- ============================================================================
```

### Étape 2: Vérifier que Tout Fonctionne

Après avoir exécuté la migration, testez la création d'une notification:

```sql
-- Test de création d'une notification simple
SELECT create_user_notification(
  (SELECT id FROM users LIMIT 1), -- ID d'un utilisateur existant
  'Test de notification',
  'Ceci est un test après la correction',
  'info',
  'medium',
  '/dashboard',
  '{"test": true}'::jsonb
);

-- Vérifier que la notification a été créée
SELECT * FROM user_notifications ORDER BY created_at DESC LIMIT 1;
```

### Étape 3: Résultat Attendu

Si tout fonctionne correctement, vous devriez voir:
- ✅ La requête s'exécute sans erreur
- ✅ Une nouvelle notification apparaît dans la table
- ✅ Toutes les colonnes sont remplies correctement

## 📋 Structure Complète de la Table

Après la correction, la table `user_notifications` devrait avoir ces colonnes:

| Colonne       | Type                  | Nullable | Default       | Description                          |
|---------------|-----------------------|----------|---------------|--------------------------------------|
| id            | UUID                  | NO       | gen_random_uuid() | Identifiant unique              |
| user_id       | UUID                  | NO       | -             | Référence vers auth.users            |
| title         | TEXT                  | NO       | -             | Titre de la notification             |
| message       | TEXT                  | NO       | -             | Contenu du message                   |
| type          | TEXT                  | NO       | 'info'        | Type: info/success/warning/error     |
| priority      | TEXT                  | NO       | 'medium'      | Priorité: low/medium/high            |
| is_read       | BOOLEAN               | NO       | false         | Lu ou non                            |
| read_at       | TIMESTAMP WITH TZ     | YES      | NULL          | Date de lecture                      |
| action_url    | TEXT                  | YES      | NULL          | URL de redirection                   |
| metadata      | JSONB                 | YES      | '{}'          | Données supplémentaires              |
| created_at    | TIMESTAMP WITH TZ     | NO       | NOW()         | Date de création                     |
| updated_at    | TIMESTAMP WITH TZ     | NO       | NOW()         | Date de modification                 |

## 🔍 Diagnostic Supplémentaire

Si l'erreur persiste, vérifiez la structure actuelle de la table:

```sql
-- Voir toutes les colonnes de user_notifications
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_notifications'
ORDER BY ordinal_position;

-- Voir les contraintes
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'user_notifications';
```

## 📝 Fichier de Migration

Le fichier de migration a été créé dans:
```
supabase/migrations/20260103_fix_user_notifications_columns.sql
```

Vous pouvez également l'exécuter plus tard via:
```bash
npx supabase db push
```
(nécessite Docker Desktop en cours d'exécution)

---

**Date:** 03 Janvier 2026
**Statut:** 🔧 À APPLIQUER MANUELLEMENT
