# 🎭 COMPTES DE DÉMONSTRATION - EDUTRACK-CM

**Version:** 2.0 (Sécurisé)
**Date mise à jour:** 25 Décembre 2024

⚠️ **ATTENTION:** Les codes PIN ont été changés pour des raisons de sécurité.

---

## 📋 LISTE DES COMPTES DÉMO

### 👨‍💼 DIRECTEUR / PRINCIPAL

```
Email:    principal@demo.com
PIN:      463789
Rôle:     Principal (Directeur d'établissement)
École:    École Démo
Accès:    - Gestion complète de l'école
          - Statistiques et rapports
          - Gestion du personnel
          - Configuration système
```

### 👨‍🏫 ENSEIGNANT / TEACHER

```
Email:    teacher@demo.com
PIN:      736429
Rôle:     Teacher (Enseignant)
Matière:  Mathématiques
Classes:  6e A, 6e B, 5e A
Accès:    - Saisie des notes
          - Gestion des présences
          - Emploi du temps
          - Bulletins de notes
```

### 👨‍🎓 ÉTUDIANT / STUDENT

```
Email:    student@demo.com
PIN:      592481
Rôle:     Student (Élève)
Classe:   6e A
Matricule: STU2024001
Accès:    - Consultation des notes
          - Consultation des présences
          - Emploi du temps personnel
          - Bulletin de notes
```

### 👪 PARENT

```
Email:    parent@demo.com
PIN:      847362
Rôle:     Parent
Enfants:  - Student Demo (6e A)
          - Student Demo 2 (4e B)
Accès:    - Suivi des notes des enfants
          - Suivi des présences
          - Paiements scolaires
          - Communication avec l'école
```

### 👩‍💼 SECRÉTAIRE / SECRETARY

```
Email:    secretary@demo.com
PIN:      625183
Rôle:     Secretary (Secrétaire)
École:    École Démo
Accès:    - Gestion des inscriptions
          - Gestion des paiements
          - Émission de documents
          - Tâches administratives
```

### 🔧 ADMINISTRATEUR / ADMIN

```
Email:    admin@demo.com
PIN:      981547
Rôle:     Admin (Administrateur système)
Permissions: Toutes
Accès:    - Gestion multi-écoles
          - Configuration globale
          - Gestion des utilisateurs
          - Logs et statistiques système
```

---

## 🔐 INFORMATIONS DE SÉCURITÉ

### ⚠️ Changement de PIN (25 Décembre 2024)

Les codes PIN ont été modifiés de `123456` (identique pour tous) vers des codes **aléatoires uniques** par compte pour améliorer la sécurité.

#### Ancien système (OBSOLÈTE)
```
Tous les comptes:  123456  ❌ DANGEREUX
```

#### Nouveau système (ACTUEL)
```
principal@demo.com:  463789  ✅ Unique
teacher@demo.com:    736429  ✅ Unique
student@demo.com:    592481  ✅ Unique
parent@demo.com:     847362  ✅ Unique
secretary@demo.com:  625183  ✅ Unique
admin@demo.com:      981547  ✅ Unique
```

### 🛡️ Bonnes Pratiques

1. **NE PAS** utiliser ces comptes en production
2. **NE PAS** partager les PINs publiquement
3. **CHANGER** les PINs si utilisés en production
4. **UTILISER** des comptes réels avec emails valides en prod

---

## 🚀 COMMENT TESTER

### Connexion via PIN

1. Aller sur la page de connexion
2. Entrer l'email (ex: `teacher@demo.com`)
3. Entrer le PIN correspondant (ex: `736429`)
4. Cliquer sur "Se connecter"

### Connexion via Email/Mot de passe (Production)

```
⚠️ Les comptes démo N'ONT PAS de mot de passe email.
Ils utilisent UNIQUEMENT le système PIN.

Pour tester l'authentification email/mot de passe:
1. Créer un nouveau compte directeur via le formulaire d'inscription
2. Utiliser une vraie adresse email
3. Vérifier l'email de confirmation
4. Se connecter avec email + mot de passe
```

---

## 📊 DONNÉES DE TEST

Chaque compte démo contient des données pré-remplies pour faciliter les tests :

### Compte Enseignant (teacher@demo.com)

- **3 classes** assignées
- **45+ élèves** total
- **Notes** pour le 1er trimestre
- **Présences** sur 2 mois
- **Documents** : bulletins, rapports

### Compte Étudiant (student@demo.com)

- **8 matières**
- **20+ notes** enregistrées
- **Moyenne générale** : 14.5/20
- **Présences** : 95%
- **Paiements** : 2/3 effectués

### Compte Parent (parent@demo.com)

- **2 enfants** dans différentes classes
- **Historique paiements** complet
- **Notifications** : 5 non lues
- **Messages** : 3 conversations actives

### Compte Directeur (principal@demo.com)

- **1 école** complète
- **120 élèves**
- **15 enseignants**
- **Statistiques** temps réel
- **Rapports** mensuels/trimestriels

---

## 🔄 RÉINITIALISATION DES DONNÉES DÉMO

