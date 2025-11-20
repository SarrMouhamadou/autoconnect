from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegionViewSet, ConcessionViewSet

# Création du router
router = DefaultRouter()

# Enregistrement des ViewSets
router.register(r'regions', RegionViewSet, basename='region')
router.register(r'concessions', ConcessionViewSet, basename='concession')

urlpatterns = [
    path('', include(router.urls)),
]