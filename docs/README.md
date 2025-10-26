# 📚 Documentation EduTrack CM

Bienvenue dans la documentation complète d'**EduTrack CM**, la plateforme de gestion scolaire adaptée au système éducatif camerounais.

## 📖 Guides Disponibles

### 🏗️ **Architecture & Configuration**

#### [PRISMA_MIGRATION.md](./PRISMA_MIGRATION.md)
**Architecture Hybride Prisma + Supabase**
- Configuration actuelle (Prisma ORM + Supabase Database)
- Structure des fichiers et migrations
- Système de trigger automatique
- Bonnes pratiques d'utilisation

**Status** : ✅ Système en production

---

#### [SUPABASE_AUTH.md](./SUPABASE_AUTH.md)
**Configuration Authentification Supabase**
- Setup Supabase Auth
- Templates email personnalisés
- Flux d'inscription directeur
- Sécurité et Row Level Security (RLS)

**Status** : ✅ Auth fonctionnel avec trigger automatique

---

### 🎓 **Systèmes Métier**

#### [SCHOOL_TYPES.md](./SCHOOL_TYPES.md)
**Types d'Établissements Camerounais**
- Maternelle, Primaire, Collège, Lycée, Collège-Lycée
- Classes disponibles par type
- Sections et filières
- Calendrier scolaire

**Status** : ✅ Tous types supportés

---

#### [PARENT_MULTI_SCHOOL_GUIDE.md](./PARENT_MULTI_SCHOOL_GUIDE.md)
**Système Multi-Établissements pour Parents**
- Un parent, plusieurs enfants, plusieurs écoles
- Table `parent_student_schools` (relation N-N-N)
- Composant `ParentSearchSelector`
- Éviter les doublons

**Status** : ✅ Système actif

---

#### [TEACHER_MULTI_SCHOOL_GUIDE.md](./TEACHER_MULTI_SCHOOL_GUIDE.md)
**Système Multi-Établissements pour Enseignants**
- Un enseignant, plusieurs assignations
- Gestion de la charge horaire
- Dashboard multi-établissements
- Composants `TeacherSearchSelector` et `TeacherAssignmentManager`

**Status** : ✅ Système actif

---

### 🎨 **Interface Utilisateur**

#### [DATA_MODE_SYSTEM.md](./DATA_MODE_SYSTEM.md)
**Système Switch Démo/Production**
- Détection automatique du mode
- Hook `useDataMode` et `useDashboardData`
- Services démo vs production
- Basculement transparent

**Status** : ✅ Fonctionnalité active

---

#### [NAVIGATION_FLOWS.md](./NAVIGATION_FLOWS.md)
**Flux de Navigation**
- Routes et redirections
- Connexion/Déconnexion intelligente
- Transitions Démo ↔ Production
- Textes adaptatifs selon le mode

**Status** : ✅ Navigation optimisée

---

## 🗂️ Structure du Projet

```
EduTrack-CM/
├── database/
│   ├── diagnostics/          # Scripts de diagnostic
│   └── migrations/           # Migrations SQL
├── docs/                     # 📚 Vous êtes ici
├── prisma/
│   └── schema.prisma         # Schéma Prisma ORM
├── src/
│   ├── components/           # Composants React
│   ├── hooks/                # Hooks personnalisés
│   ├── lib/                  # Prisma + Supabase clients
│   ├── pages/                # Pages de l'application
│   └── services/             # Services métier
├── MIGRATION_COMPLETE_22_TABLES.sql  # Migration complète
└── FIX_TRIGGER_ONLY.sql     # Fix trigger automatique
```

## 🚀 Démarrage Rapide

### **1. Configuration Environnement**
```env
# Supabase (Frontend Auth)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon

# Prisma (Backend Database)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

### **2. Installation**
```bash
npm install
npx prisma generate
```

### **3. Migration Base de Données**
**Nouveau projet :**
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier: MIGRATION_COMPLETE_22_TABLES.sql
```

**Projet existant (fix trigger) :**
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier: FIX_TRIGGER_ONLY.sql
```

### **4. Lancer l'Application**
```bash
npm run dev
```

## 📊 Technologies Utilisées

| Technologie | Usage | Documentation |
|-------------|-------|---------------|
| **React + Vite** | Frontend | [Vite Docs](https://vitejs.dev) |
| **Supabase** | Auth + Database | [Supabase Docs](https://supabase.com/docs) |
| **Prisma** | ORM TypeScript | [Prisma Docs](https://prisma.io/docs) |
| **TailwindCSS** | Styling | [Tailwind Docs](https://tailwindcss.com) |
| **PostgreSQL** | Base de données | Hébergé sur Supabase |

## 🎯 Fonctionnalités Principales

### ✅ **Gestion Multi-Établissements**
- Parents avec enfants dans plusieurs écoles
- Enseignants avec assignations multiples
- Données isolées par établissement

### ✅ **Système Automatisé**
- Trigger PostgreSQL pour auto-initialisation
- Création automatique des données par défaut
- 22 tables relationnelles

### ✅ **Interface Adaptative**
- Mode Démo pour tests sans connexion
- Mode Production avec vraies données
- Navigation intelligente

### ✅ **Adapté au Cameroun**
- 5 types d'établissements supportés
- Calendrier scolaire camerounais
- Système de notation adapté

## 🔧 Maintenance

### **Diagnostic Base de Données**
```bash
# Exécuter database/diagnostics/database_check.sql
# dans Supabase SQL Editor
```

### **Vérifier Trigger**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### **Prisma Studio (Visualisation Données)**
```bash
npx prisma studio
```

---

## 🗑️ Suppression de Compte

### **Documentation Complète**

#### [ACCOUNT_DELETION_OVERVIEW.md](./ACCOUNT_DELETION_OVERVIEW.md)
**Vue d'Ensemble - Réponses Rapides**
- ✅ Réponse aux 3 questions clés
- Visualisation de la suppression
- Implications concrètes
- Garanties et limitations

**Pour qui :** Directeurs et utilisateurs finaux

---

#### [ACCOUNT_DELETION.md](./ACCOUNT_DELETION.md)
**Guide Principal**
- Fonctionnalité et localisation
- Processus de suppression
- Interface utilisateur
- Tests et personnalisation

**Pour qui :** Développeurs et administrateurs

---

#### [ACCOUNT_DELETION_COMPLETE_LIST.md](./ACCOUNT_DELETION_COMPLETE_LIST.md)
**Liste Exhaustive des 22 Tables**
- Détails de chaque table supprimée
- Ordre de suppression cascade
- Implications techniques
- Statistiques de suppression

**Pour qui :** Développeurs et auditeurs techniques

---

#### [ACCOUNT_DELETION_VERIFICATION.md](./ACCOUNT_DELETION_VERIFICATION.md)
**Checklist de Vérification SQL**
- Requêtes SQL de vérification
- Checklist avant/après suppression
- Dépannage en cas de problème
- Validation finale

**Pour qui :** Administrateurs base de données

**Status** : ✅ Implémenté et documenté (22 tables affectées)

---

## 📞 Support

Pour toute question technique :
1. Consulter la documentation appropriée ci-dessus
2. Vérifier les logs Supabase
3. Tester avec le mode démo
4. Consulter les exemples dans les guides

---

**✨ EduTrack CM - Plateforme moderne de gestion scolaire pour le Cameroun**

*Documentation mise à jour : Octobre 2025*
