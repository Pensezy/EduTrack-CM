# 🔐 GUIDE DE SÉCURITÉ - EDUTRACK-CM

**Version:** 1.0
**Date:** 25 Décembre 2024
**Statut:** CRITIQUE - À LIRE OBLIGATOIREMENT

---

## 📋 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Corrections de Sécurité Phase 1 - TERMINÉES](#phase-1-terminée)
3. [Actions Immédiates Requises](#actions-immédiates)
4. [Bonnes Pratiques de Sécurité](#bonnes-pratiques)
5. [Checklist de Déploiement](#checklist-déploiement)
6. [Contacts d'Urgence](#contacts-urgence)

---

## 🎯 INTRODUCTION

Ce document décrit les **failles de sécurité critiques** identifiées dans EduTrack-CM et les **corrections apportées**. La Phase 1 de sécurisation a été complétée le 25/12/2024.

### Niveau de Risque AVANT Corrections

| Catégorie | Risque | Impact |
|-----------|--------|--------|
| Exposition secrets (.env) | 🔴 CRITIQUE | Compromission totale BDD |
| Mots de passe en clair | 🔴 CRITIQUE | Vol de comptes |
| RLS désactivée | 🟠 ÉLEVÉ | Fuite de données inter-écoles |
| XSS (dangerouslySetInnerHTML) | 🟠 ÉLEVÉ | Vol de sessions |
| PIN faibles (123456) | 🟡 MOYEN | Bruteforce facile |

---

## ✅ PHASE 1 - TERMINÉE

### 1. Protection des Secrets (.env)

#### ❌ AVANT
```bash
# .env COMMITÉ dans Git avec mot de passe en clair
DATABASE_URL="postgresql://postgres.xxx:Insandji1@..."
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

#### ✅ APRÈS
- ✅ `.env` retiré du contrôle de version Git
- ✅ `.env.example` créé comme template
- ✅ Variables sensibles commentées avec instructions
- ✅ `.gitignore` vérifié

**Fichiers modifiés:**
- [.env.example](.env.example) - Template sécurisé
- `.env` - Retiré de Git

---

### 2. Hashing des Mots de Passe (bcrypt)

#### ❌ AVANT
```javascript
// Mot de passe stocké EN CLAIR dans la BDD
if (userData.password_hash !== password) {
  throw new Error('Incorrect');
}
```

#### ✅ APRÈS
```javascript
// Vérification sécurisée avec bcrypt (12 rounds)
const isValid = await verifyPassword(password, userData.password_hash);
```

**Fichiers créés/modifiés:**
- [src/services/passwordHashService.js](../src/services/passwordHashService.js) - Service bcrypt complet
- [src/services/authService.js](../src/services/authService.js) - Migration automatique
- [scripts/migrate-passwords-to-bcrypt.js](../scripts/migrate-passwords-to-bcrypt.js) - Script de migration

**Fonctionnalités:**
- `hashPassword(plainPassword)` - Hash avec bcrypt (12 rounds)
- `verifyPassword(plain, hash)` - Vérification sécurisée
- `checkPasswordStrength(password)` - Analyse force du mot de passe
- `generateSecurePassword(length)` - Générateur de mot de passe fort
- `generateSecurePIN(length)` - Générateur de PIN sécurisé

---

### 3. Activation Row Level Security (RLS)

#### ❌ AVANT
```sql
-- TOUTES LES TABLES SANS PROTECTION
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools DISABLE ROW LEVEL SECURITY;
-- ... 22 tables non protégées
```

**Conséquence:** Un directeur pouvait voir/modifier les données d'une autre école !

#### ✅ APRÈS
```sql
-- POLITIQUES PAR RÔLE ET PAR ÉCOLE
CREATE POLICY "Directors can only see their school"
ON schools FOR SELECT
USING (director_user_id = auth.uid());

CREATE POLICY "Students see only their school data"
ON students FOR SELECT
USING (school_id IN (
  SELECT current_school_id FROM users WHERE id = auth.uid()
));
```

**Fichier créé:**
- [supabase/migrations/20251225_enable_rls_security.sql](../supabase/migrations/20251225_enable_rls_security.sql)

**Politiques créées:** 30+ politiques couvrant:
- Isolation par école (multi-tenancy)
- Isolation par rôle (principal, teacher, student, parent)
- Admins avec accès complet
- Protection lectures ET écritures

---

### 4. Protection XSS (DOMPurify)

#### ❌ AVANT
```javascript
// Injection HTML non filtrée
printWindow.document.write(`
  <body>${printContent.innerHTML}</body>
`);
```

**Risque:** Injection de `<script>alert(document.cookie)</script>`

#### ✅ APRÈS
```javascript
// Sanitization systématique avec DOMPurify
const sanitizedContent = DOMPurify.sanitize(printContent.innerHTML, {
  ALLOWED_TAGS: ['div', 'span', 'p', 'table', ...],
  ALLOWED_ATTR: ['class', 'colspan']
});
```

**Fichiers modifiés:**
- [src/pages/teacher-dashboard/components/ReportCard.jsx](../src/pages/teacher-dashboard/components/ReportCard.jsx)
- [src/pages/secretary-dashboard/components/ReceiptModal.jsx](../src/pages/secretary-dashboard/components/ReceiptModal.jsx)

**Protection:**
- Tous les scripts bloqués
- Uniquement tags sûrs autorisés
- Attributs `onclick`, `onerror` interdits

---

### 5. Amélioration Codes PIN

#### ❌ AVANT
```javascript
const demoAccounts = {
  'parent@demo.com': { pin: '123456' },  // Identique partout !
  'student@demo.com': { pin: '123456' },
  'teacher@demo.com': { pin: '123456' },
  // ...
};
```

**Risque:** 1 seule tentative pour accéder à tous les comptes

#### ✅ APRÈS
```javascript
const demoAccounts = {
  'parent@demo.com': { pin: '847362' },   // Aléatoire
  'student@demo.com': { pin: '592481' },  // Unique par compte
  'teacher@demo.com': { pin: '736429' },  // Pas de pattern
  // ...
};
```

**Fichier modifié:**
- [src/contexts/AuthContext.jsx](../src/contexts/AuthContext.jsx)

---

## 🚨 ACTIONS IMMÉDIATES REQUISES

### ⚠️ AVANT TOUT DÉPLOIEMENT EN PRODUCTION

1. **Régénérer TOUTES les clés API compromises**
   ```bash
   # Aller sur Supabase Dashboard > Settings > API
   # Cliquer "Reset service_role key"
   # Cliquer "Reset anon key"
   ```

2. **Changer le mot de passe de la base de données**
   ```bash
   # Aller sur Supabase Dashboard > Settings > Database
   # Database password > Reset password
   # Copier le nouveau mot de passe dans .env
   ```

3. **Regénérer les clés EmailJS**
   ```bash
   # Aller sur EmailJS Dashboard
   # Account > API Keys > Generate new key
   # Copier dans .env
   ```

4. **Appliquer la migration RLS**
   ```bash
   # 1. Faire un BACKUP de la base de données
   # 2. Aller sur Supabase SQL Editor
   # 3. Copier le contenu de: supabase/migrations/20251225_enable_rls_security.sql
   # 4. Exécuter le script
   # 5. Vérifier les logs
   ```

5. **Migrer les mots de passe existants**
   ```bash
   # ATTENTION: Faire un backup AVANT
   npm install dotenv @supabase/supabase-js
   node scripts/migrate-passwords-to-bcrypt.js
   ```

6. **Tester l'isolation RLS**
   ```bash
   # Se connecter en tant que Directeur A
   # Vérifier qu'il ne voit que SON école
   # Se connecter en tant que Directeur B
   # Vérifier qu'il ne voit PAS l'école A
   ```

---

## 🛡️ BONNES PRATIQUES DE SÉCURITÉ

### Variables d'Environnement

#### ✅ À FAIRE
```bash
# Utiliser des variables d'environnement
VITE_SUPABASE_URL=https://xxx.supabase.co

# Préfixe VITE_ uniquement pour les clés PUBLIQUES
VITE_STRIPE_PUBLISHABLE_KEY=pk_xxx

# Secrets SANS préfixe VITE (backend uniquement)
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=xxx
```

#### ❌ NE JAMAIS FAIRE
```bash
# Ne JAMAIS commiter .env
git add .env  # ❌

# Ne JAMAIS exposer des secrets avec VITE_
VITE_SUPABASE_SERVICE_ROLE_KEY=xxx  # ❌

# Ne JAMAIS hardcoder des secrets
const API_KEY = "sk_live_xxxx";  # ❌
```

### Mots de Passe

#### ✅ TOUJOURS
- Utiliser bcrypt avec minimum 10 rounds (idéal: 12)
- Vérifier la force du mot de passe (min 8 caractères)
- Ne JAMAIS stocker de mot de passe en clair
- Forcer le changement après reset

#### ❌ JAMAIS
- Comparer directement: `password === storedPassword`
- Logger les mots de passe: `console.log(password)`
- Envoyer par email en clair
- Afficher dans l'UI

### Base de Données

#### ✅ TOUJOURS
- Activer RLS sur TOUTES les tables
- Créer des politiques par rôle
- Tester l'isolation entre comptes
- Utiliser des indexes pour les performances

#### ❌ JAMAIS
- Désactiver RLS en production
- Utiliser `DISABLE ROW LEVEL SECURITY`
- Donner accès direct à la BDD aux utilisateurs
- Exposer la `DIRECT_URL` en frontend

### Code Frontend

#### ✅ TOUJOURS
- Sanitize TOUT input utilisateur (DOMPurify)
- Valider côté client ET serveur
- Utiliser des CSP (Content Security Policy)
- Échapper les données dans le HTML

#### ❌ JAMAIS
- Utiliser `dangerouslySetInnerHTML` sans sanitization
- Faire confiance aux données utilisateur
- Exécuter du code fourni par l'utilisateur
- Stocker des secrets dans le code source

---

## ✅ CHECKLIST DE DÉPLOIEMENT

### Avant CHAQUE déploiement

- [ ] Les secrets sont dans `.env` (pas dans le code)
- [ ] `.env` est dans `.gitignore`
- [ ] Les mots de passe sont hashés avec bcrypt
- [ ] RLS est ACTIVÉE sur toutes les tables
- [ ] Les politiques RLS sont testées
- [ ] DOMPurify est utilisé pour tout HTML dynamique
- [ ] Les dépendances sont à jour (`npm audit`)
- [ ] Les tests de sécurité passent
- [ ] Backup de la base de données effectué
- [ ] Variables d'environnement configurées sur Vercel/production

### Tests de Sécurité

```bash
# 1. Audit des dépendances
npm audit --production

# 2. Vérifier les secrets exposés
git log --all -- .env  # Doit être vide après cleanup

# 3. Tester RLS
# Se connecter avec 2 comptes différents
# Vérifier l'isolation des données

# 4. Tester XSS
# Injecter <script>alert('XSS')</script> dans un formulaire
# Vérifier que c'est bloqué

# 5. Tester bruteforce PIN
# Essayer 10 PINs incorrects
# Vérifier le rate limiting (À IMPLÉMENTER en Phase 2)
```

---

## 📞 CONTACTS D'URGENCE

### En cas de faille de sécurité détectée

1. **NE PAS PANIQUER** - Suivre le protocole
2. **Isoler** - Désactiver la fonctionnalité touchée
3. **Documenter** - Noter ce qui s'est passé
4. **Corriger** - Appliquer un patch
5. **Communiquer** - Informer les utilisateurs si nécessaire

### Protocole d'Incident

```markdown
1. DÉTECTION
   - Qui a détecté ?
   - Quand ?
   - Quel composant ?

2. ÉVALUATION
   - Niveau de gravité (Critique/Élevé/Moyen/Faible)
   - Données exposées ?
   - Nombre d'utilisateurs affectés ?

3. CONTENTION
   - Désactiver la fonctionnalité
   - Bloquer l'accès si nécessaire
   - Sauvegarder les logs

4. RÉSOLUTION
   - Identifier la cause
   - Développer un patch
   - Tester la correction
   - Déployer

5. POST-MORTEM
   - Documenter l'incident
   - Améliorer les tests
   - Mettre à jour la documentation
```

---

## 📚 RESSOURCES COMPLÉMENTAIRES

### Documentation Officielle

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [DOMPurify Guide](https://github.com/cure53/DOMPurify)

### Outils de Sécurité

- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Audit des dépendances
- [Snyk](https://snyk.io/) - Scan de vulnérabilités
- [OWASP ZAP](https://www.zaproxy.org/) - Test de pénétration
- [git-secrets](https://github.com/awslabs/git-secrets) - Détection secrets Git

---

## 🔄 PROCHAINES ÉTAPES (PHASE 2)

Après avoir complété la Phase 1, voici les améliorations à implémenter :

1. **Rate Limiting** - Bloquer les tentatives de bruteforce
2. **MFA (Multi-Factor Auth)** - Authentification 2 facteurs
3. **Chiffrement localStorage** - Protéger les données locales
4. **Monitoring Sentry** - Détection d'erreurs en production
5. **Tests E2E** - Tests automatisés de sécurité
6. **CI/CD Security Scan** - Analyse automatique à chaque commit
7. **Audit Logs** - Traçabilité complète des actions
8. **CSP Headers** - Content Security Policy strict

---

## 📝 CHANGELOG SÉCURITÉ

### v1.0.0 - 2024-12-25 (PHASE 1 COMPLÉTÉE)

#### ✅ Ajouté
- Service de hashing bcrypt (12 rounds)
- Script de migration des mots de passe
- 30+ politiques RLS par rôle et école
- Sanitization XSS avec DOMPurify
- PINs aléatoires pour comptes démo
- `.env.example` template sécurisé

#### 🔒 Sécurité
- `.env` retiré du contrôle de version
- Mots de passe hashés (bcrypt 12 rounds)
- RLS activée sur 22 tables
- Protection XSS complète
- Codes PIN renforcés

#### 📚 Documentation
- Guide de sécurité complet
- Checklist de déploiement
- Protocole d'incident
- Bonnes pratiques développeur

---

**🔐 SÉCURITÉ AVANT TOUT - NE JAMAIS COMPROMETTRE LA SÉCURITÉ DES UTILISATEURS**

*Document maintenu par: Équipe EduTrack-CM*
*Dernière mise à jour: 25 Décembre 2024*
