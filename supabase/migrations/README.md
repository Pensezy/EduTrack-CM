# 🗄️ Migrations Base de Données EduTrack-CM

Ce dossier contient toutes les migrations SQL nécessaires pour créer une base de données complète pour EduTrack-CM.

## 📋 Liste des Migrations

### 1. `20250918150401_create_missing_tables.sql`
**Tables principales créées :**
- `classes` - Gestion des classes et niveaux
- `school_years` - Années scolaires et périodes
- `subjects` - Matières enseignées
- `teachers` - Profils détaillés des enseignants
- `tasks` - Tâches du secrétariat
- `student_cards` - Cartes scolaires
- `fees` - Types de frais scolaires

**Fonctionnalités :**
- ✅ Index optimisés pour performance
- ✅ Triggers pour `updated_at` automatique
- ✅ Données de base (matières, frais standards)
- ✅ Contraintes d'intégrité

### 2. `20250918150402_create_communication_tables.sql`
**Tables communication et planning :**
- `appointments` - Rendez-vous et planning
- `events` - Événements scolaires
- `documents` - Gestion documentaire
- `document_templates` - Templates de documents
- `messages` - Système de messagerie
- `message_recipients` - Suivi des destinataires

**Fonctionnalités :**
- ✅ Système de récurrence pour événements
- ✅ Templates de certificats pré-configurés
- ✅ Statistiques de livraison messages
- ✅ Gestion des pièces jointes

### 3. `20250918150403_create_rls_policies.sql`
**Sécurité Row Level Security :**
- ✅ Isolation complète par établissement
- ✅ Contrôle d'accès par rôle utilisateur
- ✅ Politiques granulaires pour chaque table
- ✅ Fonctions utilitaires de sécurité

**Niveaux de sécurité :**
- `SELECT` : Accès selon l'appartenance à l'école
- `INSERT` : Validation des permissions
- `UPDATE` : Contrôle propriétaire/administrateur
- `DELETE` : Restriction aux rôles élevés

### 4. `20250918150404_create_views_and_functions.sql`
**Vues optimisées :**
- `student_complete_view` - Vue complète des élèves
- `tasks_dashboard_view` - Tâches avec priorités
- `payments_complete_view` - Paiements détaillés
- `events_calendar_view` - Calendrier des événements
- `messages_stats_view` - Statistiques messages

**Fonctions utilitaires :**
- `get_dashboard_stats()` - Statistiques tableau de bord
- `generate_card_number()` - Numéros de cartes uniques
- `calculate_student_fees()` - Calcul des frais élèves
- `get_weekly_schedule()` - Planning hebdomadaire

### 5. `20250918150405_insert_demo_data.sql`
**Données de démonstration :**
- 🏫 École de test complète
- 👥 Utilisateurs (directeur, secrétaire, parents)
- 🎓 3 élèves avec profils complets
- 📋 Tâches, paiements, absences
- 📅 Événements et rendez-vous

### 6. `20250918150406_school_initialization_functions.sql`
**Fonctions d'administration :**
- `initialize_new_school()` - Création école complète
- `get_school_initialization_status()` - Statut configuration
- `cleanup_demo_data()` - Nettoyage données test

## 🚀 Instructions d'Installation

### Prérequis
- PostgreSQL 14+ ou Supabase
- Extension `uuid-ossp` activée
- Droits d'administration sur la base

### Installation Complète

```sql
-- 1. Exécuter dans l'ordre :
\i 20250918150401_create_missing_tables.sql
\i 20250918150402_create_communication_tables.sql
\i 20250918150403_create_rls_policies.sql
\i 20250918150404_create_views_and_functions.sql

-- 2. Optionnel - Données de test :
\i 20250918150405_insert_demo_data.sql

-- 3. Fonctions d'administration :
\i 20250918150406_school_initialization_functions.sql
```

### Installation via Supabase CLI

```bash
# Dans le dossier du projet
supabase migration up
```

## 🏫 Initialisation d'une Nouvelle École

### Méthode SQL Directe

