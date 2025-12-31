/**
 * @module gradeCalculator
 * Calculs liés aux notes, moyennes et appréciations (système camerounais)
 */

/**
 * Barème de notation sur 20 (système camerounais)
 */
const GRADE_SCALE = {
  MAX: 20,
  MIN: 0,
  PASSING: 10 // Moyenne de passage
};

/**
 * Appréciations selon la moyenne
 */
const APPRECIATIONS = [
  { min: 18, max: 20, label: 'Excellent', color: 'success' },
  { min: 16, max: 17.99, label: 'Très Bien', color: 'success' },
  { min: 14, max: 15.99, label: 'Bien', color: 'info' },
  { min: 12, max: 13.99, label: 'Assez Bien', color: 'info' },
  { min: 10, max: 11.99, label: 'Passable', color: 'warning' },
  { min: 8, max: 9.99, label: 'Insuffisant', color: 'warning' },
  { min: 0, max: 7.99, label: 'Médiocre', color: 'danger' }
];

/**
 * Calcule la moyenne simple (arithmétique)
 * @param {Array<number>} grades - Notes
 * @returns {number|null} Moyenne ou null si array vide
 *
 * @example
 * calculateAverage([15, 12, 18, 14])
 * // => 14.75
 */
export const calculateAverage = (grades) => {
  if (!Array.isArray(grades) || grades.length === 0) {
    return null;
  }

  const validGrades = grades.filter(g => typeof g === 'number' && !isNaN(g));
  if (validGrades.length === 0) {
    return null;
  }

  const sum = validGrades.reduce((acc, grade) => acc + grade, 0);
  return sum / validGrades.length;
};

/**
 * Calcule la moyenne pondérée
 * @param {Array<{grade: number, coefficient: number}>} items - Notes avec coefficients
 * @returns {number|null} Moyenne pondérée ou null
 *
 * @example
 * calculateWeightedAverage([
 *   { grade: 15, coefficient: 2 },
 *   { grade: 12, coefficient: 1 },
 *   { grade: 18, coefficient: 3 }
 * ])
 * // => 15.5
 */
export const calculateWeightedAverage = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  let totalPoints = 0;
  let totalCoefficients = 0;

  items.forEach(item => {
    if (typeof item.grade === 'number' && typeof item.coefficient === 'number') {
      if (!isNaN(item.grade) && !isNaN(item.coefficient)) {
        totalPoints += item.grade * item.coefficient;
        totalCoefficients += item.coefficient;
      }
    }
  });

  if (totalCoefficients === 0) {
    return null;
  }

  return totalPoints / totalCoefficients;
};

/**
 * Obtient l'appréciation selon la moyenne
 * @param {number} average - Moyenne
 * @returns {Object|null} { label, color, min, max }
 *
 * @example
 * getAppreciation(15.5)
 * // => { label: "Bien", color: "info", min: 14, max: 15.99 }
 */
export const getAppreciation = (average) => {
  if (average === null || average === undefined || isNaN(average)) {
    return null;
  }

  const appreciation = APPRECIATIONS.find(
    app => average >= app.min && average <= app.max
  );

  return appreciation || null;
};

/**
 * Vérifie si l'élève a réussi (moyenne >= 10)
 * @param {number} average - Moyenne
 * @returns {boolean} true si >= 10
 *
 * @example
 * isPassing(12.5)
 * // => true
 */
export const isPassing = (average) => {
  if (average === null || average === undefined || isNaN(average)) {
    return false;
  }

  return average >= GRADE_SCALE.PASSING;
};

/**
 * Calcule le rang dans une classe
 * @param {Array<{id: string, average: number}>} students - Liste des élèves avec moyennes
 * @param {string} studentId - ID de l'élève
 * @returns {number|null} Rang (1 = premier) ou null
 *
 * @example
 * calculateRank([
 *   { id: "1", average: 15 },
 *   { id: "2", average: 18 },
 *   { id: "3", average: 12 }
 * ], "2")
 * // => 1
 */
export const calculateRank = (students, studentId) => {
  if (!Array.isArray(students) || students.length === 0) {
    return null;
  }

  // Trier par moyenne décroissante
  const sorted = [...students].sort((a, b) => (b.average || 0) - (a.average || 0));

  // Trouver l'index de l'élève
  const index = sorted.findIndex(s => s.id === studentId);

  if (index === -1) {
    return null;
  }

  return index + 1; // Rang commence à 1
};

