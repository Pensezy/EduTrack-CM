/**
 * @module schoolLevels
 * Constantes pour les niveaux scolaires au Cameroun
 */

/**
 * Types d'établissements
 */
export const SCHOOL_TYPES = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  HIGH_SCHOOL: 'high_school'
};

/**
 * Labels des types d'établissements
 */
export const SCHOOL_TYPE_LABELS = {
  [SCHOOL_TYPES.PRIMARY]: 'École Primaire',
  [SCHOOL_TYPES.SECONDARY]: 'Collège',
  [SCHOOL_TYPES.HIGH_SCHOOL]: 'Lycée'
};

/**
 * Classes disponibles par type d'établissement
 */
export const CLASSES_BY_TYPE = {
  [SCHOOL_TYPES.PRIMARY]: [
    'SIL',
    'CP',
    'CE1',
    'CE2',
    'CM1',
    'CM2'
  ],
  [SCHOOL_TYPES.SECONDARY]: [
    '6ème',
    '5ème',
    '4ème',
    '3ème'
  ],
  [SCHOOL_TYPES.HIGH_SCHOOL]: [
    '2nde',
    '1ère',
    'Tle'
  ]
};

/**
 * Sections/Séries pour le lycée
 */
export const HIGH_SCHOOL_SECTIONS = {
  LITERARY: {
    code: 'A',
    label: 'Littéraire',
    subsections: ['A1', 'A2', 'A3', 'A4', 'A5']
  },
  SCIENTIFIC: {
    code: 'C',
    label: 'Scientifique',
    subsections: ['C', 'D', 'E']
  },
  TECHNICAL: {
    code: 'TI',
    label: 'Technique Industrielle',
    subsections: ['TI', 'F']
  },
  COMMERCIAL: {
    code: 'G',
    label: 'Technique Commerciale',
    subsections: ['G1', 'G2', 'G3']
  }
};

/**
 * Cycles scolaires
 */
export const CYCLES = {
  PRIMARY: {
    code: 'primary',
    label: 'Primaire',
    levels: ['SIL', 'CP', 'CE1', 'CE2', 'CM1', 'CM2']
  },
  FIRST_CYCLE: {
    code: 'first_cycle',
    label: 'Premier Cycle',
    levels: ['6ème', '5ème', '4ème', '3ème']
  },
  SECOND_CYCLE: {
    code: 'second_cycle',
    label: 'Second Cycle',
    levels: ['2nde', '1ère', 'Tle']
  }
};

/**
 * Âges recommandés par niveau (primaire)
 */
export const RECOMMENDED_AGES_PRIMARY = {
  'SIL': 3,
  'CP': 6,
  'CE1': 7,
  'CE2': 8,
  'CM1': 9,
  'CM2': 10
};

/**
 * Âges recommandés par niveau (secondaire)
 */
export const RECOMMENDED_AGES_SECONDARY = {
  '6ème': 11,
  '5ème': 12,
  '4ème': 13,
  '3ème': 14,
  '2nde': 15,
  '1ère': 16,
  'Tle': 17
};

/**
 * Matières principales par cycle
 */
export const MAIN_SUBJECTS = {
  PRIMARY: [
    'Français',
    'Mathématiques',
    'Sciences',
    'Histoire-Géographie',
    'Éducation Civique et Morale',
    'Anglais',
    'Éducation Physique et Sportive'
  ],
  SECONDARY: [
    'Français',
    'Anglais',
    'Mathématiques',
    'Sciences de la Vie et de la Terre',
    'Physique-Chimie',
    'Histoire-Géographie',
    'Éducation Civique et Morale',
    'Informatique',
    'Éducation Physique et Sportive'
  ],
  LITERARY: [
    'Français',
    'Philosophie',
    'Anglais',
    'Allemand/Espagnol',
    'Histoire-Géographie',
    'Littérature',
    'Mathématiques',
    'Économie'
  ],
  SCIENTIFIC: [
    'Mathématiques',
    'Physique-Chimie',
    'Sciences de la Vie et de la Terre',
    'Français',
    'Anglais',
    'Philosophie',
    'Histoire-Géographie',
    'Informatique'
  ]
};

