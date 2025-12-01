# Guide Rapide : Déploiement de la Fonction de Changement de Mot de Passe

## Pour l'administrateur système

### Prérequis
- Accès admin au projet Supabase
- [Supabase CLI installé](https://supabase.com/docs/guides/cli/getting-started)
- Terminal/Command prompt

---

## Étapes de déploiement (5 minutes)

### 1. Installer Supabase CLI

**Windows (PowerShell) :**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**macOS :**
```bash
brew install supabase/tap/supabase
```

**Linux :**
```bash
npm install -g supabase
```

### 2. Se connecter à Supabase
```bash
supabase login
```
- Ouvrir le lien qui s'affiche dans le navigateur
- Se connecter avec votre compte Supabase
- Autoriser l'accès

### 3. Lier le projet
```bash
cd "e:\Projet ENS - EduTrack CM\EduTrack-CM"
supabase link --project-ref YOUR_PROJECT_REF
```

**Comment trouver votre project-ref ?**
- Aller sur https://supabase.com/dashboard
- Sélectionner votre projet
- URL format : `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- Ou dans Settings → General → Reference ID

### 4. Déployer la fonction
```bash
supabase functions deploy update-student-password
```

**Sortie attendue :**
```
Deploying update-student-password (version xxx)
- Bundling function...
- Deploying function to https://xxx.supabase.co/functions/v1/update-student-password
✓ Function deployed successfully
```

### 5. Vérifier le déploiement
```bash
supabase functions list
```

**Vous devriez voir :**
```
NAME                         VERSION    STATUS
update-student-password      1          ACTIVE
```

### 6. Tester la fonction

**Option A : Depuis le dashboard Supabase**
1. Aller sur Functions dans le menu
2. Cliquer sur `update-student-password`
3. Onglet "Invoke"
4. Tester avec des données de test

**Option B : Avec curl**
```bash
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/update-student-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "student_user_id": "test-uuid",
    "new_password": "TestPassword123",
    "parent_user_id": "parent-uuid"
  }'
```

---

## Vérification dans l'application

### Test complet
1. Se connecter en tant que parent dans l'application
2. Aller sur "Mes Enfants"
3. Survoler la carte d'un enfant
4. Cliquer sur ⚙️ (Settings)
5. Onglet "Mot de passe"
6. Saisir un nouveau mot de passe
7. Cliquer sur "Modifier le mot de passe"

**Résultat attendu :**
- ✅ Message de succès : "Mot de passe modifié avec succès"
- ❌ Si erreur : voir section Troubleshooting

---

## Troubleshooting

### Erreur : "supabase: command not found"
**Solution :** Installer Supabase CLI (voir étape 1)

### Erreur : "Not logged in"
**Solution :** Exécuter `supabase login`

### Erreur : "Project not linked"
**Solution :** Exécuter `supabase link --project-ref YOUR_REF`

### Erreur : "Failed to deploy"
**Causes possibles :**
1. Erreur de syntaxe dans `index.ts`
2. Problème de connexion internet
3. Permissions insuffisantes

**Solution :** 
```bash
# Voir les logs
supabase functions logs update-student-password

# Redéployer
supabase functions deploy update-student-password --no-verify-jwt
```

### Erreur dans l'application : "Service non disponible"
**Causes :**
1. Fonction pas encore déployée
2. URL Supabase incorrecte dans `.env`

**Vérifier :**
```bash
# Liste des fonctions
supabase functions list

# Logs en temps réel
supabase functions logs update-student-password --follow
```

### Erreur : "Unauthorized" dans les logs
**Cause :** Token JWT invalide ou expiré

**Solution :**
- Vérifier que l'utilisateur est bien connecté
- Redemander une connexion
- Vérifier le header Authorization

---

## Configuration avancée

### Variables d'environnement personnalisées
Si vous avez besoin de variables supplémentaires :

```bash
supabase secrets set MY_VARIABLE=value
```

### Activer les logs détaillés
```bash
supabase functions logs update-student-password --follow
```

### Redéployer après modification
```bash
supabase functions deploy update-student-password
```

---

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `supabase functions list` | Liste toutes les fonctions |
| `supabase functions logs FUNCTION_NAME` | Voir les logs |
| `supabase functions delete FUNCTION_NAME` | Supprimer une fonction |
| `supabase functions deploy FUNCTION_NAME` | Déployer/Redéployer |
| `supabase status` | État du projet |

---

## Sécurité

### Permissions requises
- ✅ Service Role Key automatiquement injectée par Supabase
- ✅ CORS configuré pour votre domaine
- ✅ Vérification relation parent-enfant

### Bonnes pratiques
- 🔒 Ne jamais exposer le Service Role Key
- 🔒 Toujours vérifier les relations avant modification
- 🔒 Logger toutes les modifications
- 🔒 Monitorer les logs régulièrement

---

## Support

### Documentation officielle
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid)

### Logs et monitoring
```bash
# Logs en temps réel
supabase functions logs update-student-password --follow

# Derniers logs
supabase functions logs update-student-password --limit 100
```

### Contact
Pour assistance technique :
- Dashboard Supabase : https://supabase.com/dashboard
- Discord Supabase : https://discord.supabase.com
- Documentation : Dans `supabase/functions/update-student-password/README.md`

---

## Checklist de déploiement

- [ ] Supabase CLI installé
- [ ] Connecté avec `supabase login`
- [ ] Projet lié avec `supabase link`
- [ ] Fonction déployée avec succès
- [ ] Fonction visible dans `supabase functions list`
- [ ] Test manuel effectué
- [ ] Test dans l'application réussi
- [ ] Logs vérifiés
- [ ] Documentation partagée avec l'équipe

---

**Temps estimé :** 5-10 minutes  
**Difficulté :** Facile  
**Prérequis techniques :** Accès admin Supabase
