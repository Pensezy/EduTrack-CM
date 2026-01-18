// Utilitaires de calcul de notes et moyennes — Système camerounais

// ============================================================
// CONFIGURATION DES PALIERS ET MENTIONS PAR TYPE D'ÉTABLISSEMENT
// ============================================================

/**
 * Paliers francophone — École primaire (sur 10)
 */
export const PALIERS_PRIMAIRE_FR = [
  { min: 9, max: 10, mention: 'Très bien', code: 'TB' },
  { min: 8, max: 8.99, mention: 'Bien', code: 'B' },
  { min: 6, max: 7.99, mention: 'Assez bien', code: 'AB' },
  { min: 5, max: 5.99, mention: 'Passable', code: 'P' },
  { min: 0, max: 4.99, mention: 'Échec', code: 'E' }
];

/**
 * Paliers francophone — Secondaire (sur 20)
 */
export const PALIERS_SECONDAIRE_FR = [
  { min: 16, max: 20, mention: 'Très bien', code: 'TB' },
  { min: 14, max: 15.99, mention: 'Bien', code: 'B' },
  { min: 12, max: 13.99, mention: 'Assez bien', code: 'AB' },
  { min: 10, max: 11.99, mention: 'Passable', code: 'P' },
  { min: 0, max: 9.99, mention: 'Échec', code: 'E' }
];

/**
 * Paliers francophone — Université LMD (sur 20)
 */
export const PALIERS_UNIVERSITE_FR = [
  { min: 16, max: 20, mention: 'Très Bien', code: 'A', validated: true },
  { min: 14, max: 15.99, mention: 'Bien', code: 'B', validated: true },
  { min: 12, max: 13.99, mention: 'Assez Bien', code: 'C', validated: true },
  { min: 10, max: 11.99, mention: 'Passable', code: 'D', validated: true },
  { min: 7, max: 9.99, mention: 'Rattrapage', code: 'R', validated: false },
  { min: 0, max: 6.99, mention: 'Non Validé', code: 'NV', validated: false }
];

/**
 * Paliers anglophone — Primary School (pourcentage → lettre)
 */
export const PALIERS_PRIMARY_EN = [
  { min: 80, max: 100, letter: 'A', mention: 'Excellent' },
  { min: 70, max: 79.99, letter: 'B', mention: 'Very Good' },
  { min: 60, max: 69.99, letter: 'C', mention: 'Good' },
  { min: 50, max: 59.99, letter: 'D', mention: 'Fair' },
  { min: 40, max: 49.99, letter: 'E', mention: 'Pass' },
  { min: 0, max: 39.99, letter: 'F', mention: 'Fail' }
];

/**
 * Paliers anglophone — Secondary / GCE O-Level (pourcentage → grade)
 */
export const PALIERS_SECONDARY_EN = [
  { min: 80, max: 100, grade: 'A1', mention: 'Excellent' },
  { min: 70, max: 79.99, grade: 'B2', mention: 'Very Good' },
  { min: 65, max: 69.99, grade: 'B3', mention: 'Good' },
  { min: 60, max: 64.99, grade: 'C4', mention: 'Credit' },
  { min: 55, max: 59.99, grade: 'C5', mention: 'Credit' },
  { min: 50, max: 54.99, grade: 'C6', mention: 'Credit' },
  { min: 45, max: 49.99, grade: 'D7', mention: 'Pass' },
  { min: 40, max: 44.99, grade: 'E8', mention: 'Pass' },
  { min: 0, max: 39.99, grade: 'F9', mention: 'Fail' }
];

/**
 * Paliers anglophone — GCE A-Level
 */
export const PALIERS_GCE_ALEVEL = [
  { min: 90, max: 100, grade: 'A*', ucasPoints: 56 },
  { min: 80, max: 89.99, grade: 'A', ucasPoints: 48 },
  { min: 70, max: 79.99, grade: 'B', ucasPoints: 40 },
  { min: 60, max: 69.99, grade: 'C', ucasPoints: 32 },
  { min: 50, max: 59.99, grade: 'D', ucasPoints: 24 },
  { min: 40, max: 49.99, grade: 'E', ucasPoints: 16 },
  { min: 0, max: 39.99, grade: 'U', ucasPoints: 0 }
];

/**
 * Mentions honorifiques du conseil de classe
 */
export const MENTIONS_HONORIFIQUES = {
  felicitations: { min: 16, label: 'Félicitations du Conseil' },
  encouragements: { min: 14, label: 'Encouragements' },
  tableauHonneur: { min: 12, label: "Tableau d'Honneur" },
  avertissementTravail: { max: 8, label: 'Avertissement Travail' },
  avertissementConduite: { conduct: true, label: 'Avertissement Conduite' }
};

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