Si les données de démonstration sont corrompues ou incomplètes :

```bash
# Option 1: Script de réinitialisation (si disponible)
npm run seed:demo

# Option 2: Rechargement manuel
# Les données démo sont dans: src/services/demoDataService.js
# Elles se rechargent automatiquement au prochain login
```

---

## 🆚 DÉMO vs PRODUCTION

### Mode Démo (Détection Automatique)

Le système détecte automatiquement quand un compte démo est utilisé :

```javascript
// Fichier: src/hooks/useDataMode.js
if (user.email.endsWith('@demo.com')) {
  return 'demo';  // Utilise données mockées
} else {
  return 'production';  // Utilise Supabase
}
```

**Avantages mode démo:**
- ✅ Aucune connexion BDD requise
- ✅ Données réinitialisées à chaque session
- ✅ Parfait pour présentation/formation
- ✅ Pas de risque de corruption données

**Limites mode démo:**
- ❌ Données NON persistées
- ❌ Modifications NON sauvegardées
- ❌ Pas d'envoi d'emails réels
- ❌ Pas de génération PDF réels

### Mode Production

Comptes créés via le formulaire d'inscription :

```javascript
// Utilise Supabase Auth + PostgreSQL
if (!user.email.endsWith('@demo.com')) {
  return 'production';
}
```

**Avantages production:**
- ✅ Données persistées en BDD
- ✅ Modifications sauvegardées
- ✅ Envoi emails réels (EmailJS)
- ✅ Génération PDF téléchargeables

---

## 🎓 SCÉNARIOS DE TEST RECOMMANDÉS

### Scénario 1: Gestion de Notes (15 min)

1. Connexion `teacher@demo.com` (PIN: 736429)
2. Aller dans "Mes Classes"
3. Sélectionner "6e A"
4. Cliquer "Saisir des notes"
5. Ajouter une note pour un élève
6. Vérifier le calcul automatique de moyenne

### Scénario 2: Suivi Parental (10 min)

1. Connexion `parent@demo.com` (PIN: 847362)
2. Voir le tableau de bord multi-enfants
3. Sélectionner "Student Demo"
4. Consulter les notes
5. Consulter les présences
6. Vérifier l'historique des paiements

### Scénario 3: Gestion Administrative (20 min)

1. Connexion `principal@demo.com` (PIN: 463789)
2. Voir les statistiques d'école
3. Aller dans "Personnel"
4. Consulter la liste des enseignants
5. Aller dans "Élèves"
6. Voir les effectifs par classe
7. Générer un rapport PDF

### Scénario 4: Inscription Étudiant (15 min)

1. Connexion `secretary@demo.com` (PIN: 625183)
2. Aller dans "Inscriptions"
3. Cliquer "Nouvel élève"
4. Remplir le formulaire
5. Générer le numéro matricule
6. Enregistrer et imprimer fiche

### Scénario 5: Consultation Étudiant (5 min)

1. Connexion `student@demo.com` (PIN: 592481)
2. Voir le tableau de bord personnel
3. Consulter les notes par matière
4. Vérifier l'emploi du temps
5. Télécharger le bulletin PDF

---

## 🐛 DÉPANNAGE

### Problème: "PIN incorrect"

**Cause:** Vous utilisez l'ancien PIN (123456)

**Solution:** Utiliser les nouveaux PINs (voir tableau ci-dessus)

### Problème: "Aucune donnée affichée"

**Cause:** Compte non initialisé ou données corrompues

**Solution:**
1. Se déconnecter
2. Vider le cache navigateur (Ctrl+Shift+Delete)
3. Se reconnecter

### Problème: "Erreur Supabase"

**Cause:** Le compte démo essaie d'accéder à la BDD

**Solution:**
1. Vérifier que l'email se termine par `@demo.com`
2. Vérifier dans la console: `useDataMode()` doit retourner `"demo"`

### Problème: "Session expirée"

**Cause:** Inactivité prolongée (>30 min)

**Solution:** Se reconnecter avec email + PIN

---

## 📞 SUPPORT

### Questions fréquentes

**Q: Puis-je changer le PIN d'un compte démo ?**
R: Oui, modifier [src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx) ligne 16-102

**Q: Comment ajouter un nouveau compte démo ?**
R: Ajouter une entrée dans `demoAccounts` dans AuthContext.jsx

**Q: Les données démo sont-elles sauvegardées ?**
R: Non, elles sont rechargées à chaque session (localStorage temporaire)

**Q: Peut-on utiliser les comptes démo en production ?**
R: ❌ NON - Créer de vrais comptes via le formulaire d'inscription

### Contact

- **Documentation:** [docs/](docs/)
- **Guide sécurité:** [docs/SECURITY_GUIDE.md](docs/SECURITY_GUIDE.md)
- **Issues GitHub:** [github.com/your-repo/issues](https://github.com)

---

**🎭 Les comptes démo sont là pour TESTER, pas pour PRODUIRE.**

*Document maintenu par: Équipe EduTrack-CM*
*Dernière mise à jour: 25 Décembre 2024*
