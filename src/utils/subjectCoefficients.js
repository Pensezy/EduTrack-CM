/**
 * Coefficients des matières par série/filière — Système camerounais
 * 
 * Ces coefficients sont utilisés pour calculer la moyenne générale pondérée
 * et correspondent aux coefficients officiels des examens nationaux (BAC, BEPC, GCE)
 */

// ============================================================
// SECONDAIRE FRANCOPHONE — COLLÈGE (6ème à 3ème)
// ============================================================

export const COEF_COLLEGE_FR = {
  'Français': 5,
  'Mathématiques': 5,
  'Anglais': 3,
  'Histoire-Géographie': 3,
  'Sciences de la Vie et de la Terre': 2,
  'SVT': 2,
  'Physique-Chimie': 2,
  'PCT': 2,
  'Éducation Civique': 2,
  'ECM': 2,
  'Éducation Physique': 2,
  'EPS': 2,
  'Informatique': 1,
  'Arts Plastiques': 1,
  'Musique': 1,
  'Espagnol': 2,
  'Allemand': 2,
  'Latin': 2
};

// ============================================================
// SECONDAIRE FRANCOPHONE — LYCÉE SÉRIE A (Littéraire)
// ============================================================

export const COEF_SERIE_A = {
  'Philosophie': 5,
  'Français': 5,
  'Littérature': 4,
  'Histoire-Géographie': 4,
  'Anglais': 3,
  'Espagnol': 3,
  'Allemand': 3,
  'Latin': 3,
  'Grec': 3,
  'Mathématiques': 2,
  'Sciences de la Vie et de la Terre': 1,
  'SVT': 1,
  'Physique-Chimie': 1,
  'PCT': 1,
  'Éducation Civique': 1,
  'ECM': 1,
  'Éducation Physique': 1,
  'EPS': 1,
  'Informatique': 1
};

// ============================================================
// SECONDAIRE FRANCOPHONE — LYCÉE SÉRIE C (Mathématiques-Physique)
// ============================================================

export const COEF_SERIE_C = {
  'Mathématiques': 7,
  'Physique-Chimie': 6,
  'PCT': 6,
  'Sciences de la Vie et de la Terre': 3,
  'SVT': 3,
  'Français': 3,
  'Philosophie': 3,
  'Anglais': 2,
  'Histoire-Géographie': 2,
  'Éducation Civique': 1,
  'ECM': 1,
  'Éducation Physique': 2,
  'EPS': 2,
  'Informatique': 2
};

// ============================================================
// SECONDAIRE FRANCOPHONE — LYCÉE SÉRIE D (Sciences Biologiques)
// ============================================================

export const COEF_SERIE_D = {
  'Sciences de la Vie et de la Terre': 6,
  'SVT': 6,
  'Mathématiques': 5,
  'Physique-Chimie': 5,
  'PCT': 5,
  'Français': 3,
  'Philosophie': 3,
  'Anglais': 2,
  'Histoire-Géographie': 2,
  'Éducation Civique': 1,
  'ECM': 1,
  'Éducation Physique': 2,
  'EPS': 2,
  'Informatique': 2
};

// ============================================================
// SECONDAIRE FRANCOPHONE — LYCÉE SÉRIE TI (Technique Industrielle)
// ============================================================

export const COEF_SERIE_TI = {
  'Spécialité Technique': 8,
  'Dessin Industriel': 5,
  'Mathématiques': 5,
  'Physique-Chimie': 4,
  'PCT': 4,
  'Mécanique': 4,
  'Électricité': 4,
  'Français': 2,
  'Anglais': 2,
  'Éducation Civique': 1,
  'ECM': 1,
  'Éducation Physique': 1,
  'EPS': 1
};

// ============================================================
// PRIMAIRE FRANCOPHONE
// ============================================================

export const COEF_PRIMAIRE_FR = {
  'Français': 4,
  'Lecture': 3,
  'Écriture': 2,
  'Dictée': 2,
  'Grammaire': 2,
  'Vocabulaire': 2,
  'Expression écrite': 2,
  'Mathématiques': 4,
  'Calcul': 3,
  'Géométrie': 2,
  'Problèmes': 2,
  'Sciences': 2,
  'Histoire': 1,
  'Géographie': 1,
  'Éducation Civique': 1,
  'ECM': 1,
  'Anglais': 2,
  'Éducation Physique': 1,
  'EPS': 1,
  'Dessin': 1,
  'Chant': 1
};

