from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehiculeViewSet, EquipementViewSet

# Créer le router
router = DefaultRouter()
router.register(r'vehicules', VehiculeViewSet, basename='vehicule')
router.register(r'equipements', EquipementViewSet, basename='equipement')

app_name = 'vehicules'

urlpatterns = [
    path('', include(router.urls)),
]