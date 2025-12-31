/**
 * @module authService
 * Service d'authentification et de gestion des mots de passe
 * Intègre le hashage bcrypt et la validation
 */

import bcrypt from 'bcryptjs';

/**
 * Nombre de rounds pour le salt (10 = ~10 hashes/seconde, bon équilibre sécurité/performance)
 * Plus le nombre est élevé, plus c'est sécurisé mais lent
 * Recommandations OWASP: minimum 10, idéal 12
 */
const SALT_ROUNDS = 12;

/**
 * Hash un mot de passe de manière sécurisée
 *
 * @param {string} plainPassword - Mot de passe en clair
 * @returns {Promise<string>} Hash bcrypt du mot de passe
 * @throws {Error} Si le mot de passe est invalide
 *
 * @example
 * const hashedPassword = await hashPassword('MySecurePassword123!');
 * // => $2a$12$KIXQQz8JZ0Og5vLxMxQ6/.ZxGfVFJh9p7xQ5mK0X8rN7xQ5mK0X8r
 */
export const hashPassword = async (plainPassword) => {
  // Validation
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Le mot de passe doit être une chaîne non vide');
  }

  if (plainPassword.length < 8) {
    throw new Error('Le mot de passe doit contenir au moins 8 caractères');
  }

  try {
    // Générer le salt et hasher en une seule opération
    const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Erreur lors du hashing du mot de passe:', error);
    throw new Error('Impossible de hasher le mot de passe');
  }
};

/**
 * Vérifie si un mot de passe correspond à un hash
 *
 * @param {string} plainPassword - Mot de passe en clair à vérifier
 * @param {string} hashedPassword - Hash bcrypt stocké en base
 * @returns {Promise<boolean>} true si le mot de passe correspond, false sinon
 *
 * @example
 * const isValid = await verifyPassword('MyPassword123', storedHash);
 * if (isValid) {
 *   console.log('Mot de passe correct');
 * } else {
 *   console.log('Mot de passe incorrect');
 * }
 */
export const verifyPassword = async (plainPassword, hashedPassword) => {
  // Validation
  if (!plainPassword || typeof plainPassword !== 'string') {
    return false;
  }

  if (!hashedPassword || typeof hashedPassword !== 'string') {
    return false;
  }

  // Vérifier que c'est bien un hash bcrypt (commence par $2a$, $2b$, ou $2y$)
  if (!hashedPassword.startsWith('$2')) {
    console.warn('⚠️ Le hash fourni ne semble pas être un hash bcrypt valide');
    return false;
  }

  try {
    // Comparer de manière sécurisée (timing-attack resistant)
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error);
    return false;
  }
};

/**
 * Vérifie la force d'un mot de passe
 *
 * @param {string} password - Mot de passe à tester
 * @returns {Object} Résultat avec score et suggestions
 *
 * @example
 * const strength = checkPasswordStrength('abc123');
 * // => {
 * //   isStrong: false,
 * //   score: 2,
 * //   suggestions: ['Ajouter des majuscules', 'Ajouter des caractères spéciaux']
 * // }
 */
export const checkPasswordStrength = (password) => {
  if (!password) {
    return {
      isStrong: false,
      score: 0,
      suggestions: ['Le mot de passe est requis']
    };
  }

  const suggestions = [];
  let score = 0;

  // Longueur
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (password.length < 8) suggestions.push('Utiliser au moins 8 caractères');

  // Complexité
  if (/[a-z]/.test(password)) score++; // Minuscules
  else suggestions.push('Ajouter des lettres minuscules');

  if (/[A-Z]/.test(password)) score++; // Majuscules
  else suggestions.push('Ajouter des lettres majuscules');

  if (/[0-9]/.test(password)) score++; // Chiffres
  else suggestions.push('Ajouter des chiffres');

  if (/[^a-zA-Z0-9]/.test(password)) score++; // Caractères spéciaux
  else suggestions.push('Ajouter des caractères spéciaux (!@#$%^&*)');

  // Patterns faibles
  const weakPatterns = [
    /^[0-9]+$/,           // Que des chiffres
    /^[a-zA-Z]+$/,        // Que des lettres
    /(.)\1{2,}/,          // Caractères répétés (aaa, 111)
    /^(password|motdepasse|admin|1234)/i  // Mots communs
  ];

  const hasWeakPattern = weakPatterns.some(pattern => pattern.test(password));
  if (hasWeakPattern) {
    score = Math.max(0, score - 2);
    suggestions.push('Éviter les patterns prévisibles (1234, aaa, password)');
  }

  return {
    isStrong: score >= 5,
    score: Math.min(score, 7), // Max 7
    level: score >= 6 ? 'fort' : score >= 4 ? 'moyen' : 'faible',
    suggestions
  };
};

/**
 * Génère un mot de passe aléatoire sécurisé
 *
 * @param {number} length - Longueur souhaitée (min 12)
 * @returns {string} Mot de passe généré
 *
 * @example
 * const randomPassword = generateSecurePassword(16);
 * // => "X7k#mP9@qR2$nL5!"
 */
export const generateSecurePassword = (length = 16) => {
  const minLength = 12;
  const finalLength = Math.max(length, minLength);

  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + symbols;

  let password = '';

  // Garantir au moins 1 de chaque type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Remplir le reste aléatoirement
  for (let i = password.length; i < finalLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mélanger les caractères (Fisher-Yates shuffle)
  const chars = password.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
};

/**
 * Génère un PIN numérique aléatoire
 *
 * @param {number} length - Longueur du PIN (défaut: 6)
 * @returns {string} PIN généré
 *
 * @example
 * const pin = generateSecurePIN(6);
 * // => "847362"
 */
export const generateSecurePIN = (length = 6) => {
  if (length < 4) {
    throw new Error('Le PIN doit contenir au moins 4 chiffres');
  }

  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += Math.floor(Math.random() * 10).toString();
  }

  // Vérifier que ce n'est pas un pattern simple (1234, 1111, etc.)
  const isSequential = /^(?:0123456789|9876543210|012345|543210)/.test(pin);
  const isRepeating = /^(\d)\1+$/.test(pin);

  if (isSequential || isRepeating) {
    // Régénérer si pattern faible
    return generateSecurePIN(length);
  }

  return pin;
};

/**
 * Service d'authentification complet
 */
export const authService = {
  hashPassword,
  verifyPassword,
  checkPasswordStrength,
  generateSecurePassword,
  generateSecurePIN
};

export default authService;
