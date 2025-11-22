# backend/favoris/urls.py
# URLs pour les favoris et l'historique

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FavoriViewSet, HistoriqueViewSet

# Créer le router
router = DefaultRouter()

# Enregistrer les viewsets
router.register(r'favoris', FavoriViewSet, basename='favori')
router.register(r'historique', HistoriqueViewSet, basename='historique')

# URLs
urlpatterns = [
    path('', include(router.urls)),
]

"""
ENDPOINTS DISPONIBLES :

FAVORIS :
---------
GET    /api/favoris/                     - Mes favoris
POST   /api/favoris/                     - Ajouter un favori
GET    /api/favoris/{id}/                - Détail d'un favori
PATCH  /api/favoris/{id}/                - Modifier notes/alerte
DELETE /api/favoris/{id}/                - Retirer des favoris
GET    /api/favoris/alertes-prix/        - Favoris avec baisse de prix
POST   /api/favoris/{id}/toggle-alerte/  - Toggle alerte prix

HISTORIQUE :
------------
GET    /api/historique/                  - Mon historique
GET    /api/historique/{id}/             - Détail d'une action
GET    /api/historique/statistiques/     - Statistiques de l'historique

FILTRES FAVORIS :
-----------------
?alerte_prix_active=true                 - Favoris avec alerte active
?date_ajout__gte=2024-01-01             - Favoris ajoutés après cette date
?search=Toyota                           - Recherche dans véhicule/notes
?ordering=-date_ajout                    - Tri (plus récents d'abord)

FILTRES HISTORIQUE :
--------------------
?type_action=CONSULTATION_VEHICULE       - Filtrer par type d'action
?date_action__gte=2024-01-01            - Actions après cette date
?ordering=-date_action                   - Tri (plus récentes d'abord)

EXEMPLES D'UTILISATION :
------------------------

# Ajouter un véhicule aux favoris
POST /api/favoris/
{
    "vehicule_id": 123,
    "alerte_prix_active": true,
    "notes": "Véhicule idéal pour mes besoins"
}

# Modifier les notes d'un favori
PATCH /api/favoris/456/
{
    "notes": "Attendre la baisse de prix",
    "alerte_prix_active": true
}

# Activer/Désactiver l'alerte prix
POST /api/favoris/456/toggle-alerte/

# Retirer des favoris
DELETE /api/favoris/456/

# Mes favoris avec alerte prix qui ont baissé
GET /api/favoris/alertes-prix/

# Mon historique des 7 derniers jours
GET /api/historique/?date_action__gte=2024-12-15

# Statistiques de mon historique
GET /api/historique/statistiques/

# Mes consultations de véhicules
GET /api/historique/?type_action=CONSULTATION_VEHICULE

# Mes favoris par ordre de prix initial
GET /api/favoris/?ordering=prix_initial
"""