# ✅ CHECKLIST DE DÉPLOIEMENT - PHASE 1 SÉCURITÉ

**Version:** 1.0
**Date:** 25 Décembre 2024
**Responsable:** Équipe Développement

---

## 📋 AVANT DE DÉPLOYER EN PRODUCTION

### ⚠️ ÉTAPES CRITIQUES (NE PAS SAUTER)

#### ☐ 1. Régénérer les Clés API Supabase

```bash
# Dashboard Supabase > Settings > API

☐ Reset "anon key" (clé publique)
   └─ Copier dans .env > VITE_SUPABASE_ANON_KEY

☐ Reset "service_role key" (clé admin)
   └─ Copier dans .env > SUPABASE_SERVICE_ROLE_KEY
   └─ ⚠️ JAMAIS exposer côté client

☐ Vérifier que les anciennes clés sont désactivées
```

**Pourquoi ?** Les anciennes clés étaient exposées dans Git.

---

#### ☐ 2. Changer le Mot de Passe Base de Données

```bash
# Dashboard Supabase > Settings > Database

☐ Cliquer "Reset database password"
☐ Copier le nouveau mot de passe
☐ Remplacer dans .env > DATABASE_URL
☐ Remplacer dans .env > DIRECT_URL

Format attendu:
DATABASE_URL="postgresql://postgres.XXX:NOUVEAU_MOT_DE_PASSE@..."
DIRECT_URL="postgresql://postgres.XXX:NOUVEAU_MOT_DE_PASSE@..."
```

**Pourquoi ?** L'ancien mot de passe "Insandji1" était exposé dans Git.

---

#### ☐ 3. Régénérer les Clés EmailJS

```bash
# Dashboard EmailJS > Account > API Keys

☐ Supprimer l'ancienne clé
☐ Créer une nouvelle clé
☐ Copier dans .env > VITE_EMAILJS_PUBLIC_KEY
☐ Vérifier SERVICE_ID et TEMPLATE_ID
```

**Pourquoi ?** Les anciennes clés EmailJS étaient exposées.

---

#### ☐ 4. Backup de la Base de Données

```bash
# Dashboard Supabase > Database > Backups

☐ Cliquer "Create backup"
☐ Nommer: "avant_migration_rls_YYYYMMDD"
☐ Attendre confirmation (peut prendre 5 min)
☐ Télécharger le backup localement (recommandé)
```

**Pourquoi ?** Sécurité avant toute modification SQL.

---

#### ☐ 5. Appliquer la Migration RLS

```bash
# Dashboard Supabase > SQL Editor > New query

☐ Ouvrir: supabase/migrations/20251225_enable_rls_security.sql
☐ Copier TOUT le contenu (450+ lignes)
☐ Coller dans SQL Editor
☐ Cliquer "Run"
☐ Vérifier logs:
   ✅ "RLS ACTIVÉ AVEC SUCCÈS !"
   ✅ Aucune erreur rouge

☐ Tester isolation RLS (voir section Tests)
```

**Pourquoi ?** Active la sécurité Row Level Security.

---

#### ☐ 6. Migrer les Mots de Passe vers bcrypt

```bash
# Terminal / Ligne de commande

☐ Vérifier que .env est configuré
☐ Installer dépendances:
   npm install dotenv @supabase/supabase-js

☐ Exécuter le script:
   node scripts/migrate-passwords-to-bcrypt.js

☐ Vérifier le rapport:
   ✅ "Migration terminée avec succès !"
   ✅ X utilisateur(s) migré(s)
   ✅ 0 erreur

☐ Vérifier en BDD (Supabase Table Editor > users):
   - password_hash commence par "$2a$12$"
   - Pour TOUS les utilisateurs
```

**Pourquoi ?** Convertit les mots de passe en clair → hashs bcrypt sécurisés.

---

#### ☐ 7. Configurer Variables d'Environnement Vercel

```bash
# Dashboard Vercel > Project > Settings > Environment Variables

☐ Ajouter TOUTES les variables de .env.example:

   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   DATABASE_URL
   DIRECT_URL
   VITE_EMAILJS_SERVICE_ID
   VITE_EMAILJS_TEMPLATE_ID
   VITE_EMAILJS_PUBLIC_KEY

☐ Vérifier les valeurs (copier depuis .env local)
☐ Scopes: Production, Preview, Development
☐ Sauvegarder
```

**Pourquoi ?** Vercel a besoin des variables pour le build et runtime.

---

### 🧪 TESTS DE SÉCURITÉ

#### ☐ Test 1: Isolation RLS (Multi-Écoles)

```bash
Objectif: Vérifier qu'un directeur voit UNIQUEMENT son école

1. ☐ Créer École A (directeur A)
2. ☐ Créer École B (directeur B)
3. ☐ Se connecter comme Directeur A
4. ☐ Aller dans "Élèves"
   ✅ Voir UNIQUEMENT les élèves de l'École A
   ❌ NE PAS voir les élèves de l'École B
5. ☐ Se connecter comme Directeur B
6. ☐ Aller dans "Élèves"
   ✅ Voir UNIQUEMENT les élèves de l'École B
   ❌ NE PAS voir les élèves de l'École A

RÉSULTAT: ☐ PASS  ☐ FAIL
```

---

#### ☐ Test 2: Hashing bcrypt

```bash
Objectif: Vérifier que les mots de passe sont hashés

1. ☐ Créer un nouveau compte étudiant
   Email: test-student@example.com
   Mot de passe: TestPassword123!

2. ☐ Vérifier en BDD (Table users):
   SELECT password_hash FROM users WHERE email = 'test-student@example.com';

   ✅ password_hash doit commencer par "$2a$12$"
   ✅ Longueur ≈ 60 caractères
   ❌ NE PAS voir "TestPassword123!" en clair

3. ☐ Se connecter avec ce compte
   ✅ Connexion réussie

RÉSULTAT: ☐ PASS  ☐ FAIL
```

