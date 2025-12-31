/**
 * @module roles
 * Constantes pour les rôles utilisateurs dans EduTrack
 */

/**
 * Rôles disponibles dans le système
 */
export const ROLES = {
  ADMIN: 'admin',
  PRINCIPAL: 'principal',
  TEACHER: 'teacher',
  SECRETARY: 'secretary',
  STUDENT: 'student',
  PARENT: 'parent'
};

/**
 * Labels français des rôles
 */
export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.PRINCIPAL]: 'Directeur',
  [ROLES.TEACHER]: 'Enseignant',
  [ROLES.SECRETARY]: 'Secrétaire',
  [ROLES.STUDENT]: 'Élève',
  [ROLES.PARENT]: 'Parent'
};

/**
 * Permissions par rôle
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'manage_schools',
    'manage_users',
    'manage_academic_years',
    'view_all_data',
    'manage_system_settings'
  ],
  [ROLES.PRINCIPAL]: [
    'manage_school',
    'manage_teachers',
    'manage_students',
    'manage_classes',
    'view_school_data',
    'manage_enrollment_requests',
    'manage_payments'
  ],
  [ROLES.TEACHER]: [
    'manage_grades',
    'manage_attendance',
    'view_class_data',
    'manage_assignments',
    'communicate_with_parents'
  ],
  [ROLES.SECRETARY]: [
    'manage_students',
    'manage_documents',
    'manage_payments',
    'view_school_data'
  ],
  [ROLES.STUDENT]: [
    'view_own_grades',
    'view_own_attendance',
    'view_own_schedule',
    'submit_assignments'
  ],
  [ROLES.PARENT]: [
    'view_children_grades',
    'view_children_attendance',
    'view_children_schedule',
    'communicate_with_teachers',
    'view_payment_history'
  ]
};

/**
 * Vérifie si un rôle existe
 * @param {string} role - Rôle à vérifier
 * @returns {boolean}
 */
export const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};

/**
 * Obtient le label d'un rôle
 * @param {string} role - Rôle
 * @returns {string} Label ou "Inconnu"
 */
export const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || 'Inconnu';
};

/**
 * Vérifie si un rôle a une permission
 * @param {string} role - Rôle
 * @param {string} permission - Permission à vérifier
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

/**
 * Obtient toutes les permissions d'un rôle
 * @param {string} role - Rôle
 * @returns {Array<string>} Liste des permissions
 */
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Vérifie si un rôle est un rôle administratif
 * @param {string} role - Rôle
 * @returns {boolean}
 */
export const isAdminRole = (role) => {
  return role === ROLES.ADMIN || role === ROLES.PRINCIPAL;
};

/**
 * Vérifie si un rôle est un rôle pédagogique
 * @param {string} role - Rôle
 * @returns {boolean}
 */
export const isEducationalRole = (role) => {
  return role === ROLES.TEACHER || role === ROLES.STUDENT;
};

export default {
  ROLES,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  isValidRole,
  getRoleLabel,
  hasPermission,
  getRolePermissions,
  isAdminRole,
  isEducationalRole
};
