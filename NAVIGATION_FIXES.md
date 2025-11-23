# 🔧 Corrections Navigation Enseignant et Parent

## Fichier 1: `src/components/ui/Sidebar.jsx`

### Modification 1 - Ligne 34-38 : Navigation Teacher
**REMPLACER:**
```javascript
teacher: [
  { label: 'Dashboard', path: '/teacher-dashboard', icon: 'Home', description: 'Aperçu des classes' },
  { label: 'Devoirs & Notes', path: '/teacher-assignment-system', icon: 'FileText', description: 'Gestion des devoirs' },
  { label: 'Mon Compte', path: '/teacher-account-management', icon: 'User', description: 'Gestion du compte' },
  { label: 'Documents', path: '/document-management-hub', icon: 'Files', description: 'Ressources pédagogiques' }
],
```

**PAR:**
```javascript
teacher: [
  { label: 'Tableau de bord', path: '/teacher-dashboard', icon: 'Home', description: 'Vue d\'ensemble' },
  { label: 'Mes Classes', path: '/teacher-dashboard?tab=classes', icon: 'Users', description: 'Classes assignées' },
  { label: 'Notes & Évaluations', path: '/teacher-dashboard?tab=grades', icon: 'BookOpen', description: 'Saisie des notes' },
  { label: 'Présences', path: '/teacher-dashboard?tab=attendance', icon: 'Calendar', description: 'Gestion des présences' },
  { label: 'Documents', path: '/teacher-dashboard?tab=documents', icon: 'FileText', description: 'Ressources pédagogiques' },
  { label: 'Mon Compte', path: '/teacher-dashboard?tab=account', icon: 'User', description: 'Paramètres' }
],
```

### Modification 2 - Ligne 69-72 : Quick Actions Teacher
**REMPLACER:**
```javascript
teacher: [
  { label: 'Nouvelle note', icon: 'Plus', path: '/grade-management-system' },
  { label: 'Documents', icon: 'FileText', path: '/document-management-hub' },
  { label: 'Emploi du temps', icon: 'Calendar', path: '/teacher-dashboard' },
],
```

**PAR:**
```javascript
teacher: [
  { label: 'Saisir une note', icon: 'Plus', path: '/teacher-dashboard?tab=grades' },
  { label: 'Prendre présences', icon: 'CheckSquare', path: '/teacher-dashboard?tab=attendance' },
  { label: 'Voir emploi du temps', icon: 'Clock', path: '/teacher-dashboard?tab=schedule' },
  { label: 'Mes documents', icon: 'FileText', path: '/teacher-dashboard?tab=documents' },
],
```

### Modification 3 - Ajouter Navigation Parent (après teacher, avant secretary)
**AJOUTER après la section teacher:**
```javascript
parent: [
  { label: 'Tableau de bord', path: '/parent-dashboard', icon: 'Home', description: 'Vue d\'ensemble' },
  { label: 'Mes Enfants', path: '/parent-dashboard?tab=children', icon: 'Users', description: 'Suivi des enfants' },
  { label: 'Notes & Résultats', path: '/parent-dashboard?tab=grades', icon: 'BookOpen', description: 'Performances scolaires' },
  { label: 'Présences', path: '/parent-dashboard?tab=attendance', icon: 'Calendar', description: 'Assiduité' },
  { label: 'Paiements', path: '/parent-dashboard?tab=payments', icon: 'CreditCard', description: 'Frais scolaires' },
  { label: 'Communications', path: '/parent-dashboard?tab=messages', icon: 'MessageSquare', description: 'Messagerie école' }
],
```

### Modification 4 - Ajouter Quick Actions Parent (après teacher, avant secretary)
**AJOUTER après la section teacher:**
```javascript
parent: [
  { label: 'Voir bulletins', icon: 'FileText', path: '/parent-dashboard?tab=grades' },
  { label: 'Paiements en cours', icon: 'DollarSign', path: '/parent-dashboard?tab=payments' },
  { label: 'Événements à venir', icon: 'Calendar', path: '/parent-dashboard?tab=events' },
  { label: 'Contacter l\'école', icon: 'MessageCircle', path: '/parent-dashboard?tab=messages' },
],
```

---

## Fichier 2: `src/components/ui/Header.jsx`

### Modification 5 - Ligne 60-62 : Navigation Parent
**REMPLACER:**
```javascript
parent: [
  { label: 'Dashboard', path: '/parent-dashboard', icon: 'Home' },
  { label: 'Enfants', path: '/parent-dashboard', icon: 'Users' },
  { label: 'Communications', path: '/parent-dashboard', icon: 'MessageCircle' },
],
```

**PAR:**
```javascript
parent: [
  { label: 'Tableau de bord', path: '/parent-dashboard', icon: 'Home' },
  { label: 'Enfants', path: '/parent-dashboard?tab=children', icon: 'Users' },
  { label: 'Notes', path: '/parent-dashboard?tab=grades', icon: 'BookOpen' },
  { label: 'Paiements', path: '/parent-dashboard?tab=payments', icon: 'CreditCard' },
],
```

### Modification 6 - Ligne 65-68 : Navigation Teacher
**REMPLACER:**
```javascript
teacher: [
  { label: 'Dashboard', path: '/teacher-dashboard', icon: 'Home' },
  { label: 'Affectations', path: '/teacher-assignment-system', icon: 'FileText' },
  { label: 'Compte', path: '/teacher-account-management', icon: 'User' },
],
```

**PAR:**
```javascript
teacher: [
  { label: 'Tableau de bord', path: '/teacher-dashboard', icon: 'Home' },
  { label: 'Classes', path: '/teacher-dashboard?tab=classes', icon: 'Users' },
  { label: 'Notes', path: '/teacher-dashboard?tab=grades', icon: 'BookOpen' },
  { label: 'Compte', path: '/teacher-dashboard?tab=account', icon: 'User' },
],
```

---

## 📋 Résumé des Changements

### ✅ Enseignant (Teacher)
- **Avant**: Liens vers `/teacher-assignment-system`, `/teacher-account-management`, `/document-management-hub`
- **Après**: Tout reste dans `/teacher-dashboard` avec onglets `?tab=classes`, `?tab=grades`, `?tab=attendance`, `?tab=documents`, `?tab=account`

### ✅ Parent
- **Avant**: Liens génériques vers `/parent-dashboard` (même chemin pour tout)
- **Après**: Navigation par onglets `?tab=children`, `?tab=grades`, `?tab=attendance`, `?tab=payments`, `?tab=messages`

### 🎯 Objectif
- Éviter les redirections vers des pages de rôles différents
- Garder la navigation cohérente avec student/secretary/principal
- Éliminer les doublons dans la navigation

---

## 🚀 Instructions d'Application

1. Ouvrir `src/components/ui/Sidebar.jsx`
2. Appliquer les modifications 1, 2, 3 et 4
3. Ouvrir `src/components/ui/Header.jsx`
4. Appliquer les modifications 5 et 6
5. Sauvegarder les deux fichiers
6. Tester la navigation pour teacher et parent