// ============================================================
// SYSTÈME ANGLOPHONE — GCE O-LEVEL
// ============================================================

export const COEF_GCE_OLEVEL = {
  'English Language': 3,
  'French': 2,
  'Mathematics': 3,
  'Additional Mathematics': 2,
  'Physics': 2,
  'Chemistry': 2,
  'Biology': 2,
  'Human Biology': 2,
  'Geography': 2,
  'History': 2,
  'Economics': 2,
  'Commerce': 2,
  'Accounting': 2,
  'Computer Science': 2,
  'Religious Studies': 1,
  'Physical Education': 1,
  'Literature in English': 2,
  'Food and Nutrition': 2
};

// ============================================================
// SYSTÈME ANGLOPHONE — GCE A-LEVEL
// ============================================================

export const COEF_GCE_ALEVEL = {
  'Mathematics': 3,
  'Further Mathematics': 3,
  'Physics': 3,
  'Chemistry': 3,
  'Biology': 3,
  'Economics': 3,
  'Geography': 3,
  'History': 3,
  'English Literature': 3,
  'French': 2,
  'Computer Science': 3,
  'Accounting': 3,
  'General Paper': 1
};

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

/**
 * Obtenir les coefficients selon le type d'établissement et la série
 */
export function getSubjectCoefficients(schoolType, series = null) {
  const type = String(schoolType || '').toLowerCase();
  const serie = String(series || '').toUpperCase();

  // Système anglophone
  if (type.includes('anglophone') || type.includes('english') || type.includes('gce')) {
    if (type.includes('a-level') || type.includes('alevel') || serie === 'A-LEVEL') {
      return COEF_GCE_ALEVEL;
    }
    return COEF_GCE_OLEVEL;
  }

  // Primaire
  if (type.includes('primaire') || type.includes('primary')) {
    return COEF_PRIMAIRE_FR;
  }

  // Collège
  if (type.includes('college') || type.includes('6') || type.includes('5') || type.includes('4') || type.includes('3')) {
    return COEF_COLLEGE_FR;
  }

  // Lycée selon série
  if (serie === 'A' || serie === 'A4' || serie === 'A5') return COEF_SERIE_A;
  if (serie === 'C') return COEF_SERIE_C;
  if (serie === 'D') return COEF_SERIE_D;
  if (serie === 'TI' || serie === 'F' || serie === 'E') return COEF_SERIE_TI;

  // Défaut : collège
  return COEF_COLLEGE_FR;
}

/**
 * Obtenir le coefficient d'une matière spécifique
 */
export function getSubjectCoefficient(subjectName, schoolType, series = null) {
  const coefficients = getSubjectCoefficients(schoolType, series);
  
  // Recherche exacte
  if (coefficients[subjectName]) {
    return coefficients[subjectName];
  }

  // Recherche par inclusion (cas insensible)
  const lowerName = subjectName.toLowerCase();
  for (const [key, value] of Object.entries(coefficients)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Défaut
  return 1;
}

/**
 * Liste des séries disponibles
 */
export const SERIES_LIST = [
  { value: 'college', label: 'Collège (6ème-3ème)', system: 'francophone' },
  { value: 'A', label: 'Série A (Littéraire)', system: 'francophone' },
  { value: 'C', label: 'Série C (Maths-Physique)', system: 'francophone' },
  { value: 'D', label: 'Série D (Sciences Bio)', system: 'francophone' },
  { value: 'TI', label: 'Série TI (Technique)', system: 'francophone' },
  { value: 'O-LEVEL', label: 'GCE Ordinary Level', system: 'anglophone' },
  { value: 'A-LEVEL', label: 'GCE Advanced Level', system: 'anglophone' }
];

export default {
  getSubjectCoefficients,
  getSubjectCoefficient,
  SERIES_LIST,
  COEF_COLLEGE_FR,
  COEF_SERIE_A,
  COEF_SERIE_C,
  COEF_SERIE_D,
  COEF_SERIE_TI,
  COEF_PRIMAIRE_FR,
  COEF_GCE_OLEVEL,
  COEF_GCE_ALEVEL
};
