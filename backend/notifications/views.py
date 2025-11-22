# backend/notifications/views.py
# Views pour les notifications

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Notification
from .serializers import (
    NotificationSerializer,
    NotificationCreateSerializer,
    MarquerLueSerializer
)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les notifications.
    
    Endpoints:
    - GET    /api/notifications/                - Mes notifications
    - POST   /api/notifications/                - Créer une notification (admin)
    - GET    /api/notifications/{id}/           - Détail d'une notification
    - DELETE /api/notifications/{id}/           - Supprimer une notification
    - PATCH  /api/notifications/{id}/marquer-lue/ - Marquer comme lue
    - POST   /api/notifications/marquer-toutes-lues/ - Marquer toutes comme lues
    - GET    /api/notifications/non-lues/       - Notifications non lues
    - GET    /api/notifications/compteur/       - Compteur non lues
    - DELETE /api/notifications/supprimer-lues/ - Supprimer toutes les lues
    """
    
    queryset = Notification.objects.select_related('destinataire')
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    permission_classes = [permissions.IsAuthenticated]
    
    # Filtres
    filterset_fields = {
        'type_notification': ['exact'],
        'niveau_priorite': ['exact'],
        'est_lue': ['exact'],
        'date_creation': ['gte', 'lte'],
    }
    
    # Recherche
    search_fields = [
        'titre',
        'message',
    ]
    
    # Tri
    ordering_fields = [
        'date_creation',
        'niveau_priorite',
        'est_lue',
    ]
    ordering = ['-date_creation']
    
    def get_serializer_class(self):
        """Retourner le serializer approprié."""
        if self.action == 'create':
            return NotificationCreateSerializer
        return NotificationSerializer
    
    def get_queryset(self):
        """Filtrer uniquement les notifications de l'utilisateur connecté."""
        queryset = super().get_queryset().filter(destinataire=self.request.user)
        
        # Exclure les notifications expirées (optionnel)
        # queryset = queryset.filter(
        #     Q(date_expiration__isnull=True) | Q(date_expiration__gt=timezone.now())
        # )
        
        return queryset
    
    def get_permissions(self):
        """
        Permissions : 
        - Créer : Admin uniquement
        - Autres actions : Utilisateur authentifié
        """
        if self.action == 'create':
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def perform_destroy(self, instance):
        """Supprimer une notification."""
        # Vérifier que c'est bien le destinataire
        if instance.destinataire != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "Vous ne pouvez supprimer que vos propres notifications"
            )
        instance.delete()
    
    @action(
        detail=True,
        methods=['patch']
    )
    def marquer_lue(self, request, pk=None):
        """
        Marquer une notification comme lue ou non lue.
        PATCH /api/notifications/{id}/marquer-lue/
        Body: {"est_lue": true}
        """
        notification = self.get_object()
        
        serializer = MarquerLueSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        est_lue = serializer.validated_data['est_lue']
        
        if est_lue:
            notification.marquer_comme_lue()
            message = "Notification marquée comme lue"
        else:
            notification.marquer_comme_non_lue()
            message = "Notification marquée comme non lue"
        
        return Response(
            {
                "message": message,
                "notification": NotificationSerializer(notification).data
            },
            status=status.HTTP_200_OK
        )
    
    @action(
        detail=False,
        methods=['post']
    )
    def marquer_toutes_lues(self, request):
        """
        Marquer toutes les notifications comme lues.
        POST /api/notifications/marquer-toutes-lues/
        """
        from django.utils import timezone
        
        count = self.get_queryset().filter(est_lue=False).update(
            est_lue=True,
            date_lecture=timezone.now()
        )
        
        return Response(
            {
                "message": f"{count} notification(s) marquée(s) comme lue(s)",
                "count": count
            },
            status=status.HTTP_200_OK
        )
    
    @action(
        detail=False,
        methods=['get']
    )
    def non_lues(self, request):
        """
        Récupérer uniquement les notifications non lues.
        GET /api/notifications/non-lues/
        """
        notifications = self.get_queryset().filter(est_lue=False)
        
        # Appliquer la pagination
        page = self.paginate_queryset(notifications)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(
        detail=False,
        methods=['get']
    )
    def compteur(self, request):
        """
        Récupérer le compteur de notifications non lues.
        GET /api/notifications/compteur/
        """
        count = self.get_queryset().filter(est_lue=False).count()
        
        return Response(
            {
                "non_lues": count
            },
            status=status.HTTP_200_OK
        )
    
    @action(
        detail=False,
        methods=['delete']
    )
    def supprimer_lues(self, request):
        """
        Supprimer toutes les notifications lues.
        DELETE /api/notifications/supprimer-lues/
        """
        count, _ = self.get_queryset().filter(est_lue=True).delete()
        
        return Response(
            {
                "message": f"{count} notification(s) supprimée(s)",
                "count": count
            },
            status=status.HTTP_200_OK
        )
    
    @action(
        detail=False,
        methods=['get']
    )
    def statistiques(self, request):
        """
        Statistiques des notifications.
        GET /api/notifications/statistiques/
        """
        from django.db.models import Count
        
        queryset = self.get_queryset()
        
        # Total
        total = queryset.count()
        
        # Non lues
        non_lues = queryset.filter(est_lue=False).count()
        
        # Par type
        par_type = queryset.values('type_notification').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Par priorité
        par_priorite = queryset.values('niveau_priorite').annotate(
            count=Count('id')
        ).order_by('-count')
        
        stats = {
            'total': total,
            'non_lues': non_lues,
            'lues': total - non_lues,
            'par_type': list(par_type),
            'par_priorite': list(par_priorite),
        }
        
        return Response(stats)