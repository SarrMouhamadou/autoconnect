import api from './api';

/**
 * Service pour gérer les clients (concessionnaire)
 * Endpoints: /api/clients/
 */
const clientService = {
    /**
     * Récupérer mes clients (concessionnaire)
     * GET /api/clients/mes-clients/
     */
    async getMesClients(params = {}) {
        try {
            const response = await api.get('/clients/mes-clients/', { params });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /**
     * Récupérer un client par ID
     * GET /api/clients/{id}/
     */
    async getClient(id) {
        try {
            const response = await api.get(`/clients/${id}/`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /**
     * Statistiques d'un client
     * GET /api/clients/{id}/statistiques/
     */
    async getStatistiquesClient(id) {
        try {
            const response = await api.get(`/clients/${id}/statistiques/`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /**
     * Historique des locations d'un client
     * GET /api/clients/{id}/locations/
     */
    async getLocationsClient(id) {
        try {
            const response = await api.get(`/clients/${id}/locations/`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Gestion des erreurs
    handleError(error) {
        if (error.response) {
            const message =
                error.response.data.detail ||
                error.response.data.message ||
                'Une erreur est survenue';

            return {
                message,
                status: error.response.status,
                errors: error.response.data,
            };
        } else if (error.request) {
            return {
                message: 'Impossible de contacter le serveur.',
                status: 0,
            };
        } else {
            return {
                message: error.message || 'Une erreur est survenue',
                status: 0,
            };
        }
    },
};

export default clientService;