# 🚀 PHASE 2 - GUIDE DE DÉPLOIEMENT SÉCURISÉ

**Date:** 25 Décembre 2024
**Objectif:** Appliquer toutes les mesures de sécurité de Phase 1 en production
**Temps estimé:** 2-3 heures
**Criticité:** 🔴 CRITIQUE - Ne pas sauter d'étapes

---

## ⚠️ AVANT DE COMMENCER

### Prérequis Obligatoires

- [ ] Avoir complété la Phase 1 (fichiers créés)
- [ ] Accès administrateur à Supabase
- [ ] Accès au compte EmailJS
- [ ] Accès au compte Vercel (si déploiement)
- [ ] Backup récent de la base de données

### ⚡ AVERTISSEMENT CRITIQUE

> **Cette phase va modifier la base de données en production.**
> **Un backup est OBLIGATOIRE avant de continuer.**

---

## 📋 CHECKLIST COMPLÈTE

### ✅ Étape 1: Backup de la Base de Données

**Temps:** 5-10 minutes
**Criticité:** 🔴 OBLIGATOIRE

#### 1.1 Se Connecter à Supabase

```bash
# Ouvrir https://supabase.com
# Se connecter à votre projet EduTrack-CM
```

#### 1.2 Créer un Backup SQL

1. Aller dans **Database** → **Backups**
2. Cliquer sur **Create backup now**
3. Nom suggéré: `before-rls-migration-2024-12-25`
4. Attendre la confirmation ✅

#### 1.3 Télécharger le Backup (Optionnel mais Recommandé)

```bash
# Dans le terminal
cd "e:\Projet ENS - EduTrack CM\EduTrack-CM"
mkdir -p backups

# Aller dans Supabase → Database → Backups
# Cliquer sur Download sur le backup créé
# Sauvegarder dans backups/backup-before-rls-2024-12-25.sql
```

**✅ VALIDATION:** Vous avez un backup récent visible dans Supabase

---

### ✅ Étape 2: Régénérer les Clés API

**Temps:** 15-20 minutes
**Criticité:** 🔴 OBLIGATOIRE (clés exposées dans Git)

#### 2.1 Régénérer les Clés Supabase

⚠️ **IMPORTANT:** Ceci va invalider les anciennes clés. L'application cessera de fonctionner temporairement jusqu'à la mise à jour du .env.

**Instructions:**

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet EduTrack-CM
3. Aller dans **Settings** → **API**
4. Section "Project API keys":
   - **anon public key**: Noter la nouvelle clé
   - **service_role key**: Cliquer sur "Reset" (⚠️ action destructive)

5. Copier les nouvelles clés dans un fichier temporaire

**Nouvelles clés à noter:**

```bash
# NOUVELLES CLÉS - À COPIER
VITE_SUPABASE_URL=https://votre-projet.supabase.co  # (inchangé)
VITE_SUPABASE_ANON_KEY=eyJhb... (NOUVELLE CLÉ)
SUPABASE_SERVICE_ROLE_KEY=eyJhb... (NOUVELLE CLÉ)
```

#### 2.2 Régénérer les Clés EmailJS

