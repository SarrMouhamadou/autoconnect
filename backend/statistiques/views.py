from django.shortcuts import render

# Create your views here.
# backend/statistiques/views.py
# Views pour les statistiques

from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .services import (
    StatistiquesConcessionnaire,
    StatistiquesClient,
    StatistiquesAdmin
)
from users.permissions import IsConcessionnaire, IsClient, IsAdministrateur


# ========================================
# DASHBOARD CONCESSIONNAIRE
# ========================================

class DashboardConcessionnnaireView(APIView):
    """
    Dashboard statistiques pour les concessionnaires.
    
    GET /api/statistiques/dashboard/concessionnaire/
    
    Retourne toutes les statistiques du concessionnaire connecté.
    """
    
    permission_classes = [permissions.IsAuthenticated, IsConcessionnaire]
    
    def get(self, request):
        """Récupérer les statistiques complètes."""
        service = StatistiquesConcessionnaire(request.user)
        stats = service.get_statistiques_completes()
        
        return Response(stats, status=status.HTTP_200_OK)


class RevenusConcessionnnaireView(APIView):
    """
    Statistiques de revenus pour les concessionnaires.
    
    GET /api/statistiques/concessionnaire/revenus/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsConcessionnaire]
    
    def get(self, request):
        """Récupérer les statistiques de revenus."""
        service = StatistiquesConcessionnaire(request.user)
        stats = service.get_revenus()
        
        return Response(stats, status=status.HTTP_200_OK)


class LocationsConcessionnnaireView(APIView):
    """
    Statistiques de locations pour les concessionnaires.
    
    GET /api/statistiques/concessionnaire/locations/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsConcessionnaire]
    
    def get(self, request):
        """Récupérer les statistiques de locations."""
        service = StatistiquesConcessionnaire(request.user)
        stats = service.get_locations()
        
        return Response(stats, status=status.HTTP_200_OK)


class VehiculesConcessionnnaireView(APIView):
    """
    Statistiques de véhicules pour les concessionnaires.
    
    GET /api/statistiques/concessionnaire/vehicules/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsConcessionnaire]
    
    def get(self, request):
        """Récupérer les statistiques de véhicules."""
        service = StatistiquesConcessionnaire(request.user)
        stats = service.get_vehicules()
        
        return Response(stats, status=status.HTTP_200_OK)


class DemandesConcessionnnaireView(APIView):
    """
    Statistiques de demandes pour les concessionnaires.
    
    GET /api/statistiques/concessionnaire/demandes/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsConcessionnaire]
    
    def get(self, request):
        """Récupérer les statistiques de demandes."""
        service = StatistiquesConcessionnaire(request.user)
        stats = service.get_demandes()
        
        return Response(stats, status=status.HTTP_200_OK)


class AvisConcessionnnaireView(APIView):
    """
    Statistiques d'avis pour les concessionnaires.
    
    GET /api/statistiques/concessionnaire/avis/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsConcessionnaire]
    
    def get(self, request):
        """Récupérer les statistiques d'avis."""
        service = StatistiquesConcessionnaire(request.user)
        stats = service.get_avis()
        
        return Response(stats, status=status.HTTP_200_OK)


class TendancesConcessionnnaireView(APIView):
    """
    Tendances pour les concessionnaires (graphiques).
    
    GET /api/statistiques/concessionnaire/tendances/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsConcessionnaire]
    
    def get(self, request):
        """Récupérer les tendances."""
        service = StatistiquesConcessionnaire(request.user)
        stats = service.get_tendances()
        
        return Response(stats, status=status.HTTP_200_OK)


# ========================================
# DASHBOARD CLIENT
# ========================================

class DashboardClientView(APIView):
    """
    Dashboard statistiques pour les clients.
    
    GET /api/statistiques/dashboard/client/
    
    Retourne toutes les statistiques du client connecté.
    """
    
    permission_classes = [permissions.IsAuthenticated, IsClient]
    
    def get(self, request):
        """Récupérer les statistiques complètes."""
        service = StatistiquesClient(request.user)
        stats = service.get_statistiques_completes()
        
        return Response(stats, status=status.HTTP_200_OK)


class LocationsClientView(APIView):
    """
    Statistiques de locations pour les clients.
    
    GET /api/statistiques/client/locations/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsClient]
    
    def get(self, request):
        """Récupérer les statistiques de locations."""
        service = StatistiquesClient(request.user)
        stats = service.get_locations()
        
        return Response(stats, status=status.HTTP_200_OK)


