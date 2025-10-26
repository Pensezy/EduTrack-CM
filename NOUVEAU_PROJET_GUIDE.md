# 🚀 GUIDE COMPLET - NOUVEAU PROJET SUPABASE EDUTRACK CM

## 📋 ÉTAPES À SUIVRE DANS L'ORDRE

### 1. CRÉER LE NOUVEAU PROJET SUPABASE

1. **Aller sur https://supabase.com/dashboard**
2. **Cliquer sur "New Project"**
3. **Configuration :**
   - **Nom :** EduTrack-CM-New (ou votre choix)
   - **Organisation :** Votre organisation
   - **Mot de passe DB :** Choisir un mot de passe sécurisé
   - **Région :** eu-west-3 (Europe - Paris) ou us-east-1

### 2. CONFIGURER LA BASE DE DONNÉES

#### A. Créer le schéma complet
1. **Aller dans "SQL Editor"** (menu gauche)
2. **Ouvrir le fichier `new_project_schema.sql`** de votre projet
3. **Copier TOUT le contenu** et le coller dans l'éditeur
4. **Cliquer sur "Run"** ▶️
5. **Vérifier :** Aucune erreur rouge ne doit apparaître

#### B. **🚨 CRUCIAL : Synchronisation automatique Supabase Auth**
1. **Toujours dans "SQL Editor"**
2. **Ouvrir le fichier `auto_sync_supabase_auth.sql`**
3. **Copier TOUT le contenu** et le coller
4. **Cliquer sur "Run"** ▶️
5. **Vérifier :** Les triggers de synchronisation sont créés
6. **⚠️ SANS CETTE ÉTAPE, LES COMPTES DIRECTEURS NE SERONT PAS SAUVÉS !**

#### C. Configurer les permissions RLS (VERSION CORRIGÉE)
1. **Toujours dans "SQL Editor"**
2. **Ouvrir le fichier `fix_rls_permissions_v2.sql`** (⚠️ **V2 = VERSION CORRIGÉE**)
3. **Copier TOUT le contenu** et le coller
4. **Cliquer sur "Run"** ▶️
5. **Vérifier :** Les politiques sont créées sans erreur
6. **✅ Cette version corrige les erreurs 401/42501 lors de l'inscription !**
1. **Toujours dans "SQL Editor"**
2. **Ouvrir le fichier `fix_rls_permissions.sql`**
3. **Copier TOUT le contenu** et le coller
4. **Cliquer sur "Run"** ▶️
5. **Vérifier :** Les politiques sont créées sans erreur

#### D. Ajouter les fonctionnalités avancées pour secrétaires (NOUVEAU)
1. **Toujours dans "SQL Editor"**
2. **Ouvrir le fichier `secretary_features.sql`**
3. **Copier TOUT le contenu** et le coller
4. **Cliquer sur "Run"** ▶️
5. **Vérifier :** Les fonctions et vues sont créées sans erreur

### 3. RÉCUPÉRER LES NOUVELLES CLÉS

1. **Aller dans "Settings" > "API"** (menu gauche)
2. **Copier ces valeurs :**
   - **Project URL :** `https://[votre-id].supabase.co`
   - **anon public :** `eyJ...` (clé publique)
   - **service_role :** `eyJ...` (clé secrète)

### 4. METTRE À JOUR VOTRE CODE

#### A. Fichier `.env`
```env
# NOUVELLES CLÉS SUPABASE
VITE_SUPABASE_URL=https://[votre-nouveau-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ[nouvelle-clé-anon]
SUPABASE_SERVICE_ROLE_KEY=eyJ[nouvelle-clé-service]

# NOUVELLES URLs DATABASE POUR PRISMA
DATABASE_URL="postgresql://postgres.[votre-id]:[password]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[votre-id]:[password]@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"
```

#### B. Prisma Schema (optionnel)
Si vous utilisez Prisma, mettez à jour les URLs dans le fichier `.env` ci-dessus.

### 5. CRÉER VOTRE COMPTE DIRECTEUR

#### A. Via l'interface Supabase
1. **Aller dans "Authentication" > "Users"**
2. **Cliquer sur "Add user"**
3. **Remplir :**
   - **Email :** votre email de directeur
   - **Password :** votre mot de passe
   - **Confirm :** oui

#### B. Créer l'école associée
1. **Aller dans "Table Editor" > "schools"**
2. **Cliquer sur "Insert" > "Insert row"**
3. **Remplir les champs obligatoires :**
   - **name :** Nom de votre école
   - **code :** Code unique (ex: ECOLE001)
   - **type :** Choisir le type (primaire, college, etc.)
   - **director_name :** Votre nom
   - **phone :** Votre téléphone
   - **address, city :** Adresse de l'école
   - **director_user_id :** ID de l'utilisateur créé à l'étape A
   - **status :** active

### 6. TESTER LA CONNEXION

1. **Redémarrer votre serveur local :** `npm run dev`
2. **Tester la connexion directeur :** `http://localhost:4028/school-management`
3. **Vérifier :** Vous devez arriver sur le tableau de bord principal
4. **Tester la création de secrétaire :** Aller dans Comptes > Créer compte > Secrétaire

### 7. FLUX DE CRÉATION D'UN COMPTE SECRÉTAIRE

1. **Le directeur :** Va dans son tableau de bord > Gestion des comptes
2. **Saisit les informations :** Nom, email, téléphone, mot de passe temporaire
3. **Le système :** Crée automatiquement le compte Supabase Auth + données DB
4. **Le directeur :** Communique les identifiants (email + mot de passe) à la secrétaire
5. **La secrétaire :** Se connecte avec ces identifiants via `/school-management` ou interface dédiée

## ✅ VÉRIFICATIONS FINALES

### Base de données
- [ ] Toutes les tables sont créées (users, schools, students, secretaries, tasks, etc.)
- [ ] Les politiques RLS sont en place
- [ ] Les fonctions pour les secrétaires sont créées
- [ ] Votre compte utilisateur existe
- [ ] Votre école est créée et liée à votre compte

### Application
- [ ] Les nouvelles clés sont dans `.env`
- [ ] La connexion fonctionne
- [ ] Accès au tableau de bord principal
- [ ] Pas d'erreur 403 Forbidden
- [ ] Création de comptes secrétaires fonctionne

## 🆘 EN CAS DE PROBLÈME

### Erreur "permission denied"
1. Vérifier que les politiques RLS sont bien appliquées
2. Re-exécuter `fix_rls_permissions.sql`
3. Vérifier que `director_user_id` dans la table schools correspond à votre ID utilisateur

### Erreur de connexion
1. Vérifier les clés dans `.env`
2. Redémarrer le serveur `npm run dev`
3. Vider le cache du navigateur

### Erreurs de table
1. Re-exécuter `new_project_schema.sql`
2. Vérifier dans "Table Editor" que toutes les tables existent

## 📁 FICHIERS UTILISÉS

- ✅ **`new_project_schema.sql`** - Schéma complet de la DB avec support secrétaires
- ✅ **`fix_rls_permissions.sql`** - Permissions RLS pour directeurs et secrétaires
- ✅ **`secretary_features.sql`** - Fonctionnalités avancées pour gestion des secrétaires
- ❌ **Tous les autres fichiers .js/.sql temporaires** - Pas nécessaires

## 🎉 APRÈS LE SUCCÈS

Une fois que tout fonctionne :
1. **Supprimer l'ancien projet Supabase** (optionnel)
2. **Faire un commit git** de vos modifications
3. **Tester toutes les fonctionnalités** de l'application

---

**💡 Conseil :** Gardez une sauvegarde de vos anciennes clés pendant quelques jours, au cas où.