/**
 * Calcule la moyenne générale d'un élève (toutes matières)
 * @param {Array<{subject: string, grade: number, coefficient: number}>} grades - Notes par matière
 * @returns {Object} { average, totalPoints, totalCoefficients }
 *
 * @example
 * calculateGeneralAverage([
 *   { subject: "Maths", grade: 15, coefficient: 4 },
 *   { subject: "Français", grade: 12, coefficient: 3 },
 *   { subject: "Anglais", grade: 14, coefficient: 2 }
 * ])
 * // => { average: 13.89, totalPoints: 125, totalCoefficients: 9 }
 */
export const calculateGeneralAverage = (grades) => {
  if (!Array.isArray(grades) || grades.length === 0) {
    return {
      average: null,
      totalPoints: 0,
      totalCoefficients: 0
    };
  }

  let totalPoints = 0;
  let totalCoefficients = 0;

  grades.forEach(item => {
    if (typeof item.grade === 'number' && typeof item.coefficient === 'number') {
      if (!isNaN(item.grade) && !isNaN(item.coefficient)) {
        totalPoints += item.grade * item.coefficient;
        totalCoefficients += item.coefficient;
      }
    }
  });

  const average = totalCoefficients > 0
    ? totalPoints / totalCoefficients
    : null;

  return {
    average,
    totalPoints,
    totalCoefficients
  };
};

/**
 * Valide une note (entre 0 et 20)
 * @param {number} grade - Note à valider
 * @returns {boolean} true si valide
 *
 * @example
 * isValidGrade(15)
 * // => true
 *
 * isValidGrade(25)
 * // => false
 */
export const isValidGrade = (grade) => {
  if (typeof grade !== 'number' || isNaN(grade)) {
    return false;
  }

  return grade >= GRADE_SCALE.MIN && grade <= GRADE_SCALE.MAX;
};

/**
 * Normalise une note (limite entre 0 et 20)
 * @param {number} grade - Note à normaliser
 * @returns {number} Note normalisée
 *
 * @example
 * normalizeGrade(25)
 * // => 20
 *
 * normalizeGrade(-5)
 * // => 0
 */
export const normalizeGrade = (grade) => {
  if (typeof grade !== 'number' || isNaN(grade)) {
    return 0;
  }

  return Math.max(GRADE_SCALE.MIN, Math.min(GRADE_SCALE.MAX, grade));
};

/**
 * Calcule les statistiques d'une classe
 * @param {Array<number>} averages - Moyennes des élèves
 * @returns {Object} { min, max, average, median, passing, failing }
 *
 * @example
 * calculateClassStats([12, 15, 8, 18, 14, 9, 16])
 * // => {
 * //   min: 8,
 * //   max: 18,
 * //   average: 13.14,
 * //   median: 14,
 * //   passing: 5,
 * //   failing: 2
 * // }
 */
export const calculateClassStats = (averages) => {
  if (!Array.isArray(averages) || averages.length === 0) {
    return {
      min: null,
      max: null,
      average: null,
      median: null,
      passing: 0,
      failing: 0
    };
  }

  const validAverages = averages.filter(a => typeof a === 'number' && !isNaN(a));
  if (validAverages.length === 0) {
    return {
      min: null,
      max: null,
      average: null,
      median: null,
      passing: 0,
      failing: 0
    };
  }

  // Min et Max
  const min = Math.min(...validAverages);
  const max = Math.max(...validAverages);

  // Moyenne
  const average = calculateAverage(validAverages);

  // Médiane
  const sorted = [...validAverages].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];

  // Réussites et échecs
  const passing = validAverages.filter(a => a >= GRADE_SCALE.PASSING).length;
  const failing = validAverages.filter(a => a < GRADE_SCALE.PASSING).length;

  return {
    min,
    max,
    average,
    median,
    passing,
    failing,
    total: validAverages.length,
    successRate: (passing / validAverages.length) * 100
  };
};

/**
 * Formate une note pour affichage
 * @param {number} grade - Note
 * @param {number} decimals - Nombre de décimales (défaut: 2)
 * @returns {string} Note formatée
 *
 * @example
 * formatGrade(15.6789)
 * // => "15,68"
 */
export const formatGrade = (grade, decimals = 2) => {
  if (grade === null || grade === undefined || isNaN(grade)) {
    return '-';
  }

  return grade.toFixed(decimals).replace('.', ',');
};

export default {
  calculateAverage,
  calculateWeightedAverage,
  getAppreciation,
  isPassing,
  calculateRank,
  calculateGeneralAverage,
  isValidGrade,
  normalizeGrade,
  calculateClassStats,
  formatGrade,
  GRADE_SCALE,
  APPRECIATIONS
};
