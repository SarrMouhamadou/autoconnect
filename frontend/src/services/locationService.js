import api from './api';

/**
 * Service pour gérer les locations via l'API
 * Endpoints: /api/locations/
 */
const locationService = {
  // ========================================
  // LOCATIONS - LECTURE
  // ========================================

  /**
   * Récupérer toutes les locations (avec filtres)
   * GET /api/locations/
   */
  async getAllLocations(params = {}) {
    try {
      const response = await api.get('/locations/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer une location par ID
   * GET /api/locations/{id}/
   */
  async getLocation(id) {
    try {
      const response = await api.get(`/locations/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CLIENT - MES LOCATIONS
  // ========================================

  /**
   * Récupérer mes locations (client connecté)
   * GET /api/locations/mes-locations/
   */
  async getMesLocations(params = {}) {
    try {
      const response = await api.get('/locations/mes-locations/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer mes locations en cours
   * GET /api/locations/en-cours/
   */
  async getMesLocationsEnCours() {
    try {
      const response = await api.get('/locations/en-cours/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer l'historique de mes locations
   * GET /api/locations/historique/
   */
  async getHistoriqueLocations(params = {}) {
    try {
      const response = await api.get('/locations/historique/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CLIENT - CRÉER UNE DEMANDE DE LOCATION
  // ========================================

  /**
   * Créer une demande de location (réservation)
   * POST /api/locations/
   */
  async creerDemandeLocation(data) {
    try {
      const response = await api.post('/locations/', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Annuler une demande de location (si en attente)
   * POST /api/locations/{id}/annuler/
   */
  async annulerLocation(id, raison = '') {
    try {
      const response = await api.post(`/locations/${id}/annuler/`, { raison });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Prolonger une location
   * POST /api/locations/{id}/prolonger/
   */
  async prolongerLocation(id, nouvelleDateFin) {
    try {
      const response = await api.post(`/locations/${id}/prolonger/`, {
        nouvelle_date_fin: nouvelleDateFin,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CONCESSIONNAIRE - GESTION DES LOCATIONS
  // ========================================

  /**
   * Récupérer les locations de mes concessions
   * GET /api/locations/locations-recues/
   */
  async getLocationsRecues(params = {}) {
    try {
      const response = await api.get('/locations/locations-recues/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Confirmer une demande de location
   * POST /api/locations/{id}/confirmer/
   */
  async confirmerLocation(id) {
    try {
      const response = await api.post(`/locations/${id}/confirmer/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Refuser une demande de location
   * POST /api/locations/{id}/refuser/
   */
  async refuserLocation(id, raison = '') {
    try {
      const response = await api.post(`/locations/${id}/refuser/`, { raison });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Enregistrer le départ du véhicule
   * POST /api/locations/{id}/depart/
   */
  async enregistrerDepart(id, data) {
    try {
      const response = await api.post(`/locations/${id}/depart/`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Enregistrer le retour du véhicule
   * POST /api/locations/{id}/retour/
   */
  async enregistrerRetour(id, data) {
    try {
      const response = await api.post(`/locations/${id}/retour/`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Ajouter des notes concessionnaire
   * PATCH /api/locations/{id}/notes/
   */
  async ajouterNotes(id, notes) {
    try {
      const response = await api.patch(`/locations/${id}/notes/`, {
        notes_concessionnaire: notes,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CONTRAT
  // ========================================

  /**
   * Générer le contrat PDF
   * POST /api/locations/{id}/generer-contrat/
   */
  async genererContrat(id) {
    try {
      const response = await api.post(`/locations/${id}/generer-contrat/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Télécharger le contrat PDF
   * GET /api/locations/{id}/telecharger-contrat/
   */
  async telechargerContrat(id) {
    try {
      const response = await api.get(`/locations/${id}/telecharger-contrat/`, {
        responseType: 'blob',
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrat-location-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CALCULS & VÉRIFICATIONS
  // ========================================

  /**
   * Calculer le prix d'une location
   * POST /api/locations/calculer-prix/
   */
  async calculerPrix(vehiculeId, dateDebut, dateFin, codePromo = null) {
    try {
      const response = await api.post('/locations/calculer-prix/', {
        vehicule_id: vehiculeId,
        date_debut: dateDebut,
        date_fin: dateFin,
        code_promo: codePromo,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Vérifier la disponibilité d'un véhicule
   * GET /api/locations/verifier-disponibilite/
   */
  async verifierDisponibilite(vehiculeId, dateDebut, dateFin) {
    try {
      const response = await api.get('/locations/verifier-disponibilite/', {
        params: {
          vehicule_id: vehiculeId,
          date_debut: dateDebut,
          date_fin: dateFin,
        },
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
   * Statistiques des locations
   * GET /api/locations/statistiques/
   */
  async getStatistiques() {
    try {
      const response = await api.get('/locations/statistiques/');
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

export default locationService;