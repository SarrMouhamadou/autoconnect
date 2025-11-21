# backend/vehicules/urls.py - URLS COMPLÈTES

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from vehicules.views import MarqueViewSet, CategorieViewSet, VehiculeViewSet

# Créer le router
router = DefaultRouter()

# Enregistrer les viewsets
router.register(r'marques', MarqueViewSet, basename='marque')
router.register(r'categories', CategorieViewSet, basename='categorie')
router.register(r'vehicules', VehiculeViewSet, basename='vehicule')

# URLs
urlpatterns = [
    path('', include(router.urls)),
]

"""
ENDPOINTS DISPONIBLES :

MARQUES :
---------
GET    /api/marques/                  - Liste des marques
POST   /api/marques/                  - Créer une marque (Admin)
GET    /api/marques/{id}/             - Détail d'une marque
PUT    /api/marques/{id}/             - Modifier une marque (Admin)
PATCH  /api/marques/{id}/             - Modifier partiellement (Admin)
DELETE /api/marques/{id}/             - Supprimer une marque (Admin)
GET    /api/marques/populaires/       - Marques les plus populaires

CATÉGORIES :
------------
GET    /api/categories/               - Liste des catégories
POST   /api/categories/               - Créer une catégorie (Admin)
GET    /api/categories/{id}/          - Détail d'une catégorie
PUT    /api/categories/{id}/          - Modifier une catégorie (Admin)
PATCH  /api/categories/{id}/          - Modifier partiellement (Admin)
DELETE /api/categories/{id}/          - Supprimer une catégorie (Admin)
GET    /api/categories/populaires/    - Catégories les plus populaires

VÉHICULES :
-----------
GET    /api/vehicules/                - Liste des véhicules disponibles
POST   /api/vehicules/                - Créer un véhicule (Concessionnaire)
GET    /api/vehicules/{id}/           - Détail d'un véhicule
PUT    /api/vehicules/{id}/           - Modifier un véhicule (Propriétaire)
PATCH  /api/vehicules/{id}/           - Modifier partiellement (Propriétaire)
DELETE /api/vehicules/{id}/           - Supprimer un véhicule (Propriétaire)
GET    /api/vehicules/mes-vehicules/  - Mes véhicules (Concessionnaire)
GET    /api/vehicules/par-marque/     - Grouper par marque
GET    /api/vehicules/par-categorie/  - Grouper par catégorie

FILTRES VÉHICULES :
-------------------
?marque=1                              - Filtrer par marque
?categorie=2                           - Filtrer par catégorie
?concession=3                          - Filtrer par concession
?type_carburant=ESSENCE                - Filtrer par carburant
?transmission=AUTOMATIQUE              - Filtrer par transmission
?prix_location_jour__gte=10000         - Prix min
?prix_location_jour__lte=50000         - Prix max
?annee__gte=2020                       - Année min
?nombre_places__gte=5                  - Nombre de places min
?climatisation=true                    - Avec climatisation
?search=Toyota                         - Recherche textuelle
?ordering=-prix_location_jour          - Tri (prix décroissant)
"""