import api from './api';

/**
 * Service pour gérer les demandes de contact via l'API
 * Endpoints: /api/demands/
 */
const demandeService = {
  // ========================================
  // DEMANDES - LECTURE
  // ========================================

  /**
   * Récupérer toutes les demandes (avec filtres)
   * GET /api/demands/
   */
  async getAllDemandes(params = {}) {
    try {
      const response = await api.get('/demands/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer une demande par ID
   * GET /api/demands/{id}/
   */
  async getDemande(id) {
    try {
      const response = await api.get(`/demands/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CLIENT - MES DEMANDES
  // ========================================

  /**
   * Récupérer mes demandes (client connecté)
   * GET /api/demands/mes_demandes/
   */
  async getMesDemandes(params = {}) {
    try {
      const response = await api.get('/demands/mes_demandes/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créer une nouvelle demande
   * POST /api/demands/
   * 
   * Types de demande: CONTACT, ESSAI, DEVIS, INFORMATION
   */
  async creerDemande(data) {
    try {
      const response = await api.post('/demands/', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créer une demande de contact
   */
  async creerDemandeContact(vehiculeId, objet, message) {
    return this.creerDemande({
      vehicule_id: vehiculeId,
      type_demande: 'CONTACT',
      objet,
      message,
    });
  },

  /**
   * Créer une demande d'essai
   */
  async creerDemandeEssai(vehiculeId, dateEssai, heureEssai, message = '') {
    return this.creerDemande({
      vehicule_id: vehiculeId,
      type_demande: 'ESSAI',
      objet: `Demande d'essai pour le ${dateEssai}`,
      message,
      date_essai: dateEssai,
      heure_essai: heureEssai,
    });
  },

  /**
   * Créer une demande de devis
   */
  async creerDemandeDevis(vehiculeId, dateDebut, dateFin, optionsSupp = '', message = '') {
    return this.creerDemande({
      vehicule_id: vehiculeId,
      type_demande: 'DEVIS',
      objet: `Demande de devis du ${dateDebut} au ${dateFin}`,
      message,
      date_debut_souhaitee: dateDebut,
      date_fin_souhaitee: dateFin,
      options_supplementaires: optionsSupp,
    });
  },

  /**
   * Créer une demande d'information
   */
  async creerDemandeInformation(vehiculeId, objet, message) {
    return this.creerDemande({
      vehicule_id: vehiculeId,
      type_demande: 'INFORMATION',
      objet,
      message,
    });
  },

  /**
   * Annuler une demande (si en attente)
   * DELETE /api/demands/{id}/
   */
  async annulerDemande(id) {
    try {
      const response = await api.delete(`/demands/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CONCESSIONNAIRE - DEMANDES REÇUES
  // ========================================

  /**
   * Récupérer les demandes reçues (concessionnaire)
   * GET /api/demands/demandes-recues/
   */
  async getDemandesRecues(params = {}) {
    try {
      const response = await api.get('/demands/demandes-recues/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Répondre à une demande
   * PATCH /api/demands/{id}/repondre/
   */
  async repondreDemande(id, reponse) {
    try {
      const response = await api.patch(`/demands/${id}/repondre/`, {
        reponse,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Marquer une demande en cours de traitement
   * PATCH /api/demands/{id}/marquer-en-cours/
   */
  async marquerEnCours(id) {
    try {
      const response = await api.patch(`/demands/${id}/marquer-en-cours/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Ajouter des notes internes (concessionnaire)
   * PATCH /api/demands/{id}/notes/
   */
  async ajouterNotes(id, notes) {
    try {
      const response = await api.patch(`/demands/${id}/notes/`, {
        notes_internes: notes,
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
   * Statistiques des demandes
   * GET /api/demands/statistiques/
   */
  async getStatistiques() {
    try {
      const response = await api.get('/demands/statistiques/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // FILTRES PRÉDÉFINIS
  // ========================================

  /**
   * Récupérer les demandes en attente
   */
  async getDemandesEnAttente() {
    return this.getDemandesRecues({ statut: 'EN_ATTENTE' });
  },

  /**
   * Récupérer les demandes en cours
   */
  async getDemandesEnCours() {
    return this.getDemandesRecues({ statut: 'EN_COURS' });
  },

  /**
   * Récupérer les demandes traitées
   */
  async getDemandesTraitees() {
    return this.getDemandesRecues({ statut: 'TRAITEE' });
  },

  /**
   * Récupérer les demandes par type
   */
  async getDemandesParType(type) {
    return this.getDemandesRecues({ type_demande: type });
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

export default demandeService;