# Système de Switch Données Démo/Production

## 🎯 Fonctionnement

Le système détecte automatiquement si l'utilisateur est en mode **démo** ou **production** et affiche les données appropriées :

### 📊 Mode Démo
- **Quand :** Utilisateur non connecté, compte de test, ou utilisateur non présent dans la base
- **Données :** Fictives, générées pour les tests et démonstrations
- **Indicateur :** Badge orange "Mode Démo" avec icône TestTube
- **Performance :** Simulation de latence d'API (300-600ms)

### 🔒 Mode Production  
- **Quand :** Utilisateur connecté avec un vrai compte Supabase présent dans notre base
- **Données :** Vraies données depuis Supabase
- **Indicateur :** Badge vert "Données Réelles" avec icône Database
- **Performance :** Vraies requêtes API vers Supabase

## 🏗️ Architecture

```
src/
├── hooks/
│   ├── useDataMode.js       # Détection auto du mode
│   └── useDashboardData.js  # Hook unifié pour toutes les données
├── services/
│   ├── demoDataService.js       # Service données fictives
│   └── productionDataService.js # Service données Supabase
└── pages/principal-dashboard/
    ├── index.jsx                # Dashboard avec switch intégré
    └── components/
        ├── ClassAverageChart.jsx    # Utilise le switch
        ├── AttendanceChart.jsx      # Utilise le switch  
        └── PaymentStatusChart.jsx   # Utilise le switch
```

## 🚀 Utilisation

### Dans un composant :
```jsx
import useDashboardData from '../../hooks/useDashboardData';

const MonComposant = () => {
  const { 
    data,           // Données (démo ou prod selon le mode)
    loading,        // États de chargement
    isDemo,         // true si mode démo
    isProduction,   // true si mode production
    refresh         // Fonction pour recharger
  } = useDashboardData();

  return (
    <div>
      {isDemo && <p>🧪 Données de démonstration</p>}
      {loading.metrics ? 'Chargement...' : data.metrics}
    </div>
  );
};
```

### Données disponibles :
- `data.metrics` - Métriques du dashboard
- `data.classAverages` - Moyennes par classe
- `data.attendance` - Données d'assiduité
- `data.payments` - Statuts de paiement
- `data.personnel` - Liste du personnel
- `data.students` - Liste des étudiants
- `data.schoolStats` - Statistiques générales

## 🔧 Configuration

### Critères de détection du mode :
1. **Démo si :**
   - Aucun utilisateur connecté
   - Email contient 'demo@' ou 'test@'
   - Métadonnée `demo: true`
   - Utilisateur absent de la table `users`

2. **Production si :**
   - Utilisateur authentifié Supabase
   - Présent dans la table `users`
   - Email ne contient pas de marqueurs de test

### Personnaliser les données démo :
Modifiez `src/services/demoDataService.js` pour ajuster les données fictives.

### Ajouter de nouveaux endpoints :
1. Ajoutez la méthode dans les deux services
2. Ajoutez l'appel dans `useDashboardData.js`
3. Utilisez dans votre composant

## 🎨 Interface Utilisateur

- **Badge d'état :** Visible dans le header du dashboard
- **Notification démo :** Bandeau d'information en mode démo
- **Bouton connexion :** Permet de basculer vers le mode production
- **Indicateurs de chargement :** Pendant la détection du mode

## 🔄 Basculement de Mode

Le basculement est **automatique** :
- Connexion → Passe en production (si compte valide)
- Déconnexion → Retour en mode démo
- Pas de rechargement de page nécessaire
- Les données se mettent à jour en temps réel

## 📈 Performance

- **Mode démo :** Latence simulée pour réalisme
- **Mode production :** Vraies performances Supabase
- **Cache intelligent :** Évite les requêtes redondantes
- **Loading states :** Feedback utilisateur pendant les transitions

## 🛠️ Développement

Pour tester le switch :
1. **Mode démo :** Accédez sans vous connecter
2. **Mode production :** Connectez-vous avec un compte réel
3. **Force démo :** Utilisez `setMode('demo')` dans le hook
4. **Debug :** Consultez les logs de `useDataMode`

---

✨ **Le système fonctionne automatiquement - aucune configuration manuelle requise !**