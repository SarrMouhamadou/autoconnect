# backend/promotions/urls.py
# URLs pour les promotions

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PromotionViewSet

# Créer le router
router = DefaultRouter()

# Enregistrer le viewset
router.register(r'promotions', PromotionViewSet, basename='promotion')

# URLs
urlpatterns = [
    path('', include(router.urls)),
]

"""
ENDPOINTS DISPONIBLES :

PROMOTIONS (PUBLIC) :
---------------------
GET    /api/promotions/                       - Liste des promotions actives et visibles

PROMOTIONS (CONCESSIONNAIRE) :
------------------------------
POST   /api/promotions/                       - Créer une promotion
GET    /api/promotions/{id}/                  - Détail d'une promotion
PATCH  /api/promotions/{id}/                  - Modifier une promotion
DELETE /api/promotions/{id}/                  - Supprimer une promotion
GET    /api/promotions/mes-promotions/        - Mes promotions
POST   /api/promotions/{id}/activer/          - Activer une promotion
POST   /api/promotions/{id}/desactiver/       - Désactiver une promotion
GET    /api/promotions/{id}/utilisations/     - Historique d'utilisation
GET    /api/promotions/statistiques/          - Statistiques

PROMOTIONS (CLIENT) :
---------------------
POST   /api/promotions/verifier-code/         - Vérifier un code promo

FILTRES :
---------
?type_reduction=POURCENTAGE                   - Filtrer par type (POURCENTAGE, MONTANT_FIXE)
?statut=ACTIF                                 - Filtrer par statut (ACTIF, INACTIF, EXPIRE)
?est_cumulable=true                           - Filtrer par cumulable
?est_visible=true                             - Filtrer par visibilité
?date_debut__gte=2024-01-01                  - Date de début après
?date_fin__lte=2024-12-31                    - Date de fin avant
?search=SUMMER                                - Recherche dans nom, description, code
?ordering=-date_creation                      - Tri (plus récentes d'abord)
?ordering=-valeur_reduction                   - Tri par valeur de réduction

EXEMPLES D'UTILISATION :
------------------------

# Créer une promotion (Concessionnaire)
POST /api/promotions/
{
    "nom": "Promo Été 2024",
    "description": "20% de réduction sur toutes les locations",
    "code": "SUMMER2024",
    "type_reduction": "POURCENTAGE",
    "valeur_reduction": 20,
    "date_debut": "2024-06-01",
    "date_fin": "2024-08-31",
    "nombre_utilisations_max": 100,
    "utilisations_par_client": 1,
    "montant_minimum": 50000,
    "reduction_maximum": 30000,
    "est_cumulable": false,
    "est_visible": true
}

# Créer une promotion montant fixe
POST /api/promotions/
{
    "nom": "Réduction fidélité",
    "description": "10 000 FCFA offerts",
    "code": "FIDELITE10K",
    "type_reduction": "MONTANT_FIXE",
    "valeur_reduction": 10000,
    "date_debut": "2024-01-01",
    "date_fin": "2024-12-31",
    "utilisations_par_client": 3,
    "montant_minimum": 30000,
    "est_visible": false
}

# Créer une promotion ciblée sur des véhicules
POST /api/promotions/
{
    "nom": "Promo SUV",
    "description": "15% sur les SUV",
    "code": "SUV15",
    "type_reduction": "POURCENTAGE",
    "valeur_reduction": 15,
    "date_debut": "2024-01-01",
    "date_fin": "2024-12-31",
    "categories_ids": [3],
    "est_visible": true
}

# Vérifier un code promo (Client)
POST /api/promotions/verifier-code/
{
    "code": "SUMMER2024",
    "vehicule_id": 123,
    "montant": 75000
}

# Réponse si valide :
{
    "valide": true,
    "message": "Code promo valide",
    "promotion": {...},
    "reduction_estimee": 15000
}

# Réponse si invalide :
{
    "valide": false,
    "message": "Ce code promo a expiré"
}

# Activer une promotion
POST /api/promotions/123/activer/

# Désactiver une promotion
POST /api/promotions/123/desactiver/

# Voir l'historique d'utilisation
GET /api/promotions/123/utilisations/

# Statistiques des promotions
GET /api/promotions/statistiques/

# Mes promotions avec filtre
GET /api/promotions/mes-promotions/?statut=ACTIF

# Rechercher une promotion
GET /api/promotions/?search=SUMMER
"""