class DepensesClientView(APIView):
    """
    Statistiques de dépenses pour les clients.
    
    GET /api/statistiques/client/depenses/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsClient]
    
    def get(self, request):
        """Récupérer les statistiques de dépenses."""
        service = StatistiquesClient(request.user)
        stats = service.get_depenses()
        
        return Response(stats, status=status.HTTP_200_OK)


class FavorisClientView(APIView):
    """
    Statistiques de favoris pour les clients.
    
    GET /api/statistiques/client/favoris/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsClient]
    
    def get(self, request):
        """Récupérer les statistiques de favoris."""
        service = StatistiquesClient(request.user)
        stats = service.get_favoris()
        
        return Response(stats, status=status.HTTP_200_OK)


class ActiviteClientView(APIView):
    """
    Statistiques d'activité pour les clients.
    
    GET /api/statistiques/client/activite/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsClient]
    
    def get(self, request):
        """Récupérer les statistiques d'activité."""
        service = StatistiquesClient(request.user)
        stats = service.get_activite()
        
        return Response(stats, status=status.HTTP_200_OK)


# ========================================
# DASHBOARD ADMINISTRATEUR
# ========================================

class DashboardAdminView(APIView):
    """
    Dashboard statistiques pour les administrateurs.
    
    GET /api/statistiques/dashboard/admin/
    
    Retourne toutes les statistiques de la plateforme.
    """
    
    permission_classes = [permissions.IsAuthenticated, IsAdministrateur]
    
    def get(self, request):
        """Récupérer les statistiques complètes."""
        service = StatistiquesAdmin()
        stats = service.get_statistiques_completes()
        
        return Response(stats, status=status.HTTP_200_OK)


class UtilisateursAdminView(APIView):
    """
    Statistiques des utilisateurs pour les administrateurs.
    
    GET /api/statistiques/admin/utilisateurs/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsAdministrateur]
    
    def get(self, request):
        """Récupérer les statistiques des utilisateurs."""
        service = StatistiquesAdmin()
        stats = service.get_utilisateurs()
        
        return Response(stats, status=status.HTTP_200_OK)


class ConcessionsAdminView(APIView):
    """
    Statistiques des concessions pour les administrateurs.
    
    GET /api/statistiques/admin/concessions/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsAdministrateur]
    
    def get(self, request):
        """Récupérer les statistiques des concessions."""
        service = StatistiquesAdmin()
        stats = service.get_concessions()
        
        return Response(stats, status=status.HTTP_200_OK)


class VehiculesAdminView(APIView):
    """
    Statistiques des véhicules pour les administrateurs.
    
    GET /api/statistiques/admin/vehicules/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsAdministrateur]
    
    def get(self, request):
        """Récupérer les statistiques des véhicules."""
        service = StatistiquesAdmin()
        stats = service.get_vehicules()
        
        return Response(stats, status=status.HTTP_200_OK)


class LocationsAdminView(APIView):
    """
    Statistiques des locations pour les administrateurs.
    
    GET /api/statistiques/admin/locations/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsAdministrateur]
    
    def get(self, request):
        """Récupérer les statistiques des locations."""
        service = StatistiquesAdmin()
        stats = service.get_locations()
        
        return Response(stats, status=status.HTTP_200_OK)


class RevenusAdminView(APIView):
    """
    Statistiques des revenus pour les administrateurs.
    
    GET /api/statistiques/admin/revenus/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsAdministrateur]
    
    def get(self, request):
        """Récupérer les statistiques des revenus."""
        service = StatistiquesAdmin()
        stats = service.get_revenus()
        
        return Response(stats, status=status.HTTP_200_OK)


class TendancesAdminView(APIView):
    """
    Tendances pour les administrateurs (graphiques).
    
    GET /api/statistiques/admin/tendances/
    """
    
    permission_classes = [permissions.IsAuthenticated, IsAdministrateur]
    
    def get(self, request):
        """Récupérer les tendances."""
        service = StatistiquesAdmin()
        stats = service.get_tendances()
        
        return Response(stats, status=status.HTTP_200_OK)