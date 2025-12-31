/**
 * Valide une adresse email avec une expression régulière basique
 * @param {string} email - L'adresse email à valider
 * @returns {boolean} True si l'email est valide, false sinon
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Normalise une adresse email (minuscules et espace supprimés)
 * @param {string} email - L'adresse email à normaliser
 * @returns {string} L'email normalisé
 */
export const normalizeEmail = (email) => {
  if (typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase();
};

/**
 * Valide et normalise une adresse email
 * @param {string} email - L'adresse email
 * @returns {object} Objet avec isValid et normalizedEmail
 */
export const validateAndNormalizeEmail = (email) => {
  const normalized = normalizeEmail(email);
  return {
    isValid: validateEmail(normalized),
    normalizedEmail: normalized
  };
};
