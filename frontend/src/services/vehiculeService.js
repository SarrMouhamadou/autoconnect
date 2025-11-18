import api from './api';

/**
 * Service pour gérer les véhicules via l'API
 */
const vehiculeService = {
  /**
   * Récupérer tous les véhicules (publics)
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
   * Créer un véhicule
   */
  async createVehicule(formData) {
    try {
      const response = await api.post('/vehicules/', formData, {
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
   * Mettre à jour un véhicule
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
   * Supprimer une image
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
   * Changer le statut d'un véhicule
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
   * Gérer les erreurs
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