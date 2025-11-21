# backend/avis/urls.py
# URLs pour les avis

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AvisViewSet

# Créer le router
router = DefaultRouter()

# Enregistrer le viewset
router.register(r'avis', AvisViewSet, basename='avis')

# URLs
urlpatterns = [
    path('', include(router.urls)),
]

"""
ENDPOINTS DISPONIBLES :

AVIS :
------
GET    /api/avis/                        - Liste des avis validés
POST   /api/avis/                        - Créer un avis (Client)
GET    /api/avis/{id}/                   - Détail d'un avis
PUT    /api/avis/{id}/                   - Modifier un avis (Client propriétaire)
DELETE /api/avis/{id}/                   - Supprimer un avis (Client propriétaire)

ACTIONS PERSONNALISÉES :
------------------------
GET    /api/avis/mes-avis/               - Mes avis (Client)
GET    /api/avis/vehicule/{id}/          - Avis d'un véhicule spécifique
PATCH  /api/avis/{id}/repondre/          - Répondre à un avis (Concessionnaire)
PATCH  /api/avis/{id}/signaler/          - Signaler un avis
PATCH  /api/avis/{id}/moderer/           - Modérer un avis (Admin)
POST   /api/avis/{id}/utile/             - Marquer comme utile
POST   /api/avis/{id}/inutile/           - Marquer comme inutile
GET    /api/avis/statistiques/           - Statistiques globales

FILTRES :
---------
?vehicule=123                            - Avis d'un véhicule
?client=456                              - Avis d'un client
?note=5                                  - Filtrer par note
?note__gte=4                             - Note >= 4
?recommande=true                         - Avis recommandés
?est_valide=true                         - Avis validés
?est_signale=true                        - Avis signalés
?search=confort                          - Recherche textuelle
?ordering=-date_creation                 - Tri (date décroissante)
?ordering=note                           - Tri par note

EXEMPLES D'UTILISATION :
------------------------

# Client : Créer un avis
POST /api/avis/
{
    "location_id": 123,
    "note": 5,
    "note_confort": 5,
    "note_performance": 4,
    "note_consommation": 4,
    "note_proprete": 5,
    "titre": "Excellent véhicule !",
    "commentaire": "J'ai loué ce véhicule pendant 5 jours et j'ai été très satisfait...",
    "points_positifs": "Confortable, économique, propre",
    "points_negatifs": "Système audio un peu vieillot",
    "recommande": true
}

# Concessionnaire : Répondre à un avis
PATCH /api/avis/123/repondre/
{
    "reponse": "Merci beaucoup pour votre retour positif ! Nous sommes ravis que vous ayez apprécié votre expérience. Concernant le système audio, nous prenons note de votre remarque."
}

# Signaler un avis
PATCH /api/avis/123/signaler/
{
    "raison": "Contenu inapproprié et offensant"
}

# Admin : Modérer un avis
PATCH /api/avis/123/moderer/
{
    "valide": false,
    "raison": "Contenu inapproprié vérifié"
}

# Marquer un avis comme utile
POST /api/avis/123/utile/

# Récupérer les avis d'un véhicule
GET /api/avis/vehicule/456/

# Récupérer mes avis
GET /api/avis/mes-avis/

# Statistiques globales
GET /api/avis/statistiques/

# Filtrer les avis 5 étoiles d'un véhicule
GET /api/avis/?vehicule=456&note=5

# Rechercher des avis mentionnant "confort"
GET /api/avis/?search=confort

# Avis les plus récents avec note >= 4
GET /api/avis/?note__gte=4&ordering=-date_creation
"""