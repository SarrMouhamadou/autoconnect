# backend/notifications/urls.py
# URLs pour les notifications

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

# Créer le router
router = DefaultRouter()

# Enregistrer le viewset
router.register(r'notifications', NotificationViewSet, basename='notification')

# URLs
urlpatterns = [
    path('', include(router.urls)),
]

"""
ENDPOINTS DISPONIBLES :

NOTIFICATIONS :
---------------
GET    /api/notifications/                       - Mes notifications
POST   /api/notifications/                       - Créer une notification (admin)
GET    /api/notifications/{id}/                  - Détail d'une notification
DELETE /api/notifications/{id}/                  - Supprimer une notification
PATCH  /api/notifications/{id}/marquer-lue/      - Marquer comme lue/non lue
POST   /api/notifications/marquer-toutes-lues/   - Marquer toutes comme lues
GET    /api/notifications/non-lues/              - Notifications non lues
GET    /api/notifications/compteur/              - Compteur non lues
DELETE /api/notifications/supprimer-lues/        - Supprimer toutes les lues
GET    /api/notifications/statistiques/          - Statistiques

FILTRES :
---------
?type_notification=DEMANDE_RECUE                 - Filtrer par type
?niveau_priorite=HAUTE                           - Filtrer par priorité
?est_lue=false                                   - Filtrer non lues
?date_creation__gte=2024-01-01                  - Notifications après date
?search=location                                 - Recherche dans titre/message
?ordering=-date_creation                         - Tri (plus récentes d'abord)

EXEMPLES D'UTILISATION :
------------------------

# Mes notifications (les plus récentes)
GET /api/notifications/?ordering=-date_creation

# Notifications non lues uniquement
GET /api/notifications/non-lues/

# Compteur de notifications non lues (pour badge)
GET /api/notifications/compteur/
# Response: {"non_lues": 5}

# Marquer une notification comme lue
PATCH /api/notifications/123/marquer-lue/
{
    "est_lue": true
}

# Marquer toutes les notifications comme lues
POST /api/notifications/marquer-toutes-lues/

# Supprimer une notification
DELETE /api/notifications/123/

# Supprimer toutes les notifications lues
DELETE /api/notifications/supprimer-lues/

# Notifications urgentes non lues
GET /api/notifications/?niveau_priorite=URGENTE&est_lue=false

# Notifications de locations
GET /api/notifications/?type_notification=LOCATION_CONFIRMEE

# Statistiques de mes notifications
GET /api/notifications/statistiques/
# Response: {
#   "total": 50,
#   "non_lues": 5,
#   "lues": 45,
#   "par_type": [...],
#   "par_priorite": [...]
# }

# Créer une notification (admin uniquement)
POST /api/notifications/
{
    "destinataire": 123,
    "type_notification": "INFORMATION",
    "titre": "Maintenance prévue",
    "message": "Le site sera en maintenance demain de 2h à 4h",
    "niveau_priorite": "HAUTE",
    "lien": "/maintenance",
    "texte_action": "En savoir plus"
}
"""