1. Aller sur [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Se connecter avec votre compte
3. Aller dans **Account** → **API Keys**
4. Cliquer sur **Create New Key**
5. Noter la nouvelle clé publique

**Nouvelle clé EmailJS:**

```bash
VITE_EMAILJS_PUBLIC_KEY=nouvelle_clé_ici
```

#### 2.3 Mettre à Jour le Fichier .env Local

```bash
cd "e:\Projet ENS - EduTrack CM\EduTrack-CM"

# Ouvrir .env dans votre éditeur
# Remplacer TOUTES les clés par les nouvelles
```

**Fichier .env complet:**

```env
# Supabase Configuration (NOUVELLES CLÉS)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG... (NOUVELLE)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (NOUVELLE)

# EmailJS Configuration (NOUVELLE CLÉ)
VITE_EMAILJS_SERVICE_ID=votre_service_id
VITE_EMAILJS_TEMPLATE_ID=votre_template_id
VITE_EMAILJS_PUBLIC_KEY=votre_nouvelle_public_key

# Security Settings
VITE_APP_ENV=development
VITE_ENABLE_DEBUG=true
```

#### 2.4 Tester la Connexion

```bash
npm run dev

# Ouvrir http://localhost:5173
# Essayer de se connecter avec un compte démo
# Vérifier que la connexion fonctionne
```

**✅ VALIDATION:** L'application se connecte à Supabase avec les nouvelles clés

---

### ✅ Étape 3: Appliquer la Migration RLS

**Temps:** 10-15 minutes
**Criticité:** 🔴 OBLIGATOIRE (sécurité multi-tenant)

#### 3.1 Vérifier le Fichier de Migration

```bash
cd "e:\Projet ENS - EduTrack CM\EduTrack-CM"
cat supabase/migrations/20251225_enable_rls_security.sql
```

Vérifier que le fichier contient:
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` (22 fois)
- `CREATE POLICY ...` (30+ fois)
- `CREATE OR REPLACE FUNCTION get_user_school_id()`

#### 3.2 Appliquer la Migration sur Supabase

**Option A: Via le Dashboard Supabase (Recommandé)**

1. Aller sur Supabase Dashboard
2. Cliquer sur **SQL Editor**
3. Cliquer sur **New Query**
4. Copier-coller le contenu complet de `supabase/migrations/20251225_enable_rls_security.sql`
5. Cliquer sur **Run** (▶️)
6. Attendre la confirmation de succès

**Option B: Via CLI Supabase**

```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref votre-project-ref

# Appliquer la migration
supabase db push
```

#### 3.3 Vérifier que RLS est Activée

```sql
-- Exécuter dans SQL Editor
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Résultat attendu:** `rowsecurity = true` pour toutes les tables

#### 3.4 Vérifier les Politiques

```sql
-- Exécuter dans SQL Editor
SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Résultat attendu:** Au moins 30 politiques créées

**✅ VALIDATION:** RLS activée sur toutes les tables, politiques créées

---

### ✅ Étape 4: Migrer les Mots de Passe vers bcrypt

**Temps:** 5-10 minutes
**Criticité:** 🟠 IMPORTANTE (si utilisateurs existants)

⚠️ **SKIP si:** Vous n'avez que des comptes démo (aucun utilisateur réel)

#### 4.1 Vérifier les Utilisateurs en Base

```sql
-- Exécuter dans SQL Editor Supabase
SELECT
    id,
    email,
    full_name,
    password_hash,
    CASE
        WHEN password_hash LIKE '$2%' THEN 'bcrypt ✅'
        ELSE 'plaintext ⚠️'
    END as status
FROM users
LIMIT 20;
```

Si tous les mots de passe sont déjà en bcrypt (commencent par `$2`), **SKIP cette étape**.

#### 4.2 Exécuter le Script de Migration

```bash
cd "e:\Projet ENS - EduTrack CM\EduTrack-CM"

# Installer les dépendances si pas déjà fait
npm install bcryptjs dotenv

# Exécuter le script
node scripts/migrate-passwords-to-bcrypt.js
```

**Sortie attendue:**

```
🔐 Migration des mots de passe vers bcrypt...
✅ Configuration chargée avec succès
🔍 Récupération des utilisateurs...
📊 Trouvé 15 utilisateurs à migrer

Traitement:
  ✅ user1@example.com - Migré
  ✅ user2@example.com - Migré
  ...

✅ Migration terminée avec succès!
📊 Statistiques:
   Total: 15
   Succès: 15
   Erreurs: 0
```

#### 4.3 Vérifier la Migration

```sql
-- Exécuter dans SQL Editor
SELECT
    COUNT(*) as total,
    SUM(CASE WHEN password_hash LIKE '$2%' THEN 1 ELSE 0 END) as bcrypt_count,
    SUM(CASE WHEN password_hash NOT LIKE '$2%' THEN 1 ELSE 0 END) as plaintext_count
FROM users;
```

**Résultat attendu:** `plaintext_count = 0`

**✅ VALIDATION:** Tous les mots de passe sont en bcrypt

---

### ✅ Étape 5: Tester l'Isolation RLS

**Temps:** 10-15 minutes
**Criticité:** 🔴 OBLIGATOIRE

#### 5.1 Créer 2 Écoles de Test

```sql
-- Exécuter dans SQL Editor
-- École 1
INSERT INTO schools (id, name, code, address, director_user_id, created_at)
VALUES (
    gen_random_uuid(),
    'École Test A',
    'TEST-A',
    '123 Rue Test A',
    (SELECT id FROM users WHERE email = 'teacher@demo.com'),
    NOW()
);

-- École 2
INSERT INTO schools (id, name, code, address, director_user_id, created_at)
VALUES (
    gen_random_uuid(),
    'École Test B',
    'TEST-B',
    '456 Rue Test B',
    (SELECT id FROM users WHERE email = 'principal@demo.com'),
    NOW()
);
```

#### 5.2 Créer 2 Étudiants (1 par école)

```sql
-- Étudiant École A
INSERT INTO students (
    id, user_id, school_id, matricule,
    class_name, is_active, created_at
)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'student@demo.com'),
    (SELECT id FROM schools WHERE code = 'TEST-A'),
    'TEST-A-001',
    'Test A',
    true,
    NOW()
);

