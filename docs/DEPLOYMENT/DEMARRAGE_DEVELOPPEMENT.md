# 🚀 Guide de Démarrage - EduTrack (Architecture Modulaire)

## 📋 Architecture

EduTrack utilise maintenant une **architecture monorepo modulaire** avec plusieurs applications indépendantes :

```
EduTrack-CM/
├── apps/
│   ├── hub/          ← Point d'entrée PUBLIC (Landing, Signup, Login, Onboarding)
│   ├── admin/        ← Dashboard ADMIN (pour directeurs)
│   └── [futures apps...]
├── packages/
│   ├── ui-components/
│   ├── api-client/
│   └── utils/
└── index.html        ← Redirecteur automatique vers Hub
```

---

## 🎯 Applications

### 1. **Hub** (apps/hub) - Port 5173
**Point d'entrée public** pour les visiteurs

- **URL Dev**: `http://localhost:5173`
- **Pages**:
  - `/` - Landing page professionnelle
  - `/signup` - Inscription établissement (3 étapes)
  - `/login` - Connexion utilisateurs
  - `/onboarding` - Guide post-inscription

### 2. **Admin** (apps/admin) - Port 5174
**Dashboard administrateur** pour directeurs d'établissement

- **URL Dev**: `http://localhost:5174`
- **Pages**:
  - `/` - Dashboard principal
  - `/app-store` - Catalogue applications
  - `/my-apps` - Gestion abonnements
  - [+ toutes les fonctionnalités existantes]

---

## ⚙️ Installation & Configuration

### 1. Installer les dépendances

```bash
# À la racine du projet
pnpm install
```

Cela installera toutes les dépendances pour toutes les apps et packages workspace.

### 2. Configurer les variables d'environnement

Créer un fichier `.env` **à la racine** du projet :

```env
# Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon

# EmailJS (optionnel)
VITE_EMAILJS_SERVICE_ID=votre-service-id
VITE_EMAILJS_TEMPLATE_ID_RECEIPT=votre-template-id
VITE_EMAILJS_PUBLIC_KEY=votre-public-key
```

**Note**: Les variables `VITE_*` sont automatiquement partagées entre toutes les apps Vite.

---

## 🏃 Démarrer le Projet

### Option 1 : Démarrer TOUTES les apps (Recommandé)

Ouvrir **2 terminaux** :

#### Terminal 1 : Hub (Public)
```bash
pnpm --filter hub dev
```
→ Démarre sur `http://localhost:5173`

#### Terminal 2 : Admin (Privé)
```bash
pnpm --filter admin dev
```
→ Démarre sur `http://localhost:5174`

### Option 2 : Script combiné (À créer)

Vous pouvez créer un script npm pour lancer les 2 en parallèle :

```json
// Dans package.json racine
{
  "scripts": {
    "dev": "concurrently \"pnpm --filter hub dev\" \"pnpm --filter admin dev\"",
    "dev:hub": "pnpm --filter hub dev",
    "dev:admin": "pnpm --filter admin dev"
  }
}
```

Puis lancer :
```bash
pnpm dev
```

---

## 🌐 Accéder au Site

### En Développement

1. **Point d'entrée principal** : `http://localhost:5173` (Hub)
   - Landing page
   - Inscription
   - Login

2. **Dashboard Admin** : `http://localhost:5174/admin`
   - Accessible après login
   - Ou directement pour dev/debug

3. **Ancien index.html** : `http://localhost:5173` (racine)
   - Redirige automatiquement vers Hub (port 5173)

### Parcours Utilisateur Complet

1. **Visiteur** ouvre `http://localhost:5173`
   → Voit la landing page

2. **Clique "Créer Mon Compte"**
   → `/signup` (formulaire 3 étapes)

3. **Complète l'inscription**
   → `/onboarding` (guide 4 étapes)

4. **Finit l'onboarding**
   → Redirection vers `http://localhost:5174/admin` (Dashboard admin)

---

## 🔧 Commandes Utiles

