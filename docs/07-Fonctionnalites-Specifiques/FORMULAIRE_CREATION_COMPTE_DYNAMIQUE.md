# 📋 Formulaire de Création de Compte Dynamique

## Vue d'ensemble

Le formulaire de création de compte dans le dashboard du directeur a été amélioré pour s'adapter dynamiquement en fonction du rôle sélectionné. Chaque rôle affiche maintenant des champs spécifiques à ses besoins.

## 🎯 Objectifs

- **Expérience utilisateur améliorée** : Afficher uniquement les champs pertinents pour chaque rôle
- **Données complètes** : Collecter toutes les informations nécessaires dès la création
- **Automatisation** : Créer automatiquement les relations et assignations appropriées

## 📝 Structure du formulaire

### Section 1 : Informations générales (Tous les rôles)

Champs communs à tous les utilisateurs :
- **Nom complet*** (obligatoire)
- **Email*** (obligatoire)
- **Téléphone** (optionnel)
- **Rôle*** (sélecteur qui déclenche l'affichage des sections suivantes)

### Section 2 : Informations spécifiques au rôle

#### 👨‍🏫 **ENSEIGNANT (teacher)**

**Informations professionnelles :**
- **Spécialité / Matière principale*** - Ex: Mathématiques, Français
- **Date d'embauche** - Date d'entrée en fonction
- **Classes assignées** (multi-select) - Liste des classes où il enseigne
- **Matières enseignées** (multi-select) - Liste des matières qu'il enseigne
- **Heures hebdomadaires** - Nombre d'heures de cours par semaine

**Traitement automatique :**
- Création dans la table `teachers`
- Création d'entrées dans `teacher_assignments` pour chaque combinaison classe-matière
- Calcul automatique du schedule avec les heures hebdomadaires
- Attribution à l'année académique courante

**Exemple d'utilisation :**
```
Enseignant: M. Dupont
Spécialité: Mathématiques
Classes: 6ème A, 6ème B, 5ème A
Matières: Mathématiques, Physique
Heures: 18

→ Crée 6 assignations (3 classes × 2 matières)
```

#### 👔 **SECRÉTAIRE (secretary)**

**Informations professionnelles :**
- **Département** - Ex: Administration, Pédagogie
- **Date d'embauche** - Date d'entrée en fonction
- **Permissions accordées** (checkboxes multiples) :
  - ✅ Gérer les élèves
  - ✅ Gérer les notes
  - ✅ Gérer les présences
  - ✅ Gérer les communications
  - ✅ Voir les rapports

**Traitement automatique :**
- Création dans la table `secretaries`
- Stockage des permissions sélectionnées
- Configuration des accès selon les permissions

#### 🎓 **ÉLÈVE (student)**

**Informations scolaires :**
- **Classe*** - Classe d'affectation (obligatoire)
- **Date de naissance** - Pour calcul de l'âge

**Informations du parent/tuteur :**
- **Nom du parent** - Nom complet
- **Téléphone du parent** - Contact principal
- **Email du parent** - Pour les communications

**Traitement automatique :**
- Création dans la table `students`
- Affectation à la classe sélectionnée
- Stockage des informations du parent pour contact rapide

#### 👨‍👩‍👧 **PARENT (parent)**

**Informations familiales :**
- **Enfants à lier au compte*** (multi-select) - Liste des élèves de l'école
- **Profession** - Métier du parent
- **Contact d'urgence (nom)** - Personne à contacter en cas d'urgence
- **Téléphone d'urgence** - Numéro du contact d'urgence

**Traitement automatique :**
- Création dans la table `parents`
- Création de liens dans `parent_student` pour chaque enfant sélectionné
- Configuration du parent comme contact principal et d'urgence

### Section 3 : Informations de connexion (Tous les rôles)

- **Mot de passe*** (obligatoire)
  - Minimum 8 caractères
  - Bouton "Générer automatiquement"
  - Bouton "Copier" pour faciliter la communication
  - Possibilité d'afficher/masquer
- **Statut** - Actif ou Inactif

## 🔄 Flux de création

### 1. Sélection du rôle
```
Directeur sélectionne "Enseignant" 
→ Affichage automatique des sections spécifiques enseignant
```

### 2. Remplissage du formulaire
```
Remplir informations générales
↓
Remplir informations spécifiques au rôle
↓
Définir le mot de passe (ou générer automatiquement)
```

### 3. Validation et création
```
Clic sur "Créer le compte"
↓
Validation des champs obligatoires
↓
Création dans Supabase :
  1. Table users
  2. Table spécifique au rôle (teachers, secretaries, students, parents)
  3. Tables de relations (assignations, liens parent-enfant)
↓
Envoi email automatique avec identifiants (si configuré)
↓
Affichage message de confirmation
↓
Redirection vers liste des comptes
```

## 📊 Données de référence chargées

Le formulaire charge automatiquement :

### Classes disponibles
```sql
SELECT id, name, level 
FROM classes 
WHERE school_id = ? AND is_active = true
ORDER BY name
```

### Matières disponibles
```sql
SELECT id, name 
FROM subjects 
WHERE school_id = ? AND is_active = true
ORDER BY name
```

### Élèves disponibles (pour les parents)
```sql
SELECT s.id, s.first_name, s.last_name, c.name as class_name
FROM students s
JOIN classes c ON s.class_id = c.id
WHERE s.school_id = ? AND s.is_active = true
ORDER BY s.last_name
```

## 🎨 Interface utilisateur

### Indicateurs visuels

- **Icônes colorées** pour chaque section
  - 📖 Bleu pour les enseignants
  - 💼 Violet pour les secrétaires
  - 🎓 Vert pour les élèves
  - 👨‍👩‍👧 Orange pour les parents

- **Compteurs de sélections** pour les multi-selects
  ```
  Classes sélectionnées (3): 6ème A, 6ème B, 5ème A
  ```

- **Instructions d'utilisation** sous les champs multi-select
  ```
  Maintenez Ctrl/Cmd pour sélectionner plusieurs
  ```

### Responsive design

Le formulaire s'adapte aux différentes tailles d'écran :
- **Desktop** : 2 colonnes pour la plupart des champs
- **Mobile** : 1 colonne pour faciliter la saisie

## 🔧 Mode démonstration

En mode démo, le formulaire :
- Affiche des données fictives pour les listes (classes, matières, élèves)
- Simule la création sans toucher à la base de données
- Affiche un message de confirmation simulé

## 📧 Intégration email

Après création d'un compte :

### Email automatique envoyé (si configuré)
```
À : nouvel.utilisateur@email.com
Sujet : Vos identifiants EduTrack-CM

Bonjour [Nom],

Votre compte [Rôle] a été créé avec succès !

Email : [email]
Mot de passe : [mot_de_passe]

Lien de connexion : [URL]

Cordialement,
[Nom du directeur]
[Nom de l'école]
```

### Fallback si email non configuré
```
Affichage dans une alerte :
- Email : [email]
- Mot de passe : [mot_de_passe]
- Instructions pour configurer l'envoi automatique
```

## 🔐 Validation des données

### Champs obligatoires
- Nom complet
- Email
- Mot de passe (min 8 caractères)
- Rôle

### Champs obligatoires spécifiques
- **Enseignant** : Spécialité
- **Élève** : Classe
- **Parent** : Au moins un enfant lié

### Validations
- ✅ Format email valide
- ✅ Mot de passe minimum 8 caractères
- ✅ Email unique (non déjà utilisé)
- ✅ Classe existe et est active
- ✅ Matières et classes sont de la même école

## 🚀 Avantages

1. **Gain de temps** : Toutes les informations en une seule fois
2. **Moins d'erreurs** : Validation en temps réel
3. **Données complètes** : Relations créées automatiquement
4. **UX améliorée** : Affichage contextuel des champs
5. **Automatisation** : Assignations et liens créés automatiquement

## 📝 Exemples d'utilisation

### Créer un enseignant complet

```
1. Nom complet: Jean Dupont
2. Email: j.dupont@ecole.cm
3. Téléphone: +237 695 123 456
4. Rôle: Enseignant

→ Section enseignant apparaît

5. Spécialité: Mathématiques
6. Date d'embauche: 2025-01-01
7. Classes: [6ème A, 6ème B, 5ème A]
8. Matières: [Mathématiques, Physique]
9. Heures: 18

10. Générer mot de passe automatiquement
11. Clic "Créer le compte"

→ Résultat:
- 1 utilisateur créé
- 1 enseignant créé
- 6 assignations créées (3 classes × 2 matières)
- Email envoyé avec identifiants
```

### Créer un parent avec plusieurs enfants

```
1. Nom complet: Marie Martin
2. Email: m.martin@email.com
3. Téléphone: +237 695 234 567
4. Rôle: Parent

→ Section parent apparaît

5. Enfants: [Pierre Martin - 6ème A, Sophie Martin - 5ème B]
6. Profession: Infirmière
7. Contact d'urgence: Paul Martin
8. Téléphone d'urgence: +237 695 345 678

9. Mot de passe: MarieMartin2025!
10. Clic "Créer le compte"

→ Résultat:
- 1 utilisateur créé
- 1 parent créé
- 2 liens parent-enfant créés
- Email envoyé
```

## 🛠️ Maintenance et évolution

### Ajouter un nouveau rôle

1. Ajouter l'option dans `newUserRoleOptions`
2. Créer une section conditionnelle dans `renderCreateForm()`
3. Ajouter les champs dans l'état `newUser`
4. Implémenter la logique de création dans `handleCreateUser()`

### Ajouter un champ à un rôle existant

1. Ajouter le champ dans l'état `newUser`
2. Ajouter l'input dans la section du rôle
3. Mettre à jour la logique de reset dans `handleCreateUser()`
4. Mettre à jour la requête d'insertion Supabase

## 📚 Fichiers modifiés

- `src/pages/principal-dashboard/components/AccountsManagement.jsx`
  - État `newUser` étendu (lignes 107-145)
  - Fonction `loadReferenceData()` (lignes 290-375)
  - Fonction `renderCreateForm()` complètement réécrite (lignes 1670-2150)
  - Fonction `handleCreateUser()` améliorée (lignes 507-930)

## 🎯 Prochaines améliorations possibles

- [ ] Auto-complétion pour les noms
- [ ] Validation email en temps réel (vérifier si déjà utilisé)
- [ ] Prévisualisation des assignations avant création
- [ ] Import en masse depuis fichier CSV/Excel
- [ ] Génération automatique de l'emploi du temps enseignant
- [ ] Suggestion de mot de passe sécurisé avec indicateur de force
- [ ] Vérification des conflits d'horaires pour les enseignants
- [ ] Photo de profil lors de la création

---

**Dernière mise à jour** : 30 novembre 2025
**Version** : 2.0
**Auteur** : GitHub Copilot