-- Étudiant École B
INSERT INTO students (
    id, user_id, school_id, matricule,
    class_name, is_active, created_at
)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'parent@demo.com'),
    (SELECT id FROM schools WHERE code = 'TEST-B'),
    'TEST-B-001',
    'Test B',
    true,
    NOW()
);
```

#### 5.3 Tester l'Isolation

**Test 1: Enseignant de l'École A ne voit pas École B**

```sql
-- Se connecter comme enseignant École A
-- Exécuter:
SELECT * FROM students;
```

**Résultat attendu:** Seulement l'étudiant de TEST-A visible

**Test 2: RLS bloque les accès non autorisés**

```sql
-- Essayer d'accéder directement à un étudiant de l'autre école
SELECT * FROM students
WHERE school_id = (SELECT id FROM schools WHERE code = 'TEST-B');
```

**Résultat attendu:** Aucune ligne retournée (RLS bloque)

#### 5.4 Nettoyer les Données de Test

```sql
-- Supprimer les données de test
DELETE FROM students WHERE matricule LIKE 'TEST-%';
DELETE FROM schools WHERE code LIKE 'TEST-%';
```

**✅ VALIDATION:** L'isolation RLS fonctionne correctement

---

### ✅ Étape 6: Déployer sur Vercel

**Temps:** 10-15 minutes
**Criticité:** 🟠 IMPORTANTE (si production)

#### 6.1 Se Connecter à Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login
```

#### 6.2 Configurer les Variables d'Environnement

```bash
# Aller sur https://vercel.com
# Sélectionner votre projet EduTrack-CM
# Aller dans Settings → Environment Variables
```

**Ajouter les variables suivantes:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://votre-projet.supabase.co` | Production |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbG...` (NOUVELLE) | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` (NOUVELLE) | Production |
| `VITE_EMAILJS_SERVICE_ID` | `service_...` | Production |
| `VITE_EMAILJS_TEMPLATE_ID` | `template_...` | Production |
| `VITE_EMAILJS_PUBLIC_KEY` | `...` (NOUVELLE) | Production |
| `VITE_APP_ENV` | `production` | Production |
| `VITE_ENABLE_DEBUG` | `false` | Production |

#### 6.3 Déployer

