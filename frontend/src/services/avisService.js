import api from './api';

/**
 * Service pour gérer les avis via l'API
 * Endpoints: /api/avis/
 */
const avisService = {
  // ========================================
  // AVIS - LECTURE PUBLIQUE
  // ========================================

  /**
   * Récupérer tous les avis (avec filtres)
   * GET /api/avis/
   */
  async getAllAvis(params = {}) {
    try {
      const response = await api.get('/avis/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer un avis par ID
   * GET /api/avis/{id}/
   */
  async getAvis(id) {
    try {
      const response = await api.get(`/avis/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les avis d'un véhicule
   * GET /api/avis/?vehicule={id}
   */
  async getAvisVehicule(vehiculeId, params = {}) {
    try {
      const response = await api.get('/avis/', {
        params: { vehicule: vehiculeId, ...params },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les avis d'une concession
   * GET /api/avis/?concession={id}
   */
  async getAvisConcession(concessionId, params = {}) {
    try {
      const response = await api.get('/avis/', {
        params: { concession: concessionId, ...params },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CLIENT - MES AVIS
  // ========================================

  /**
   * Récupérer mes avis (client connecté)
   * GET /api/avis/mes_avis/
   */
  async getMesAvis(params = {}) {
    try {
      const response = await api.get('/avis/mes_avis/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créer un nouvel avis
   * POST /api/avis/
   */
  async creerAvis(data) {
    try {
      const response = await api.post('/avis/', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créer un avis sur un véhicule
   */
  async creerAvisVehicule(vehiculeId, note, commentaire, recommande = true) {
    return this.creerAvis({
      vehicule_id: vehiculeId,
      type_avis: 'VEHICULE',
      note,
      commentaire,
      recommande,
    });
  },

  /**
   * Créer un avis sur une concession
   */
  async creerAvisConcession(concessionId, note, commentaire, recommande = true) {
    return this.creerAvis({
      concession_id: concessionId,
      type_avis: 'CONCESSION',
      note,
      commentaire,
      recommande,
    });
  },

  /**
   * Créer un avis sur une location
   */
  async creerAvisLocation(locationId, note, commentaire, recommande = true) {
    return this.creerAvis({
      location_id: locationId,
      type_avis: 'LOCATION',
      note,
      commentaire,
      recommande,
    });
  },

  /**
   * Modifier un avis
   * PATCH /api/avis/{id}/
   */
  async modifierAvis(id, data) {
    try {
      const response = await api.patch(`/avis/${id}/`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer un avis
   * DELETE /api/avis/{id}/
   */
  async supprimerAvis(id) {
    try {
      const response = await api.delete(`/avis/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Vérifier si l'utilisateur peut donner un avis sur une location
   * GET /api/avis/peut-noter/{locationId}/
   */
  async peutNoterLocation(locationId) {
    try {
      const response = await api.get(`/avis/peut-noter/${locationId}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CONCESSIONNAIRE - AVIS REÇUS
  // ========================================

  /**
   * Récupérer les avis reçus (concessionnaire)
   * GET /api/avis/avis-recus/
   */
  async getAvisRecus(params = {}) {
    try {
      const response = await api.get('/avis/avis-recus/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Répondre à un avis
   * PATCH /api/avis/{id}/repondre/
   */
  async repondreAvis(id, reponse) {
    try {
      const response = await api.patch(`/avis/${id}/repondre/`, {
        reponse_concessionnaire: reponse,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Signaler un avis
   * POST /api/avis/{id}/signaler/
   */
  async signalerAvis(id, raison) {
    try {
      const response = await api.post(`/avis/${id}/signaler/`, {
        raison,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // ADMIN - MODÉRATION
  // ========================================

  /**
   * Récupérer les avis signalés (admin)
   * GET /api/avis/signales/
   */
  async getAvisSignales(params = {}) {
    try {
      const response = await api.get('/avis/signales/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Modérer un avis (approuver/rejeter)
   * POST /api/avis/{id}/moderer/
   */
  async modererAvis(id, action, raison = '') {
    try {
      const response = await api.post(`/avis/${id}/moderer/`, {
        action, // 'APPROUVER' ou 'REJETER'
        raison,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // STATISTIQUES
  // ========================================

  /**
   * Récupérer les statistiques d'avis
   * GET /api/avis/statistiques/
   */
  async getStatistiques() {
    try {
      const response = await api.get('/avis/statistiques/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer la note moyenne d'un véhicule
   */
  async getNoteMoyenneVehicule(vehiculeId) {
    try {
      const response = await api.get(`/avis/note-moyenne/vehicule/${vehiculeId}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer la note moyenne d'une concession
   */
  async getNoteMoyenneConcession(concessionId) {
    try {
      const response = await api.get(`/avis/note-moyenne/concession/${concessionId}/`);
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

export default avisService;