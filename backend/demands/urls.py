# backend/demands/urls.py
# URLs pour les demandes de contact

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DemandeContactViewSet

# Créer le router
router = DefaultRouter()

# Enregistrer le viewset
router.register(r'demands', DemandeContactViewSet, basename='demand')

# URLs
urlpatterns = [
    path('', include(router.urls)),
]

"""
ENDPOINTS DISPONIBLES :

DEMANDES DE CONTACT :
---------------------
GET    /api/demands/                       - Liste des demandes
POST   /api/demands/                       - Créer une demande (Client)
GET    /api/demands/{id}/                  - Détail d'une demande
DELETE /api/demands/{id}/                  - Annuler une demande (Client)

ACTIONS PERSONNALISÉES :
------------------------
GET    /api/demands/mes-demandes/          - Mes demandes (Client)
GET    /api/demands/demandes-recues/       - Demandes reçues (Concessionnaire)
PATCH  /api/demands/{id}/repondre/         - Répondre à une demande (Concessionnaire)
PATCH  /api/demands/{id}/marquer-en-cours/ - Marquer en cours (Concessionnaire)
PATCH  /api/demands/{id}/notes/            - Ajouter notes internes (Concessionnaire)
GET    /api/demands/statistiques/          - Statistiques des demandes

FILTRES :
---------
?type_demande=CONTACT                      - Filtrer par type (CONTACT, ESSAI, DEVIS, INFORMATION)
?statut=EN_ATTENTE                         - Filtrer par statut (EN_ATTENTE, EN_COURS, TRAITEE, ANNULEE)
?vehicule=123                              - Filtrer par véhicule
?date_creation__gte=2024-01-01            - Demandes après cette date
?search=Toyota                             - Recherche textuelle
?ordering=-date_creation                   - Tri (date décroissante)
?ordering=statut                           - Tri par statut

EXEMPLES D'UTILISATION :
------------------------

# Client : Créer une demande de contact
POST /api/demands/
{
    "vehicule_id": 123,
    "type_demande": "CONTACT",
    "objet": "Informations sur le véhicule",
    "message": "Bonjour, je suis intéressé par ce véhicule...",
    "telephone_contact": "+221771234567",
    "email_contact": "client@email.com"
}

# Client : Créer une demande d'essai
POST /api/demands/
{
    "vehicule_id": 123,
    "type_demande": "ESSAI",
    "objet": "Demande d'essai",
    "message": "Je souhaiterais essayer ce véhicule",
    "date_souhaitee_essai": "2024-12-25",
    "heure_souhaitee_essai": "14:00",
    "telephone_contact": "+221771234567",
    "email_contact": "client@email.com"
}

# Concessionnaire : Répondre à une demande
PATCH /api/demands/123/repondre/
{
    "reponse": "Bonjour, nous vous recontacterons dans les plus brefs délais...",
    "notes_internes": "Client prioritaire, rappeler demain"
}

# Concessionnaire : Marquer en cours
PATCH /api/demands/123/marquer-en-cours/

# Client : Annuler une demande
DELETE /api/demands/123/

# Récupérer mes demandes (Client)
GET /api/demands/mes-demandes/

# Récupérer les demandes reçues (Concessionnaire)
GET /api/demands/demandes-recues/?statut=EN_ATTENTE

# Statistiques
GET /api/demands/statistiques/
"""