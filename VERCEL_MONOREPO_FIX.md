# 🔧 Fix Vercel pour Monorepo - Configuration Correcte

## ❌ Problème Rencontré

```
ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL admin@1.0.0 build: `vite build`
spawn ENOENT
Local package.json exists, but node_modules missing
```

**Cause:** Vercel n'installe pas correctement les dépendances du monorepo pnpm.

---

## ✅ Solution: Configuration Vercel Dashboard

### Étape 1: Supprimer le Déploiement Actuel (Optionnel)

Si un déploiement existe déjà:
1. Aller dans **Settings → General**
2. Scroll jusqu'à **Delete Project**
3. Recréer le projet avec la bonne configuration

### Étape 2: Configuration du Nouveau Projet

#### A. Framework Preset
```
Vite
```

#### B. Root Directory
```
apps/admin
```
⚠️ **CRITIQUE:** Cliquer sur "Edit" et bien sélectionner `apps/admin`

#### C. Build & Development Settings

Cliquer sur **"Override"** pour chaque commande:

**Build Command:**
```bash
cd ../.. && pnpm install --no-frozen-lockfile && pnpm --filter admin build
```

**Output Directory:**
```
dist
```

**Install Command:**
```bash
cd ../.. && pnpm install --no-frozen-lockfile
```

**Development Command:**
```bash
pnpm dev
```

---

## 🔄 Alternative: Fichier `build.sh` (Recommandé)

Créer un script de build personnalisé pour plus de contrôle.

### 1. Créer `apps/admin/build.sh`

```bash
#!/bin/bash
set -e

echo "📦 Installing dependencies from monorepo root..."
cd ../..
pnpm install --no-frozen-lockfile

echo "🔨 Building admin app..."
pnpm --filter admin build

echo "✅ Build completed!"
```

### 2. Rendre le script exécutable

```bash
chmod +x apps/admin/build.sh
```

### 3. Configuration Vercel

**Build Command:**
```bash
bash build.sh
```

**Output Directory:**
```
dist
```

**Install Command:**
```bash
echo "Dependencies handled by build.sh"
```

---

## 📝 Configuration package.json

Vérifier que `apps/admin/package.json` contient:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🎯 Configuration Finale Vercel

### General Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | `apps/admin` |
| Node.js Version | 20.x |

### Build Settings (Override activé)

| Setting | Command |
|---------|---------|
| Build Command | `cd ../.. && pnpm install --no-frozen-lockfile && pnpm --filter admin build` |
| Output Directory | `dist` |
| Install Command | `cd ../.. && pnpm install --no-frozen-lockfile` |
| Development Command | `pnpm dev` |

### Environment Variables

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://votre-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `votre-anon-key` |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` |

---

## 🐛 Dépannage Spécifique Monorepo

### Erreur: "pnpm: command not found"

**Solution:**
1. Ajouter variable d'environnement: `ENABLE_EXPERIMENTAL_COREPACK=1`
2. OU spécifier `"packageManager": "pnpm@10.27.0"` dans package.json root

### Erreur: "node_modules missing"

**Solution:**
S'assurer que le `Install Command` fait bien:
```bash
cd ../.. && pnpm install --no-frozen-lockfile
```

### Erreur: "Cannot find module '@edutrack/api'"

**Cause:** Les workspaces ne sont pas résolus

**Solution:**
1. Vérifier que `pnpm-workspace.yaml` existe à la racine
2. Vérifier que l'install se fait depuis la racine (`cd ../..`)
3. Vérifier que les packages sont linkés avec `workspace:*`

---

## ✅ Checklist de Vérification

Avant de redéployer, vérifier:

- [ ] Root Directory = `apps/admin`
- [ ] Build Command commence par `cd ../..`
- [ ] Install Command commence par `cd ../..`
- [ ] `--no-frozen-lockfile` est ajouté aux commandes pnpm
- [ ] Variables d'environnement Supabase ajoutées
- [ ] Node.js version = 20.x
- [ ] Framework Preset = Vite

---

## 🚀 Redéploiement

Après avoir corrigé la configuration:

1. Aller dans **Deployments**
2. Cliquer sur le dernier déploiement
3. Cliquer **"Redeploy"**
4. OU faire un nouveau commit:
   ```bash
   git add .
   git commit -m "Fix Vercel monorepo build config"
   git push origin master
   ```

---

## 📊 Log de Build Réussi

Un build réussi devrait afficher:

```
✓ Installing dependencies from monorepo root...
✓ Added 1234 packages in 45s
✓ Building admin app...
✓ vite v5.4.21 building for production...
✓ 3046 modules transformed
✓ built in 20.42s
✓ Build completed successfully
```

---

## 🎯 Structure Attendue

```
/
├── apps/
│   ├── admin/           ← ROOT DIRECTORY (Vercel)
│   │   ├── dist/        ← OUTPUT DIRECTORY
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.js
│   └── hub/
├── packages/
│   ├── api-client/
│   ├── utils/
│   └── ui-components/
├── package.json         ← Install depuis ici
├── pnpm-workspace.yaml  ← Important!
└── pnpm-lock.yaml
```

---

## 📞 Support

Si le problème persiste:

1. **Logs Vercel:** Copier les logs complets du build
2. **GitHub Issue:** Créer un issue avec les logs
3. **Vercel Support:** Contacter via Dashboard → Help

---

**Dernière mise à jour:** 31 Décembre 2025
