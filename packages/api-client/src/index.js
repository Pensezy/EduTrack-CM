/**
 * @edutrack/api - API Client Package
 * Exporte tous les services de base pour l'API EduTrack
 */

// Imports pour l'export default
import {
  initializeSupabase,
  getSupabaseClient,
  resetSupabaseClient,
} from './supabase/client.js';
import { ApiGateway } from './gateway/ApiGateway.js';
import { EventBus } from './events/EventBus.js';

// Supabase
export {
  initializeSupabase,
  getSupabaseClient,
  resetSupabaseClient,
} from './supabase/client.js';

// ApiGateway
export { ApiGateway } from './gateway/ApiGateway.js';

// EventBus
export { EventBus } from './events/EventBus.js';

// Contexts
export { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

// Services
export {
  dashboardService,
  authService,
  hashPassword,
  verifyPassword,
  checkPasswordStrength,
  generateSecurePassword,
  generateSecurePIN
} from './services/index.js';

// Factory pour créer une instance d'ApiGateway
export const createApiGateway = (options = {}) => {
  return new ApiGateway(options);
};

// Factory pour créer une instance d'EventBus
export const createEventBus = () => {
  return new EventBus();
};

export default {
  initializeSupabase,
  getSupabaseClient,
  resetSupabaseClient,
  ApiGateway,
  EventBus,
  createApiGateway,
  createEventBus,
};
