# backend/locations/urls.py
# URLs pour les locations

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, ContratLocationViewSet

# Créer le router
router = DefaultRouter()

# Enregistrer les viewsets
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'contrats', ContratLocationViewSet, basename='contrat')

# URLs
urlpatterns = [
    path('', include(router.urls)),
]

"""
ENDPOINTS DISPONIBLES :

LOCATIONS :
-----------
GET    /api/locations/                       - Liste des locations
POST   /api/locations/                       - Créer une demande de location (Client)
GET    /api/locations/{id}/                  - Détail d'une location
DELETE /api/locations/{id}/                  - Annuler une demande (Client)

GESTION PAR CONCESSIONNAIRE :
------------------------------
PATCH  /api/locations/{id}/confirmer/        - Confirmer une demande
PATCH  /api/locations/{id}/refuser/          - Refuser une demande
PATCH  /api/locations/{id}/depart/           - Enregistrer le départ
PATCH  /api/locations/{id}/retour/           - Enregistrer le retour
PATCH  /api/locations/{id}/notes/            - Ajouter des notes internes

LISTES FILTRÉES :
-----------------
GET    /api/locations/mes-locations/         - Mes locations (Client)
GET    /api/locations/locations-gerees/      - Locations gérées (Concessionnaire)
GET    /api/locations/statistiques/          - Statistiques

CONTRATS :
----------
GET    /api/contrats/                        - Liste des contrats
GET    /api/contrats/{id}/                   - Détail d'un contrat

FILTRES :
---------
?statut=DEMANDE                              - Filtrer par statut (DEMANDE, CONFIRMEE, EN_COURS, TERMINEE, ANNULEE)
?vehicule=123                                - Filtrer par véhicule
?client=456                                  - Filtrer par client
?date_debut__gte=2024-12-01                 - Locations après cette date
?date_fin__lte=2024-12-31                   - Locations avant cette date
?search=Toyota                               - Recherche textuelle
?ordering=-date_creation                     - Tri (date décroissante)
?ordering=date_debut                         - Tri par date de début

EXEMPLES D'UTILISATION :
------------------------

# Client : Créer une demande de location
POST /api/locations/
{
    "vehicule_id": 123,
    "date_debut": "2024-12-25",
    "date_fin": "2024-12-30",
    "notes_client": "Je souhaiterais récupérer le véhicule à 9h"
}

# Concessionnaire : Confirmer une location
PATCH /api/locations/123/confirmer/

# Concessionnaire : Refuser une location
PATCH /api/locations/123/refuser/

# Concessionnaire : Enregistrer le départ
PATCH /api/locations/123/depart/
{
    "kilometrage_depart": 12345,
    "etat_depart": "Véhicule en excellent état, plein d'essence"
}

# Concessionnaire : Enregistrer le retour
PATCH /api/locations/123/retour/
{
    "kilometrage_retour": 12500,
    "etat_retour": "Véhicule rendu propre, aucun dommage"
}

# Concessionnaire : Ajouter des notes
PATCH /api/locations/123/notes/
{
    "notes_concessionnaire": "Client sérieux, bon payeur, à privilégier"
}

# Client : Annuler une demande
DELETE /api/locations/123/

# Récupérer mes locations (Client)
GET /api/locations/mes-locations/

# Récupérer les locations gérées (Concessionnaire)
GET /api/locations/locations-gerees/?statut=EN_COURS

# Statistiques
GET /api/locations/statistiques/

# Filtrer les locations en cours
GET /api/locations/?statut=EN_COURS

# Rechercher par véhicule
GET /api/locations/?search=Toyota+Corolla

# Locations du mois prochain
GET /api/locations/?date_debut__gte=2025-01-01&date_debut__lte=2025-01-31
"""