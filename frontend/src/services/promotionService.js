import api from './api';

/**
 * Service pour gérer les promotions via l'API
 * Endpoints: /api/promotions/
 */
const promotionService = {
  // ========================================
  // PROMOTIONS - LECTURE PUBLIQUE
  // ========================================

  /**
   * Récupérer toutes les promotions actives
   * GET /api/promotions/
   */
  async getAllPromotions(params = {}) {
    try {
      const response = await api.get('/promotions/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer une promotion par ID
   * GET /api/promotions/{id}/
   */
  async getPromotion(id) {
    try {
      const response = await api.get(`/promotions/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les promotions d'un véhicule
   * GET /api/promotions/?vehicule={id}
   */
  async getPromotionsVehicule(vehiculeId) {
    try {
      const response = await api.get('/promotions/', {
        params: { vehicule: vehiculeId },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les promotions d'une concession
   * GET /api/promotions/?concession={id}
   */
  async getPromotionsConcession(concessionId) {
    try {
      const response = await api.get('/promotions/', {
        params: { concession: concessionId },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // VÉRIFICATION DE CODE PROMO
  // ========================================

  /**
   * Vérifier un code promo
   * POST /api/promotions/verifier-code/
   */
  async verifierCode(code, vehiculeId = null, montant = null) {
    try {
      const response = await api.post('/promotions/verifier-code/', {
        code,
        vehicule_id: vehiculeId,
        montant,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Calculer la réduction d'un code promo
   * POST /api/promotions/calculer-reduction/
   */
  async calculerReduction(code, montantOriginal, vehiculeId = null) {
    try {
      const response = await api.post('/promotions/calculer-reduction/', {
        code,
        montant_original: montantOriginal,
        vehicule_id: vehiculeId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CONCESSIONNAIRE - MES PROMOTIONS
  // ========================================

  /**
   * Récupérer mes promotions (concessionnaire)
   * GET /api/promotions/mes-promotions/
   */
  async getMesPromotions(params = {}) {
    try {
      const response = await api.get('/promotions/mes-promotions/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créer une nouvelle promotion
   * POST /api/promotions/
   */
  async creerPromotion(data) {
    try {
      const response = await api.post('/promotions/', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créer une promotion pourcentage
   */
  async creerPromotionPourcentage(data) {
    return this.creerPromotion({
      ...data,
      type_reduction: 'POURCENTAGE',
    });
  },

  /**
   * Créer une promotion montant fixe
   */
  async creerPromotionMontant(data) {
    return this.creerPromotion({
      ...data,
      type_reduction: 'MONTANT_FIXE',
    });
  },

  /**
   * Modifier une promotion
   * PATCH /api/promotions/{id}/
   */
  async modifierPromotion(id, data) {
    try {
      const response = await api.patch(`/promotions/${id}/`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer une promotion
   * DELETE /api/promotions/{id}/
   */
  async supprimerPromotion(id) {
    try {
      const response = await api.delete(`/promotions/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Activer une promotion
   * POST /api/promotions/{id}/activer/
   */
  async activerPromotion(id) {
    try {
      const response = await api.post(`/promotions/${id}/activer/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Désactiver une promotion
   * POST /api/promotions/{id}/desactiver/
   */
  async desactiverPromotion(id) {
    try {
      const response = await api.post(`/promotions/${id}/desactiver/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Prolonger une promotion
   * POST /api/promotions/{id}/prolonger/
   */
  async prolongerPromotion(id, nouvelleDateFin) {
    try {
      const response = await api.post(`/promotions/${id}/prolonger/`, {
        nouvelle_date_fin: nouvelleDateFin,
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
   * Récupérer les statistiques de promotions
   * GET /api/promotions/statistiques/
   */
  async getStatistiques() {
    try {
      const response = await api.get('/promotions/statistiques/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer l'historique d'utilisation d'une promotion
   * GET /api/promotions/{id}/historique/
   */
  async getHistoriqueUtilisation(id) {
    try {
      const response = await api.get(`/promotions/${id}/historique/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // FILTRES PRÉDÉFINIS
  // ========================================

  /**
   * Récupérer les promotions actives uniquement
   */
  async getPromotionsActives() {
    return this.getMesPromotions({ statut: 'ACTIF' });
  },

  /**
   * Récupérer les promotions inactives
   */
  async getPromotionsInactives() {
    return this.getMesPromotions({ statut: 'INACTIF' });
  },

  /**
   * Récupérer les promotions expirées
   */
  async getPromotionsExpirees() {
    return this.getMesPromotions({ statut: 'EXPIRE' });
  },


  // Dans promotionService.js

  /**
   * Toggle activation d'une promotion
   */
  async togglePromotion(id, estActive) {
    return estActive
      ? this.activerPromotion(id)
      : this.desactiverPromotion(id);
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

export default promotionService;