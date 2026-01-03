# Améliorations des Formulaires Utilisateurs

## Problèmes Résolus

### 1. ✅ Formulaire Enseignant - Zone de matières invisible

**Problème**: Quand on clique sur "Nouvel Enseignant", les zones de sélection des matières et classes n'apparaissaient pas visuellement.

**Cause**:
- Les matières et classes se chargent de manière asynchrone après la sélection d'une école
- Pour les directeurs, l'école est pré-sélectionnée mais les données ne se chargeaient pas automatiquement
- Les zones étaient conditionnelles (`{availableSubjects.length > 0 && ...}`) donc invisibles tant que les données n'étaient pas chargées

**Solution Appliquée**:

1. **Chargement automatique au montage du modal** :
   ```javascript
   useEffect(() => {
     if (isOpen) {
       loadSchools();
       // Pour les directeurs, pré-charger les matières de leur école
       if (currentUser?.role === 'principal' && currentUser?.current_school_id) {
         loadSchoolDetails(currentUser.current_school_id);
       }
     }
   }, [isOpen, currentUser]);
   ```

2. **Indicateur de chargement visuel** :
   - Ajout d'un état `loadingSchoolDetails`
   - Spinner affiché pendant le chargement des matières/classes
   - Message d'attente clair pour l'utilisateur

3. **Affichage permanent des zones** :
   - Les zones "Matières" et "Classes" sont maintenant TOUJOURS visibles
   - 3 états possibles :
     - **Chargement** : Spinner + "Chargement des matières..."
     - **Chargé** : Liste des checkboxes pour sélectionner
     - **Vide** : Message jaune "Veuillez d'abord sélectionner une école"

4. **Gestion d'erreur robuste** :
   - En cas d'erreur de chargement, utilisation des matières par défaut
   - Liste par défaut : Français, Mathématiques, Sciences, Histoire-Géographie, Anglais, EPS, Arts, Musique, Informatique

**Fichier Modifié**: [TeacherFormModal.jsx](apps/admin/src/pages/Users/components/TeacherFormModal.jsx)

---

### 2. ✅ Formulaire Secrétaire - Page générique inutile

**Problème**: Quand on clique sur "Secrétaire" (ou "Autre"), une page générique avec un champ role changeant s'affichait, ce qui était confus et inutile.

**Solution**: Création d'un **formulaire dédié pour les secrétaires** (`SecretaryFormModal.jsx`).

**Caractéristiques du nouveau formulaire**:

1. **Interface dédiée** :
   - Icône spécifique (Briefcase) et couleur jaune
   - Champs pertinents : Nom, Email, Téléphone, École, Département
   - Pas de sélection de rôle (fixé à "secretary")

2. **Utilise l'Edge Function** :
   - Création via `createUserAccount()` avec rôle fixe "secretary"
   - Génération automatique d'un mot de passe sécurisé
   - Affichage des identifiants après création

3. **Écran de confirmation** :
   - Affichage du nom complet
   - Email de connexion avec bouton copier
   - Mot de passe avec bouton afficher/masquer et copier
   - Instructions pour la première connexion
   - Avertissement de sécurité (identifiants affichés une seule fois)

4. **Champ optionnel Département** :
   - Permet de préciser le service (Administration, Scolarité, etc.)

**Fichier Créé**: [SecretaryFormModal.jsx](apps/admin/src/pages/Users/components/SecretaryFormModal.jsx) (548 lignes)

---

### 3. ✅ Bouton "Autre" supprimé

**Problème**: Le bouton "Autre" ouvrait un formulaire générique avec sélection de rôle, ce qui était confus.

**Solution**:
- Suppression complète du bouton "Autre"
- Ajout du bouton "Secrétaire" avec formulaire dédié
- Chaque type d'utilisateur a maintenant son propre bouton et formulaire spécialisé

