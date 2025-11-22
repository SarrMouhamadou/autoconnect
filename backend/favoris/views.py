# backend/favoris/views.py
# Views pour les favoris et l'historique

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Favori, Historique
from .serializers import (
    FavoriSerializer,
    FavoriCreateSerializer,
    HistoriqueSerializer
)
from users.permissions import IsClient


# ========================================
# VIEWSET FAVORI
# ========================================

class FavoriViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les favoris.
    
    Endpoints:
    - GET    /api/favoris/                - Liste mes favoris
    - POST   /api/favoris/                - Ajouter un favori
    - GET    /api/favoris/{id}/           - Détail d'un favori
    - PATCH  /api/favoris/{id}/           - Modifier notes/alerte
    - DELETE /api/favoris/{id}/           - Retirer des favoris
    - GET    /api/favoris/alertes-prix/   - Favoris avec baisse de prix
    """
    
    queryset = Favori.objects.select_related(
        'client',
        'vehicule',
        'vehicule__marque',
        'vehicule__categorie'
    ).prefetch_related('vehicule__photos')
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    permission_classes = [permissions.IsAuthenticated, IsClient]
    
    # Filtres
    filterset_fields = {
        'alerte_prix_active': ['exact'],
        'date_ajout': ['gte', 'lte'],
    }
    
    # Recherche
    search_fields = [
        'vehicule__nom_modele',
        'vehicule__marque__nom',
        'notes',
    ]
    
    # Tri
    ordering_fields = [
        'date_ajout',
        'prix_initial',
    ]
    ordering = ['-date_ajout']
    
    def get_serializer_class(self):
        """Retourner le serializer approprié."""
        if self.action == 'create':
            return FavoriCreateSerializer
        return FavoriSerializer
    
    def get_queryset(self):
        """Filtrer uniquement les favoris de l'utilisateur connecté."""
        return super().get_queryset().filter(client=self.request.user)
    
    def perform_create(self, serializer):
        """Créer un favori et enregistrer dans l'historique."""
        favori = serializer.save(client=self.request.user)
        
        # Enregistrer dans l'historique
        Historique.enregistrer_action(
            utilisateur=self.request.user,
            type_action='AJOUT_FAVORI',
            description=f"Ajouté {favori.vehicule.nom_complet} aux favoris",
            vehicule=favori.vehicule,
            request=self.request
        )
        
        return favori
    
    def perform_destroy(self, instance):
        """Supprimer un favori et enregistrer dans l'historique."""
        vehicule = instance.vehicule
        
        # Enregistrer dans l'historique
        Historique.enregistrer_action(
            utilisateur=self.request.user,
            type_action='RETRAIT_FAVORI',
            description=f"Retiré {vehicule.nom_complet} des favoris",
            vehicule=vehicule,
            request=self.request
        )
        
        instance.delete()
    
    @action(
        detail=False,
        methods=['get']
    )
    def alertes_prix(self, request):
        """
        Récupérer les favoris avec alerte prix active et prix ayant baissé.
        GET /api/favoris/alertes-prix/
        """
        favoris_avec_baisse = []
        
        for favori in self.get_queryset().filter(alerte_prix_active=True):
            if favori.verifier_baisse_prix():
                favoris_avec_baisse.append(favori)
        
        serializer = FavoriSerializer(
            favoris_avec_baisse,
            many=True,
            context={'request': request}
        )
        
        return Response(serializer.data)
    
    @action(
        detail=True,
        methods=['post']
    )
    def toggle_alerte(self, request, pk=None):
        """
        Activer/Désactiver l'alerte prix.
        POST /api/favoris/{id}/toggle-alerte/
        """
        favori = self.get_object()
        
        favori.alerte_prix_active = not favori.alerte_prix_active
        favori.save(update_fields=['alerte_prix_active'])
        
        return Response(
            {
                "message": "Alerte prix " + ("activée" if favori.alerte_prix_active else "désactivée"),
                "alerte_prix_active": favori.alerte_prix_active
            },
            status=status.HTTP_200_OK
        )


# ========================================
# VIEWSET HISTORIQUE
# ========================================

class HistoriqueViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour consulter l'historique (lecture seule).
    
    Endpoints:
    - GET /api/historique/           - Mon historique
    - GET /api/historique/{id}/      - Détail d'une action
    """
    
    queryset = Historique.objects.select_related(
        'utilisateur',
        'vehicule',
        'vehicule__marque'
    )
    
    serializer_class = HistoriqueSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    
    # Filtres
    filterset_fields = {
        'type_action': ['exact'],
        'date_action': ['gte', 'lte'],
    }
    
    # Tri
    ordering_fields = ['date_action']
    ordering = ['-date_action']
    
    def get_queryset(self):
        """Filtrer uniquement l'historique de l'utilisateur connecté."""
        return super().get_queryset().filter(utilisateur=self.request.user)
    
    @action(
        detail=False,
        methods=['get']
    )
    def statistiques(self, request):
        """
        Statistiques de l'historique.
        GET /api/historique/statistiques/
        """
        from django.db.models import Count
        from datetime import timedelta
        from django.utils import timezone
        
        queryset = self.get_queryset()
        
        # Total d'actions
        total = queryset.count()
        
        # Actions par type
        actions_par_type = queryset.values('type_action').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Actions des 7 derniers jours
        date_limite = timezone.now() - timedelta(days=7)
        actions_recentes = queryset.filter(date_action__gte=date_limite).count()
        
        # Véhicules consultés (top 5)
        vehicules_consultes = queryset.filter(
            type_action='CONSULTATION_VEHICULE',
            vehicule__isnull=False
        ).values(
            'vehicule__id',
            'vehicule__nom_modele',
            'vehicule__marque__nom'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        stats = {
            'total_actions': total,
            'actions_7_derniers_jours': actions_recentes,
            'actions_par_type': list(actions_par_type),
            'vehicules_plus_consultes': list(vehicules_consultes)
        }
        
        return Response(stats)