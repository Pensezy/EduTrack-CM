````markdown# 🔗 Configuration de la connexion Supabase avec Prisma

# 🔗 Prisma + Supabase - Configuration Hybride

## 📋 Instructions pour récupérer votre chaîne de connexion :

## 📊 **Architecture Actuelle**

### **Étape 1 : Aller sur votre Dashboard Supabase**

EduTrack-CM utilise une **architecture hybride** :1. Ouvrez https://app.supabase.com

- **Prisma ORM** : Requêtes type-safe, relations complexes, CRUD2. Sélectionnez votre projet **EduTrack-CM**

- **SQL Direct (Triggers)** : Auto-initialisation, validations, automatisations

### **Étape 2 : Récupérer l'URL de connexion directe**

## 🗂️ **Structure**1. Allez dans **Settings** → **Database**

2. Cherchez la section **Connection string**

```3. Sélectionnez l'onglet **Direct connection** (pas Pooled connection)

prisma/4. Copiez l'URL qui ressemble à :

├── schema.prisma              # Schéma Prisma (source de vérité)```

├── migrations/                # Migrations Prisma historiquespostgresql://postgres:[YOUR-PASSWORD]@db.cgpkhtksdcxtlyprerbj.supabase.co:5432/postgres

└── README.md                  # Ce fichier```

```

### **Étape 3 : Mettre à jour votre fichier .env**

## ⚙️ **Configuration .env**Remplacez `[VOTRE_PASSWORD]` par votre mot de passe de base de données dans le fichier `.env` :



```env```env

# Prisma - Connexion poolée (requêtes ORM)DATABASE_URL="postgresql://postgres:[VOTRE_MOT_DE_PASSE]@db.cgpkhtksdcxtlyprerbj.supabase.co:5432/postgres?sslmode=require"

DATABASE_URL="postgresql://postgres.[ref]:password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"```



# Prisma - Connexion directe (migrations, introspection)### **Étape 4 : Synchroniser avec la base existante**

DIRECT_URL="postgresql://postgres.[ref]:password@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"Une fois la connexion configurée, exécutez :

```

```bash

### **Où trouver ces URLs ?**# Pour synchroniser Prisma avec votre base existante

1. **Supabase Dashboard** → https://app.supabase.comnpx prisma db pull

2. **Settings** → **Database** → **Connection string**

3. **Transaction pooler** → `DATABASE_URL`# Pour générer le client avec les vrais modèles

4. **Session pooler** → `DIRECT_URL`npx prisma generate



## 🔧 **Commandes Essentielles**# Pour appliquer le schéma à la base (si nécessaire)

npx prisma db push

### **Générer le client Prisma**```

```bash

npx prisma generate## ⚠️ **Important :**

```- **Gardez votre mot de passe secret** (ne le commitez pas dans Git)

- **Quand ?** Après modification de `schema.prisma`- **Utilisez des variables d'environnement** pour la production

- **Résultat** : Client TypeScript dans `src/generated/prisma`- **Testez la connexion** avant de continuer



### **Synchroniser avec Supabase (Pull)**## 🎯 **Prochaines étapes :**

```bash1. Configurer l'URL de connexion

npx prisma db pull2. Tester la connexion avec `npx prisma db pull`

```3. Adapter les services pour utiliser Prisma au lieu de Supabase direct

- **Quand ?** Après migration SQL dans Supabase4. Migrer progressivement les requêtes existantes
- **Résultat** : `schema.prisma` mis à jour avec changements de la BDD

### **Appliquer le schéma (Push)**
```bash
npx prisma db push
```
- **Quand ?** Après modification de `schema.prisma`
- **Résultat** : Changements appliqués directement sur Supabase
- **⚠️ Attention** : Éviter en production, utiliser migrations SQL

### **Interface graphique (Studio)**
```bash
npx prisma studio
```
- **Utilité** : Visualiser/éditer les données
- **URL** : http://localhost:5555

## 🔄 **Workflow Hybride**

### **1. Pour les Triggers et Automatisations → SQL Direct**
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichiers: MIGRATION_COMPLETE_22_TABLES.sql, FIX_TRIGGER_ONLY.sql
```

**Exemples d'usage :**
- Trigger `on_auth_user_created`
- Auto-initialisation données par défaut
- Fonctions PostgreSQL personnalisées
- Row Level Security (RLS)

### **2. Pour les Requêtes Métier → Prisma ORM**
```javascript
// Dans vos services
import { prisma } from '@/lib/prisma';

// Requêtes type-safe
const schools = await prisma.school.findMany({
  where: { status: 'active' },
  include: { 
    director: true,
    students: true 
  }
});
```

**Exemples d'usage :**
- CRUD standards
- Relations complexes
- Agrégations et statistiques
- Transactions

### **3. Synchronisation Schéma**

**Après migration SQL :**
```bash
# 1. Pull les changements depuis Supabase
npx prisma db pull

# 2. Générer le nouveau client
npx prisma generate
```

**Après modification schema.prisma :**
```bash
# 1. Appliquer sur Supabase (dev only)
npx prisma db push

# 2. Générer le client
npx prisma generate
```

## 📋 **Bonnes Pratiques**

### ✅ **À FAIRE**
- Utiliser Prisma pour les requêtes métier
- Utiliser SQL pour les triggers/fonctions
- Toujours `prisma generate` après changements
- Synchroniser régulièrement avec `db pull`

### ❌ **À ÉVITER**
- Modifier manuellement les fichiers générés
- Utiliser `prisma migrate` sans coordination SQL
- Oublier de `generate` après changements schéma
- Commiter les mots de passe dans .env

## 🗄️ **Modèles Principaux**

```prisma
// schema.prisma

model User {
  id              String   @id @db.Uuid
  email           String   @unique
  fullName        String?
  role            UserRole
  currentSchool   School?  @relation("SchoolUsers")
  // ... relations
}

model School {
  id              String   @id @default(dbgenerated("gen_random_uuid()"))
  name            String
  code            String   @unique
  type            SchoolType
  director        User     @relation("SchoolDirector")
  students        Student[]
  teachers        Teacher[]
  // ... relations
}

// 22 modèles au total
```

## 🔍 **Diagnostic**

### **Vérifier la connexion**
```bash
npx prisma db execute --stdin < database/diagnostics/database_check.sql
```

### **Vérifier le schéma**
```bash
npx prisma validate
```

### **Formater le schéma**
```bash
npx prisma format
```

## 📚 **Ressources**

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma + Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

---

**✨ Architecture hybride optimale : Prisma (ORM) + SQL (Automatisations) !**

*Dernière mise à jour : Octobre 2025*
````
