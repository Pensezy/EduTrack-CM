# Corrections Critiques Requises - 03 Janvier 2026

## Problèmes Identifiés

### 1. Table `user_notifications` manquante ❌
**Erreur**: `column notifications.user_id does not exist`

**Cause**: L'application utilise `user_notifications` mais seule la table `notifications` (pour diffusions) existe.

**Solution**: Exécuter la migration SQL

### 2. Colonne `bundles.icon` inexistante ❌
**Erreur**: `column bundles.icon does not exist`

**Cause**: Le code essayait de récupérer une colonne `icon` qui n'existe pas dans la table `bundles`.

**Solution**: ✅ Corrigé dans le code (suppression de la référence à `icon`)

### 3. Performance lente au chargement ⚠️
**Symptômes**:
- Pages qui mettent du temps à charger
- Connexion lente
- Requêtes multiples qui se bloquent

**Causes possibles**:
- Row Level Security (RLS) mal configuré
- Index manquants
- Requêtes non optimisées
- Trop de requêtes en parallèle au chargement

---

## MIGRATIONS SQL À EXÉCUTER

### Migration 1: Créer la table `user_notifications`

**Fichier**: [supabase/migrations/20260103_create_user_notifications.sql](supabase/migrations/20260103_create_user_notifications.sql)

**Instructions**:

1. Ouvrez le SQL Editor de Supabase:
   https://supabase.com/dashboard/project/lbqwbnclknwszdnlxaxz/sql/new

2. Copiez et exécutez le contenu du fichier `20260103_create_user_notifications.sql`

3. Vérifiez que la table a été créée:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_name = 'user_notifications';
   ```

### Migration 2: Ajouter les champs `profession` et `address` à `users`

**Fichier**: [supabase/migrations/20260103_add_parent_fields.sql](supabase/migrations/20260103_add_parent_fields.sql)

**Instructions**: Voir [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md)

---

## OPTIMISATIONS DE PERFORMANCE

### 1. Vérifier les Policies RLS

Exécutez cette requête pour voir toutes les policies RLS :

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Problèmes potentiels**:
- Policies trop complexes avec sous-requêtes lourdes
- Policies qui scannent toute la table
- Absence de policies (refus d'accès par défaut)

### 2. Vérifier les Index

Exécutez pour voir les index manquants :

```sql
SELECT
  schemaname,
  tablename,
  attname AS column_name,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct IS NOT NULL
ORDER BY abs(correlation) DESC;
```

**Index recommandés** (à créer si manquants) :

```sql
-- Index pour users
CREATE INDEX IF NOT EXISTS idx_users_current_school_id ON users(current_school_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index pour students
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);

-- Index pour teachers
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);

-- Index pour parents
CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);

-- Index pour schools
CREATE INDEX IF NOT EXISTS idx_schools_is_active ON schools(is_active);

-- Index pour user_notifications (déjà créés dans la migration)
-- Vérifier qu'ils existent bien
```

### 3. Optimiser les Requêtes

#### Dashboard Queries

Les dashboards chargent souvent trop de données. Vérifiez :

**AdminDashboard.jsx**:
- Utilise-t-il `select('*')` au lieu de colonnes spécifiques ?
- Charge-t-il des relations inutiles ?
- Fait-il trop de requêtes en série au lieu de parallèle ?

**PrincipalDashboard.jsx**:
- Même vérifications

#### Requêtes Recommandées

Au lieu de :
```javascript
const { data } = await supabase.from('students').select('*');
```

Utilisez :
```javascript
const { data } = await supabase
  .from('students')
  .select('id, full_name, class_id')
  .limit(50);
```

### 4. Activer le Query Cache (optionnel)

Si les données changent peu souvent, ajoutez du cache côté client :

```javascript
const [cachedData, setCachedData] = useState(null);
const [cacheTime, setCacheTime] = useState(null);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchWithCache = async () => {
  const now = Date.now();
  if (cachedData && cacheTime && (now - cacheTime < CACHE_DURATION)) {
    return cachedData;
  }

  const data = await fetchData();
  setCachedData(data);
  setCacheTime(now);
  return data;
};
```

### 5. Lazy Loading des Composants

Utilisez React.lazy() pour charger les pages uniquement quand nécessaire :

```javascript
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./pages/Dashboard/AdminDashboard'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboard />
    </Suspense>
  );
}
```

### 6. Débugger les Requêtes Lentes

Activez le logging Supabase en dev :

```javascript
const supabase = createClient(url, key, {
  auth: {
    debug: true
  },
  global: {
    headers: {
      'x-my-custom-header': 'debug-mode'
    }
  }
});
```

Ouvrez la console Chrome > Network et filtrez par `supabase.co` pour voir :
- Quelles requêtes sont lentes (> 500ms)
- Combien de requêtes sont faites au chargement
- S'il y a des requêtes qui échouent silencieusement

---

## CHECKLIST DE VÉRIFICATION

Après avoir appliqué les migrations :

### Base de Données
- [ ] Table `user_notifications` créée
- [ ] Colonnes `profession` et `address` ajoutées à `users`
- [ ] Tous les index recommandés créés
- [ ] Policies RLS vérifiées et optimisées

### Application
- [ ] Page se charge en moins de 2 secondes
- [ ] Connexion utilisateur en moins de 1 seconde
- [ ] Aucune erreur dans la console
- [ ] Badge de notifications s'affiche correctement
- [ ] Formulaire parents fonctionne avec profession/address

### Tests
- [ ] Créer un parent avec profession et adresse
- [ ] Vérifier que les notifications s'affichent
- [ ] Tester la connexion avec différents rôles
- [ ] Vérifier que chaque page se charge rapidement

---

## COMMANDES UTILES

### Vérifier les requêtes lentes (PostgreSQL)

```sql
-- Voir les requêtes les plus lentes
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

### Analyser une requête spécifique

```sql
EXPLAIN ANALYZE
SELECT * FROM users WHERE current_school_id = 'xxx';
```

### Voir la taille des tables

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## NEXT STEPS

1. **Immédiat**: Exécuter les 2 migrations SQL
2. **Court terme**: Ajouter les index recommandés
3. **Moyen terme**: Optimiser les requêtes dans les dashboards
4. **Long terme**: Implémenter le cache et lazy loading

---

**Date**: 03 Janvier 2026
**Priorité**: 🔴 CRITIQUE
**Temps estimé**: 30 minutes pour les migrations + 2-3 heures pour les optimisations
