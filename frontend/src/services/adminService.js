import api from './api';

/**
 * Service pour les fonctions d'administration
 * Endpoints: /api/admin/ et autres endpoints admin
 */
const adminService = {
  // ========================================
  // GESTION DES UTILISATEURS
  // ========================================

  /**
   * Récupérer tous les utilisateurs
   * GET /api/auth/admin/users/
   */
  async getAllUsers(params = {}) {
    try {
      const response = await api.get('/auth/admin/users/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer un utilisateur par ID
   * GET /api/auth/admin/users/{id}/
   */
  async getUser(id) {
    try {
      const response = await api.get(`/auth/admin/users/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les utilisateurs en attente de validation
   * GET /api/auth/admin/users/en-attente/
   */
  async getUsersEnAttente() {
    try {
      const response = await api.get('/auth/admin/users/', {
        params: {
          est_valide: false,
          type_utilisateur: 'CONCESSIONNAIRE'
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Valider un utilisateur (concessionnaire)
   * POST /api/auth/admin/users/{id}/valider/
   */
  async validerUser(id) {
    try {
      const response = await api.post(`/auth/admin/users/${id}/valider/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Rejeter un utilisateur
   * POST /api/auth/admin/users/{id}/rejeter/
   */
  async rejeterUser(id, raison = '') {
    try {
      const response = await api.post(`/auth/admin/users/${id}/rejeter/`, {
        raison,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Suspendre un utilisateur
   * POST /api/auth/admin/users/{id}/suspendre/
   */
  async suspendreUser(id, raison = '') {
    try {
      const response = await api.post(`/auth/admin/users/${id}/suspendre/`, {
        raison,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Réactiver un utilisateur suspendu
   * POST /api/auth/admin/users/{id}/reactiver/
   */
  async reactiverUser(id) {
    try {
      const response = await api.post(`/auth/admin/users/${id}/reactiver/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer un utilisateur
   * DELETE /api/auth/admin/users/{id}/
   */
  async supprimerUser(id) {
    try {
      const response = await api.delete(`/auth/admin/users/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Changer le rôle d'un utilisateur
   * PATCH /api/auth/admin/users/{id}/role/
   */
  async changerRole(id, roleId) {
    try {
      const response = await api.patch(`/auth/admin/users/${id}/role/`, {
        role_id: roleId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // GESTION DES CONCESSIONS
  // ========================================

  /**
   * Récupérer toutes les concessions (admin)
   * GET /api/concessions/admin/all/
   */
  async getAllConcessions(params = {}) {
    try {
      const response = await api.get('/concessions/', {
        params: { ...params, admin: true }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les concessions en attente
   * GET /api/concessions/en_attente/
   */
  async getConcessionsEnAttente() {
    try {
      const response = await api.get('/concessions/', {
        params: {
          statut: 'EN_ATTENTE'
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Valider une concession
   * POST /api/concessions/{id}/valider/
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
   * POST /api/concessions/{id}/rejeter/
   */
  async rejeterConcession(id, raison = '') {
    try {
      const response = await api.post(`/concessions/${id}/rejeter/`, {
        raison_rejet: raison,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Suspendre une concession
   * POST /api/concessions/{id}/suspendre/
   */
  async suspendreConcession(id, raison = '') {
    try {
      const response = await api.post(`/concessions/${id}/suspendre/`, {
        raison,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Réactiver une concession
   * POST /api/concessions/{id}/reactiver/
   */
  async reactiverConcession(id) {
    try {
      const response = await api.post(`/concessions/${id}/reactiver/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // GESTION DES VÉHICULES (MODÉRATION)
  // ========================================

  /**
   * Récupérer les véhicules signalés
   * GET /api/vehicules/signales/
   */
  async getVehiculesSignales() {
    try {
      const response = await api.get('/vehicules/signales/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Modérer un véhicule
   * POST /api/vehicules/{id}/moderer/
   */
  async modererVehicule(id, action, raison = '') {
    try {
      const response = await api.post(`/vehicules/${id}/moderer/`, {
        action, // 'APPROUVER', 'REJETER', 'SUSPENDRE'
        raison,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // GESTION DES AVIS (MODÉRATION)
  // ========================================

  /**
   * Récupérer les avis signalés
   * GET /api/avis/signales/
   */
  async getAvisSignales() {
    try {
      const response = await api.get('/avis/signales/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Modérer un avis
   * POST /api/avis/{id}/moderer/
   */
  async modererAvis(id, action, raison = '') {
    try {
      const response = await api.post(`/avis/${id}/moderer/`, {
        action, // 'APPROUVER', 'REJETER', 'SUPPRIMER'
        raison,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // CONFIGURATION PLATEFORME
  // ========================================

  /**
   * Récupérer toutes les régions
   * GET /api/regions/
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
   * Créer une région
   * POST /api/regions/
   */
  async creerRegion(data) {
    try {
      const response = await api.post('/regions/', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Modifier une région
   * PATCH /api/regions/{id}/
   */
  async modifierRegion(id, data) {
    try {
      const response = await api.patch(`/regions/${id}/`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer une région
   * DELETE /api/regions/{id}/
   */
  async supprimerRegion(id) {
    try {
      const response = await api.delete(`/regions/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer toutes les catégories de véhicules
   * GET /api/vehicules/categories/
   */
  async getAllCategories() {
    try {
      const response = await api.get('/vehicules/categories/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer toutes les marques
   * GET /api/vehicules/marques/
   */
  async getAllMarques() {
    try {
      const response = await api.get('/vehicules/marques/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer tous les rôles
   * GET /api/auth/roles/
   */
  async getAllRoles() {
    try {
      const response = await api.get('/auth/roles/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // STATISTIQUES ADMIN
  // ========================================

  /**
   * Récupérer le dashboard admin
   * GET /api/statistiques/dashboard/admin/
   */
  async getDashboardStats() {
    try {
      const response = await api.get('/statistiques/dashboard/admin/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Exporter les données
   * GET /api/admin/export/{type}/
   */
  async exporterDonnees(type, format = 'csv') {
    try {
      const response = await api.get(`/admin/export/${type}/`, {
        params: { format },
        responseType: 'blob',
      });

      // Télécharger le fichier
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export-${type}-${Date.now()}.${format}`);
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
  // CONFIGURATION PLATEFORME (suite)
  // ========================================

  /**
   * Créer une catégorie
   */
  async creerCategorie(data) {
    try {
      const response = await api.post('/vehicules/categories/', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer une catégorie
   */
  async supprimerCategorie(id) {
    try {
      const response = await api.delete(`/vehicules/categories/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créer une marque
   */
  async creerMarque(data) {
    try {
      const response = await api.post('/vehicules/marques/', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer une marque
   */
  async supprimerMarque(id) {
    try {
      const response = await api.delete(`/vehicules/marques/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // COMMUNICATION
  // ========================================

  /**
   * Envoyer une newsletter
   */
  async envoyerNewsletter(data) {
    try {
      const response = await api.post('/communication/newsletter/', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Publier une annonce
   */
  async publierAnnonce(data) {
    try {
      const response = await api.post('/communication/annonce/', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // RÔLES & PERMISSIONS
  // ========================================

  /**
   * Récupérer toutes les permissions
   */
  async getAllPermissions() {
    try {
      const response = await api.get('/auth/permissions/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créer un rôle
   */
  async creerRole(data) {
    try {
      const response = await api.post('/auth/roles/', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Modifier un rôle
   */
  async modifierRole(id, data) {
    try {
      const response = await api.patch(`/auth/roles/${id}/`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer un rôle
   */
  async supprimerRole(id) {
    try {
      const response = await api.delete(`/auth/roles/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer tous les véhicules (admin)
   */
  async getAllVehicules(params = {}) {
    try {
      const response = await api.get('/vehicules/', {
        params: { ...params, admin: true }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer tous les avis (admin)
   */
  async getAllAvis(params = {}) {
    try {
      const response = await api.get('/avis/', {
        params: { ...params, admin: true }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer un avis
   */
  async supprimerAvis(id) {
    try {
      const response = await api.delete(`/avis/${id}/`);
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

export default adminService;