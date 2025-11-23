# backend/promotions/views.py
# Views pour les promotions

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count
from django.utils import timezone

from .models import Promotion, UtilisationPromotion
from .serializers import (
    PromotionListSerializer,
    PromotionDetailSerializer,
    PromotionCreateSerializer,
    VerifierCodeSerializer,
    UtilisationPromotionSerializer
)
from users.permissions import IsConcessionnaire, IsClient
from vehicules.models import Vehicule


class PromotionViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les promotions.
    
    Endpoints:
    - GET    /api/promotions/                     - Liste des promotions actives
    - POST   /api/promotions/                     - Créer une promotion (Concessionnaire)
    - GET    /api/promotions/{id}/                - Détail d'une promotion
    - PATCH  /api/promotions/{id}/                - Modifier (Concessionnaire propriétaire)
    - DELETE /api/promotions/{id}/                - Supprimer (Concessionnaire propriétaire)
    - GET    /api/promotions/mes-promotions/      - Mes promotions (Concessionnaire)
    - POST   /api/promotions/verifier-code/       - Vérifier un code promo
    - POST   /api/promotions/{id}/activer/        - Activer une promotion
    - POST   /api/promotions/{id}/desactiver/     - Désactiver une promotion
    - GET    /api/promotions/{id}/utilisations/   - Historique d'utilisation
    - GET    /api/promotions/statistiques/        - Statistiques
    """
    
    queryset = Promotion.objects.select_related(
        'concessionnaire',
        'concession'
    ).prefetch_related(
        'vehicules',
        'categories',
        'clients_cibles'
    )
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtres
    filterset_fields = {
        'type_reduction': ['exact'],
        'statut': ['exact'],
        'date_debut': ['gte', 'lte'],
        'date_fin': ['gte', 'lte'],
        'est_cumulable': ['exact'],
        'est_visible': ['exact'],
    }
    
    # Recherche
    search_fields = [
        'nom',
        'description',
        'code',
    ]
    
    # Tri
    ordering_fields = [
        'date_creation',
        'date_debut',
        'date_fin',
        'valeur_reduction',
        'nombre_utilisations',
    ]
    ordering = ['-date_creation']
    
    def get_serializer_class(self):
        """Retourner le serializer approprié."""
        if self.action in ['create', 'update', 'partial_update']:
            return PromotionCreateSerializer
        elif self.action == 'retrieve':
            return PromotionDetailSerializer
        return PromotionListSerializer
    
    def get_permissions(self):
        """Permissions selon l'action."""
        if self.action in ['create']:
            return [permissions.IsAuthenticated(), IsConcessionnaire()]
        elif self.action in ['update', 'partial_update', 'destroy', 'activer', 'desactiver', 'utilisations']:
            return [permissions.IsAuthenticated(), IsConcessionnaire()]
        elif self.action == 'verifier_code':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        """Personnaliser le queryset selon l'utilisateur."""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Pour la liste publique, afficher uniquement les promotions actives et visibles
        if self.action == 'list':
            queryset = queryset.filter(
                statut='ACTIF',
                est_visible=True,
                date_debut__lte=timezone.now().date(),
                date_fin__gte=timezone.now().date()
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """Créer une promotion."""
        serializer.save(concessionnaire=self.request.user)
    
    def perform_update(self, serializer):
        """Vérifier que c'est le propriétaire."""
        if serializer.instance.concessionnaire != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous ne pouvez modifier que vos propres promotions")
        serializer.save()
    
    def perform_destroy(self, instance):
        """Vérifier que c'est le propriétaire."""
        if instance.concessionnaire != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous ne pouvez supprimer que vos propres promotions")
        instance.delete()
    
    # ========================================
    # ACTIONS PERSONNALISÉES
    # ========================================
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def mes_promotions(self, request):
        """
        Récupérer les promotions du concessionnaire connecté.
        GET /api/promotions/mes-promotions/
        """
        queryset = self.filter_queryset(
            Promotion.objects.filter(concessionnaire=request.user)
        )
        
        # Appliquer la pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PromotionDetailSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = PromotionDetailSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(
        detail=False,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def verifier_code(self, request):
        """
        Vérifier si un code promo est valide.
        POST /api/promotions/verifier-code/
        
        Body:
        {
            "code": "SUMMER2024",
            "vehicule_id": 123,  // optionnel
            "montant": 50000     // optionnel
        }
        """
        serializer = VerifierCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        code = serializer.validated_data['code'].upper().strip()
        vehicule_id = serializer.validated_data.get('vehicule_id')
        montant = serializer.validated_data.get('montant')
        
        # Chercher la promotion
        try:
            promotion = Promotion.objects.get(code=code)
        except Promotion.DoesNotExist:
            return Response({
                'valide': False,
                'message': "Code promo invalide"
            }, status=status.HTTP_200_OK)
        
        # Vérifier si valide
        if not promotion.est_valide:
            if promotion.statut == 'EXPIRE':
                message = "Ce code promo a expiré"
            elif promotion.statut == 'INACTIF':
                message = "Ce code promo est désactivé"
            elif promotion.nombre_utilisations_max and promotion.nombre_utilisations >= promotion.nombre_utilisations_max:
                message = "Ce code promo a atteint sa limite d'utilisation"
            else:
                message = "Ce code promo n'est pas valide actuellement"
            
            return Response({
                'valide': False,
                'message': message
            }, status=status.HTTP_200_OK)
        
        # Vérifier si le client peut l'utiliser
        peut_utiliser, message = promotion.peut_etre_utilise_par(request.user)
        if not peut_utiliser:
            return Response({
                'valide': False,
                'message': message
            }, status=status.HTTP_200_OK)
        
        # Vérifier si applicable au véhicule
        if vehicule_id:
            try:
                vehicule = Vehicule.objects.get(id=vehicule_id)
                if not promotion.applicable_a_vehicule(vehicule):
                    return Response({
                        'valide': False,
                        'message': "Ce code promo ne s'applique pas à ce véhicule"
                    }, status=status.HTTP_200_OK)
            except Vehicule.DoesNotExist:
                pass
        
        # Vérifier le montant minimum
        if montant and promotion.montant_minimum:
            if montant < promotion.montant_minimum:
                return Response({
                    'valide': False,
                    'message': f"Montant minimum requis : {int(promotion.montant_minimum):,} FCFA".replace(',', ' ')
                }, status=status.HTTP_200_OK)
        
        # Calculer la réduction estimée
        reduction_estimee = None
        if montant:
            reduction_estimee = promotion.calculer_reduction(montant)
        
        return Response({
            'valide': True,
            'message': "Code promo valide",
            'promotion': PromotionListSerializer(promotion).data,
            'reduction_estimee': reduction_estimee
        }, status=status.HTTP_200_OK)
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def activer(self, request, pk=None):
        """
        Activer une promotion.
        POST /api/promotions/{id}/activer/
        """
        promotion = self.get_object()
        
        # Vérifier propriétaire
        if promotion.concessionnaire != request.user:
            return Response(
                {"error": "Vous ne pouvez activer que vos propres promotions"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier si déjà active
        if promotion.statut == 'ACTIF':
            return Response(
                {"error": "Cette promotion est déjà active"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier si pas expirée
        if timezone.now().date() > promotion.date_fin:
            return Response(
                {"error": "Impossible d'activer une promotion expirée"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        promotion.statut = 'ACTIF'
        promotion.save(update_fields=['statut'])
        
        return Response({
            "message": "Promotion activée avec succès",
            "promotion": PromotionDetailSerializer(promotion).data
        }, status=status.HTTP_200_OK)
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def desactiver(self, request, pk=None):
        """
        Désactiver une promotion.
        POST /api/promotions/{id}/desactiver/
        """
        promotion = self.get_object()
        
        # Vérifier propriétaire
        if promotion.concessionnaire != request.user:
            return Response(
                {"error": "Vous ne pouvez désactiver que vos propres promotions"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier si déjà inactive
        if promotion.statut == 'INACTIF':
            return Response(
                {"error": "Cette promotion est déjà désactivée"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        promotion.statut = 'INACTIF'
        promotion.save(update_fields=['statut'])
        
        return Response({
            "message": "Promotion désactivée avec succès",
            "promotion": PromotionDetailSerializer(promotion).data
        }, status=status.HTTP_200_OK)
    
    @action(
        detail=True,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def utilisations(self, request, pk=None):
        """
        Historique d'utilisation d'une promotion.
        GET /api/promotions/{id}/utilisations/
        """
        promotion = self.get_object()
        
        # Vérifier propriétaire
        if promotion.concessionnaire != request.user:
            return Response(
                {"error": "Vous ne pouvez voir que vos propres promotions"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        utilisations = promotion.utilisations.select_related('client', 'location')
        
        # Appliquer la pagination
        page = self.paginate_queryset(utilisations)
        if page is not None:
            serializer = UtilisationPromotionSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = UtilisationPromotionSerializer(utilisations, many=True)
        return Response(serializer.data)
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def statistiques(self, request):
        """
        Statistiques des promotions du concessionnaire.
        GET /api/promotions/statistiques/
        """
        promotions = Promotion.objects.filter(concessionnaire=request.user)
        utilisations = UtilisationPromotion.objects.filter(
            promotion__concessionnaire=request.user
        )
        
        # Stats globales
        total_promotions = promotions.count()
        promotions_actives = promotions.filter(statut='ACTIF').count()
        total_utilisations = utilisations.count()
        total_reductions = utilisations.aggregate(
            total=Sum('montant_reduction')
        )['total'] or 0
        
        # Top 5 des promotions les plus utilisées
        top_promotions = promotions.order_by('-nombre_utilisations')[:5]
        
        # Utilisations par mois (6 derniers mois)
        from django.db.models.functions import TruncMonth
        utilisations_par_mois = utilisations.annotate(
            mois=TruncMonth('date_utilisation')
        ).values('mois').annotate(
            count=Count('id'),
            total_reduction=Sum('montant_reduction')
        ).order_by('-mois')[:6]
        
        stats = {
            'total_promotions': total_promotions,
            'promotions_actives': promotions_actives,
            'total_utilisations': total_utilisations,
            'total_reductions': float(total_reductions),
            'top_promotions': PromotionListSerializer(top_promotions, many=True).data,
            'utilisations_par_mois': list(utilisations_par_mois),
        }
        
        return Response(stats)