```sql
-- Créer une nouvelle école avec directeur et secrétaire
SELECT initialize_new_school(
    'École Primaire Exemple',           -- Nom de l'école
    '123 Rue de l''École',             -- Adresse
    '01.23.45.67.89',                  -- Téléphone
    'contact@ecole-exemple.edu',        -- Email
    'Ville Exemple',                    -- Ville
    '12345',                           -- Code postal
    'Jean Directeur',                   -- Nom directeur
    'directeur@ecole-exemple.edu',      -- Email directeur
    '01.23.45.67.80',                  -- Téléphone directeur
    'Marie Secrétaire',                 -- Nom secrétaire (optionnel)
    'secretaire@ecole-exemple.edu',     -- Email secrétaire (optionnel)
    '01.23.45.67.81'                   -- Téléphone secrétaire (optionnel)
);
```

### Résultat de l'Initialisation

```json
{
  "success": true,
  "school": {
    "id": "uuid-école",
    "name": "École Primaire Exemple",
    "address": "123 Rue de l'École"
  },
  "principal": {
    "id": "uuid-directeur",
    "name": "Jean Directeur",
    "email": "directeur@ecole-exemple.edu",
    "pin_code": "1234"
  },
  "secretary": {
    "id": "uuid-secrétaire",
    "name": "Marie Secrétaire",
    "email": "secretaire@ecole-exemple.edu",
    "pin_code": "5678"
  },
  "initial_setup": {
    "classes_created": 4,
    "subjects_available": 8,
    "fees_configured": 6,
    "templates_available": 2
  }
}
```

## 📊 Vérification du Statut

```sql
-- Vérifier le statut d'initialisation
SELECT get_school_initialization_status('uuid-de-l-ecole');
```

## 🧹 Nettoyage des Données de Test

```sql
-- Supprimer toutes les données de démonstration
SELECT cleanup_demo_data('uuid-de-l-ecole');
```

## 📈 Structure des Données Créées

### Tables Principales (12)
- **Gestion Scolaire** : `classes`, `school_years`, `subjects`, `teachers`
- **Administration** : `tasks`, `student_cards`, `fees`
- **Communication** : `appointments`, `events`, `messages`, `message_recipients`
- **Documents** : `documents`, `document_templates`

### Vues Optimisées (5)
- Requêtes complexes pré-calculées
- Jointures optimisées
- Statistiques en temps réel

### Fonctions Utilitaires (7)
- Génération automatique de données
- Calculs complexes
- Statistiques globales

### Politiques de Sécurité (50+)
- Isolation par établissement
- Contrôle d'accès granulaire
- Protection des données sensibles

## 🔐 Sécurité

### Row Level Security (RLS)
- ✅ **Isolation complète** entre établissements
- ✅ **Contrôle par rôle** (principal, secrétaire, enseignant, parent)
- ✅ **Accès contextuel** aux données liées
- ✅ **Protection** des données confidentielles

### Rôles et Permissions
- **`super_admin`** : Accès global système
- **`admin`** : Administration multi-écoles
- **`principal`** : Gestion complète de son école
- **`secretary`** : Administration opérationnelle
- **`teacher`** : Accès aux données de ses classes
- **`parent`** : Accès aux données de ses enfants

## 🚨 Points d'Attention

### Performance
- Les index sont optimisés pour les requêtes fréquentes
- Les vues utilisent des jointures efficaces
- Les fonctions incluent la mise en cache

### Maintenance
- Les triggers `updated_at` sont automatiques
- Les contraintes d'intégrité préviennent les erreurs
- Les fonctions de nettoyage facilitent la maintenance

### Évolutivité
- Structure extensible pour nouvelles fonctionnalités
- Système de versioning pour les documents
- Support de la récurrence pour les événements

## 📞 Support

Pour toute question ou problème avec les migrations :

1. **Vérifiez les logs** PostgreSQL pour les erreurs
2. **Testez sur environnement** de développement d'abord
3. **Sauvegardez** avant exécution en production
4. **Documentez** toute modification personnalisée

---

**✅ Base de données complète et sécurisée pour EduTrack-CM !**