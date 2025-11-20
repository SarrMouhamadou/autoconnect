import api from './api';

/**
 * Service pour gérer les concessions et régions via l'API
 */
const concessionService = {
  // ========================================
  // RÉGIONS
  // ========================================

  /**
   * Récupérer toutes les régions
   */
  async getAllRegions() {
    try {
      const response = await api.get('/regions/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer une région par ID
   */
  async getRegion(id) {
    try {
      const response = await api.get(`/regions/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les concessions d'une région
   */
  async getRegionConcessions(id) {
    try {
      const response = await api.get(`/regions/${id}/concessions/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CONCESSIONS - PUBLIC
  // ========================================

  /**
   * Récupérer toutes les concessions (publiques validées)
   */
  async getAllConcessions(params = {}) {
    try {
      const response = await api.get('/concessions/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer une concession par ID
   */
  async getConcession(id) {
    try {
      const response = await api.get(`/concessions/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Rechercher des concessions par proximité GPS
   */
  async searchByProximity(latitude, longitude, rayon = 10) {
    try {
      const response = await api.get('/concessions/recherche_proximite/', {
        params: { latitude, longitude, rayon }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CONCESSIONS - CONCESSIONNAIRE
  // ========================================

  /**
   * Récupérer mes concessions (concessionnaire connecté)
   */
  async getMesConcessions() {
    try {
      const response = await api.get('/concessions/mes_concessions/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créer une nouvelle concession
   */
  async createConcession(formData) {
    try {
      const response = await api.post('/concessions/', formData, {
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
   * Mettre à jour une concession
   */
  async updateConcession(id, formData) {
    try {
      const response = await api.patch(`/concessions/${id}/`, formData, {
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
   * Supprimer une concession
   */
  async deleteConcession(id) {
    try {
      const response = await api.delete(`/concessions/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CONCESSIONS - ADMIN
  // ========================================

  /**
   * Récupérer les concessions en attente de validation
   */
  async getConcessionsEnAttente() {
    try {
      const response = await api.get('/concessions/en_attente/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Valider une concession
   */
  async validerConcession(id) {
    try {
      const response = await api.post(`/concessions/${id}/valider/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Rejeter une concession
   */
  async rejeterConcession(id, raisonRejet) {
    try {
      const response = await api.post(`/concessions/${id}/rejeter/`, {
        raison_rejet: raisonRejet
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Suspendre une concession
   */
  async suspendreConcession(id, raison = '') {
    try {
      const response = await api.post(`/concessions/${id}/suspendre/`, {
        raison: raison
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les statistiques globales
   */
  async getStatistiques() {
    try {
      const response = await api.get('/concessions/statistiques/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // GÉOLOCALISATION
  // ========================================

  /**
   * Obtenir la position GPS de l'utilisateur
   */
  async getUserPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La géolocalisation n\'est pas supportée par votre navigateur'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Erreur de géolocalisation';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permission de géolocalisation refusée';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Position indisponible';
              break;
            case error.TIMEOUT:
              message = 'Délai de géolocalisation dépassé';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  },

  /**
   * Calculer la distance entre deux points GPS (formule de Haversine)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Arrondi à 1 décimale
  },

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  },

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Formater l'adresse complète
   */
  formatAdresse(concession) {
    const parts = [concession.adresse, concession.ville];
    if (concession.code_postal) {
      parts.push(concession.code_postal);
    }
    if (concession.region?.nom) {
      parts.push(concession.region.nom);
    }
    return parts.join(', ');
  },

  /**
   * Obtenir le label du statut
   */
  getStatutLabel(statut) {
    const labels = {
      'EN_ATTENTE': 'En attente',
      'VALIDE': 'Validé',
      'SUSPENDU': 'Suspendu',
      'REJETE': 'Rejeté'
    };
    return labels[statut] || statut;
  },

  /**
   * Obtenir la couleur du statut
   */
  getStatutColor(statut) {
    const colors = {
      'EN_ATTENTE': 'yellow',
      'VALIDE': 'green',
      'SUSPENDU': 'orange',
      'REJETE': 'red'
    };
    return colors[statut] || 'gray';
  },

  /**
   * Gestion des erreurs
   */
  handleError(error) {
    if (error.response) {
      // Erreur de réponse du serveur
      const message = error.response.data?.message 
        || error.response.data?.error
        || error.response.data?.detail
        || 'Une erreur est survenue';
      
      return {
        message,
        status: error.response.status,
        errors: error.response.data
      };
    } else if (error.request) {
      // Pas de réponse du serveur
      return {
        message: 'Impossible de contacter le serveur',
        status: 0
      };
    } else {
      // Autre erreur
      return {
        message: error.message || 'Une erreur est survenue',
        status: -1
      };
    }
  }
};

export default concessionService;