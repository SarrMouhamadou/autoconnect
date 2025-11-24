import api from './api';

/**
 * Service pour gérer les favoris via l'API
 * Endpoints: /api/favoris/
 */
const favoriService = {
  // ========================================
  // MES FAVORIS
  // ========================================

  /**
   * Récupérer tous mes favoris
   * GET /api/favoris/
   */
  async getMesFavoris(params = {}) {
    try {
      const response = await api.get('/favoris/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer un favori par ID
   * GET /api/favoris/{id}/
   */
  async getFavori(id) {
    try {
      const response = await api.get(`/favoris/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Ajouter un véhicule aux favoris
   * POST /api/favoris/
   */
  async ajouterFavori(vehiculeId) {
    try {
      const response = await api.post('/favoris/', {
        vehicule_id: vehiculeId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Retirer un véhicule des favoris
   * DELETE /api/favoris/{id}/
   */
  async retirerFavori(id) {
    try {
      const response = await api.delete(`/favoris/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Retirer un véhicule des favoris par vehiculeId
   * DELETE /api/favoris/vehicule/{vehiculeId}/
   */
  async retirerFavoriParVehicule(vehiculeId) {
    try {
      const response = await api.delete(`/favoris/vehicule/${vehiculeId}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Toggle favori (ajouter si pas présent, retirer si présent)
   * POST /api/favoris/toggle/
   */
  async toggleFavori(vehiculeId) {
    try {
      const response = await api.post('/favoris/toggle/', {
        vehicule_id: vehiculeId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Vérifier si un véhicule est en favori
   * GET /api/favoris/check/{vehiculeId}/
   */
  async estEnFavori(vehiculeId) {
    try {
      const response = await api.get(`/favoris/check/${vehiculeId}/`);
      return response.data;
    } catch (error) {
      // Si 404, ce n'est pas en favori
      if (error.response?.status === 404) {
        return { est_favori: false };
      }
      throw this.handleError(error);
    }
  },

  // ========================================
  // ALERTES PRIX
  // ========================================

  /**
   * Activer l'alerte prix pour un favori
   * POST /api/favoris/{id}/activer-alerte/
   */
  async activerAlertePrix(id, prixCible = null) {
    try {
      const response = await api.post(`/favoris/${id}/activer-alerte/`, {
        prix_cible: prixCible,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Désactiver l'alerte prix pour un favori
   * POST /api/favoris/{id}/desactiver-alerte/
   */
  async desactiverAlertePrix(id) {
    try {
      const response = await api.post(`/favoris/${id}/desactiver-alerte/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer mes alertes prix actives
   * GET /api/favoris/alertes/
   */
  async getMesAlertes() {
    try {
      const response = await api.get('/favoris/alertes/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les baisses de prix détectées
   * GET /api/favoris/baisses-prix/
   */
  async getBaissesPrix() {
    try {
      const response = await api.get('/favoris/baisses-prix/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // STATISTIQUES
  // ========================================

  /**
   * Compter mes favoris
   * GET /api/favoris/count/
   */
  async compterFavoris() {
    try {
      const response = await api.get('/favoris/count/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les statistiques de favoris
   * GET /api/favoris/statistiques/
   */
  async getStatistiques() {
    try {
      const response = await api.get('/favoris/statistiques/');
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

export default favoriService;