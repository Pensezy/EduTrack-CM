import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une date en chaîne de caractères lisible
 * @param {Date|string} date - La date à formater
 * @param {string} formatString - Le format de sortie (par défaut: "dd MMMM yyyy")
 * @returns {string} La date formatée
 */
export const formatDate = (date, formatString = 'dd MMMM yyyy') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString, { locale: fr });
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return null;
  }
};

/**
 * Formate une date au format français court (jj/mm/aaaa)
 * @param {Date|string} date - La date à formater
 * @returns {string} La date au format jj/mm/aaaa
 */
export const formatDateShort = (date) => {
  return formatDate(date, 'dd/MM/yyyy');
};

/**
 * Formate une date avec l'heure
 * @param {Date|string} date - La date à formater
 * @returns {string} La date et l'heure formatées
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'dd MMMM yyyy HH:mm');
};
