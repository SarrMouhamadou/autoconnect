/**
 * Export centralisé de tous les services API
 * 
 * Usage:
 * import { authService, vehiculeService, locationService } from './services';
 * 
 * Ou individuellement:
 * import authService from './services/authService';
 */

// Services existants
export { default as authService } from './authService';
export { default as vehiculeService } from './vehiculeService';
export { default as concessionService } from './concessionService';

// Nouveaux services
export { default as statistiqueService } from './statistiqueService';
export { default as locationService } from './locationService';
export { default as demandeService } from './demandeService';
export { default as avisService } from './avisService';
export { default as favoriService } from './favoriService';
export { default as promotionService } from './promotionService';
export { default as notificationService } from './notificationService';
export { default as adminService } from './adminService';

// Export de l'instance API configurée
export { default as api } from './api';