/**
 * Obtient les classes disponibles pour un type d'établissement
 * @param {string} schoolType - Type d'établissement
 * @returns {Array<string>} Liste des classes
 */
export const getAvailableClasses = (schoolType) => {
  return CLASSES_BY_TYPE[schoolType] || [];
};

/**
 * Obtient le label d'un type d'établissement
 * @param {string} schoolType - Type d'établissement
 * @returns {string} Label
 */
export const getSchoolTypeLabel = (schoolType) => {
  return SCHOOL_TYPE_LABELS[schoolType] || 'Inconnu';
};

/**
 * Vérifie si une classe appartient à un type d'établissement
 * @param {string} className - Nom de la classe
 * @param {string} schoolType - Type d'établissement
 * @returns {boolean}
 */
export const isClassInSchoolType = (className, schoolType) => {
  const classes = CLASSES_BY_TYPE[schoolType] || [];
  return classes.includes(className);
};

/**
 * Obtient le cycle d'une classe
 * @param {string} className - Nom de la classe
 * @returns {Object|null} Cycle ou null
 */
export const getClassCycle = (className) => {
  for (const cycle of Object.values(CYCLES)) {
    if (cycle.levels.includes(className)) {
      return cycle;
    }
  }
  return null;
};

/**
 * Vérifie si une classe est valide
 * @param {string} className - Nom de la classe
 * @returns {boolean}
 */
export const isValidClass = (className) => {
  return Object.values(CLASSES_BY_TYPE)
    .flat()
    .includes(className);
};

/**
 * Obtient l'âge recommandé pour une classe
 * @param {string} className - Nom de la classe
 * @returns {number|null} Âge recommandé ou null
 */
export const getRecommendedAge = (className) => {
  return RECOMMENDED_AGES_PRIMARY[className] || RECOMMENDED_AGES_SECONDARY[className] || null;
};

/**
 * Obtient la classe suivante
 * @param {string} currentClass - Classe actuelle
 * @returns {string|null} Classe suivante ou null si dernière année
 */
export const getNextClass = (currentClass) => {
  const allClasses = [
    ...CLASSES_BY_TYPE.primary,
    ...CLASSES_BY_TYPE.secondary,
    ...CLASSES_BY_TYPE.high_school
  ];

  const currentIndex = allClasses.indexOf(currentClass);
  if (currentIndex === -1 || currentIndex === allClasses.length - 1) {
    return null;
  }

  return allClasses[currentIndex + 1];
};

/**
 * Obtient la classe précédente
 * @param {string} currentClass - Classe actuelle
 * @returns {string|null} Classe précédente ou null si première année
 */
export const getPreviousClass = (currentClass) => {
  const allClasses = [
    ...CLASSES_BY_TYPE.primary,
    ...CLASSES_BY_TYPE.secondary,
    ...CLASSES_BY_TYPE.high_school
  ];

  const currentIndex = allClasses.indexOf(currentClass);
  if (currentIndex <= 0) {
    return null;
  }

  return allClasses[currentIndex - 1];
};

export default {
  SCHOOL_TYPES,
  SCHOOL_TYPE_LABELS,
  CLASSES_BY_TYPE,
  HIGH_SCHOOL_SECTIONS,
  CYCLES,
  RECOMMENDED_AGES_PRIMARY,
  RECOMMENDED_AGES_SECONDARY,
  MAIN_SUBJECTS,
  getAvailableClasses,
  getSchoolTypeLabel,
  isClassInSchoolType,
  getClassCycle,
  isValidClass,
  getRecommendedAge,
  getNextClass,
  getPreviousClass
};
