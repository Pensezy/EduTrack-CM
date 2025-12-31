import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

/**
 * Initialise et retourne le client Supabase
 * @param {string} url - URL du projet Supabase
 * @param {string} key - Clé publique Supabase
 * @returns {object} Instance du client Supabase
 */
export const initializeSupabase = (url, key) => {
  if (!supabaseInstance) {
    if (!url || !key) {
      throw new Error('Supabase URL and key are required');
    }
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
};

/**
 * Récupère l'instance Supabase existante
 * @returns {object} Instance du client Supabase
 * @throws {Error} Si Supabase n'a pas été initialisé
 */
export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    throw new Error('Supabase client not initialized. Call initializeSupabase() first.');
  }
  return supabaseInstance;
};

/**
 * Réinitialise le client Supabase
 */
export const resetSupabaseClient = () => {
  supabaseInstance = null;
};

export default {
  initializeSupabase,
  getSupabaseClient,
  resetSupabaseClient,
};
