import { getSupabaseClient } from '../supabase/client.js';

/**
 * Classe ApiGateway pour gérer les requêtes API avec cache
 */
export class ApiGateway {
  constructor(options = {}) {
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 5 * 60 * 1000; // 5 minutes par défaut
    this.enableCache = options.enableCache !== false;
  }

  /**
   * Génère une clé de cache basée sur la table et les options
   * @private
   * @param {string} table - Nom de la table
   * @param {object} options - Options de la requête
   * @returns {string} Clé de cache
   */
  _generateCacheKey(table, options = {}) {
    return `${table}:${JSON.stringify(options)}`;
  }

  /**
   * Récupère les données du cache
   * @private
   * @param {string} key - Clé de cache
   * @returns {any} Données en cache ou null
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached) {
      const { data, timestamp } = cached;
      if (Date.now() - timestamp < this.cacheTimeout) {
        return data;
      } else {
        this.cache.delete(key);
      }
    }
    return null;
  }

  /**
   * Stocke les données en cache
   * @private
   * @param {string} key - Clé de cache
   * @param {any} data - Données à mettre en cache
   */
  _setInCache(key, data) {
    if (this.enableCache) {
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Récupère les données d'une table
   * @param {string} table - Nom de la table
   * @param {object} options - Options de la requête (filter, select, etc.)
   * @returns {Promise<object>} Résultat avec data et error
   */
  async fetch(table, options = {}) {
    try {
      const cacheKey = this._generateCacheKey(table, options);

      // Vérifier le cache
      const cachedData = this._getFromCache(cacheKey);
      if (cachedData) {
        return { data: cachedData, error: null, fromCache: true };
      }

      const client = getSupabaseClient();
      let query = client.from(table).select(options.select || '*');

      // Appliquer les filtres
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Appliquer la pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Appliquer le tri
      if (options.orderBy) {
        const { column, ascending = true } = options.orderBy;
        query = query.order(column, { ascending });
      }

      const { data, error } = await query;

      if (!error) {
        this._setInCache(cacheKey, data);
      }

      return { data, error, fromCache: false };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Insère un enregistrement
   * @param {string} table - Nom de la table
   * @param {object} payload - Données à insérer
   * @returns {Promise<object>} Résultat avec data et error
   */
  async insert(table, payload) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.from(table).insert([payload]).select();

      // Invalider le cache pour cette table
      this._invalidateTableCache(table);

      return { data, error };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Met à jour un enregistrement
   * @param {string} table - Nom de la table
   * @param {number} id - ID de l'enregistrement
   * @param {object} payload - Données à mettre à jour
   * @returns {Promise<object>} Résultat avec data et error
   */
  async update(table, id, payload) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from(table)
        .update(payload)
        .eq('id', id)
        .select();

      // Invalider le cache pour cette table
      this._invalidateTableCache(table);

      return { data, error };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Supprime un enregistrement
   * @param {string} table - Nom de la table
   * @param {number} id - ID de l'enregistrement
   * @returns {Promise<object>} Résultat avec data et error
   */
  async delete(table, id) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.from(table).delete().eq('id', id);

      // Invalider le cache pour cette table
      this._invalidateTableCache(table);

      return { data, error };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Invalide le cache pour une table spécifique
   * @private
   * @param {string} table - Nom de la table
   */
  _invalidateTableCache(table) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${table}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Vide tout le cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Récupère les stats du cache
   * @returns {object} Stats du cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      cacheTimeout: this.cacheTimeout,
      enableCache: this.enableCache,
    };
  }
}

export default ApiGateway;
