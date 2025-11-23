# backend/statistiques/urls.py
# URLs pour les statistiques

from django.urls import path
from .views import (
    # Dashboards complets
    DashboardConcessionnnaireView,
    DashboardClientView,
    DashboardAdminView,
    
    # Concessionnaire - Détails
    RevenusConcessionnnaireView,
    LocationsConcessionnnaireView,
    VehiculesConcessionnnaireView,
    DemandesConcessionnnaireView,
    AvisConcessionnnaireView,
    TendancesConcessionnnaireView,
    
    # Client - Détails
    LocationsClientView,
    DepensesClientView,
    FavorisClientView,
    ActiviteClientView,
    
    # Admin - Détails
    UtilisateursAdminView,
    ConcessionsAdminView,
    VehiculesAdminView,
    LocationsAdminView,
    RevenusAdminView,
    TendancesAdminView,
)

urlpatterns = [
    # ========================================
    # DASHBOARDS COMPLETS
    # ========================================
    path('dashboard/concessionnaire/', DashboardConcessionnnaireView.as_view(), name='dashboard-concessionnaire'),
    path('dashboard/client/', DashboardClientView.as_view(), name='dashboard-client'),
    path('dashboard/admin/', DashboardAdminView.as_view(), name='dashboard-admin'),
    
    # ========================================
    # CONCESSIONNAIRE - DÉTAILS
    # ========================================
    path('concessionnaire/revenus/', RevenusConcessionnnaireView.as_view(), name='stats-concessionnaire-revenus'),
    path('concessionnaire/locations/', LocationsConcessionnnaireView.as_view(), name='stats-concessionnaire-locations'),
    path('concessionnaire/vehicules/', VehiculesConcessionnnaireView.as_view(), name='stats-concessionnaire-vehicules'),
    path('concessionnaire/demandes/', DemandesConcessionnnaireView.as_view(), name='stats-concessionnaire-demandes'),
    path('concessionnaire/avis/', AvisConcessionnnaireView.as_view(), name='stats-concessionnaire-avis'),
    path('concessionnaire/tendances/', TendancesConcessionnnaireView.as_view(), name='stats-concessionnaire-tendances'),
    
    # ========================================
    # CLIENT - DÉTAILS
    # ========================================
    path('client/locations/', LocationsClientView.as_view(), name='stats-client-locations'),
    path('client/depenses/', DepensesClientView.as_view(), name='stats-client-depenses'),
    path('client/favoris/', FavorisClientView.as_view(), name='stats-client-favoris'),
    path('client/activite/', ActiviteClientView.as_view(), name='stats-client-activite'),
    
    # ========================================
    # ADMINISTRATEUR - DÉTAILS
    # ========================================
    path('admin/utilisateurs/', UtilisateursAdminView.as_view(), name='stats-admin-utilisateurs'),
    path('admin/concessions/', ConcessionsAdminView.as_view(), name='stats-admin-concessions'),
    path('admin/vehicules/', VehiculesAdminView.as_view(), name='stats-admin-vehicules'),
    path('admin/locations/', LocationsAdminView.as_view(), name='stats-admin-locations'),
    path('admin/revenus/', RevenusAdminView.as_view(), name='stats-admin-revenus'),
    path('admin/tendances/', TendancesAdminView.as_view(), name='stats-admin-tendances'),
]

