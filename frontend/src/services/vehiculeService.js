import api from './api';

/**
 * Service pour gérer les véhicules via l'API
 */
const vehiculeService = {
  /**
   * Récupérer tous les véhicules (publics) avec filtres
   * @param {Object} params - Paramètres de recherche/filtre
   * @returns {Promise}
   */
  async getAllVehicules(params = {}) {
    try {
      const response = await api.get('/vehicules/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer mes véhicules (concessionnaire)
   * @param {Object} params - Paramètres de recherche/filtre
   * @returns {Promise}
   */
  async getMesVehicules(params = {}) {
    try {
      const response = await api.get('/vehicules/mes_vehicules/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer un véhicule par ID
   * @param {number} id - ID du véhicule
   * @returns {Promise}
   */
  async getVehicule(id) {
    try {
      const response = await api.get(`/vehicules/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Alias pour getVehicule (compatibilité)
   * @param {number} id - ID du véhicule
   * @returns {Promise}
   */
  async getVehiculeById(id) {
    return this.getVehicule(id);
  },

  /**
   * Rechercher des véhicules
   * @param {string} query - Terme de recherche
   * @returns {Promise}
   */
  async searchVehicules(query) {
    try {
      const response = await api.get('/vehicules/', {
        params: { search: query }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créer un véhicule
   * @param {Object|FormData} formData - Données du véhicule
   * @returns {Promise}
   */
  async createVehicule(formData) {
    try {
      const response = await api.post('/vehicules/', formData, {
        headers: {
          'Content-Type': formData instanceof FormData
            ? 'multipart/form-data'
            : 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Mettre à jour un véhicule
   * @param {number} id - ID du véhicule
   * @param {Object|FormData} formData - Données à mettre à jour
   * @returns {Promise}
   */
  async updateVehicule(id, formData) {
    try {
      const response = await api.patch(`/vehicules/${id}/`, formData, {
        headers: {
          'Content-Type': formData instanceof FormData
            ? 'multipart/form-data'
            : 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer un véhicule
   * @param {number} id - ID du véhicule
   * @returns {Promise}
   */
  async deleteVehicule(id) {
    try {
      const response = await api.delete(`/vehicules/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Ajouter des images à un véhicule
   * @param {number} id - ID du véhicule
   * @param {Array} images - Liste des fichiers images
   * @returns {Promise}
   */
  async ajouterImages(id, images) {
    try {
      const formData = new FormData();
      images.forEach(image => {
        formData.append('images', image);
      });

      const response = await api.post(`/vehicules/${id}/ajouter_images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Uploader une photo pour un véhicule (alias)
   * @param {number} vehiculeId - ID du véhicule
   * @param {FormData} formData - Données de la photo
   * @returns {Promise}
   */
  async uploadPhoto(vehiculeId, formData) {
    try {
      const response = await api.post(
        `/vehicules/${vehiculeId}/photos/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer une image
   * @param {number} vehiculeId - ID du véhicule
   * @param {number} imageId - ID de l'image
   * @returns {Promise}
   */
  async supprimerImage(vehiculeId, imageId) {
    try {
      const response = await api.delete(`/vehicules/${vehiculeId}/supprimer-image/${imageId}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer une photo (alias)
   * @param {number} vehiculeId - ID du véhicule
   * @param {number} photoId - ID de la photo
   * @returns {Promise}
   */
  async deletePhoto(vehiculeId, photoId) {
    return this.supprimerImage(vehiculeId, photoId);
  },

  /**
   * Uploader une vidéo pour un véhicule
   * @param {number} vehiculeId - ID du véhicule
   * @param {FormData} formData - Données de la vidéo
   * @returns {Promise}
   */
  async uploadVideo(vehiculeId, formData) {
    try {
      const response = await api.post(
        `/vehicules/${vehiculeId}/videos/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Changer le statut d'un véhicule
   * @param {number} id - ID du véhicule
   * @param {string} statut - Nouveau statut
   * @param {boolean} estDisponible - Disponibilité
   * @returns {Promise}
   */
  async changerStatut(id, statut, estDisponible = null) {
    try {
      const response = await api.post(`/vehicules/${id}/changer_statut/`, {
        statut,
        est_disponible: estDisponible,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les statistiques d'un véhicule
   * @param {number} id - ID du véhicule
   * @returns {Promise}
   */
  async getStatistiques(id) {
    try {
      const response = await api.get(`/vehicules/${id}/statistiques/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les équipements disponibles
   * @returns {Promise}
   */
  async getEquipements() {
    try {
      const response = await api.get('/equipements/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer toutes les marques
   * @returns {Promise}
   */
  async getMarques() {
    try {
      const response = await api.get('/vehicules/marques/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer toutes les catégories
   * @returns {Promise}
   */
  async getCategories() {
    try {
      const response = await api.get('/vehicules/categories/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les véhicules similaires
   * @param {number} id - ID du véhicule de référence
   * @returns {Promise}
   */
  async getSimilarVehicules(id) {
    try {
      const response = await api.get(`/vehicules/${id}/similaires/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Vérifier la disponibilité d'un véhicule pour des dates données
   * @param {number} id - ID du véhicule
   * @param {Object} dates - { date_debut, date_fin }
   * @returns {Promise}
   */
  async checkDisponibilite(id, dates) {
    try {
      const response = await api.post(`/vehicules/${id}/check_disponibilite/`, dates);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Gérer les erreurs
   * @param {Error} error - Erreur à gérer
   * @returns {Object}
   */
  handleError(error) {
    if (error.response) {
      const message = error.response.data.detail ||
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

  /**
   * Formater les erreurs de validation
   * @param {Object|string} errors - Erreurs à formater
   * @returns {string}
   */
  formatErrors(errors) {
    if (typeof errors === 'string') {
      return errors;
    }

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

export default vehiculeService;