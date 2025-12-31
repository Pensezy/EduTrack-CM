# Système de Gestion Multi-Sessions

## 🎯 Problème Résolu

Avant, tous les utilisateurs partageaient la même clé localStorage (`edutrack-user`), ce qui causait des conflits quand plusieurs comptes se connectaient sur la même machine. Le dernier connecté écrasait la session du précédent.

**Symptômes :**
- Dashboard du directeur affiche les données d'un étudiant
- Page profil montre les informations du mauvais utilisateur
- Impossible d'avoir plusieurs comptes actifs simultanément

## ✅ Solution Implémentée

### Architecture Multi-Sessions

Chaque rôle a maintenant **sa propre clé de session** dans localStorage :

```javascript
edutrack-session-principal    // Session du directeur
edutrack-session-teacher      // Session de l'enseignant
edutrack-session-student      // Session de l'étudiant
edutrack-session-parent       // Session du parent
edutrack-session-secretary    // Session du secrétaire
edutrack-user                 // Session globale (compatibilité)
```

### Fichiers Modifiés

1. **`src/hooks/useRoleSession.js`** (NOUVEAU)
   - Hook pour charger la session spécifique à un rôle
   - Évite les conflits entre comptes
   ```javascript
   const { user, loading, error } = useRoleSession('principal');
   ```

2. **`src/utils/sessionManager.js`** (NOUVEAU)
   - Gestionnaire centralisé des sessions
   - Méthodes pour lister, sauvegarder, supprimer les sessions
   ```javascript
   SessionManager.getAllSessions()
   SessionManager.getSessionByRole('student')
   SessionManager.clearSession('teacher')
   ```

3. **`src/components/SessionDebugger.jsx`** (NOUVEAU)
   - Widget de debug (mode dev uniquement)
   - Visualise toutes les sessions actives
   - Permet de supprimer des sessions

4. **`src/pages/staff-login/index.jsx`**
   - Modifié pour sauvegarder avec clé spécifique au rôle
   - Dispatch événement `edutrack-user-changed`

5. **`src/pages/principal-dashboard/index.jsx`**
   - Utilise `useRoleSession('principal')`
   - Charge uniquement la session du directeur

6. **`src/pages/student-dashboard/index.jsx`**
   - Utilise `useRoleSession('student')`
   - Charge uniquement la session de l'étudiant

7. **`src/pages/profile-settings/index.jsx`**
   - Détecte automatiquement le rôle depuis l'URL
   - Charge la session appropriée
   - Passe l'utilisateur spécifique à `useUserProfile`

8. **`src/hooks/useUserProfile.js`**
   - Accepte maintenant un paramètre `providedUser`
   - Charge le profil de l'utilisateur fourni au lieu de `AuthContext`

9. **`src/App.jsx`**
   - Ajoute `<SessionDebugger />` en mode dev

## 🔧 Utilisation

### Dans un Dashboard

```jsx
import useRoleSession from '../../hooks/useRoleSession';

const MyDashboard = () => {
  // Charger la session spécifique au rôle
  const { user, loading, error } = useRoleSession('teacher');
  
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  
  return <div>Bienvenue {user.full_name}</div>;
};
```

### Dans Profile Settings

```jsx
import useRoleSession from '../../hooks/useRoleSession';
import useUserProfile from '../../hooks/useUserProfile';

const ProfileSettings = () => {
  // Charger la session du rôle
  const { user: roleUser } = useRoleSession('principal');
  
  // Charger le profil de cet utilisateur spécifique
  const { profile, loading } = useUserProfile(roleUser);
  
  return <div>{profile.full_name}</div>;
};
```

### Gestion Programmatique

```javascript
import SessionManager from '../utils/sessionManager';

// Lister toutes les sessions
const sessions = SessionManager.getAllSessions();
console.log(sessions);
// {
//   principal: { email: 'director@school.cm', ... },
//   student: { email: 'student@school.cm', ... }
// }

// Obtenir une session spécifique
const studentSession = SessionManager.getSessionByRole('student');

// Supprimer une session
SessionManager.clearSession('teacher');

// Supprimer toutes les sessions
SessionManager.clearAllSessions();

// Debug dans la console
SessionManager.debugSessions();
```

## 🐛 Debug

En mode développement, un bouton flottant apparaît en bas à droite :
- Cliquez sur l'icône 🐛 pour voir toutes les sessions
- Visualisez qui est connecté pour chaque rôle
- Supprimez des sessions individuelles
- Effacez toutes les sessions

## 📊 Flux de Connexion

```
1. Utilisateur se connecte sur /staff-login
   ↓
2. Identification du rôle (student, teacher, etc.)
   ↓
3. Sauvegarde dans localStorage :
   - edutrack-session-{role} (spécifique)
   - edutrack-user (global, compatibilité)
   ↓
4. Dispatch événement 'edutrack-user-changed'
   ↓
5. Dashboard charge useRoleSession(role)
   ↓
6. Hook lit edutrack-session-{role}
   ↓
7. Retourne les bonnes données utilisateur
```

## ✨ Avantages

1. **Multi-utilisateurs** : Plusieurs comptes peuvent être connectés simultanément
2. **Pas de conflit** : Chaque rôle a sa propre session
3. **Rétro-compatible** : `edutrack-user` maintenu pour compatibilité
4. **Debug facile** : Widget visuel pour voir les sessions
5. **Isolation** : Dashboard du directeur ne peut pas charger les données d'un étudiant
6. **Flexibilité** : Facile d'ajouter de nouveaux rôles

## 🔒 Sécurité

- Les sessions sont isolées par rôle
- Un dashboard ne peut charger que la session de son rôle
- Détection automatique du rôle depuis l'URL
- Fallback sur AuthContext si session du rôle introuvable

## 📝 Tests Recommandés

1. **Test Multi-Comptes**
   ```
   1. Connectez-vous comme directeur → /principal-dashboard
   2. Ouvrez nouvel onglet, connectez-vous comme étudiant → /student-dashboard
   3. Vérifiez que chaque dashboard affiche les bonnes données
   4. Naviguez vers /profile-settings depuis chaque dashboard
   5. Confirmez que le profil correspond au compte actif
   ```

2. **Test Switch Rapide**
   ```
   1. Connecté comme étudiant
   2. Déconnexion
   3. Connexion immédiate comme directeur
   4. Vérifiez que le dashboard directeur affiche les bonnes données
   ```

3. **Test Session Debugger**
   ```
   1. En mode dev, cliquez sur le bouton 🐛
   2. Vérifiez que les sessions actives sont listées
   3. Supprimez une session
   4. Rechargez la page correspondante → doit rediriger vers login
   ```

## 🚀 Migration

Aucune migration nécessaire ! Le système est rétro-compatible :
- Les anciennes sessions dans `edutrack-user` continuent de fonctionner
- Les nouvelles connexions créent les sessions spécifiques
- Pas de perte de données

## 📚 Références

- Hook : `src/hooks/useRoleSession.js`
- Manager : `src/utils/sessionManager.js`
- Debugger : `src/components/SessionDebugger.jsx`
- Exemple : `src/pages/principal-dashboard/index.jsx`
