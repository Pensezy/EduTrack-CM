# 🚀 Guide de Mise à Jour de la Base de Données EduTrack CM

## 📋 Étapes à Suivre

### 1️⃣ **Diagnostic de l'État Actuel**
1. Allez dans votre **Dashboard Supabase** → **SQL Editor**
2. Copiez-collez le contenu du fichier `database/diagnostics/database_check.sql`
3. Exécutez le script pour voir l'état actuel de votre base de données

### 2️⃣ **Application de la Migration**
1. Dans le **SQL Editor** de Supabase
2. Copiez-collez le contenu du fichier `database/migrations/complete_edutrack_schema.sql`
3. Exécutez le script complet
4. Vérifiez qu'il n'y a pas d'erreurs (tout devrait être vert ✅)

### 3️⃣ **Vérification Post-Migration**
1. Re-exécutez le script de diagnostic `database_check.sql`
2. Vérifiez que toutes les tables marquent "✅ Existe"
3. Vérifiez que les colonnes manquantes ont été ajoutées

## 🎯 **Ce qui va être Créé/Ajouté**

### 📊 **Tables Créées :**
- ✅ `evaluation_periods` - Périodes d'évaluation (trimestres)
- ✅ `grade_types` - Types de notes (DS, DM, Contrôle, etc.)
- ✅ `user_roles` - Rôles utilisateur personnalisés
- ✅ `attendance_types` - Types de présence
- ✅ `payment_types` - Types de paiements scolaires

### 🔧 **Colonnes Ajoutées :**
- ✅ `subjects.category` - Catégorie des matières
- ✅ `classes.capacity` - Capacité de la classe
- ✅ `classes.current_enrollment` - Nombre d'élèves inscrits
- ✅ `classes.level` - Niveau de la classe
- ✅ `classes.section` - Section de la classe
- ✅ `users.photo` - Photo de profil utilisateur

### 🔒 **Sécurité Configurée :**
- ✅ Row Level Security (RLS) sur toutes les nouvelles tables
- ✅ Politiques d'accès basées sur l'école du directeur
- ✅ Index pour les performances
- ✅ Triggers pour updated_at automatique

## 🎉 **Résultat Final**

Après la migration, votre application EduTrack CM pourra :

1. **Créer des comptes directeurs** sans erreurs
2. **Initialiser toutes les données par défaut** :
   - Matières avec catégories
   - Classes avec capacités
   - Périodes d'évaluation
   - Types de notes
   - Types de présence
3. **Afficher les vrais noms** des directeurs
4. **Détecter automatiquement le mode production**
5. **Sauvegarder toutes les informations** du formulaire d'inscription

## ⚠️ **Important**

- **Sauvegardez votre base de données** avant d'exécuter la migration
- Les scripts sont conçus pour être **sécurisés** (IF NOT EXISTS, etc.)
- Aucune donnée existante ne sera supprimée ou modifiée
- Seules les structures manquantes seront ajoutées

## 🔍 **En Cas de Problème**

Si vous rencontrez une erreur :
1. Copiez le message d'erreur complet
2. Vérifiez les permissions de votre utilisateur Supabase
3. Consultez les logs dans l'interface Supabase
4. N'hésitez pas à demander de l'aide avec le message d'erreur exact

---

**Une fois la migration terminée, votre système EduTrack CM sera complet et fonctionnel ! 🚀**