export function toPercent(grade, max = 20) {
  const g = parseFloat(grade);
  const m = parseFloat(max) || 1;
  if (isNaN(g) || isNaN(m) || m === 0) return 0;
  return (g / m) * 100;
}

export function percentToScale(percent, scale = 20) {
  return (percent * scale) / 100;
}

/**
 * Détecter le système linguistique (francophone / anglophone)
 */
export function detectLanguageSystem(schoolType) {
  if (!schoolType) return 'francophone';
  const t = String(schoolType).toLowerCase();
  if (t.includes('anglophone') || t.includes('english') || t.includes('gce') || t.includes('bilingual')) {
    return 'anglophone';
  }
  return 'francophone';
}

/**
 * Détecter le niveau scolaire
 */
export function detectSchoolLevel(schoolType) {
  if (!schoolType) return 'secondaire';
  const t = String(schoolType).toLowerCase();
  if (t.includes('maternelle') || t.includes('nursery')) return 'maternelle';
  if (t.includes('primaire') || t.includes('primary')) return 'primaire';
  if (t.includes('college') || t.includes('lycee') || t.includes('lycée') || t.includes('secondary')) return 'secondaire';
  if (t.includes('univers') || t.includes('university') || t.includes('faculte') || t.includes('faculty')) return 'universite';
  return 'secondaire';
}

