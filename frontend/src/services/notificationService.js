import api from './api';

/**
 * Service pour gérer les notifications via l'API
 * Endpoints: /api/notifications/
 */
const notificationService = {
  // ========================================
  // MES NOTIFICATIONS
  // ========================================

  /**
   * Récupérer toutes mes notifications
   * GET /api/notifications/
   */
  async getMesNotifications(params = {}) {
    try {
      const response = await api.get('/notifications/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer une notification par ID
   * GET /api/notifications/{id}/
   */
  async getNotification(id) {
    try {
      const response = await api.get(`/notifications/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les notifications non lues
   * GET /api/notifications/non-lues/
   */
  async getNotificationsNonLues() {
    try {
      const response = await api.get('/notifications/non-lues/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Compter les notifications non lues
   * GET /api/notifications/count-non-lues/
   */
  async compterNonLues() {
    try {
      const response = await api.get('/notifications/count-non-lues/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // ACTIONS SUR LES NOTIFICATIONS
  // ========================================

  /**
   * Marquer une notification comme lue
   * POST /api/notifications/{id}/marquer-lue/
   */
  async marquerCommeLue(id) {
    try {
      const response = await api.post(`/notifications/${id}/marquer-lue/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Marquer toutes les notifications comme lues
   * POST /api/notifications/marquer-toutes-lues/
   */
  async marquerToutesCommeLues() {
    try {
      const response = await api.post('/notifications/marquer-toutes-lues/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer une notification
   * DELETE /api/notifications/{id}/
   */
  async supprimerNotification(id) {
    try {
      const response = await api.delete(`/notifications/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer toutes les notifications lues
   * DELETE /api/notifications/supprimer-lues/
   */
  async supprimerNotificationsLues() {
    try {
      const response = await api.delete('/notifications/supprimer-lues/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // FILTRES PAR TYPE
  // ========================================

  /**
   * Récupérer les notifications par type
   * Types: DEMANDE, LOCATION, PROMOTION, SYSTEME, AVIS
   */
  async getNotificationsParType(type) {
    try {
      const response = await api.get('/notifications/', {
        params: { type },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Notifications de demandes
   */
  async getNotificationsDemandes() {
    return this.getNotificationsParType('DEMANDE');
  },

  /**
   * Notifications de locations
   */
  async getNotificationsLocations() {
    return this.getNotificationsParType('LOCATION');
  },

  /**
   * Notifications de promotions
   */
  async getNotificationsPromotions() {
    return this.getNotificationsParType('PROMOTION');
  },

  /**
   * Notifications système
   */
  async getNotificationsSysteme() {
    return this.getNotificationsParType('SYSTEME');
  },

  /**
   * Notifications d'avis
   */
  async getNotificationsAvis() {
    return this.getNotificationsParType('AVIS');
  },

  // ========================================
  // PRÉFÉRENCES DE NOTIFICATION
  // ========================================

  /**
   * Récupérer les préférences de notification
   * GET /api/notifications/preferences/
   */
  async getPreferences() {
    try {
      const response = await api.get('/notifications/preferences/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Mettre à jour les préférences de notification
   * PATCH /api/notifications/preferences/
   */
  async updatePreferences(preferences) {
    try {
      const response = await api.patch('/notifications/preferences/', preferences);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // ADMIN - ENVOI DE NOTIFICATIONS
  // ========================================

  /**
   * Envoyer une notification à un utilisateur (admin)
   * POST /api/notifications/envoyer/
   */
  async envoyerNotification(destinataireId, titre, message, type = 'SYSTEME') {
    try {
      const response = await api.post('/notifications/envoyer/', {
        destinataire_id: destinataireId,
        titre,
        message,
        type,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Envoyer une notification à tous les utilisateurs (admin)
   * POST /api/notifications/envoyer-tous/
   */
  async envoyerNotificationATous(titre, message, type = 'SYSTEME', filtres = {}) {
    try {
      const response = await api.post('/notifications/envoyer-tous/', {
        titre,
        message,
        type,
        ...filtres,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Envoyer une notification aux concessionnaires (admin)
   * POST /api/notifications/envoyer-concessionnaires/
   */
  async envoyerAuxConcessionnaires(titre, message) {
    try {
      const response = await api.post('/notifications/envoyer-concessionnaires/', {
        titre,
        message,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Envoyer une notification aux clients (admin)
   * POST /api/notifications/envoyer-clients/
   */
  async envoyerAuxClients(titre, message) {
    try {
      const response = await api.post('/notifications/envoyer-clients/', {
        titre,
        message,
      });
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

export default notificationService;