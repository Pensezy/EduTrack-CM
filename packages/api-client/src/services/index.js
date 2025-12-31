/**
 * @edutrack/api - Services
 * Point d'entrée pour tous les services de l'API
 */

// Services de données
export { dashboardService } from './dashboardService.js';
export { default as dashboardServiceDefault } from './dashboardService.js';

// Services d'authentification
export {
  authService,
  hashPassword,
  verifyPassword,
  checkPasswordStrength,
  generateSecurePassword,
  generateSecurePIN
} from './authService.js';
export { default as authServiceDefault } from './authService.js';

// Export par défaut (objet regroupant tous les services)
export default {
  dashboard: dashboardService,
  auth: authService
};
