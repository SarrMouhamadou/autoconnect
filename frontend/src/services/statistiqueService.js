import api from './api';

/**
 * Service pour gérer les statistiques via l'API
 * Endpoints: /api/statistiques/
 */
const statistiqueService = {
  // ========================================
  // DASHBOARDS COMPLETS
  // ========================================

  /**
   * Dashboard complet du concessionnaire
   * GET /api/statistiques/dashboard/concessionnaire/
   */
  async getDashboardConcessionnaire() {
    try {
      const response = await api.get('/statistiques/dashboard/concessionnaire/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Dashboard complet du client
   * GET /api/statistiques/dashboard/client/
   */
  async getDashboardClient() {
    try {
      const response = await api.get('/statistiques/dashboard/client/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Dashboard complet administrateur
   * GET /api/statistiques/dashboard/admin/
   */
  async getDashboardAdmin() {
    try {
      const response = await api.get('/statistiques/dashboard/admin/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CONCESSIONNAIRE - DÉTAILS
  // ========================================

  /**
   * Statistiques de revenus du concessionnaire
   * GET /api/statistiques/concessionnaire/revenus/
   */
  async getRevenusConcessionnaire() {
    try {
      const response = await api.get('/statistiques/concessionnaire/revenus/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Statistiques de locations du concessionnaire
   * GET /api/statistiques/concessionnaire/locations/
   */
  async getLocationsConcessionnaire() {
    try {
      const response = await api.get('/statistiques/concessionnaire/locations/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Statistiques de véhicules du concessionnaire
   * GET /api/statistiques/concessionnaire/vehicules/
   */
  async getVehiculesConcessionnaire() {
    try {
      const response = await api.get('/statistiques/concessionnaire/vehicules/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Statistiques de demandes du concessionnaire
   * GET /api/statistiques/concessionnaire/demandes/
   */
  async getDemandesConcessionnaire() {
    try {
      const response = await api.get('/statistiques/concessionnaire/demandes/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Statistiques d'avis du concessionnaire
   * GET /api/statistiques/concessionnaire/avis/
   */
  async getAvisConcessionnaire() {
    try {
      const response = await api.get('/statistiques/concessionnaire/avis/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Tendances du concessionnaire (graphiques)
   * GET /api/statistiques/concessionnaire/tendances/
   */
  async getTendancesConcessionnaire() {
    try {
      const response = await api.get('/statistiques/concessionnaire/tendances/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CLIENT - DÉTAILS
  // ========================================

  /**
   * Statistiques de locations du client
   * GET /api/statistiques/client/locations/
   */
  async getLocationsClient() {
    try {
      const response = await api.get('/statistiques/client/locations/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Statistiques de dépenses du client
   * GET /api/statistiques/client/depenses/
   */
  async getDepensesClient() {
    try {
      const response = await api.get('/statistiques/client/depenses/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Statistiques de favoris du client
   * GET /api/statistiques/client/favoris/
   */
  async getFavorisClient() {
    try {
      const response = await api.get('/statistiques/client/favoris/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Activité récente du client
   * GET /api/statistiques/client/activite/
   */
  async getActiviteClient() {
    try {
      const response = await api.get('/statistiques/client/activite/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // ADMINISTRATEUR - DÉTAILS
  // ========================================

  /**
   * Statistiques utilisateurs (admin)
   * GET /api/statistiques/admin/utilisateurs/
   */
  async getUtilisateursAdmin() {
    try {
      const response = await api.get('/statistiques/admin/utilisateurs/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Statistiques concessions (admin)
   * GET /api/statistiques/admin/concessions/
   */
  async getConcessionsAdmin() {
    try {
      const response = await api.get('/statistiques/admin/concessions/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Statistiques véhicules (admin)
   * GET /api/statistiques/admin/vehicules/
   */
  async getVehiculesAdmin() {
    try {
      const response = await api.get('/statistiques/admin/vehicules/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Statistiques locations (admin)
   * GET /api/statistiques/admin/locations/
   */
  async getLocationsAdmin() {
    try {
      const response = await api.get('/statistiques/admin/locations/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Statistiques revenus (admin)
   * GET /api/statistiques/admin/revenus/
   */
  async getRevenusAdmin() {
    try {
      const response = await api.get('/statistiques/admin/revenus/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Tendances globales (admin)
   * GET /api/statistiques/admin/tendances/
   */
  async getTendancesAdmin() {
    try {
      const response = await api.get('/statistiques/admin/tendances/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // GESTION DES ERREURS
  // ========================================

  handleError(error) {
    if (error.response) {
      const message =
        error.response.data.detail ||
        error.response.data.message ||
        this.formatErrors(error.response.data) ||
        'Une erreur est survenue';

      return {
        message,
        status: error.response.status,
        errors: error.response.data,
      };
    } else if (error.request) {
      return {
        message: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
        status: 0,
      };
    } else {
      return {
        message: error.message || 'Une erreur est survenue',
        status: 0,
      };
    }
  },

  formatErrors(errors) {
    if (typeof errors === 'string') return errors;
    if (typeof errors === 'object') {
      const messages = [];
      for (const [field, fieldErrors] of Object.entries(errors)) {
        if (Array.isArray(fieldErrors)) {
          messages.push(`${field}: ${fieldErrors.join(', ')}`);
        } else {
          messages.push(`${field}: ${fieldErrors}`);
        }
      }
      return messages.join('\n');
    }
    return 'Erreur de validation';
  },
};

export default statistiqueService;