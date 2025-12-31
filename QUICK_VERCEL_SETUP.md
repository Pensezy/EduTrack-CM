# ⚡ Configuration Rapide Vercel - EduTrack Admin

## 🎯 Configuration en 5 Minutes

### 1️⃣ Créer le Projet Vercel

1. Aller sur https://vercel.com/dashboard
2. **Add New → Project**
3. Sélectionner le repo **EduTrack-CM**
4. Cliquer **Import**

---

### 2️⃣ Configurer le Build

#### Root Directory
```
apps/admin
```
👉 Cliquer sur **"Edit"** et sélectionner `apps/admin`

#### Framework
```
Vite
```

#### Override Build Settings
👉 Cliquer sur **"Override"** pour personnaliser

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

---

### 3️⃣ Variables d'Environnement

Ajouter 2 variables:

| Name | Value | Où trouver? |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase Dashboard → Settings → API |

Cocher: **Production**, **Preview**, **Development** pour chaque variable.

---

### 4️⃣ Déployer

Cliquer **"Deploy"** et attendre 2-3 minutes ☕

---

## ✅ Vérification Rapide

Le build devrait afficher:
```
✓ pnpm install completed
✓ vite build completed
✓ built in ~20s
```

URL de déploiement:
```
https://edutrack-admin-xxx.vercel.app
```

---

## 🐛 Si ça ne marche pas

### Erreur: "pnpm: command not found"
→ Vérifier Node.js Version = **20.x** dans Settings

### Erreur: "node_modules missing"
→ Vérifier que Install Command commence par `cd ../..`

### Erreur: Module not found
→ Vérifier Root Directory = `apps/admin`

📖 **Guide complet:** Voir `VERCEL_MONOREPO_FIX.md`

---

**Prêt à déployer? → Deploy! 🚀**