function detectDefaultScale(schoolType, grades) {
  const level = detectSchoolLevel(schoolType);
  if (level === 'primaire' || level === 'maternelle') return 10;
  if (level === 'universite' || level === 'secondaire') return 20;

  // Fallback : inspecter max_grade courant
  const mostCommonMax = grades && grades.length > 0
    ? grades.reduce((acc, g) => {
        const k = g.max_grade || 20;
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {})
    : {};

  const entries = Object.entries(mostCommonMax);
  if (entries.length === 0) return 20;
  const [commonMax] = entries.sort((a, b) => b[1] - a[1])[0];
  const cm = parseInt(commonMax, 10);
  if (cm === 10) return 10;
  return 20;
}

/**
 * Obtenir les paliers appropriés selon le type d'établissement
 */
export function getPaliers(schoolType) {
  const lang = detectLanguageSystem(schoolType);
  const level = detectSchoolLevel(schoolType);

  if (lang === 'anglophone') {
    if (level === 'primaire' || level === 'maternelle') return PALIERS_PRIMARY_EN;
    return PALIERS_SECONDARY_EN;
  }

  // Francophone
  if (level === 'primaire' || level === 'maternelle') return PALIERS_PRIMAIRE_FR;
  if (level === 'universite') return PALIERS_UNIVERSITE_FR;
  return PALIERS_SECONDAIRE_FR;
}

/**
 * Obtenir la mention/grade pour une note donnée
 * @param {number} score — Note ou pourcentage
 * @param {string} schoolType — Type d'établissement
 * @returns {{ mention: string, code?: string, letter?: string, grade?: string, validated?: boolean }}
 */
export function getMention(score, schoolType) {
  const paliers = getPaliers(schoolType);
  const lang = detectLanguageSystem(schoolType);
  const level = detectSchoolLevel(schoolType);

  // Normaliser le score en pourcentage si nécessaire (pour système anglophone)
  let percent = score;
  if (lang === 'francophone') {
    const scale = (level === 'primaire' || level === 'maternelle') ? 10 : 20;
    percent = toPercent(score, scale);
  }

  for (const p of paliers) {
    if (percent >= p.min && percent <= p.max) {
      return { ...p };
    }
  }

  return { mention: 'Non classé', code: 'NC' };
}

/**
 * Obtenir la mention honorifique du conseil de classe
 */
export function getMentionHonorifique(average, conductScore = null, schoolType = 'secondaire') {
  const lang = detectLanguageSystem(schoolType);
  const level = detectSchoolLevel(schoolType);
  const scale = (level === 'primaire') ? 10 : 20;
  
  // Normaliser sur 20 pour comparaison
  const avg20 = (scale === 10) ? average * 2 : average;

  if (avg20 >= MENTIONS_HONORIFIQUES.felicitations.min) {
    return MENTIONS_HONORIFIQUES.felicitations.label;
  }
  if (avg20 >= MENTIONS_HONORIFIQUES.encouragements.min) {
    return MENTIONS_HONORIFIQUES.encouragements.label;
  }
  if (avg20 >= MENTIONS_HONORIFIQUES.tableauHonneur.min) {
    return MENTIONS_HONORIFIQUES.tableauHonneur.label;
  }
  if (avg20 <= MENTIONS_HONORIFIQUES.avertissementTravail.max) {
    return MENTIONS_HONORIFIQUES.avertissementTravail.label;
  }
  return null;
}

/**
 * Calculer la moyenne d'une matière à partir d'un tableau de notes
 * Chaque note attendue: { grade, max_grade, coefficient }
 * Retourne la moyenne sur l'échelle choisie (par défaut 20)
 */
export function computeSubjectAverage(grades = [], options = {}) {
  const { schoolType = null, targetScale = null } = options;
  const scale = targetScale || detectDefaultScale(schoolType, grades);

  if (!grades || grades.length === 0) return 0;

  let weightedSum = 0;
  let coefSum = 0;

  grades.forEach(g => {
    const coef = Number(g.coefficient) || 1;
    const max = Number(g.max_grade) || 20;
    const percent = toPercent(g.grade, max);
    weightedSum += percent * coef;
    coefSum += coef;
  });

  const avgPercent = coefSum > 0 ? (weightedSum / coefSum) : (weightedSum / grades.length);

  return parseFloat(percentToScale(avgPercent, scale).toFixed(2));
}

/**
 * Calculer la moyenne générale à partir d'un tableau de matières
 * subjects: [{ average, coefficient }]
 * Le coefficient ici est le coefficient de la MATIÈRE (pas de l'évaluation)
 */
export function computeOverallAverage(subjects = [], defaultSubjectCoef = 1) {
  if (!subjects || subjects.length === 0) return 0;

  let sum = 0;
  let coefSum = 0;
  subjects.forEach(s => {
    const coef = Number(s.coefficient) || defaultSubjectCoef || 1;
    const avg = Number(s.average) || 0;
    sum += avg * coef;
    coefSum += coef;
  });

  return coefSum > 0 ? parseFloat((sum / coefSum).toFixed(2)) : 0;
}

/**
 * Calculer le rang d'un élève dans sa classe
 * @param {number} studentAverage — Moyenne de l'élève
 * @param {number[]} allAverages — Toutes les moyennes de la classe
 * @returns {{ rank: number, total: number, suffix: string }}
 */
export function computeRank(studentAverage, allAverages = []) {
  if (!allAverages || allAverages.length === 0) {
    return { rank: 1, total: 1, suffix: 'er' };
  }

  // Trier par ordre décroissant
  const sorted = [...allAverages].sort((a, b) => b - a);
  const rank = sorted.findIndex(avg => avg === studentAverage) + 1;
  const total = sorted.length;
  
  // Suffixe français
  const suffix = rank === 1 ? 'er' : 'ème';

  return { rank, total, suffix };
}

/**
 * Générer un résumé complet pour un élève (bulletin)
 */
export function generateStudentSummary(studentGrades, subjectCoefficients = {}, schoolType = 'secondaire') {
  const level = detectSchoolLevel(schoolType);
  const lang = detectLanguageSystem(schoolType);
  const scale = (level === 'primaire' || level === 'maternelle') ? 10 : 20;

  // Regrouper les notes par matière
  const bySubject = {};
  (studentGrades || []).forEach(g => {
    const subj = g.subject || g.subject_name || 'Autre';
    if (!bySubject[subj]) bySubject[subj] = [];
    bySubject[subj].push(g);
  });

  // Calculer moyenne par matière
  const subjectsData = Object.entries(bySubject).map(([name, grades]) => {
    const average = computeSubjectAverage(grades, { schoolType });
    const subjectCoef = subjectCoefficients[name] || 1;
    const mentionInfo = getMention(average, schoolType);

    return {
      name,
      grades,
      average,
      coefficient: subjectCoef,
      mention: mentionInfo.mention,
      code: mentionInfo.code || mentionInfo.grade || mentionInfo.letter
    };
  });

  // Moyenne générale pondérée par coefficient matière
  const overallAverage = computeOverallAverage(subjectsData);
  const overallMention = getMention(overallAverage, schoolType);
  const honorMention = getMentionHonorifique(overallAverage, null, schoolType);

  return {
    subjects: subjectsData,
    overallAverage,
    scale,
    mention: overallMention.mention,
    code: overallMention.code || overallMention.grade || overallMention.letter,
    honorMention,
    languageSystem: lang,
    level
  };
}

export default {
  toPercent,
  percentToScale,
  computeSubjectAverage,
  computeOverallAverage,
  computeRank,
  getMention,
  getMentionHonorifique,
  getPaliers,
  generateStudentSummary,
  detectLanguageSystem,
  detectSchoolLevel,
  PALIERS_PRIMAIRE_FR,
  PALIERS_SECONDAIRE_FR,
  PALIERS_UNIVERSITE_FR,
  PALIERS_PRIMARY_EN,
  PALIERS_SECONDARY_EN,
  PALIERS_GCE_ALEVEL,
  MENTIONS_HONORIFIQUES
};
