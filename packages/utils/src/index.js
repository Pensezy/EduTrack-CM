/**
 * @edutrack/utils - Utilitaires partagés
 * Point d'entrée pour tous les utilitaires EduTrack
 */

// ==========================================
// FORMATTERS
// ==========================================

// Date formatters
export {
  formatDate,
  formatDateShort,
  formatDateTime
} from './formatters/dateFormatter.js';

// Number formatters
export {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatWithUnit,
  roundNumber,
  formatCompact,
  parseNumber
} from './formatters/numberFormatter.js';

// ==========================================
// VALIDATORS
// ==========================================

// Email validators
export {
  validateEmail,
  normalizeEmail,
  validateAndNormalizeEmail
} from './validators/emailValidator.js';

// Phone validators
export {
  validatePhone,
  normalizePhone,
  formatPhone,
  getOperator,
  validateAndNormalizePhone,
  arePhonesSame
} from './validators/phoneValidator.js';

// ==========================================
// CALCULATORS
// ==========================================

// Grade calculator
export {
  calculateAverage,
  calculateWeightedAverage,
  getAppreciation,
  isPassing,
  calculateRank,
  calculateGeneralAverage,
  isValidGrade,
  normalizeGrade,
  calculateClassStats,
  formatGrade
} from './calculators/gradeCalculator.js';

// ==========================================
// CONSTANTS
// ==========================================

// Roles
export {
  ROLES,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  isValidRole,
  getRoleLabel,
  hasPermission,
  getRolePermissions,
  isAdminRole,
  isEducationalRole
} from './constants/roles.js';

// School levels
export {
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
} from './constants/schoolLevels.js';

// ==========================================
// DEFAULT EXPORT (objets groupés)
// ==========================================

import * as dateFormatter from './formatters/dateFormatter.js';
import * as numberFormatter from './formatters/numberFormatter.js';
import * as emailValidator from './validators/emailValidator.js';
import * as phoneValidator from './validators/phoneValidator.js';
import * as gradeCalculator from './calculators/gradeCalculator.js';
import * as roles from './constants/roles.js';
import * as schoolLevels from './constants/schoolLevels.js';

export default {
  formatters: {
    date: dateFormatter,
    number: numberFormatter
  },
  validators: {
    email: emailValidator,
    phone: phoneValidator
  },
  calculators: {
    grade: gradeCalculator
  },
  constants: {
    roles,
    schoolLevels
  }
};
