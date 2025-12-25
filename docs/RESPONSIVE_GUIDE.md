# 📱 GUIDE DE RESPONSIVITÉ - EDUTRACK-CM

**Version:** 1.0
**Date:** 25 Décembre 2024
**Statut:** COMPLET

---

## 📋 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Breakpoints et Système](#breakpoints)
3. [Composants Responsifs](#composants)
4. [Patterns et Bonnes Pratiques](#patterns)
5. [Migration depuis l'ancien code](#migration)
6. [Exemples d'Utilisation](#exemples)
7. [Tests de Responsivité](#tests)

---

## 🎯 INTRODUCTION

Ce guide présente le nouveau système de responsivité unifié pour EduTrack-CM. Tous les nouveaux composants doivent suivre ces standards.

### Objectifs

- ✅ Expérience optimale sur **tous les appareils** (mobile, tablette, desktop)
- ✅ **Performance** : Code optimisé, pas de JavaScript inutile
- ✅ **Cohérence** : Mêmes breakpoints et patterns partout
- ✅ **Accessibilité** : Touch-friendly, clavier-friendly
- ✅ **Maintenabilité** : Composants réutilisables

---

## 📏 BREAKPOINTS

### Système de Breakpoints

```javascript
export const BREAKPOINTS = {
  xs: 0,      // 0-640px     Mobile portrait
  sm: 640,    // 640-768px   Mobile landscape
  md: 768,    // 768-1024px  Tablette
  lg: 1024,   // 1024-1280px Desktop
  xl: 1280,   // 1280-1536px Desktop large
  '2xl': 1536 // 1536px+     Desktop XL
};
```

### Classes TailwindCSS

```html
<!-- Mobile first! -->
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- 100% sur mobile, 50% sur tablette, 33% sur desktop -->
</div>
```

### Hook useResponsive()

```javascript
import { useResponsive } from '../utils/responsive';

function MyComponent() {
  const { isMobile, isTablet, isDesktop, width } = useResponsive();

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}
```

---

## 🧩 COMPOSANTS RESPONSIFS

### 1. MobileSidebar

Menu hamburger avec drawer animé pour mobile.

**Fichier:** `src/components/ui/MobileSidebar.jsx`

**Usage:**
```jsx
import MobileSidebar from './components/ui/MobileSidebar';

<MobileSidebar
  isOpen={isSidebarOpen}
  onClose={() => setIsSidebarOpen(false)}
  userRole="teacher"
  userName="Prof Dupont"
  navigationItems={navItems}
  quickActions={quickActions}
/>
```

**Features:**
- ✅ Slide-in animation
- ✅ Overlay avec fermeture au clic
- ✅ Onglets Navigation / Actions rapides
- ✅ Touch-friendly (boutons 44px min)
- ✅ Auto-fermeture au changement de page

---

### 2. ResponsiveTable

Tableaux qui deviennent des cartes sur mobile.

**Fichier:** `src/components/ui/ResponsiveTable.jsx`

**Usage:**
```jsx
import ResponsiveTable from './components/ui/ResponsiveTable';

<ResponsiveTable
  columns={[
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'grade', label: 'Note', align: 'center', render: (val) => `${val}/20` },
    { key: 'status', label: 'Statut' }
  ]}
  data={students}
  onRowClick={(row) => console.log(row)}
  mobileCardRenderer={(row) => (
    <div>
      <h4>{row.name}</h4>
      <p>Note: {row.grade}/20</p>
    </div>
  )}
/>
```

**Features:**
- ✅ Desktop : Table classique avec tri
- ✅ Mobile : Cards empilées
- ✅ Renderer personnalisé pour mobile
- ✅ Loading et empty states

---

### 3. ResponsiveGrid + MetricCard

Grilles auto-adaptatives avec cartes métriques.

**Fichier:** `src/components/ui/ResponsiveGrid.jsx`

**Usage:**
```jsx
import ResponsiveGrid, { MetricCard } from './components/ui/ResponsiveGrid';
import Icon from './components/AppIcon';

<ResponsiveGrid
  cols={{ default: 1, sm: 2, md: 3, lg: 4 }}
  gap={6}
>
  <MetricCard
    icon={<Icon name="Users" />}
    title="Total Élèves"
    value="1,234"
    subtitle="Année 2024-2025"
    trend={{ direction: 'up', value: '+12%' }}
    color="primary"
  />
  <MetricCard
    icon={<Icon name="BookOpen" />}
    title="Moyenne Générale"
    value="14.2"
    subtitle="Toutes classes"
    color="success"
  />
</ResponsiveGrid>
```

**Features:**
- ✅ Grille responsive automatique
- ✅ Cartes métriques avec icônes
- ✅ Trends et couleurs
- ✅ Truncate automatique des textes

---

### 4. ListCard

Listes avec header et actions.

**Usage:**
```jsx
import { ListCard } from './components/ui/ResponsiveGrid';

<ListCard
  title="Devoirs en retard"
  action={{ label: 'Voir tout', onClick: () => {} }}
  items={[
    { label: 'Mathématiques - Devoir 3', subtitle: 'Retard: 2 jours', badge: { label: 'Urgent', color: 'danger' } },
    { label: 'Français - Rédaction', subtitle: 'Retard: 1 jour', badge: { label: 'Important', color: 'warning' } }
  ]}
/>
```

---

### 5. ResponsiveModal

Modals full-screen sur mobile, centered sur desktop.

**Fichier:** `src/components/ui/ResponsiveModal.jsx`

**Usage:**
```jsx
import ResponsiveModal, { ModalFooter } from './components/ui/ResponsiveModal';

<ResponsiveModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Ajouter une note"
  size="lg"
  footer={
    <ModalFooter align="right">
      <button onClick={onClose}>Annuler</button>
      <button onClick={onSave}>Enregistrer</button>
    </ModalFooter>
  }
>
  <p>Contenu du modal...</p>
</ResponsiveModal>
```

**Features:**
- ✅ Full-screen sur mobile
- ✅ Centered + rounded sur desktop
- ✅ Slide-up animation mobile
- ✅ Fermeture Escape
- ✅ Scroll bloqué sur body

**Sizes:**
- `sm`: max-w-sm
- `md`: max-w-lg (défaut)
- `lg`: max-w-2xl
- `xl`: max-w-4xl
- `full`: 100% width + height

---

### 6. ResponsiveForm

Formulaires adaptés mobile/desktop.

**Fichier:** `src/components/ui/ResponsiveForm.jsx`

**Usage:**
```jsx
import {
  FormContainer,
  FormRow,
  FormGroup,
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  FormSubmitButton
} from './components/ui/ResponsiveForm';

<FormContainer onSubmit={handleSubmit}>
  <FormRow cols={{ default: 1, md: 2 }}>
    <FormGroup label="Prénom" required error={errors.firstName}>
      <FormInput
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="Entrez le prénom"
        icon="User"
      />
    </FormGroup>

    <FormGroup label="Nom" required>
      <FormInput value={lastName} onChange={...} />
    </FormGroup>
  </FormRow>

  <FormGroup label="Classe">
    <FormSelect
      options={[
        { value: '6a', label: '6ème A' },
        { value: '6b', label: '6ème B' }
      ]}
      value={classe}
      onChange={(e) => setClasse(e.target.value)}
    />
  </FormGroup>

  <FormGroup label="Commentaire">
    <FormTextarea
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      rows={4}
    />
  </FormGroup>

  <FormCheckbox
    label="J'accepte les conditions"
    checked={accepted}
    onChange={(e) => setAccepted(e.target.checked)}
  />

  <FormSubmitButton loading={loading} fullWidth>
    Enregistrer
  </FormSubmitButton>
</FormContainer>
```

**Features:**
- ✅ Layouts responsive (FormRow)
- ✅ Validation visuelle
- ✅ Touch-friendly (44px min height)
- ✅ Icons dans inputs
- ✅ États disabled, loading, error

---

## 🎨 PATTERNS ET BONNES PRATIQUES

### Mobile First

```jsx
// ✅ BON - Mobile first
<div className="w-full md:w-1/2 lg:w-1/3">

// ❌ MAUVAIS - Desktop first
<div className="w-1/3 lg:w-1/2 md:w-full">
```

### Classes Pré-configurées

Utiliser `RESPONSIVE_CLASSES` de `utils/responsive.js`:

```jsx
import { RESPONSIVE_CLASSES } from '../utils/responsive';

<div className={RESPONSIVE_CLASSES.container}>
  <h1 className={RESPONSIVE_CLASSES.heading1}>Titre</h1>
  <p className={RESPONSIVE_CLASSES.body}>Texte...</p>
</div>
```

### Touch Targets

Minimum **44x44px** pour tous les éléments interactifs (boutons, liens, checkboxes).

```jsx
// ✅ BON
<button className="px-4 py-3 sm:py-2">Cliquer</button>

// ❌ MAUVAIS
<button className="px-2 py-1">Cliquer</button>
```

### Text Truncate

Toujours tronquer les textes longs :

```jsx
<p className="truncate">Texte très très très long...</p>
<p className="line-clamp-2">Texte sur max 2 lignes...</p>
```

### Hidden Elements

Cacher intelligemment sur mobile :

```jsx
{/* Texte complet desktop, raccourci mobile */}
<span className="hidden sm:inline">Complet</span>
<span className="sm:hidden">Court</span>

{/* Desktop uniquement */}
<div className="hidden lg:block">...</div>

{/* Mobile uniquement */}
<div className="lg:hidden">...</div>
```

---

## 🔄 MIGRATION DEPUIS L'ANCIEN CODE

### Étape 1: Identifier les composants non-responsifs

```bash
# Chercher les composants avec classes fixes
grep -r "w-\[" src/
grep -r "h-\[" src/
```

### Étape 2: Remplacer par les nouveaux composants

**AVANT:**
```jsx
<div className="w-[800px] h-[600px]">
  <table>
    <thead>...</thead>
    <tbody>...</tbody>
  </table>
</div>
```

**APRÈS:**
```jsx
<ResponsiveTable
  columns={columns}
  data={data}
/>
```

### Étape 3: Utiliser les utilitaires

**AVANT:**
```jsx
<div className="grid grid-cols-4 gap-4">
  <div className="bg-white p-4">Carte 1</div>
  <div className="bg-white p-4">Carte 2</div>
</div>
```

**APRÈS:**
```jsx
<ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }}>
  <div className={RESPONSIVE_CLASSES.card}>Carte 1</div>
  <div className={RESPONSIVE_CLASSES.card}>Carte 2</div>
</ResponsiveGrid>
```

---

## 📝 EXEMPLES D'UTILISATION

### Dashboard Page

```jsx
import { useResponsive, RESPONSIVE_CLASSES } from '../utils/responsive';
import ResponsiveGrid, { MetricCard } from '../components/ui/ResponsiveGrid';
import ResponsiveTable from '../components/ui/ResponsiveTable';

function TeacherDashboard() {
  const { isMobile } = useResponsive();

  return (
    <div className={RESPONSIVE_CLASSES.container}>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className={RESPONSIVE_CLASSES.heading1}>Tableau de Bord</h1>
        <p className={RESPONSIVE_CLASSES.body + ' text-gray-600 mt-2'}>
          Bienvenue, Prof. Dupont
        </p>
      </div>

      {/* Metrics Grid */}
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} className="mb-6">
        <MetricCard
          icon={<Icon name="Users" />}
          title="Mes Élèves"
          value="156"
          color="primary"
        />
        {/* Plus de cartes... */}
      </ResponsiveGrid>

      {/* Table */}
      <div className={RESPONSIVE_CLASSES.card}>
        <h2 className={RESPONSIVE_CLASSES.heading3 + ' mb-4'}>
          Dernières Notes
        </h2>
        <ResponsiveTable
          columns={[
            { key: 'student', label: 'Élève', sortable: true },
            { key: 'subject', label: 'Matière' },
            { key: 'grade', label: 'Note', render: (v) => `${v}/20` }
          ]}
          data={grades}
        />
      </div>
    </div>
  );
}
```

---

## 🧪 TESTS DE RESPONSIVITÉ

### Checklist de Test

- [ ] **Mobile Portrait** (320px-640px)
  - [ ] Menu hamburger accessible
  - [ ] Textes lisibles (min 14px)
  - [ ] Boutons cliquables (min 44px)
  - [ ] Pas de scroll horizontal
  - [ ] Tableaux en mode card

- [ ] **Mobile Landscape** (640px-768px)
  - [ ] Layout adapté
  - [ ] Navigation fonctionnelle

- [ ] **Tablette** (768px-1024px)
  - [ ] Grilles 2-3 colonnes
  - [ ] Sidebar visible ou repliable

- [ ] **Desktop** (1024px+)
  - [ ] Layout pleine largeur optimisé
  - [ ] Tables avec toutes les colonnes

### Devices à Tester

| Device | Résolution | Breakpoint |
|--------|------------|------------|
| iPhone SE | 375x667 | xs |
| iPhone 12 | 390x844 | xs |
| iPad Mini | 768x1024 | md |
| iPad Pro | 1024x1366 | lg |
| Desktop HD | 1920x1080 | xl |

### Outils

**Chrome DevTools:**
```
F12 > Toggle Device Toolbar (Ctrl+Shift+M)
Tester : iPhone SE, iPad, Desktop
```

**Firefox Responsive Mode:**
```
F12 > Responsive Design Mode (Ctrl+Shift+M)
```

**Tests Automatisés:**
```bash
# Playwright (à installer en Phase 2)
npm run test:responsive
```

---

## 📚 RESSOURCES

### Documentation TailwindCSS

- [Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Breakpoints](https://tailwindcss.com/docs/breakpoints)
- [Container Queries](https://tailwindcss.com/docs/plugins#container-queries)

### Guides WCAG

- [Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Responsive Web Design](https://www.w3.org/TR/mobile-accessibility-mapping/)

---

## ✅ RÉSUMÉ

### Nouveaux Composants Créés

1. ✅ **MobileSidebar** - Menu mobile avec drawer
2. ✅ **ResponsiveTable** - Tables → Cards
3. ✅ **ResponsiveGrid** - Grilles auto-adaptatives
4. ✅ **MetricCard** - Cartes métriques
5. ✅ **ListCard** - Listes responsive
6. ✅ **ResponsiveModal** - Modals adaptatifs
7. ✅ **ResponsiveForm** - Formulaires complets

### Utilitaires Créés

1. ✅ **useResponsive()** - Hook de détection
2. ✅ **RESPONSIVE_CLASSES** - Classes pré-configurées
3. ✅ **cn()** - Combinaison de classes
4. ✅ **BREAKPOINTS** - Système unifié

### Prochaines Étapes

1. [ ] Migrer les dashboards existants
2. [ ] Tester sur vrais devices
3. [ ] Ajouter tests E2E responsifs
4. [ ] Optimiser les images (srcset, lazy loading)
5. [ ] PWA support (Phase 3)

---

**📱 TOUS LES NOUVEAUX COMPOSANTS DOIVENT ÊTRE RESPONSIVES !**

*Document maintenu par: Équipe EduTrack-CM*
*Dernière mise à jour: 25 Décembre 2024*
