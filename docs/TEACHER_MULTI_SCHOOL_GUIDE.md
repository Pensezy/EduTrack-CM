# 🏫 Guide du Système Multi-Établissements pour Enseignants - EduTrack CM

## 📋 Vue d'ensemble

Le système multi-établissements pour enseignants permet à un même enseignant de travailler dans plusieurs établissements scolaires avec un seul compte utilisateur, tout en gardant une gestion distincte de ses assignations, horaires et élèves par établissement.

## 🎯 Problématiques Résolues

### 1. **Éviter les Doublons d'Enseignants**
- **Problème** : Un enseignant vacataire qui travaille dans 3 écoles avait 3 comptes différents
- **Solution** : Un seul compte global, plusieurs assignations par établissement

### 2. **Vision Centralisée**
- **Problème** : L'enseignant ne peut pas voir sa charge totale de travail
- **Solution** : Dashboard unifié montrant toutes ses assignations

### 3. **Gestion Simplifiée pour les Secrétaires**
- **Problème** : Difficulté à vérifier si un enseignant existe déjà
- **Solution** : Recherche globale avant création de nouvelle assignation

## 🏗️ Architecture du Système

### Structure des Données

```javascript
// Enseignant Global (un seul par personne)
Teacher {
  id: 'teacher-1',
  globalTeacherId: 'global-teacher-1', // ID unique global
  firstName: 'Marie',
  lastName: 'Ngueffo',
  email: 'marie.ngueffo@gmail.com',
  phone: '+237699123456',
  specializations: ['Mathématiques', 'Physique'],
  qualification: 'Licence en Mathématiques',
  experience: 8
}

// Assignations par Établissement
TeacherSchoolAssignment {
  id: 'assignment-1',
  teacherId: 'teacher-1',
  schoolId: 'school-1',
  position: 'Enseignant titulaire', // ou 'Vacataire', 'Remplaçant'
  subjects: ['Mathématiques', 'Physique'],
  classes: ['CM1-A', 'CM2-B'],
  weeklyHours: 18,
  assignmentType: 'principal' // ou 'vacataire'
}

// Planning Détaillé
TeacherSchedule {
  teacherId: 'teacher-1',
  schoolId: 'school-1',
  classId: 'CM1-A',
  subject: 'Mathématiques',
  dayOfWeek: 'Lundi',
  startTime: '08:00',
  endTime: '10:00',
  room: 'Salle 12'
}
```

## 🔄 Workflows Implémentés

### 1. **Workflow Secrétaire - Assignation d'Enseignant**

```
ÉTAPE 1: Type d'Assignation
├─ Enseignant Existant
│  └─ Recherche dans système global
│     ├─ Trouvé → Voir assignations actuelles
│     └─ Non trouvé → Option créer nouveau
└─ Nouvel Enseignant
   └─ Formulaire création complète

ÉTAPE 2: Informations Enseignant
├─ Si Existant: Affichage profil + disponibilités
└─ Si Nouveau: Formulaire complet (nom, spécialisations, etc.)

ÉTAPE 3: Assignation Classes
├─ Sélection matières à enseigner
├─ Sélection classes
├─ Calcul automatique heures/semaine
└─ Vérification charge de travail
```

### 2. **Workflow Enseignant - Vision Multi-Établissements**

```
DASHBOARD ENSEIGNANT
├─ Vue d'ensemble globale
│  ├─ Nombre d'établissements
│  ├─ Charge totale (heures/semaine)
│  ├─ Total élèves
│  └─ Disponibilité restante
├─ Sélecteur d'établissement
│  └─ Basculer entre ses différentes assignations
└─ Détails par établissement
   ├─ Classes assignées
   ├─ Matières enseignées
   ├─ Planning de la semaine
   └─ Informations élèves
```

## 🛠️ Composants Développés

### 1. **Service de Données**
- `teacherMultiSchoolServiceDemo.js` : Gestion centralisée des enseignants multi-établissements

### 2. **Composants Interface Secrétaire**
- `TeacherSearchSelector.jsx` : Recherche d'enseignants existants
- `TeacherAssignmentManager.jsx` : Gestionnaire d'assignations
- Intégration dans `TeacherManagementTab.jsx`

### 3. **Composants Interface Enseignant**
- `TeacherMultiSchoolOverview.jsx` : Vue d'ensemble multi-établissements
- Intégration dans le dashboard enseignant

## 📊 Fonctionnalités Clés

### ✅ **Recherche Intelligente**
- Recherche par nom, email, téléphone ou spécialisation
- Affichage des assignations actuelles
- Calcul de disponibilité en temps réel

### ✅ **Gestion des Assignations**
- Assignation par établissement
- Gestion des matières et classes
- Calcul automatique de la charge horaire
- Alertes sur la surcharge de travail