**Nouveaux Boutons** (dans l'ordre) :
1. 🟢 **Enseignant** (vert) → TeacherFormModal
2. 🟡 **Secrétaire** (jaune) → SecretaryFormModal
3. 🔴 **Parent** (rose) → ParentFormModal
4. 🔵 **Élève** (indigo) → StudentFormModal

**Fichier Modifié**: [UsersPage.jsx](apps/admin/src/pages/Users/UsersPage.jsx)

---

## Récapitulatif des Modifications

### Fichiers Créés
- `apps/admin/src/pages/Users/components/SecretaryFormModal.jsx` (548 lignes)

### Fichiers Modifiés
1. **TeacherFormModal.jsx** :
   - Ajout de `loadingSchoolDetails` state
   - Chargement automatique des matières au montage pour les directeurs
   - Affichage permanent des zones matières/classes avec indicateurs de chargement
   - Gestion d'erreur avec valeurs par défaut

2. **UsersPage.jsx** :
   - Import de `SecretaryFormModal`
   - Ajout du state `secretaryModal`
   - Fonction `handleCreateSecretary()`
   - Mise à jour de `handleEditUser()` pour router vers `SecretaryFormModal` pour les secrétaires
   - Suppression du bouton "Autre"
   - Ajout du bouton "Secrétaire"
   - Ajout du composant `<SecretaryFormModal>` en bas du JSX

3. **index.js** (components) :
   - Export de `SecretaryFormModal`

---

## Expérience Utilisateur Améliorée

### Pour les Enseignants
✅ Les champs de matières et classes sont maintenant visibles dès l'ouverture du formulaire
✅ Indicateur de chargement clair pendant la récupération des données
✅ Message informatif si aucune école n'est sélectionnée
✅ Valeurs par défaut en cas d'erreur de chargement

### Pour les Secrétaires
✅ Formulaire dédié professionnel et cohérent
✅ Création de compte sécurisée via Edge Function
✅ Affichage clair des identifiants générés
✅ Boutons copier pour faciliter la transmission des identifiants
✅ Instructions de première connexion incluses

### Pour tous
✅ Boutons clairement identifiés par type d'utilisateur
✅ Plus de confusion avec le bouton "Autre"
✅ Interface homogène pour tous les types de comptes
✅ Chaque rôle a son propre modal spécialisé

---

## Architecture des Formulaires

```
UsersPage
├── Boutons de Création
│   ├── Enseignant → TeacherFormModal (avec Edge Function à venir)
│   ├── Secrétaire → SecretaryFormModal (avec Edge Function ✅)
│   ├── Parent     → ParentFormModal (avec Edge Function ✅)
│   └── Élève      → StudentFormModal (avec Edge Function à venir)
│
└── Modals
    ├── TeacherFormModal    - Matières, Classes, École
    ├── SecretaryFormModal  - Département, École ✅ NOUVEAU
    ├── ParentFormModal     - Profession, Adresse, Email optionnel
    ├── StudentFormModal    - Classe, Parent, École
    └── UserFormModal       - Pour admin/principal uniquement
```

---

## Prochaines Améliorations (Optionnelles)

### 1. Migrer TeacherFormModal vers Edge Function
Actuellement, `TeacherFormModal` fait un INSERT direct dans la table `users`. Il serait cohérent de :
- Utiliser `createUserAccount()` comme pour les autres rôles
- Générer un mot de passe sécurisé
- Afficher les identifiants après création
- Mettre à jour les champs `subjects` et `classes` via `updateUserFields()`

### 2. Migrer StudentFormModal vers Edge Function
Même chose pour les élèves.

### 3. Validation des champs
- Validation du format téléphone (+237...)
- Validation du format email
- Messages d'erreur plus spécifiques

### 4. Gestion de la suppression
Actuellement, le bouton "Supprimer" affiche juste une alerte. Implémenter :
- Modal de confirmation
- Suppression via API (Edge Function ou RPC)
- Gestion des cascades (ex: supprimer un enseignant → que devient ses classes?)

---

## Tests Recommandés

### Formulaire Enseignant
- [ ] Ouvrir le formulaire en tant que directeur
- [ ] Vérifier que les matières s'affichent immédiatement
- [ ] Vérifier le spinner de chargement
- [ ] Sélectionner quelques matières et classes
- [ ] Créer un enseignant et vérifier l'enregistrement

### Formulaire Secrétaire
- [ ] Cliquer sur le bouton "Secrétaire"
- [ ] Remplir le formulaire (nom, email, téléphone, département optionnel)
- [ ] Créer la secrétaire
- [ ] Vérifier l'écran de confirmation des identifiants
- [ ] Copier l'email et le mot de passe
- [ ] Vérifier que le compte existe dans la BDD

### Interface Générale
- [ ] Vérifier que le bouton "Autre" n'existe plus
- [ ] Vérifier les 4 boutons : Enseignant, Secrétaire, Parent, Élève
- [ ] Tester l'édition d'une secrétaire existante
- [ ] Vérifier que chaque rôle ouvre le bon modal en édition

---

**Date**: 03 Janvier 2026
**Version**: 2.4.0
**Statut**: ✅ COMPLÉTÉ
