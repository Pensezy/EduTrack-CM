# 🚀 Migration vers Prisma - EduTrack-CM

## 📊 **Vue d'ensemble**

EduTrack-CM a migré de **Supabase SQL natif** vers **Prisma ORM** pour une meilleure gestion du schéma de base de données et des requêtes type-safe.

## ✅ **Migration Complétée le 27 Septembre 2025**

### **Architecture Hybride**
**Supabase pour :**
- ✅ Authentification (signUp, signIn, session)
- ✅ Hébergement PostgreSQL
- ✅ Triggers automatiques (`on_auth_user_created`)
- ✅ Fonctions SQL personnalisées (auto-initialisation)

**Prisma pour :**
- ✅ Schéma déclaratif dans `prisma/schema.prisma`
- ✅ ORM type-safe avec génération automatique du client
- ✅ Requêtes complexes et relations
- ✅ Validation TypeScript complète des modèles

## 🗂️ **Architecture Actuelle**

### **Structure des Fichiers**
```
├── prisma/
│   └── schema.prisma              # Schéma de base de données Prisma
├── database/
│   ├── diagnostics/
│   │   └── database_check.sql     # Script de diagnostic
│   └── migrations/
│       └── 01_initial_setup.sql   # Migration trigger automatique
├── src/
│   ├── lib/
│   │   ├── prisma.js              # Configuration client Prisma
│   │   └── supabase.js            # Client Supabase (auth + database)
│   └── services/
│       ├── schoolService.js       # Services Prisma/Supabase mixtes
│       ├── productionDataService.js
│       └── edutrackService.js
├── MIGRATION_COMPLETE_22_TABLES.sql  # Migration complète (nouveau projet)
└── FIX_TRIGGER_ONLY.sql           # Fix trigger automatique
```

### **Configuration .env**
```env
# Supabase Frontend (Auth)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service

# Prisma Backend (Database)
DATABASE_URL=postgresql://...@...supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...@...supabase.com:5432/postgres
```

## 🔧 **Commandes Prisma Essentielles**

### **Développement**
```bash
# Générer le client Prisma
npx prisma generate

# Déployer le schéma sur la base
npx prisma db push

# Interface graphique pour voir/éditer les données
npx prisma studio
```

### **Migration et Schema**
```bash
# Pull du schéma existant depuis la base
npx prisma db pull

# Formater le schéma
npx prisma format

# Valider le schéma
npx prisma validate
```

## 📋 **Modèles Prisma Principaux**

### **Modèles Utilisateur & École**
- `User` - Utilisateurs du système (principal, enseignants, étudiants)
- `School` - Établissements scolaires
- `AcademicYear` - Années académiques
- `Class` - Classes par école et année
- `Subject` - Matières enseignées

### **Modèles Pédagogiques**
- `Teacher` - Profils enseignants
- `Student` - Profils étudiants
- `Parent` - Profils parents
- `Grade` - Système de notation
- `Attendance` - Suivi des présences

### **Modèles Administratifs**
- `Payment` - Gestion des paiements
- `Notification` - Système de notifications
- `AuditLog` - Journaux d'audit

## 🎯 **Avantages de la Migration**

### **Pour les Développeurs**
- ✅ **Type Safety** : Validation TypeScript complète
- ✅ **IntelliSense** : Autocomplétion des modèles et relations
- ✅ **Requêtes Sécurisées** : Protection contre l'injection SQL
- ✅ **Migrations Automatisées** : Gestion de schéma simplifiée

### **Pour le Projet**
- ✅ **Maintenabilité** : Code plus lisible et structuré
- ✅ **Performance** : Requêtes optimisées et pooling de connexions
- ✅ **Évolutivité** : Ajout facile de nouveaux modèles
- ✅ **Documentation** : Schéma auto-documenté

## � **Système de Trigger Automatique**

### **Fonctionnement**
Lors de la création d'un compte directeur via Supabase Auth, un trigger PostgreSQL s'exécute automatiquement :

```sql
-- Trigger on_auth_user_created
-- Fonction: handle_new_user_automatic()
-- SECURITY DEFINER + SET search_path = public, auth
```

### **Actions Automatiques**
1. ✅ Création utilisateur dans `users`
2. ✅ Création école dans `schools`
3. ✅ Création année académique
4. ✅ 5 types de notes (Devoir, Interrogation, Examen, Projet, Participation)
5. ✅ 4 types de présence (Présent, Absent, Retard, Excusé)
6. ✅ 6 types de paiement (Scolarité, Inscription, Uniforme, etc.)
7. ✅ Périodes d'évaluation (Trimestres/Semestres selon type école)
8. ✅ 6 rôles utilisateur avec permissions

### **Fichiers de Migration**
- **Nouveau projet** : `MIGRATION_COMPLETE_22_TABLES.sql` (schéma complet + trigger)
- **Projet existant** : `FIX_TRIGGER_ONLY.sql` (uniquement le trigger)
- **Diagnostic** : `database/diagnostics/database_check.sql`

## 🔄 **Bonnes Pratiques**

### **Quand Utiliser Prisma**
- ✅ Requêtes complexes avec relations
- ✅ Opérations CRUD typiques
- ✅ Besoin de type-safety TypeScript
- ✅ Agrégations et statistiques

### **Quand Utiliser SQL Direct (Triggers)**
- ✅ Automatisations côté serveur
- ✅ Initialisation de données par défaut
- ✅ Validations complexes
- ✅ Performance critique

### **Quand Utiliser Supabase Client**
- ✅ Authentification (signUp, signIn)
- ✅ Gestion de session
- ✅ RLS (Row Level Security)
- ✅ Realtime subscriptions

## 📚 **Ressources**

- [Documentation Prisma](https://www.prisma.io/docs)
- [Prisma avec Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Best Practices Prisma](https://www.prisma.io/docs/guides/performance-and-optimization)

---

## 🚨 **Points d'Attention**

### **RLS (Row Level Security)**
- **Status actuel** : Désactivé en développement
- **Raison** : Éviter conflits avec triggers SECURITY DEFINER
- **Production** : Réactiver avec politiques appropriées

### **Migrations**
- **Prisma** : Utilisé pour le schéma ORM
- **SQL Direct** : Utilisé pour les triggers et fonctions
- **Coordination** : Toujours sync Prisma schema ↔ SQL migrations

### **Multi-Établissements**
- ✅ **Parents** : Table `parent_student_schools` (relation N-N-N)
- ✅ **Enseignants** : Support assignations multiples
- ✅ **Données isolées** : Par `school_id`

---

**✨ Architecture hybride optimale : Prisma pour l'ORM + Supabase pour l'infrastructure !**
````