"""
ENDPOINTS DISPONIBLES :

========================================
DASHBOARDS COMPLETS (toutes les stats)
========================================

GET /api/statistiques/dashboard/concessionnaire/
    → Retourne TOUTES les statistiques du concessionnaire
    → Permissions: Concessionnaire uniquement

GET /api/statistiques/dashboard/client/
    → Retourne TOUTES les statistiques du client
    → Permissions: Client uniquement

GET /api/statistiques/dashboard/admin/
    → Retourne TOUTES les statistiques de la plateforme
    → Permissions: Administrateur uniquement

========================================
CONCESSIONNAIRE - ENDPOINTS DÉTAILLÉS
========================================

GET /api/statistiques/concessionnaire/revenus/
    → Revenus mois, total, variation, pénalités

GET /api/statistiques/concessionnaire/locations/
    → Compteurs par statut, taux conversion, durée moyenne

GET /api/statistiques/concessionnaire/vehicules/
    → Disponibilité, taux occupation, top véhicules

GET /api/statistiques/concessionnaire/demandes/
    → Compteurs, par type, délai moyen réponse

GET /api/statistiques/concessionnaire/avis/
    → Notes, répartition, taux recommandation

GET /api/statistiques/concessionnaire/tendances/
    → Données pour graphiques (6 derniers mois)

========================================
CLIENT - ENDPOINTS DÉTAILLÉS
========================================

GET /api/statistiques/client/locations/
    → Mes locations par statut, prochaine location

GET /api/statistiques/client/depenses/
    → Total dépensé, ce mois, économies, panier moyen

GET /api/statistiques/client/favoris/
    → Total favoris, alertes, baisses détectées

GET /api/statistiques/client/activite/
    → Actions récentes, véhicules consultés

========================================
ADMINISTRATEUR - ENDPOINTS DÉTAILLÉS
========================================

GET /api/statistiques/admin/utilisateurs/
    → Total, par type, nouveaux, actifs, en attente

GET /api/statistiques/admin/concessions/
    → Total, par statut, par région

GET /api/statistiques/admin/vehicules/
    → Total, par catégorie, par marque

GET /api/statistiques/admin/locations/
    → Compteurs globaux, taux réussite

GET /api/statistiques/admin/revenus/
    → Revenus plateforme, variation mensuelle

GET /api/statistiques/admin/tendances/
    → Données pour graphiques globaux

========================================
EXEMPLES DE RÉPONSES
========================================

# Dashboard Concessionnaire (complet)
GET /api/statistiques/dashboard/concessionnaire/
{
    "revenus": {
        "revenu_mois": 1500000,
        "revenu_mois_precedent": 1200000,
        "variation_pourcentage": 25.0,
        "revenu_total": 15000000,
        "penalites_total": 150000
    },
    "locations": {
        "total": 150,
        "en_cours": 5,
        "confirmees": 3,
        "terminees": 130,
        "annulees": 10,
        "en_attente": 2,
        "ce_mois": 15,
        "duree_moyenne_jours": 3.5,
        "taux_conversion": 85.5
    },
    "vehicules": {
        "total": 25,
        "disponibles": 18,
        "loues": 5,
        "maintenance": 2,
        "indisponibles": 0,
        "note_moyenne": 4.2,
        "taux_occupation": 20.0,
        "top_vehicules": [...]
    },
    ...
}

# Dashboard Client (complet)
GET /api/statistiques/dashboard/client/
{
    "locations": {
        "total": 10,
        "en_cours": 1,
        "terminees": 8,
        "annulees": 1,
        "prochaine_location": {
            "id": 45,
            "vehicule": "Toyota Corolla 2023",
            "date_debut": "2024-12-25"
        }
    },
    "depenses": {
        "total": 750000,
        "ce_mois": 150000,
        "economies": 30000,
        "panier_moyen": 75000
    },
    "favoris": {
        "total": 5,
        "avec_alerte": 2,
        "baisses_detectees": 1
    },
    ...
}

# Dashboard Admin (complet)
GET /api/statistiques/dashboard/admin/
{
    "utilisateurs": {
        "total": 500,
        "clients": 450,
        "concessionnaires": 45,
        "admins": 5,
        "nouveaux_ce_mois": 30,
        "actifs_30_jours": 200,
        "concessionnaires_en_attente": 3
    },
    "concessions": {
        "total": 60,
        "validees": 50,
        "en_attente": 8,
        "suspendues": 2,
        "par_region": [...]
    },
    "vehicules": {
        "total": 500,
        "disponibles": 400,
        "loues": 80,
        "par_categorie": [...],
        "par_marque": [...],
        "note_moyenne_globale": 4.1
    },
    ...
}
"""