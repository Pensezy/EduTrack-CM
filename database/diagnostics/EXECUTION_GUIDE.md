# 🎯 GUIDE D'EXÉCUTION - SETUP DASHBOARD ENSEIGNANT

## 📋 ORDRE D'EXÉCUTION DES SCRIPTS SQL

### ✅ ÉTAPE 1 : Vérification des tables (DÉJÀ FAIT)
**Fichier :** `check_teacher_tables.sql`
**Résultat attendu :** Toutes les tables de base existent ✅
**Statut :** ✅ COMPLÉTÉ

---

### ⏳ ÉTAPE 2 : Vérifier les données existantes
**Fichier :** `check_existing_data.sql`

**Ouvrez Supabase SQL Editor et collez ce fichier.**

**Ce script va vous montrer :**
- Combien d'écoles, enseignants, classes vous avez
- Liste des enseignants existants
- Liste des classes existantes
- Liste des matières existantes
- Années scolaires actives

**Actions selon le résultat :**
- ✅ Si vous avez déjà des données → Passez à l'ÉTAPE 3
- ❌ Si vous n'avez AUCUNE donnée → Utilisez les scripts de la secrétaire pour créer école, classes, matières d'abord

---

### ⏳ ÉTAPE 3 : Créer la table teacher_assignments
**Fichier :** `create_teacher_assignments.sql`

**Copiez et exécutez TOUT le contenu dans Supabase SQL Editor.**

**Ce script va :**
- ✅ Créer la table `teacher_assignments`
- ✅ Créer 8 index pour les performances
- ✅ Créer un trigger pour `updated_at`
- ✅ Afficher un message de confirmation

**Résultat attendu :**
```
✅ Table teacher_assignments créée avec succès !
✅ 8 index créés pour optimiser les performances
✅ Trigger updated_at configuré
```

---

### ⏳ ÉTAPE 4A : Créer un enseignant de test (si nécessaire)
**Fichier :** `create_sample_teacher.sql`

**⚠️ AVANT D'EXÉCUTER :**
1. Ouvrez le fichier
2. Modifiez l'email : `'rose.tchoukoua@ecole.cm'`
3. Modifiez le téléphone : `'+237 6 XX XX XX XX'`
4. Si vous avez plusieurs écoles, remplacez `(SELECT id FROM schools LIMIT 1)` par votre `school_id`

**Exécutez le script dans Supabase SQL Editor.**

**Résultat attendu :**
```
✅ Enseignant créé/vérifié avec succès !
✅ Email: rose.tchoukoua@ecole.cm
```

---

### ⏳ ÉTAPE 4B : Créer une assignation de test
**Fichier :** `create_sample_assignment.sql`

**⚠️ PRÉREQUIS :**
- ✅ Table `teacher_assignments` créée (ÉTAPE 3)
- ✅ Au moins un enseignant existe (ÉTAPE 4A)
- ✅ Au moins une classe existe
- ✅ Au moins une matière existe

**Exécutez le script dans Supabase SQL Editor.**

**Résultat attendu :**
```
✅ Assignation(s) créée(s) avec succès !
✅ Total assignations : 1
```

---

## 📊 RÉSUMÉ DES FICHIERS

| Fichier | Objectif | Ordre | Statut |
|---------|----------|-------|--------|
| `check_teacher_tables.sql` | Vérifier les tables | 1 | ✅ FAIT |
| `check_existing_data.sql` | Voir les données | 2 | ⏳ À FAIRE |
| `create_teacher_assignments.sql` | Créer table | 3 | ⏳ À FAIRE |
| `create_sample_teacher.sql` | Créer enseignant test | 4A | ⏳ OPTIONNEL |
| `create_sample_assignment.sql` | Créer assignation test | 4B | ⏳ OPTIONNEL |

---

## 🎓 TESTER LE DASHBOARD

### Après avoir tout exécuté :

1. **Connectez-vous avec EmailJS** :
   - Email : `rose.tchoukoua@ecole.cm` (ou celui que vous avez utilisé)
   - Stockez dans localStorage avec :
   ```javascript
   localStorage.setItem('edutrack-user', JSON.stringify({
     id: "teacher-uuid-from-supabase",
     email: "rose.tchoukoua@ecole.cm",
     role: "teacher",
     current_school_id: "school-uuid-from-supabase",
     demoAccount: false
   }));
   ```

2. **Ouvrez le dashboard enseignant** : `/teacher-dashboard`

3. **Vérifiez** :
   - Badge "✅ Production" s'affiche (pas "🎭 Démo")
   - Vos classes assignées s'affichent
   - Vous pouvez sélectionner une classe
   - Les élèves de la classe s'affichent

---

## 🐛 DÉPANNAGE

### Problème : "Aucune classe assignée"
**Solution :**
1. Exécutez `check_existing_data.sql` → regardez section "Voir les enseignants"
2. Vérifiez que votre enseignant a des assignations :
   ```sql
   SELECT * FROM teacher_assignments 
   WHERE teacher_id = 'votre-teacher-id';
   ```
3. Si vide → exécutez `create_sample_assignment.sql`

### Problème : "Table teacher_assignments n'existe pas"
**Solution :**
1. Exécutez `create_teacher_assignments.sql`
2. Vérifiez la création :
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'teacher_assignments';
   ```

### Problème : Mode démo s'affiche au lieu de production
**Solution :**
1. Vérifiez localStorage :
   ```javascript
   console.log(JSON.parse(localStorage.getItem('edutrack-user')));
   ```
2. Assurez-vous que `demoAccount: false`
3. Vérifiez que `current_school_id` existe

---

## 📞 ÉTAPES SUIVANTES

Une fois que tout fonctionne :
1. Créer un service `teacherService.js` pour remplacer les données mock
2. Connecter les composants au service
3. Tester toutes les fonctionnalités :
   - Saisie de notes
   - Gestion des absences
   - Upload de documents
   - Communication avec élèves

---

**🎯 Commencez par exécuter `check_existing_data.sql` et partagez-moi le résultat !**
