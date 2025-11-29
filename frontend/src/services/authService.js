import api from './api';

/**
 * Service d'authentification
 * Gère toutes les interactions avec l'API d'authentification
 */

const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise} Réponse de l'API
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register/', userData);

      // Si l'inscription réussit, sauvegarder les tokens
      if (response.data.tokens) {
        this.setTokens(response.data.tokens);
        this.setUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Connexion d'un utilisateur
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise} Réponse de l'API
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login/', {
        email,
        password
      });

      // Sauvegarder les tokens et les infos utilisateur
      if (response.data.tokens) {
        this.setTokens(response.data.tokens);
        this.setUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Déconnexion de l'utilisateur
   */
  async logout() {
    try {
      const refreshToken = this.getRefreshToken();

      if (refreshToken) {
        // Appeler l'API de logout pour blacklister le token
        await api.post('/auth/logout/', {
          refresh: refreshToken
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Supprimer les tokens du localStorage dans tous les cas
      this.clearTokens();
    }
  },

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile() {
    try {
      const response = await api.get('/auth/profile/');
      this.setUser(response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer la progression du profil
   */
  async getProfileProgress() {
    try {
      const response = await api.get('/auth/profile/progress/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Mettre à jour le profil
   * @param {Object} userData - Données à mettre à jour
   */
  async updateProfile(userData) {
    try {
      // Déterminer si on a un fichier à uploader
      const hasFile = userData instanceof FormData;

      // Configurer les headers selon le type de données
      const config = hasFile ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {};

      const response = await api.patch('/auth/profile/', userData, config);
      this.setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Changer le mot de passe
   */
  async changePassword(oldPassword, newPassword, newPassword2) {
    try {
      const response = await api.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // PARAMÈTRES / PRÉFÉRENCES ✅ NOUVEAU
  // ========================================

  /**
   * Récupérer les paramètres/préférences de l'utilisateur
   * GET /api/auth/parametres/
   * @returns {Promise} Préférences de l'utilisateur
   */
  async getParametres() {
    try {
      const response = await api.get('/auth/parametres/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Mettre à jour les paramètres/préférences
   * PATCH /api/auth/parametres/
   * @param {Object} preferences - Préférences à mettre à jour
   * @returns {Promise} Réponse de l'API
   */
  async updateParametres(preferences) {
    try {
      const response = await api.patch('/auth/parametres/', preferences);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ========================================
  // TOKENS JWT
  // ========================================

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }

      const response = await api.post('/auth/token/refresh/', {
        refresh: refreshToken
      });

      // Mettre à jour uniquement l'access token
      this.setAccessToken(response.data.access);

      return response.data.access;
    } catch (error) {
      // Si le refresh échoue, déconnecter l'utilisateur
      this.clearTokens();
      throw error;
    }
  },

  // ========================================
  // GESTION DU LOCALSTORAGE
  // ========================================

  /**
   * Sauvegarder les tokens dans localStorage
   */
  setTokens(tokens) {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  },

  /**
   * Sauvegarder uniquement l'access token
   */
  setAccessToken(token) {
    localStorage.setItem('access_token', token);
  },

  /**
   * Récupérer l'access token
   */
  getAccessToken() {
    return localStorage.getItem('access_token');
  },

  /**
   * Récupérer le refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  },

  /**
   * Sauvegarder les infos utilisateur
   */
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Récupérer les infos utilisateur
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Supprimer tous les tokens et infos utilisateur
   */
  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  },

  /**
   * Récupérer le type d'utilisateur (CLIENT, CONCESSIONNAIRE, ADMINISTRATEUR)
   */
  getUserType() {
    const user = this.getUser();
    return user ? user.type_utilisateur : null;
  },

  /**
   * Vérifier si l'utilisateur est un client
   */
  isClient() {
    return this.getUserType() === 'CLIENT';
  },

  /**
   * Vérifier si l'utilisateur est un concessionnaire
   */
  isConcessionnaire() {
    return this.getUserType() === 'CONCESSIONNAIRE';
  },

  /**
   * Vérifier si l'utilisateur est un administrateur
   */
  isAdmin() {
    return this.getUserType() === 'ADMINISTRATEUR';
  },

  // ========================================
  // GESTION DES ERREURS
  // ========================================

  /**
   * Gérer les erreurs de l'API
   */
  handleError(error) {
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      const message = error.response.data.detail ||
        error.response.data.message ||
        this.formatErrors(error.response.data) ||
        'Une erreur est survenue';

      return {
        message,
        status: error.response.status,
        errors: error.response.data
      };
    } else if (error.request) {
      // La requête a été faite mais pas de réponse
      return {
        message: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
        status: 0
      };
    } else {
      // Erreur lors de la configuration de la requête
      return {
        message: error.message || 'Une erreur est survenue',
        status: 0
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
  }
};

export default authService;