---

#### ☐ Test 3: Protection XSS

```bash
Objectif: Vérifier que DOMPurify bloque les scripts

1. ☐ Se connecter comme enseignant
2. ☐ Aller dans un bulletin d'élève
3. ☐ Ajouter un commentaire:
   <script>alert('XSS')</script>

4. ☐ Imprimer le bulletin
   ❌ Aucune popup "XSS" ne doit apparaître
   ✅ Le commentaire est affiché sans le script

5. ☐ Inspecter le HTML imprimé:
   ✅ <script> tags supprimés
   ✅ Seul le texte "alert('XSS')" affiché

RÉSULTAT: ☐ PASS  ☐ FAIL
```

---

#### ☐ Test 4: Nouveaux PINs Démo

```bash
Objectif: Vérifier que les anciens PINs ne marchent plus

1. ☐ Essayer de se connecter:
   Email: teacher@demo.com
   PIN: 123456 (ancien)

   ❌ Doit échouer: "PIN incorrect"

2. ☐ Essayer avec le nouveau PIN:
   Email: teacher@demo.com
   PIN: 736429 (nouveau)

   ✅ Connexion réussie

3. ☐ Répéter pour les 6 comptes (voir DEMO_ACCOUNTS.md)

RÉSULTAT: ☐ PASS  ☐ FAIL
```

---

#### ☐ Test 5: Secrets Non Exposés

```bash
Objectif: Vérifier qu'aucun secret n'est exposé

1. ☐ Ouvrir DevTools (F12) > Network
2. ☐ Recharger la page
3. ☐ Inspecter les requêtes réseau
   ❌ SUPABASE_SERVICE_ROLE_KEY ne doit PAS apparaître
   ❌ Mot de passe BDD ne doit PAS apparaître
   ✅ Seuls VITE_* doivent être visibles

4. ☐ Inspecter le code source (View Page Source)
   ❌ Aucun secret hardcodé

5. ☐ Vérifier le bundle JS:
   npm run build
   grep -r "service_role" dist/

   ❌ Doit être vide (aucun résultat)

RÉSULTAT: ☐ PASS  ☐ FAIL
```

---

### 📊 VÉRIFICATION FINALE

#### ☐ Checklist Complète

```bash
☐ Toutes les clés API régénérées
☐ Mot de passe BDD changé
☐ Backup BDD effectué
☐ Migration RLS appliquée
☐ Mots de passe migrés vers bcrypt
☐ Variables Vercel configurées
☐ Test 1 (RLS) réussi
☐ Test 2 (bcrypt) réussi
☐ Test 3 (XSS) réussi
☐ Test 4 (PINs) réussi
☐ Test 5 (Secrets) réussi
☐ Build production réussit (npm run build)
☐ Documentation lue (SECURITY_GUIDE.md)
```

---

### 🚀 DÉPLOIEMENT

Une fois TOUTES les cases cochées :

```bash
# 1. Commit final
git add .
git commit -m "Configuration production - Phase 1 Sécurité prête"

# 2. Push vers GitHub
git push origin master

# 3. Déployer sur Vercel
vercel --prod

# 4. Vérifier le déploiement
- Ouvrir l'URL production
- Tester une connexion
- Vérifier les logs Vercel
```

---

### 🆘 EN CAS DE PROBLÈME

#### Erreur: "RLS policy violation"

**Cause:** Politiques RLS trop restrictives

**Solution:**
1. Vérifier le rôle de l'utilisateur connecté
2. Vérifier `current_school_id` dans table users
3. Vérifier que la politique existe pour ce rôle

#### Erreur: "Invalid password hash"

**Cause:** Migration bcrypt incomplète

**Solution:**
1. Relancer: `node scripts/migrate-passwords-to-bcrypt.js`
2. Vérifier les logs d'erreur
3. Migrer manuellement les comptes échoués

#### Erreur: "XSS detected"

**Cause:** DOMPurify trop strict

**Solution:**
1. Vérifier `ALLOWED_TAGS` dans le composant
2. Ajouter les tags manquants si légitimes
3. NE JAMAIS désactiver DOMPurify

#### Erreur: Build Vercel échoue

**Cause:** Variables d'environnement manquantes

**Solution:**
1. Vérifier TOUTES les variables dans Vercel
2. Vérifier le scope (Production + Preview)
3. Redéployer après correction

---

### 📞 SUPPORT

**Questions ?** Lire dans l'ordre :
1. [PHASE1_SECURITY_SUMMARY.md](PHASE1_SECURITY_SUMMARY.md) - Résumé technique
2. [docs/SECURITY_GUIDE.md](docs/SECURITY_GUIDE.md) - Guide complet
3. [DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md) - Nouveaux PINs

**Urgence ?** Protocole d'incident dans SECURITY_GUIDE.md section "Contacts d'Urgence"

---

## ✅ VALIDATION FINALE

Une fois TOUT coché :

```
☐ Je confirme avoir régénéré TOUTES les clés
☐ Je confirme avoir fait un backup BDD
☐ Je confirme que tous les tests passent
☐ Je confirme avoir lu la documentation
☐ Je confirme que le déploiement est prêt

Nom:  _____________________
Date: _____________________
Signature: _____________________
```

---

**🔐 LA SÉCURITÉ N'EST PAS OPTIONNELLE.**

*Checklist maintenue par: Équipe EduTrack-CM*
*Dernière mise à jour: 25 Décembre 2024*
