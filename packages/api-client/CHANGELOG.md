# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-31

### Added

- **Supabase Client**: Wrapper pour initialiser et gérer le client Supabase
  - `initializeSupabase()`: Initialiser le client avec URL et clé
  - `getSupabaseClient()`: Récupérer l'instance existante
  - `resetSupabaseClient()`: Réinitialiser le client

- **ApiGateway**: Classe pour gérer les requêtes API avec cache Map
  - `fetch()`: Récupérer des données avec support du cache
  - `insert()`: Insérer un enregistrement
  - `update()`: Mettre à jour un enregistrement
  - `delete()`: Supprimer un enregistrement
  - `clearCache()`: Vider le cache
  - `getCacheStats()`: Récupérer les statistiques du cache
  - Support des filtres, pagination, tri
  - Invalidation automatique du cache après modifications

- **EventBus**: Système de gestion d'événements
  - `on()`: S'abonner à un événement
  - `once()`: S'abonner une seule fois
  - `off()`: Se désabonner
  - `emit()`: Émettre un événement
  - `emitAsync()`: Émettre un événement asynchrone
  - `listeners()`: Récupérer les écouteurs
  - `listenerCount()`: Compter les écouteurs
  - `removeAllListeners()`: Supprimer tous les écouteurs
  - `setMaxListeners()`: Configurer le nombre max d'écouteurs
  - `stats()`: Récupérer les statistiques

- Documentation complète dans README.md
- Exemple de configuration dans .env.example
- Support des exports modulaires via package.json

### Features

- Cache automatique avec timeout configurable
- Gestion d'erreurs robuste
- Support des événements asynchrones
- Statistiques intégrées
- Avertissements pour les dépassements de listeners
- API fluide et intuitive
