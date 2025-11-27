// frontend/src/services/historiqueService.js
// Service pour gérer l'historique des actions de l'utilisateur

import api from './api';

const historiqueService = {
    /**
     * Récupérer l'historique complet de l'utilisateur connecté
     * GET /api/historique/
     */
    getMonHistorique: async (params = {}) => {
        try {
            const response = await api.get('/historique/', { params });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                'Erreur lors de la récupération de l\'historique'
            );
        }
    },

    /**
     * Récupérer le détail d'une action de l'historique
     * GET /api/historique/{id}/
     */
    getDetailAction: async (id) => {
        try {
            const response = await api.get(`/historique/${id}/`);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                'Erreur lors de la récupération du détail de l\'action'
            );
        }
    },

    /**
     * Récupérer les statistiques de l'historique
     * GET /api/historique/statistiques/
     */
    getStatistiques: async () => {
        try {
            const response = await api.get('/historique/statistiques/');
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                'Erreur lors de la récupération des statistiques'
            );
        }
    },

    /**
     * Filtrer l'historique par type d'action
     * GET /api/historique/?type_action=CONSULTATION_VEHICULE
     */
    getHistoriqueParType: async (typeAction) => {
        try {
            const response = await api.get('/historique/', {
                params: { type_action: typeAction }
            });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                'Erreur lors du filtrage de l\'historique'
            );
        }
    },

    /**
     * Filtrer l'historique par période
     * GET /api/historique/?date_action__gte=2024-01-01&date_action__lte=2024-12-31
     */
    getHistoriqueParPeriode: async (dateDebut, dateFin) => {
        try {
            const params = {};
            if (dateDebut) params.date_action__gte = dateDebut;
            if (dateFin) params.date_action__lte = dateFin;

            const response = await api.get('/historique/', { params });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                'Erreur lors du filtrage de l\'historique par période'
            );
        }
    },

    /**
     * Récupérer l'historique des 7 derniers jours
     */
    getHistoriqueRecent: async () => {
        try {
            const dateLimite = new Date();
            dateLimite.setDate(dateLimite.getDate() - 7);
            const dateFormatted = dateLimite.toISOString().split('T')[0];

            const response = await api.get('/historique/', {
                params: { date_action__gte: dateFormatted }
            });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                'Erreur lors de la récupération de l\'historique récent'
            );
        }
    },

    /**
     * Récupérer l'historique des consultations de véhicules
     * GET /api/historique/?type_action=CONSULTATION_VEHICULE
     */
    getConsultationsVehicules: async () => {
        try {
            const response = await api.get('/historique/', {
                params: { type_action: 'CONSULTATION_VEHICULE' }
            });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                'Erreur lors de la récupération des consultations'
            );
        }
    },

    /**
     * Récupérer l'historique avec pagination
     * GET /api/historique/?page=1&page_size=10
     */
    getHistoriquePagine: async (page = 1, pageSize = 20) => {
        try {
            const response = await api.get('/historique/', {
                params: {
                    page,
                    page_size: pageSize
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                'Erreur lors de la récupération de l\'historique paginé'
            );
        }
    },

    /**
     * Récupérer l'historique trié par date
     * GET /api/historique/?ordering=-date_action
     */
    getHistoriqueTrie: async (ordre = '-date_action') => {
        try {
            const response = await api.get('/historique/', {
                params: { ordering: ordre }
            });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                'Erreur lors du tri de l\'historique'
            );
        }
    },

    /**
     * Rechercher dans l'historique
     * GET /api/historique/?search=toyota
     */
    rechercherHistorique: async (query) => {
        try {
            const response = await api.get('/historique/', {
                params: { search: query }
            });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                'Erreur lors de la recherche dans l\'historique'
            );
        }
    },

    /**
     * Enregistrer une action dans l'historique (usage interne)
     * POST /api/historique/
     * Note: Normalement géré automatiquement par le backend
     */
    enregistrerAction: async (actionData) => {
        try {
            const response = await api.post('/historique/', actionData);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                'Erreur lors de l\'enregistrement de l\'action'
            );
        }
    }
};

export default historiqueService;

