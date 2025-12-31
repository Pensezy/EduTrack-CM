/**
 * @module phoneValidator
 * Validation et formatage des numéros de téléphone camerounais
 */

/**
 * Préfixes valides pour les opérateurs camerounais
 */
const CAMEROON_PREFIXES = {
  MTN: ['67', '650', '651', '652', '653', '654'],
  ORANGE: ['69', '655', '656', '657', '658', '659'],
  CAMTEL: ['233', '242', '243'],
  NEXTTEL: ['66']
};

/**
 * Tous les préfixes valides (array plat)
 */
const ALL_VALID_PREFIXES = Object.values(CAMEROON_PREFIXES).flat();

/**
 * Valide un numéro de téléphone camerounais
 * @param {string} phone - Numéro à valider
 * @returns {boolean} true si valide, false sinon
 *
 * @example
 * validatePhone("677123456")
 * // => true
 *
 * validatePhone("+237677123456")
 * // => true
 *
 * validatePhone("12345")
 * // => false
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Nettoyer le numéro (supprimer espaces, tirets, parenthèses)
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  // Gérer le code pays (+237 ou 237)
  let localNumber = cleaned;
  if (cleaned.startsWith('+237')) {
    localNumber = cleaned.substring(4);
  } else if (cleaned.startsWith('237')) {
    localNumber = cleaned.substring(3);
  }

  // Vérifier la longueur (9 chiffres au Cameroun)
  if (localNumber.length !== 9) {
    return false;
  }

  // Vérifier que ce sont bien des chiffres
  if (!/^\d+$/.test(localNumber)) {
    return false;
  }

  // Vérifier le préfixe
  const hasValidPrefix = ALL_VALID_PREFIXES.some(prefix =>
    localNumber.startsWith(prefix)
  );

  return hasValidPrefix;
};

/**
 * Normalise un numéro de téléphone au format international
 * @param {string} phone - Numéro à normaliser
 * @returns {string|null} Numéro formaté (+237XXXXXXXXX) ou null si invalide
 *
 * @example
 * normalizePhone("677123456")
 * // => "+237677123456"
 *
 * normalizePhone("237 67 71 23 45 6")
 * // => "+237677123456"
 */
export const normalizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return null;
  }

  // Nettoyer le numéro
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  // Extraire le numéro local
  let localNumber = cleaned;
  if (cleaned.startsWith('+237')) {
    localNumber = cleaned.substring(4);
  } else if (cleaned.startsWith('237')) {
    localNumber = cleaned.substring(3);
  }

  // Valider
  if (!validatePhone(localNumber)) {
    return null;
  }

  // Retourner au format international
  return `+237${localNumber}`;
};

/**
 * Formate un numéro de téléphone pour l'affichage
 * @param {string} phone - Numéro à formater
 * @param {string} format - Format souhaité ('international', 'local', 'display')
 * @returns {string|null} Numéro formaté ou null si invalide
 *
 * @example
 * formatPhone("677123456", "international")
 * // => "+237 6 77 12 34 56"
 *
 * formatPhone("677123456", "local")
 * // => "6 77 12 34 56"
 *
 * formatPhone("677123456", "display")
 * // => "677 12 34 56"
 */
export const formatPhone = (phone, format = 'display') => {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    return null;
  }

  // Extraire le numéro local (sans +237)
  const localNumber = normalized.substring(4);

  switch (format) {
    case 'international':
      // +237 6 77 12 34 56
      return `+237 ${localNumber[0]} ${localNumber.substring(1, 3)} ${localNumber.substring(3, 5)} ${localNumber.substring(5, 7)} ${localNumber.substring(7)}`;

    case 'local':
      // 6 77 12 34 56
      return `${localNumber[0]} ${localNumber.substring(1, 3)} ${localNumber.substring(3, 5)} ${localNumber.substring(5, 7)} ${localNumber.substring(7)}`;

    case 'display':
    default:
      // 677 12 34 56
      return `${localNumber.substring(0, 3)} ${localNumber.substring(3, 5)} ${localNumber.substring(5, 7)} ${localNumber.substring(7)}`;
  }
};

/**
 * Détecte l'opérateur à partir du numéro
 * @param {string} phone - Numéro de téléphone
 * @returns {string|null} Nom de l'opérateur ou null
 *
 * @example
 * getOperator("677123456")
 * // => "MTN"
 *
 * getOperator("699123456")
 * // => "ORANGE"
 */
export const getOperator = (phone) => {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    return null;
  }

  const localNumber = normalized.substring(4);

  for (const [operator, prefixes] of Object.entries(CAMEROON_PREFIXES)) {
    if (prefixes.some(prefix => localNumber.startsWith(prefix))) {
      return operator;
    }
  }

  return null;
};

/**
 * Valide et normalise un numéro (combo utilitaire)
 * @param {string} phone - Numéro à valider et normaliser
 * @returns {Object} { isValid, normalized, operator, formatted }
 *
 * @example
 * validateAndNormalizePhone("677123456")
 * // => {
 * //   isValid: true,
 * //   normalized: "+237677123456",
 * //   operator: "MTN",
 * //   formatted: "677 12 34 56"
 * // }
 */
export const validateAndNormalizePhone = (phone) => {
  const isValid = validatePhone(phone);

  if (!isValid) {
    return {
      isValid: false,
      normalized: null,
      operator: null,
      formatted: null
    };
  }

  const normalized = normalizePhone(phone);
  const operator = getOperator(phone);
  const formatted = formatPhone(phone, 'display');

  return {
    isValid: true,
    normalized,
    operator,
    formatted
  };
};

/**
 * Vérifie si deux numéros sont identiques (après normalisation)
 * @param {string} phone1 - Premier numéro
 * @param {string} phone2 - Deuxième numéro
 * @returns {boolean} true si identiques
 *
 * @example
 * arePhonesSame("677123456", "+237677123456")
 * // => true
 */
export const arePhonesSame = (phone1, phone2) => {
  const normalized1 = normalizePhone(phone1);
  const normalized2 = normalizePhone(phone2);

  if (!normalized1 || !normalized2) {
    return false;
  }

  return normalized1 === normalized2;
};

export default {
  validatePhone,
  normalizePhone,
  formatPhone,
  getOperator,
  validateAndNormalizePhone,
  arePhonesSame
};