### Développement

```bash
# Démarrer Hub uniquement
pnpm --filter hub dev

# Démarrer Admin uniquement
pnpm --filter admin dev

# Installer une dépendance dans Hub
pnpm --filter hub add <package>

# Installer une dépendance dans Admin
pnpm --filter admin add <package>

# Installer une dépendance dans ui-components
pnpm --filter @edutrack/ui add <package>
```

### Build

```bash
# Build Hub
pnpm --filter hub build

# Build Admin
pnpm --filter admin build

# Build toutes les apps
pnpm -r --filter "./apps/*" build
```

### Lint & Format

```bash
# Lint Hub
pnpm --filter hub lint

# Format tout le projet
pnpm format
```

---

## 🐛 Debugging

### Problème : "Page blanche sur /"

**Cause** : Vous accédez à l'ancien index.html qui n'a plus de contenu React.

**Solution** : Accédez directement à `http://localhost:5173` (Hub)

---

### Problème : "Module not found" dans Hub

**Cause** : Les dépendances partagées (@edutrack/*) ne sont pas installées.

**Solution** :
```bash
pnpm install
```

---

### Problème : "Port déjà utilisé"

**Cause** : Un autre processus utilise le port 5173 ou 5174.

**Solution** :
```bash
# Tuer le processus sur Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Ou changer le port dans vite.config.js
```

---

## 📦 Structure des Packages

### @edutrack/ui
Composants UI réutilisables :
- `AppCard`, `BundleCard`, `SubscriptionCard`
- `Button`, `Card`, etc.

**Usage** :
```javascript
import { AppCard } from '@edutrack/ui';
```

### @edutrack/api
Services API et hooks :
- `useApps()`, `useAuth()`
- `supabase client`, `ApiGateway`

**Usage** :
```javascript
import { useApps } from '@edutrack/api';
```

### @edutrack/utils
Utilitaires partagés (à créer si besoin)

---

## 🚀 Déploiement (Production)

### Configuration Recommandée

**Option 1 : Vercel (Recommandé)**

Déployer chaque app séparément :

1. **Hub** → `hub.edutrack.cm`
   - Build command: `pnpm --filter hub build`
   - Output directory: `apps/hub/dist`

2. **Admin** → `admin.edutrack.cm`
   - Build command: `pnpm --filter admin build`
   - Output directory: `apps/admin/dist`

**Option 2 : Nginx Reverse Proxy**

Configurer Nginx pour router :

```nginx
# Hub (public)
location / {
  proxy_pass http://localhost:5173;
}

# Admin (private)
location /admin {
  proxy_pass http://localhost:5174;
}
```

---

## 🎓 Bonnes Pratiques

### 1. Ne PAS modifier l'ancien code source

L'ancien code dans `/src` est conservé pour référence mais ne devrait **plus être modifié**.

Nouvelles fonctionnalités → `apps/hub` ou `apps/admin`

### 2. Utiliser les Packages Partagés

Si un composant/fonction est utilisé dans >1 app :
→ Le déplacer dans `packages/ui-components` ou `packages/utils`

### 3. Build avant de commit

Toujours vérifier que le build passe :
```bash
pnpm --filter hub build
pnpm --filter admin build
```

### 4. Tester le parcours complet

Avant chaque release, tester :
1. Landing → Signup → Onboarding → Admin
2. Login → Admin
3. Toutes les routes du Hub

---

## 🆘 Support

### Logs

Les logs de dev sont dans la console du terminal.

### Documentation

- **Architecture** : `docs/01-Architecture/`
- **Phase 1** : `docs/PHASE1_DATABASE_SUMMARY.md`
- **Phase 2** : `docs/PHASE2_UI_SUMMARY.md`
- **Phase 3** : `docs/PHASE3_HUB_SUMMARY.md`

### Contact

Pour questions/bugs : [Créer une issue GitHub]

---

**Dernière mise à jour** : 2026-01-01
**Version** : 2.0.0 (Architecture Modulaire)
