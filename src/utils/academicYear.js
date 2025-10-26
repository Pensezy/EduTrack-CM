/**
 * Utilitaire pour gérer les années académiques
 * @module utils/academicYear
 */

/**
 * Obtient l'année académique actuelle au format "YYYY-YYYY"
 * 
 * Logique :
 * - Si on est entre septembre et décembre : année en cours - année suivante
 * - Si on est entre janvier et août : année précédente - année en cours
 * 
 * Exemples :
 * - Octobre 2025 → "2025-2026"
 * - Mars 2025 → "2024-2025"
 * - Septembre 2025 → "2025-2026"
 * 
 * @returns {string} Année académique au format "YYYY-YYYY"
 */
export const getCurrentAcademicYear = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  
  // Si on est entre septembre (9) et décembre (12), l'année académique commence cette année
  // Sinon, elle a commencé l'année précédente
  if (currentMonth >= 9) {
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
};

/**
 * Obtient l'année académique suivante
 * 
 * @param {string} [academicYear] - Année académique de référence (optionnel)
 * @returns {string} Année académique suivante au format "YYYY-YYYY"
 * 
 * @example
 * getNextAcademicYear() // Si on est en 2025 → "2026-2027"
 * getNextAcademicYear("2024-2025") → "2025-2026"
 */
export const getNextAcademicYear = (academicYear) => {
  const year = academicYear || getCurrentAcademicYear();
  const [startYear] = year.split('-').map(Number);
  return `${startYear + 1}-${startYear + 2}`;
};

/**
 * Obtient l'année académique précédente
 * 
 * @param {string} [academicYear] - Année académique de référence (optionnel)
 * @returns {string} Année académique précédente au format "YYYY-YYYY"
 * 
 * @example
 * getPreviousAcademicYear() // Si on est en 2025 → "2024-2025"
 * getPreviousAcademicYear("2025-2026") → "2024-2025"
 */
export const getPreviousAcademicYear = (academicYear) => {
  const year = academicYear || getCurrentAcademicYear();
  const [startYear] = year.split('-').map(Number);
  return `${startYear - 1}-${startYear}`;
};

/**
 * Génère une liste d'années académiques
 * 
 * @param {number} [count=5] - Nombre d'années à générer
 * @param {boolean} [includePast=true] - Inclure les années passées
 * @param {boolean} [includeFuture=true] - Inclure les années futures
 * @returns {Array<{value: string, label: string}>} Liste d'années académiques
 * 
 * @example
 * getAcademicYearOptions(3) 
 * // [
 * //   { value: "2024-2025", label: "Année 2024-2025" },
 * //   { value: "2025-2026", label: "Année 2025-2026" },
 * //   { value: "2026-2027", label: "Année 2026-2027" }
 * // ]
 */
export const getAcademicYearOptions = (count = 5, includePast = true, includeFuture = true) => {
  const currentYear = getCurrentAcademicYear();
  const [startYear] = currentYear.split('-').map(Number);
  const options = [];
  
  const pastCount = includePast ? Math.floor(count / 2) : 0;
  const futureCount = includeFuture ? Math.floor(count / 2) : 0;
  
  // Années passées
  if (includePast) {
    for (let i = pastCount; i > 0; i--) {
      const year = `${startYear - i}-${startYear - i + 1}`;
      options.push({ value: year, label: `Année ${year}` });
    }
  }
  
  // Année en cours
  options.push({ value: currentYear, label: `Année ${currentYear} (en cours)` });
  
  // Années futures
  if (includeFuture) {
    for (let i = 1; i <= futureCount; i++) {
      const year = `${startYear + i}-${startYear + i + 1}`;
      options.push({ value: year, label: `Année ${year}` });
    }
  }
  
  return options;
};

/**
 * Vérifie si une année académique est l'année en cours
 * 
 * @param {string} academicYear - Année académique à vérifier
 * @returns {boolean} True si c'est l'année en cours
 * 
 * @example
 * isCurrentAcademicYear("2025-2026") // true si on est en octobre 2025
 */
export const isCurrentAcademicYear = (academicYear) => {
  return academicYear === getCurrentAcademicYear();
};

/**
 * Obtient les dates de début et fin d'une année académique
 * 
 * @param {string} [academicYear] - Année académique (optionnel, par défaut l'année en cours)
 * @returns {{startDate: Date, endDate: Date}} Dates de début et fin
 * 
 * @example
 * getAcademicYearDates("2025-2026")
 * // { startDate: Date("2025-09-01"), endDate: Date("2026-07-31") }
 */
export const getAcademicYearDates = (academicYear) => {
  const year = academicYear || getCurrentAcademicYear();
  const [startYear, endYear] = year.split('-').map(Number);
  
  return {
    startDate: new Date(startYear, 8, 1), // 1er septembre (month is 0-indexed)
    endDate: new Date(endYear, 6, 31) // 31 juillet
  };
};

/**
 * Formate une année académique pour l'affichage
 * 
 * @param {string} academicYear - Année académique
 * @param {boolean} [showCurrent=false] - Afficher "(en cours)" si c'est l'année actuelle
 * @returns {string} Année formatée
 * 
 * @example
 * formatAcademicYear("2025-2026", true) // "2025-2026 (en cours)"
 */
export const formatAcademicYear = (academicYear, showCurrent = false) => {
  if (showCurrent && isCurrentAcademicYear(academicYear)) {
    return `${academicYear} (en cours)`;
  }
  return academicYear;
};
