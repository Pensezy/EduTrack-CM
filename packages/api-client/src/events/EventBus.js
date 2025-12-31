/**
 * Classe EventBus pour gérer les événements globaux
 */
export class EventBus {
  constructor() {
    this.events = new Map();
    this.maxListeners = 10;
  }

  /**
   * S'abonne à un événement
   * @param {string} eventName - Nom de l'événement
   * @param {function} callback - Fonction de rappel
   * @param {object} options - Options (once: boolean)
   * @returns {function} Fonction pour se désabonner
   */
  on(eventName, callback, options = {}) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    const listeners = this.events.get(eventName);

    if (listeners.length >= this.maxListeners) {
      console.warn(
        `MaxListenersExceededWarning: Possible EventBus memory leak detected. ` +
          `${listeners.length} listeners added for event "${eventName}".`
      );
    }

    const listener = {
      callback,
      once: options.once || false,
    };

    listeners.push(listener);

    // Retourner une fonction pour se désabonner
    return () => this.off(eventName, callback);
  }

  /**
   * S'abonne à un événement une seule fois
   * @param {string} eventName - Nom de l'événement
   * @param {function} callback - Fonction de rappel
   * @returns {function} Fonction pour se désabonner
   */
  once(eventName, callback) {
    return this.on(eventName, callback, { once: true });
  }

  /**
   * Se désabonne d'un événement
   * @param {string} eventName - Nom de l'événement
   * @param {function} callback - Fonction de rappel
   * @returns {boolean} true si la fonction a été trouvée et supprimée
   */
  off(eventName, callback) {
    if (!this.events.has(eventName)) {
      return false;
    }

    const listeners = this.events.get(eventName);
    const index = listeners.findIndex(listener => listener.callback === callback);

    if (index !== -1) {
      listeners.splice(index, 1);

      // Nettoyer la Map si plus d'écouteurs
      if (listeners.length === 0) {
        this.events.delete(eventName);
      }
      return true;
    }

    return false;
  }

  /**
   * Émet un événement
   * @param {string} eventName - Nom de l'événement
   * @param {any} data - Données à passer aux écouteurs
   * @returns {boolean} true si au moins un écouteur a reçu l'événement
   */
  emit(eventName, data) {
    if (!this.events.has(eventName)) {
      return false;
    }

    const listeners = this.events.get(eventName);
    let hasListeners = false;

    // Créer une copie pour éviter les modifications pendant l'itération
    const listenersCopy = [...listeners];

    listenersCopy.forEach(listener => {
      hasListeners = true;
      try {
        listener.callback(data);
      } catch (error) {
        console.error(`Error in event listener for "${eventName}":`, error);
      }

      // Retirer les écouteurs "once"
      if (listener.once) {
        this.off(eventName, listener.callback);
      }
    });

    return hasListeners;
  }

  /**
   * Émet un événement de manière asynchrone
   * @param {string} eventName - Nom de l'événement
   * @param {any} data - Données à passer aux écouteurs
   * @returns {Promise<boolean>} Promesse résolvant si au moins un écouteur a reçu l'événement
   */
  async emitAsync(eventName, data) {
    if (!this.events.has(eventName)) {
      return false;
    }

    const listeners = this.events.get(eventName);
    let hasListeners = false;

    const listenersCopy = [...listeners];

    for (const listener of listenersCopy) {
      hasListeners = true;
      try {
        const result = listener.callback(data);
        if (result instanceof Promise) {
          await result;
        }
      } catch (error) {
        console.error(`Error in async event listener for "${eventName}":`, error);
      }

      // Retirer les écouteurs "once"
      if (listener.once) {
        this.off(eventName, listener.callback);
      }
    }

    return hasListeners;
  }

  /**
   * Récupère tous les écouteurs d'un événement
   * @param {string} eventName - Nom de l'événement
   * @returns {array} Tableau des fonctions de rappel
   */
  listeners(eventName) {
    if (!this.events.has(eventName)) {
      return [];
    }
    return this.events.get(eventName).map(listener => listener.callback);
  }

  /**
   * Récupère le nombre d'écouteurs d'un événement
   * @param {string} eventName - Nom de l'événement
   * @returns {number} Nombre d'écouteurs
   */
  listenerCount(eventName) {
    return this.listeners(eventName).length;
  }

  /**
   * Supprime tous les écouteurs d'un événement
   * @param {string} eventName - Nom de l'événement (optionnel)
   */
  removeAllListeners(eventName) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
  }

  /**
   * Définit le nombre maximum d'écouteurs
   * @param {number} n - Nombre maximum
   */
  setMaxListeners(n) {
    this.maxListeners = n;
  }

  /**
   * Récupère les statistiques de l'EventBus
   * @returns {object} Statistiques
   */
  stats() {
    const stats = {
      totalEvents: this.events.size,
      totalListeners: 0,
      events: {},
    };

    for (const [eventName, listeners] of this.events) {
      const count = listeners.length;
      stats.events[eventName] = count;
      stats.totalListeners += count;
    }

    return stats;
  }
}

export default EventBus;
