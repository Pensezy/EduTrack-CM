/**
 * @module numberFormatter
 * Utilitaires de formatage des nombres
 */

/**
 * Formate un nombre avec séparateurs de milliers
 * @param {number} value - Nombre à formater
 * @param {string} locale - Locale (défaut: 'fr-FR')
 * @returns {string} Nombre formaté
 *
 * @example
 * formatNumber(1234567.89)
 * // => "1 234 567,89"
 */
export const formatNumber = (value, locale = 'fr-FR') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat(locale).format(value);
};

/**
 * Formate un montant en devise (FCFA par défaut)
 * @param {number} value - Montant à formater
 * @param {string} currency - Code devise (défaut: 'XAF' pour FCFA)
 * @param {string} locale - Locale (défaut: 'fr-FR')
 * @returns {string} Montant formaté avec devise
 *
 * @example
 * formatCurrency(1234567)
 * // => "1 234 567 FCFA"
 */
export const formatCurrency = (value, currency = 'XAF', locale = 'fr-FR') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 FCFA';
  }

  // Pour FCFA, on utilise un formatage personnalisé car Intl ne le supporte pas bien
  if (currency === 'XAF' || currency === 'FCFA') {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
    return `${formatted} FCFA`;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formate un pourcentage
 * @param {number} value - Valeur décimale (0.5 = 50%)
 * @param {number} decimals - Nombre de décimales (défaut: 1)
 * @returns {string} Pourcentage formaté
 *
 * @example
 * formatPercentage(0.8567)
 * // => "85,7 %"
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 %';
  }

  const percentage = value * 100;
  return `${percentage.toFixed(decimals).replace('.', ',')} %`;
};

/**
 * Formate un nombre avec une unité
 * @param {number} value - Valeur
 * @param {string} unit - Unité
 * @param {number} decimals - Nombre de décimales (défaut: 0)
 * @returns {string} Nombre formaté avec unité
 *
 * @example
 * formatWithUnit(12.5, 'kg', 1)
 * // => "12,5 kg"
 */
export const formatWithUnit = (value, unit, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return `0 ${unit}`;
  }

  const formatted = decimals > 0
    ? value.toFixed(decimals).replace('.', ',')
    : Math.round(value).toString();

  return `${formatted} ${unit}`;
};

/**
 * Arrondit un nombre à N décimales
 * @param {number} value - Valeur à arrondir
 * @param {number} decimals - Nombre de décimales (défaut: 2)
 * @returns {number} Nombre arrondi
 *
 * @example
 * roundNumber(12.3456, 2)
 * // => 12.35
 */
export const roundNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 0;
  }

  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Formate un grand nombre de manière compacte (1.2k, 3.5M)
 * @param {number} value - Nombre à formater
 * @param {number} decimals - Nombre de décimales (défaut: 1)
 * @returns {string} Nombre formaté
 *
 * @example
 * formatCompact(1234567)
 * // => "1,2 M"
 */
export const formatCompact = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const absValue = Math.abs(value);

  if (absValue >= 1e9) {
    return `${(value / 1e9).toFixed(decimals).replace('.', ',')} G`;
  }
  if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(decimals).replace('.', ',')} M`;
  }
  if (absValue >= 1e3) {
    return `${(value / 1e3).toFixed(decimals).replace('.', ',')} k`;
  }

  return value.toString();
};

/**
 * Parse une chaîne en nombre (gère les formats FR)
 * @param {string} value - Chaîne à parser
 * @returns {number|null} Nombre parsé ou null si invalide
 *
 * @example
 * parseNumber("1 234,56")
 * // => 1234.56
 */
export const parseNumber = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  // Supprimer les espaces et remplacer virgule par point
  const cleaned = value.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? null : parsed;
};

export default {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatWithUnit,
  roundNumber,
  formatCompact,
  parseNumber
};
