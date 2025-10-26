# 🗑️ Suppression de Compte - Documentation

> **⚠️ ATTENTION :** Cette fonctionnalité permet la suppression DÉFINITIVE et IRRÉVERSIBLE d'un compte directeur et de toutes les données associées.

## 📚 Documentation Complète

- **📄 Ce fichier** → Guide d'utilisation et personnalisation
- **📋 [Liste complète](./ACCOUNT_DELETION_COMPLETE_LIST.md)** → Détails des 22 tables supprimées
- **✅ [Vérification](./ACCOUNT_DELETION_VERIFICATION.md)** → Checklist SQL post-suppression
- **🎯 [Vue d'ensemble](./ACCOUNT_DELETION_OVERVIEW.md)** → Réponse rapide aux 3 questions clés

---

## 📋 Fonctionnalité Ajoutée

Une section "Zone de danger" a été ajoutée à la page de profil (`/profile-settings`) permettant aux utilisateurs de supprimer définitivement leur compte.

## 🎯 Localisation

**Page :** `src/pages/profile-settings/index.jsx`  
**Route :** `/profile-settings`  
**Composant :** `DangerZone`

## 🔐 Sécurité

### Confirmation en deux étapes
1. **Clic sur le bouton** "Supprimer définitivement mon compte"
2. **Modal de confirmation** avec saisie obligatoire de `SUPPRIMER MON COMPTE`

### Restrictions
- Le texte doit être exact (sensible à la casse)
- Bouton désactivé tant que le texte n'est pas correct
- Impossible d'annuler après validation

## ⚠️ Avertissements Spécifiques

### Pour les Directeurs (role: 'principal')
**Avertissement renforcé :**
> En tant que directeur, la suppression de votre compte entraînera la **suppression complète de votre école** et de toutes les données associées.

**Données supprimées (22 tables) :**
- ✅ **École complète** (schools)
- ✅ **Tous les comptes utilisateurs** : étudiants, enseignants, parents, secrétaires
- ✅ **Toutes les notes** (grades) et bulletins
- ✅ **Toutes les présences** (attendances) et absences
- ✅ **Tous les paiements** (payments) et factures
- ✅ **Toutes les classes** et configuration pédagogique
- ✅ **Toutes les matières** et emplois du temps
- ✅ **Toutes les notifications** et communications
- ✅ **Tous les logs d'audit** (audit_logs)
- ✅ **Années académiques** et périodes d'évaluation
- ✅ **Tous les types** (notes, présences, paiements)
- ✅ **Toutes les relations** et associations

📋 **Voir la liste complète :** `docs/ACCOUNT_DELETION_COMPLETE_LIST.md`

### Pour les autres rôles
- Suppression uniquement des données personnelles de l'utilisateur

## 🔄 Processus de Suppression

### 1. Ordre de suppression des données

Pour un **directeur** :
```javascript
1. Notes (grades)
2. Présences (attendances)
3. Paiements (payments)
4. Notifications
5. Relations classes-matières (class_subjects)
6. Relations enseignants-matières (teacher_subjects)
7. Relations parents-étudiants-écoles (parent_student_schools)
8. Étudiants (students)
9. Enseignants (teachers)
10. Parents
11. Secrétaires (secretaries)
12. Matières (subjects)
13. Classes
14. Périodes d'évaluation (evaluation_periods)
15. Années académiques (academic_years)
16. Types de notes (grade_types)
17. Types de présences (attendance_types)
18. Types de paiements (payment_types)
19. Rôles utilisateur (user_roles)
20. École (schools)
21. Utilisateur (users)
22. Compte Supabase Auth
```

### 2. Après suppression
- ✅ Déconnexion automatique
- ✅ Redirection vers la page d'accueil (`/`)
- ✅ Message de confirmation

## 🎨 Interface Utilisateur

### Zone de danger
```jsx
┌─────────────────────────────────────────────┐
│ ⚠️  Zone de danger                          │
│                                             │
│ La suppression de votre compte est          │
│ irréversible. Toutes vos données seront    │
│ définitivement effacées.                    │
│                                             │
│ [Attention - Compte Directeur]              │
│ En tant que directeur, la suppression...    │
│                                             │
│ 📧 Email du compte : user@example.com       │
│                                             │
│ [ 🗑️ Supprimer définitivement mon compte ] │
└─────────────────────────────────────────────┘
```

### Modal de confirmation
```jsx
┌─────────────────────────────────────────┐
│          ⚠️                             │
│    Confirmer la suppression             │
│                                         │
│ Cette action est définitive et          │
│ irréversible.                           │
│                                         │
│ Pour confirmer, tapez exactement :      │
│ ┌─────────────────────────────────────┐ │
│ │ SUPPRIMER MON COMPTE                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [____________________________]          │
│                                         │
│ [ Annuler ]  [ 🗑️ Supprimer ]          │
└─────────────────────────────────────────┘
```

## 🧪 Tests

### Test 1 : Vérifier l'affichage
1. Se connecter en tant que directeur
2. Aller sur `/profile-settings`
3. Scroll vers le bas
4. Vérifier la présence de la "Zone de danger"

### Test 2 : Vérifier la confirmation
1. Cliquer sur "Supprimer définitivement mon compte"
2. Vérifier l'ouverture du modal
3. Essayer de valider sans saisir le texte → Bouton désactivé ✅
4. Taper un texte incorrect → Bouton désactivé ✅
5. Taper `SUPPRIMER MON COMPTE` → Bouton activé ✅

### Test 3 : Annuler la suppression
1. Ouvrir le modal
2. Cliquer sur "Annuler"
3. Vérifier la fermeture du modal
4. Vérifier que le compte n'est pas supprimé

### Test 4 : Suppression complète (ENVIRONNEMENT DE TEST UNIQUEMENT)
1. Créer un compte test
2. Ajouter quelques données
3. Supprimer le compte
4. Vérifier dans Supabase que toutes les données sont supprimées
5. Vérifier la redirection vers `/`

## 🔧 Personnalisation

### Changer le texte de confirmation

Dans `src/pages/profile-settings/index.jsx`, ligne ~850 :
```javascript
if (deleteConfirmText !== 'SUPPRIMER MON COMPTE') {
  // Changer le texte ici
}
```

### Ajouter des étapes de suppression

Ajouter avant la suppression du compte :
```javascript
// Exemple : envoyer un email de confirmation
await supabase.functions.invoke('send-deletion-email', {
  body: { userId, userEmail }
});
```

### Désactiver pour certains rôles

Dans le composant `DangerZone` :
```javascript
// Ne pas afficher pour les administrateurs
if (userRole === 'admin') {
  return null;
}
```

## 📊 Logs et Monitoring

Les logs suivants sont affichés dans la console :
```
🗑️ Suppression des données de l'école...
✅ Votre compte a été supprimé avec succès
❌ Erreur lors de la suppression du compte: [message]
```

## ⚠️ Limitations Connues

1. **Suppression du compte Auth**
   - `supabase.auth.admin.deleteUser()` nécessite des permissions RLS admin
   - Alternative implémentée : déconnexion forcée

2. **Cascade Delete**
   - Les suppressions sont manuelles dans l'ordre des dépendances
   - Pas d'utilisation de `ON DELETE CASCADE` SQL

3. **Rollback**
   - Aucun système de rollback en cas d'erreur partielle
   - Recommandation : sauvegardes régulières de la base de données

## 🚀 Améliorations Futures

- [ ] Ajouter un délai de grâce (30 jours) avant suppression définitive
- [ ] Envoyer un email de confirmation avant suppression
- [ ] Exporter les données avant suppression (GDPR compliance)
- [ ] Historique des comptes supprimés (audit trail)
- [ ] Possibilité de réactiver un compte dans les 30 jours

## 📚 Références

- **RGPD** : Droit à l'effacement (Article 17)
- **Supabase Docs** : https://supabase.com/docs/guides/auth/managing-users
- **React Docs** : https://react.dev/reference/react/useState

---

**Dernière mise à jour :** Octobre 2025  
**Version :** 1.0.0  
**Status :** ✅ Implémenté et fonctionnel