```bash
cd "e:\Projet ENS - EduTrack CM\EduTrack-CM"

# Commit les changements (si pas déjà fait)
git add .
git commit -m "🔐 Phase 2 - Sécurité Production"
git push origin master

# Déployer sur Vercel
vercel --prod
```

#### 6.4 Tester en Production

```bash
# Ouvrir l'URL Vercel
# Exemple: https://edutrack-cm.vercel.app

# Tester:
# 1. Connexion avec compte démo
# 2. Navigation dans le dashboard
# 3. Vérifier que RLS fonctionne
# 4. Tester EmailJS (notifications)
```

**✅ VALIDATION:** Application déployée et fonctionnelle en production

---

## 🎯 VALIDATION FINALE

### Checklist de Sécurité Complète

Vérifier **TOUS** les points suivants:

- [ ] **Backup créé** et téléchargé
- [ ] **Clés API Supabase** régénérées et testées
- [ ] **Clé EmailJS** régénérée et testée
- [ ] **RLS activée** sur toutes les tables (22/22)
- [ ] **Politiques RLS** créées (30+)
- [ ] **Mots de passe bcrypt** (100% migrés)
- [ ] **Isolation RLS** testée et validée
- [ ] **Variables Vercel** configurées
- [ ] **Production** déployée et testée
- [ ] **.env local** mis à jour
- [ ] **Ancien .env** supprimé de Git

### Tests de Non-Régression

- [ ] Connexion avec compte démo fonctionne
- [ ] Connexion avec compte réel fonctionne
- [ ] Dashboard affiche les bonnes données
- [ ] RLS isole bien les écoles
- [ ] Notifications EmailJS fonctionnent
- [ ] Pas d'erreur dans la console navigateur
- [ ] Pas d'erreur dans les logs Supabase

---

## 🚨 EN CAS DE PROBLÈME

### Problème 1: "Error connecting to Supabase"

**Cause probable:** Anciennes clés API dans .env

**Solution:**
```bash
# Vérifier .env
cat .env | grep VITE_SUPABASE

# Copier les NOUVELLES clés depuis Supabase Dashboard
# Redémarrer le serveur
npm run dev
```

### Problème 2: "RLS Error: permission denied"

**Cause probable:** Politique RLS manquante ou mal configurée

**Solution:**
```sql
-- Vérifier les politiques
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Réappliquer la migration si nécessaire
-- Copier-coller à nouveau le fichier SQL complet
```

### Problème 3: "Cannot read property 'password_hash'"

**Cause probable:** Migration bcrypt incomplète

**Solution:**
```bash
# Réexécuter le script de migration
node scripts/migrate-passwords-to-bcrypt.js

# Vérifier les résultats
```

### Problème 4: "Deployment failed on Vercel"

**Cause probable:** Variables d'environnement manquantes

**Solution:**
```bash
# Aller sur Vercel Dashboard
# Settings → Environment Variables
# Vérifier que TOUTES les variables sont présentes
# Redéployer manuellement
```

---

## 📞 SUPPORT

Si vous rencontrez un problème non documenté:

1. **Vérifier les logs** Supabase (Dashboard → Logs)
2. **Vérifier la console** navigateur (F12)
3. **Créer une issue** GitHub avec:
   - Description du problème
   - Étape en cours
   - Message d'erreur complet
   - Logs Supabase/Console

---

## 🎉 FÉLICITATIONS!

Si vous avez complété toutes les étapes avec succès:

✅ **Votre application est maintenant sécurisée en production!**

Score de sécurité: **8/10** 🎯

### Prochaines Étapes (Optionnelles)

- [ ] Configurer les backups automatiques Supabase (quotidiens)
- [ ] Mettre en place monitoring (Sentry, LogRocket)
- [ ] Configurer alertes de sécurité
- [ ] Audit de sécurité externe (Phase 3)
- [ ] Tests de pénétration (Phase 3)

---

*Document créé le: 25 Décembre 2024*
*Par: Claude Sonnet 4.5 - EduTrack-CM Team*
*Version: 1.0*
