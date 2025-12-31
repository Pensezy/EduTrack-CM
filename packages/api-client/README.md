# @edutrack/api

Client API centralisé pour EduTrack CM avec support Supabase, cache intégré et gestion d'événements.

## Installation

```bash
npm install @edutrack/api
```

## Caractéristiques

- **Supabase Client**: Wrapper pour initialiser et gérer le client Supabase
- **ApiGateway**: Classe pour gérer les requêtes API avec cache Map intégré
- **EventBus**: Système de gestion d'événements décentralisé

## Utilisation

### Initialisation de Supabase

```javascript
import { initializeSupabase, getSupabaseClient } from '@edutrack/api';

// Initialiser le client
const supabase = initializeSupabase(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Récupérer l'instance plus tard
const client = getSupabaseClient();
```

### ApiGateway

```javascript
import { ApiGateway } from '@edutrack/api';

// Créer une instance
const gateway = new ApiGateway({
  enableCache: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
});

// Récupérer des données
const { data, error, fromCache } = await gateway.fetch('users', {
  select: 'id, name, email',
  filters: { active: true },
  limit: 10,
  orderBy: { column: 'created_at', ascending: false },
});

// Insérer un enregistrement
const { data, error } = await gateway.insert('users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// Mettre à jour un enregistrement
const { data, error } = await gateway.update('users', 1, {
  name: 'Jane Doe',
});

// Supprimer un enregistrement
const { data, error } = await gateway.delete('users', 1);

// Gérer le cache
gateway.clearCache();
const stats = gateway.getCacheStats();
```

### EventBus

```javascript
import { EventBus } from '@edutrack/api';

const eventBus = new EventBus();

// S'abonner à un événement
const unsubscribe = eventBus.on('user:created', (user) => {
  console.log('Nouvel utilisateur:', user);
});

// S'abonner une seule fois
eventBus.once('user:updated', (user) => {
  console.log('Utilisateur mis à jour:', user);
});

// Émettre un événement
eventBus.emit('user:created', { id: 1, name: 'John' });

// Émettre un événement asynchrone
await eventBus.emitAsync('user:updated', { id: 1, name: 'Jane' });

// Se désabonner
unsubscribe();
// ou
eventBus.off('user:created', callback);

// Obtenir les statistiques
const stats = eventBus.stats();
console.log(stats.totalListeners);
```

## API Complète

### Supabase Client

- `initializeSupabase(url, key)`: Initialiser le client
- `getSupabaseClient()`: Récupérer l'instance
- `resetSupabaseClient()`: Réinitialiser le client

### ApiGateway

- `fetch(table, options)`: Récupérer des données avec cache
- `insert(table, payload)`: Insérer un enregistrement
- `update(table, id, payload)`: Mettre à jour un enregistrement
- `delete(table, id)`: Supprimer un enregistrement
- `clearCache()`: Vider le cache
- `getCacheStats()`: Récupérer les stats du cache

### EventBus

- `on(eventName, callback, options)`: S'abonner
- `once(eventName, callback)`: S'abonner une seule fois
- `off(eventName, callback)`: Se désabonner
- `emit(eventName, data)`: Émettre un événement
- `emitAsync(eventName, data)`: Émettre un événement asynchrone
- `listeners(eventName)`: Récupérer les écouteurs
- `listenerCount(eventName)`: Compter les écouteurs
- `removeAllListeners(eventName)`: Supprimer tous les écouteurs
- `setMaxListeners(n)`: Définir le nombre maximum d'écouteurs
- `stats()`: Récupérer les statistiques

## Exemples d'intégration

### Avec React

```javascript
// context/api.js
import React, { createContext, useContext } from 'react';
import { initializeSupabase, ApiGateway, EventBus } from '@edutrack/api';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [apiGateway] = React.useState(() => new ApiGateway());
  const [eventBus] = React.useState(() => new EventBus());

  React.useEffect(() => {
    initializeSupabase(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.REACT_APP_SUPABASE_KEY
    );
  }, []);

  return (
    <ApiContext.Provider value={{ apiGateway, eventBus }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return context;
};
```

## Licence

MIT
