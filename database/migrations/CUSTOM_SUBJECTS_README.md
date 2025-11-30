# Migration: Ajout du support des matières personnalisées

## Problème résolu
Les matières personnalisées ajoutées par les secrétaires disparaissaient au rafraîchissement de la page car elles n'étaient pas sauvegardées en base de données.

## Solution
Ajout d'une colonne `custom_subjects` (type TEXT[]) à la table `schools` pour stocker les matières personnalisées de chaque établissement.

## Comment appliquer la migration

### Option 1 : Via l'interface Supabase (Recommandé)
1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu du fichier `add_custom_subjects_column.sql`
4. Cliquez sur **Run** pour exécuter la migration
5. Vérifiez le message de confirmation

### Option 2 : Via la ligne de commande
```bash
# Si vous utilisez Supabase CLI
supabase db execute -f database/migrations/add_custom_subjects_column.sql
```

## Structure de la colonne

```sql
custom_subjects TEXT[] DEFAULT '{}'
```

- **Type**: Array de textes (TEXT[])
- **Valeur par défaut**: Array vide `{}`
- **Nullable**: Non (utilise un array vide par défaut)

## Exemple d'utilisation

### Données stockées
```json
{
  "id": "school-123",
  "name": "Lycée Technique",
  "type": "Lycée Technique",
  "custom_subjects": [
    "Électronique Automobile",
    "Génie Civil",
    "Maintenance Industrielle"
  ]
}
```

### Dans l'application
1. Les matières par défaut sont chargées selon le type d'école
2. Les matières personnalisées sont ajoutées depuis `custom_subjects`
3. Quand un secrétaire ajoute une matière, elle est sauvegardée dans `custom_subjects`
4. Au prochain chargement, les matières personnalisées persistent

## Vérification

Après avoir appliqué la migration, vous pouvez vérifier la structure avec :

```sql
-- Voir la structure de la colonne
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'schools' 
AND column_name = 'custom_subjects';

-- Voir les écoles avec leurs matières personnalisées
SELECT 
    id,
    name,
    type,
    custom_subjects,
    array_length(custom_subjects, 1) as nb_custom_subjects
FROM schools;
```

## Impact sur le code

### Avant (matières non persistantes)
```javascript
const handleAddSubject = () => {
  // Ajout uniquement en mémoire locale
  setSchoolSubjects([...schoolSubjects, newSubjectObj]);
};
```

### Après (matières persistantes)
```javascript
const handleAddSubject = async () => {
  // 1. Récupérer les matières actuelles
  const { data } = await supabase
    .from('schools')
    .select('custom_subjects')
    .eq('id', currentSchool.id)
    .single();

  // 2. Ajouter la nouvelle matière
  const updated = [...data.custom_subjects, newSubject.trim()];

  // 3. Sauvegarder en base de données
  await supabase
    .from('schools')
    .update({ custom_subjects: updated })
    .eq('id', currentSchool.id);
};
```

## Notes importantes
- Les matières par défaut ne sont **pas** stockées dans `custom_subjects`
- Seules les matières ajoutées via le bouton "+ Ajouter une matière" sont sauvegardées
- Les matières personnalisées sont **spécifiques à chaque école**
- Si une école n'a pas de matières personnalisées, le champ contient un array vide `[]`
