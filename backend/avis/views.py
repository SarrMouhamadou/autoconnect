# backend/avis/views.py
# Views pour les avis

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Avis
from .serializers import (
    AvisSerializer,
    AvisListSerializer,
    AvisCreateSerializer,
    AvisRepondreSerializer,
    AvisSignalerSerializer,
    AvisModererSerializer
)
from users.permissions import IsClient, IsConcessionnaire


# ========================================
# VIEWSET AVIS
# ========================================

class AvisViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les avis.
    
    ⭐ CONFORME AU DIAGRAMME DE CLASSE
    
    Endpoints:
    - GET    /api/avis/                    - Liste avis
    - POST   /api/avis/                    - Créer avis (Client)
    - GET    /api/avis/{id}/               - Détail avis
    - PUT    /api/avis/{id}/               - Modifier avis (Client)
    - DELETE /api/avis/{id}/               - Supprimer avis (Client)
    - PATCH  /api/avis/{id}/repondre/      - Répondre (Concessionnaire)
    - PATCH  /api/avis/{id}/signaler/      - Signaler
    - PATCH  /api/avis/{id}/moderer/       - Modérer (Admin)
    - POST   /api/avis/{id}/utile/         - Marquer utile
    - POST   /api/avis/{id}/inutile/       - Marquer inutile
    - GET    /api/avis/mes-avis/           - Mes avis (Client)
    - GET    /api/avis/vehicule/{id}/      - Avis d'un véhicule
    """
    
    queryset = Avis.objects.select_related(
        'client',
        'vehicule',
        'vehicule__marque',
        'location',
        'repondu_par',
        'modere_par'
    )
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtres
    filterset_fields = {
        'vehicule': ['exact'],
        'client': ['exact'],
        'note': ['exact', 'gte', 'lte'],
        'recommande': ['exact'],
        'est_valide': ['exact'],
        'est_signale': ['exact'],
    }
    
    # Recherche
    search_fields = [
        'titre',
        'commentaire',
        'client__nom',
        'client__prenom',
        'vehicule__nom_modele',
        'vehicule__marque__nom',
    ]
    
    # Tri
    ordering_fields = [
        'date_creation',
        'note',
        'nb_personnes_utile',
    ]
    ordering = ['-date_creation']
    
    def get_serializer_class(self):
        """Retourner le serializer approprié selon l'action."""
        if self.action == 'list':
            return AvisListSerializer
        elif self.action == 'create':
            return AvisCreateSerializer
        elif self.action == 'repondre':
            return AvisRepondreSerializer
        elif self.action == 'signaler':
            return AvisSignalerSerializer
        elif self.action == 'moderer':
            return AvisModererSerializer
        return AvisSerializer
    
    def get_permissions(self):
        """
        Permissions :
        - Création : Client uniquement
        - Modification/Suppression : Client propriétaire
        - Réponse : Concessionnaire concerné
        - Signalement : Utilisateurs authentifiés
        - Modération : Admin uniquement
        """
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsClient()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        elif self.action == 'repondre':
            return [permissions.IsAuthenticated(), IsConcessionnaire()]
        elif self.action in ['signaler', 'marquer_utile', 'marquer_inutile']:
            return [permissions.IsAuthenticated()]
        elif self.action == 'moderer':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        """Filtrer selon le type d'utilisateur et la visibilité."""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Pour les non-authentifiés et clients : voir uniquement les avis validés
        if not user.is_authenticated or user.is_client():
            queryset = queryset.filter(est_valide=True)
        
        # Admin : voit tout
        
        return queryset
    
    def perform_create(self, serializer):
        """Créer un avis."""
        avis = serializer.save(client=self.request.user)
        
        # TODO: Créer une notification pour le concessionnaire
        # from notifications.models import Notification
        # Notification.objects.create(...)
        
        return avis
    
    def perform_update(self, serializer):
        """Mettre à jour un avis."""
        # Vérifier que c'est le client qui a créé l'avis
        if serializer.instance.client != self.request.user:
            raise permissions.PermissionDenied(
                "Vous ne pouvez modifier que vos propres avis"
            )
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """Supprimer un avis."""
        # Vérifier que c'est le client qui a créé l'avis
        if instance.client != self.request.user:
            raise permissions.PermissionDenied(
                "Vous ne pouvez supprimer que vos propres avis"
            )
        
        instance.delete()
    
    # ========================================
    # ACTIONS PERSONNALISÉES
    # ========================================
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated, IsClient]
    )
    def mes_avis(self, request):
        """
        Récupérer tous les avis du client connecté.
        GET /api/avis/mes-avis/
        """
        queryset = self.filter_queryset(
            self.get_queryset().filter(client=request.user)
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AvisListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = AvisListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(
        detail=False,
        methods=['get'],
        url_path='vehicule/(?P<vehicule_id>[^/.]+)'
    )
    def avis_vehicule(self, request, vehicule_id=None):
        """
        Récupérer tous les avis d'un véhicule.
        GET /api/avis/vehicule/{vehicule_id}/
        """
        queryset = self.filter_queryset(
            self.get_queryset().filter(
                vehicule_id=vehicule_id,
                est_valide=True
            )
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AvisSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = AvisSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def repondre(self, request, pk=None):
        """
        Répondre à un avis.
        PATCH /api/avis/{id}/repondre/
        
        Body:
        {
            "reponse": "Merci pour votre avis..."
        }
        """
        avis = self.get_object()
        
        # Vérifier que c'est le concessionnaire du véhicule
        if avis.vehicule.concessionnaire != request.user:
            return Response(
                {"error": "Vous ne pouvez répondre qu'aux avis sur vos véhicules"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier qu'il n'y a pas déjà une réponse
        if avis.a_reponse:
            return Response(
                {"error": "Vous avez déjà répondu à cet avis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Valider les données
        serializer = AvisRepondreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Ajouter la réponse
        avis.repondre(
            reponse=serializer.validated_data['reponse'],
            user=request.user
        )
        
        # TODO: Créer une notification pour le client
        # Notification.objects.create(...)
        
        return Response(
            AvisSerializer(avis, context={'request': request}).data,
            status=status.HTTP_200_OK
        )
    
    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def signaler(self, request, pk=None):
        """
        Signaler un avis comme inapproprié.
        PATCH /api/avis/{id}/signaler/
        
        Body:
        {
            "raison": "Contenu inapproprié..."
        }
        """
        avis = self.get_object()
        
        # Vérifier que ce n'est pas son propre avis
        if avis.client == request.user:
            return Response(
                {"error": "Vous ne pouvez pas signaler votre propre avis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier qu'il n'est pas déjà signalé
        if avis.est_signale:
            return Response(
                {"error": "Cet avis est déjà signalé"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Valider les données
        serializer = AvisSignalerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Signaler l'avis
        avis.signaler(raison=serializer.validated_data['raison'])
        
        # TODO: Notifier les administrateurs
        # Notification.objects.create(...)
        
        return Response(
            {"message": "Avis signalé avec succès"},
            status=status.HTTP_200_OK
        )
    
    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[permissions.IsAdminUser]
    )
    def moderer(self, request, pk=None):
        """
        Modérer un avis (valider/invalider).
        PATCH /api/avis/{id}/moderer/
        
        Body:
        {
            "valide": true/false,
            "raison": "..."  (optionnel)
        }
        """
        avis = self.get_object()
        
        # Valider les données
        serializer = AvisModererSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Modérer l'avis
        avis.moderer(
            valide=serializer.validated_data['valide'],
            user=request.user
        )
        
        # Si l'avis est invalidé, notifier le client
        if not serializer.validated_data['valide']:
            # TODO: Notification au client
            pass
        
        return Response(
            AvisSerializer(avis, context={'request': request}).data,
            status=status.HTTP_200_OK
        )
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def marquer_utile(self, request, pk=None):
        """
        Marquer un avis comme utile.
        POST /api/avis/{id}/utile/
        """
        avis = self.get_object()
        
        # Ne pas pouvoir voter pour son propre avis
        if avis.client == request.user:
            return Response(
                {"error": "Vous ne pouvez pas voter pour votre propre avis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        avis.marquer_utile()
        
        return Response(
            {
                "message": "Merci pour votre vote",
                "nb_personnes_utile": avis.nb_personnes_utile,
                "score_utilite": avis.score_utilite
            },
            status=status.HTTP_200_OK
        )
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def marquer_inutile(self, request, pk=None):
        """
        Marquer un avis comme inutile.
        POST /api/avis/{id}/inutile/
        """
        avis = self.get_object()
        
        # Ne pas pouvoir voter pour son propre avis
        if avis.client == request.user:
            return Response(
                {"error": "Vous ne pouvez pas voter pour votre propre avis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        avis.marquer_inutile()
        
        return Response(
            {
                "message": "Merci pour votre vote",
                "nb_personnes_inutile": avis.nb_personnes_inutile,
                "score_utilite": avis.score_utilite
            },
            status=status.HTTP_200_OK
        )
    
    @action(
        detail=False,
        methods=['get']
    )
    def statistiques(self, request):
        """
        Statistiques sur les avis.
        GET /api/avis/statistiques/
        """
        from django.db.models import Avg, Count
        
        queryset = self.get_queryset().filter(est_valide=True)
        
        # Statistiques globales
        stats = queryset.aggregate(
            total=Count('id'),
            note_moyenne=Avg('note'),
            avec_reponse=Count('id', filter=Q(reponse__isnull=False)),
            recommandes=Count('id', filter=Q(recommande=True)),
        )
        
        # Distribution des notes
        distribution_notes = {}
        for i in range(1, 6):
            distribution_notes[f'note_{i}'] = queryset.filter(note=i).count()
        
        stats['distribution_notes'] = distribution_notes
        
        # Taux de réponse
        if stats['total'] > 0:
            stats['taux_reponse'] = round((stats['avec_reponse'] / stats['total']) * 100, 1)
            stats['taux_recommandation'] = round((stats['recommandes'] / stats['total']) * 100, 1)
        else:
            stats['taux_reponse'] = 0
            stats['taux_recommandation'] = 0
        
        return Response(stats)