### ✅ **Vision Enseignant Unifiée**
- Dashboard centralisé multi-établissements
- Basculement entre établissements
- Planning unifié
- Statistiques globales de charge

### ✅ **Prévention des Doublons**
- Vérification automatique avant création
- Système d'ID globaux
- Recherche préventive par email/téléphone

## 🔒 Règles Métier Implémentées

### 1. **Contraintes de Charge**
- Maximum recommandé : 40h/semaine
- Alertes à partir de 25h/semaine
- Visualisation de la disponibilité restante

### 2. **Types d'Assignation**
- **Principal** : Poste principal de l'enseignant
- **Vacataire** : Heures supplémentaires
- **Remplacement** : Assignation temporaire

### 3. **Spécialisations**
- Un enseignant peut enseigner uniquement ses matières de spécialisation
- Vérification lors de l'assignation
- Suggestions basées sur les compétences

## 📱 Interfaces Utilisateur

### **Dashboard Secrétaire**
1. **Liste des enseignants** avec filtres par spécialisation et disponibilité
2. **Modal d'assignation** en 3 étapes
3. **Recherche d'enseignants existants** avec aperçu des assignations
4. **Gestionnaire d'assignations** avec calcul automatique des heures

### **Dashboard Enseignant**
1. **Vue d'ensemble globale** avec statistiques multi-établissements
2. **Sélecteur d'établissement** pour basculer entre assignations
3. **Détails par établissement** : classes, matières, planning
4. **Indicateur de charge** avec visualisation graphique

## 🚀 Exemple d'Utilisation

### **Cas Pratique : Marie Ngueffo, Enseignante Multi-Établissements**

```
Marie Ngueffo
├─ Spécialisations: Mathématiques, Physique
├─ Assignation 1: EPP Les Palmiers (Yaoundé)
│  ├─ Poste: Enseignant titulaire
│  ├─ Classes: CM1-A, CM2-B
│  ├─ Matières: Mathématiques, Physique
│  └─ Charge: 20h/semaine
└─ Assignation 2: Collège Excellence (Douala)
   ├─ Poste: Enseignant vacataire
   ├─ Classes: 6ème-A
   ├─ Matières: Mathématiques
   └─ Charge: 8h/semaine

Total: 28h/semaine sur 2 établissements
Disponibilité restante: 12h/semaine
```

## 🔧 Intégration Technique

### **Services Utilisés**
```javascript
// Vérifier si enseignant existe
const result = await teacherMultiSchoolServiceDemo.checkExistingTeacher(email, phone);

// Rechercher enseignants
const teachers = await teacherMultiSchoolServiceDemo.searchExistingTeachers(searchTerm);

// Créer assignation
const assignment = await teacherMultiSchoolServiceDemo.createTeacherAssignment(
  teacherId, schoolId, assignmentData
);

// Obtenir détails multi-établissements
const details = await teacherMultiSchoolServiceDemo.getTeacherMultiSchoolDetails(globalTeacherId);
```

### **Composants React**
```jsx
// Recherche d'enseignants (Secrétaire)
<TeacherSearchSelector
  onTeacherSelect={handleTeacherSelect}
  onCreateNew={handleCreateNew}
  selectedTeacher={selectedTeacher}
/>

// Gestionnaire d'assignations (Secrétaire)
<TeacherAssignmentManager
  teacher={teacher}
  selectedSchoolId={schoolId}
  onAssignmentComplete={handleComplete}
/>

// Vue multi-établissements (Enseignant)
<TeacherMultiSchoolOverview
  teacherGlobalId="global-teacher-1"
/>
```

## 🎯 Bénéfices du Système

### **Pour les Enseignants**
- ✅ Un seul compte pour tous les établissements
- ✅ Vision globale de leur charge de travail
- ✅ Planning unifié accessible partout
- ✅ Historique centralisé de leurs assignations

### **Pour les Secrétaires**
- ✅ Évite la création de doublons
- ✅ Recherche rapide d'enseignants existants
- ✅ Gestion simplifiée des assignations
- ✅ Vue d'ensemble des disponibilités

### **Pour l'Administration**
- ✅ Données centralisées et cohérentes
- ✅ Statistiques fiables sur les enseignants
- ✅ Optimisation des ressources humaines
- ✅ Suivi des charges de travail

## 🔄 Évolutions Futures Possibles

1. **Synchronisation Planning** : Éviter les conflits d'horaires entre établissements
2. **Gestion des Congés** : Système unifié pour toutes les assignations
3. **Évaluations Multi-Établissements** : Agrégation des performances
4. **Système de Recommandations** : Suggérer des assignations optimales
5. **Intégration Paie** : Calcul automatique basé sur toutes les assignations

---

**📚 Ce système multi-établissements transforme la gestion des enseignants en une solution moderne, centralisée et efficace, adaptée aux réalités du système éducatif camerounais.**