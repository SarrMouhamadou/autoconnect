from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, Count

from .models import Region, Concession
from .serializers import (
    RegionSerializer,
    ConcessionListSerializer,
    ConcessionDetailSerializer,
    ConcessionCreateSerializer,
    ConcessionUpdateSerializer,
    ConcessionValidationSerializer,
    ConcessionStatsSerializer
)
from users.permissions import IsConcessionnaire, IsAdministrateur


# ========================================
# PERMISSION PERSONNALISÉE
# ========================================

class IsConcessionOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission qui permet:
    - Lecture à tous
    - Modification/Suppression uniquement au propriétaire de la concession
    """
    
    def has_object_permission(self, request, view, obj):
        # Lecture autorisée pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Modification/Suppression uniquement pour le propriétaire
        return obj.concessionnaire == request.user


# ========================================
# VIEWSET RÉGION
# ========================================

class RegionViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les régions.
    
    Liste des endpoints:
    - GET /api/regions/ - Liste toutes les régions
    - GET /api/regions/{id}/ - Détails d'une région
    - POST /api/regions/ - Créer une région (Admin uniquement)
    - PUT/PATCH /api/regions/{id}/ - Modifier une région (Admin uniquement)
    - DELETE /api/regions/{id}/ - Supprimer une région (Admin uniquement)
    - GET /api/regions/{id}/concessions/ - Liste des concessions d'une région
    """
    
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'code']
    ordering_fields = ['nom', 'nombre_concessions']
    ordering = ['nom']
    
    def get_permissions(self):
        """
        Permissions:
        - Liste et détails: Public
        - Création, modification, suppression: Admin uniquement
        """
        if self.action in ['list', 'retrieve', 'concessions']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated, IsAdministrateur]
        
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['get'])
    def concessions(self, request, pk=None):
        """
        Retourne la liste des concessions d'une région.
        GET /api/regions/{id}/concessions/
        """
        region = self.get_object()
        concessions = region.concessions.filter(
            statut='VALIDE',
            est_visible=True
        )
        
        serializer = ConcessionListSerializer(
            concessions,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'region': RegionSerializer(region).data,
            'count': concessions.count(),
            'concessions': serializer.data
        })


# ========================================
# VIEWSET CONCESSION
# ========================================

class ConcessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les concessions.
    
    Liste des endpoints:
    - GET /api/concessions/ - Liste toutes les concessions validées
    - GET /api/concessions/{id}/ - Détails d'une concession
    - POST /api/concessions/ - Créer une concession (Concessionnaire uniquement)
    - PUT/PATCH /api/concessions/{id}/ - Modifier une concession (Propriétaire uniquement)
    - DELETE /api/concessions/{id}/ - Supprimer une concession (Propriétaire uniquement)
    - GET /api/concessions/mes_concessions/ - Mes concessions (Concessionnaire)
    - GET /api/concessions/en_attente/ - Concessions en attente (Admin)
    - POST /api/concessions/{id}/valider/ - Valider une concession (Admin)
    - POST /api/concessions/{id}/rejeter/ - Rejeter une concession (Admin)
    - POST /api/concessions/{id}/suspendre/ - Suspendre une concession (Admin)
    - GET /api/concessions/recherche_proximite/ - Recherche par proximité
    - POST /api/concessions/{id}/incrementer_vues/ - Incrémenter les vues
    """
    
    queryset = Concession.objects.select_related(
        'concessionnaire',
        'region',
        'validee_par'
    ).all()
    
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    
    filterset_fields = {
        'region': ['exact'],
        'ville': ['exact', 'icontains'],
        'statut': ['exact'],
        'ouvert_weekend': ['exact'],
        'note_moyenne': ['gte', 'lte'],
    }
    
    search_fields = ['nom', 'description', 'ville', 'adresse', 'services']
    ordering_fields = ['date_creation', 'note_moyenne', 'nombre_vehicules', 'nombre_vues']
    ordering = ['-date_creation']
    
    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action."""
        if self.action == 'list':
            return ConcessionListSerializer
        elif self.action in ['create']:
            return ConcessionCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ConcessionUpdateSerializer
        elif self.action in ['valider', 'rejeter', 'suspendre']:
            return ConcessionValidationSerializer
        elif self.action == 'statistiques':
            return ConcessionStatsSerializer
        return ConcessionDetailSerializer
    
    def get_permissions(self):
        """Définit les permissions selon l'action."""
        if self.action in ['list', 'retrieve', 'recherche_proximite']:
            # Liste et détails publics (concessions validées uniquement)
            permission_classes = [permissions.AllowAny]
        elif self.action == 'create':
            # Création réservée aux concessionnaires
            permission_classes = [permissions.IsAuthenticated, IsConcessionnaire]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Modification/suppression par le propriétaire uniquement
            permission_classes = [permissions.IsAuthenticated, IsConcessionOwnerOrReadOnly]
        elif self.action in ['mes_concessions']:
            # Mes concessions : concessionnaire connecté
            permission_classes = [permissions.IsAuthenticated, IsConcessionnaire]
        elif self.action in ['en_attente', 'valider', 'rejeter', 'suspendre']:
            # Actions admin
            permission_classes = [permissions.IsAuthenticated, IsAdministrateur]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filtre le queryset selon l'action et l'utilisateur."""
        queryset = super().get_queryset()
        
        # Pour la liste publique, afficher uniquement les concessions validées et visibles
        if self.action == 'list':
            queryset = queryset.filter(
                statut='VALIDE',
                est_visible=True
            )
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve pour incrémenter le compteur de vues."""
        instance = self.get_object()
        
        # Incrémenter les vues uniquement si ce n'est pas le propriétaire
        if not request.user.is_authenticated or request.user != instance.concessionnaire:
            instance.incrementer_vues()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    # ========================================
    # ACTION : MES CONCESSIONS
    # ========================================
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def mes_concessions(self, request):
        """
        Retourne les concessions du concessionnaire connecté.
        GET /api/concessions/mes_concessions/
        """
        concessions = self.get_queryset().filter(
            concessionnaire=request.user
        )
        
        serializer = ConcessionDetailSerializer(
            concessions,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'count': concessions.count(),
            'concessions': serializer.data
        })
    
    # ========================================
    # ACTION : CONCESSIONS EN ATTENTE (ADMIN)
    # ========================================
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated, IsAdministrateur]
    )
    def en_attente(self, request):
        """
        Retourne les concessions en attente de validation.
        GET /api/concessions/en_attente/
        """
        concessions = self.get_queryset().filter(statut='EN_ATTENTE')
        
        serializer = ConcessionDetailSerializer(
            concessions,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'count': concessions.count(),
            'concessions': serializer.data
        })
    
    # ========================================
    # ACTION : VALIDER UNE CONCESSION (ADMIN)
    # ========================================
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated, IsAdministrateur]
    )
    def valider(self, request, pk=None):
        """
        Valide une concession.
        POST /api/concessions/{id}/valider/
        """
        concession = self.get_object()
        
        if concession.statut == 'VALIDE':
            return Response({
                'error': 'Cette concession est déjà validée'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        concession.statut = 'VALIDE'
        concession.date_validation = timezone.now()
        concession.validee_par = request.user
        concession.raison_rejet = ''
        concession.save()
        
        serializer = ConcessionDetailSerializer(
            concession,
            context={'request': request}
        )
        
        return Response({
            'message': 'Concession validée avec succès',
            'concession': serializer.data
        })
    
    # ========================================
    # ACTION : REJETER UNE CONCESSION (ADMIN)
    # ========================================
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated, IsAdministrateur]
    )
    def rejeter(self, request, pk=None):
        """
        Rejette une concession.
        POST /api/concessions/{id}/rejeter/
        
        Body:
        {
            "raison_rejet": "Raison du rejet"
        }
        """
        concession = self.get_object()
        raison_rejet = request.data.get('raison_rejet')
        
        if not raison_rejet:
            return Response({
                'error': 'La raison du rejet est obligatoire'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        concession.statut = 'REJETE'
        concession.raison_rejet = raison_rejet
        concession.date_validation = timezone.now()
        concession.validee_par = request.user
        concession.save()
        
        serializer = ConcessionDetailSerializer(
            concession,
            context={'request': request}
        )
        
        return Response({
            'message': 'Concession rejetée',
            'concession': serializer.data
        })
    
    # ========================================
    # ACTION : SUSPENDRE UNE CONCESSION (ADMIN)
    # ========================================
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated, IsAdministrateur]
    )
    def suspendre(self, request, pk=None):
        """
        Suspend une concession.
        POST /api/concessions/{id}/suspendre/
        
        Body (optionnel):
        {
            "raison": "Raison de la suspension"
        }
        """
        concession = self.get_object()
        raison = request.data.get('raison', '')
        
        concession.statut = 'SUSPENDU'
        if raison:
            concession.raison_rejet = raison
        concession.save()
        
        serializer = ConcessionDetailSerializer(
            concession,
            context={'request': request}
        )
        
        return Response({
            'message': 'Concession suspendue',
            'concession': serializer.data
        })
    
    # ========================================
    # ACTION : RECHERCHE PAR PROXIMITÉ
    # ========================================
    
    @action(detail=False, methods=['get'])
    def recherche_proximite(self, request):
        """
        Recherche les concessions à proximité d'une position GPS.
        GET /api/concessions/recherche_proximite/?latitude=14.7167&longitude=-17.4677&rayon=10
        
        Params:
        - latitude: Latitude de la position
        - longitude: Longitude de la position
        - rayon: Rayon de recherche en km (défaut: 10km)
        """
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        rayon = float(request.query_params.get('rayon', 10))  # km
        
        if not latitude or not longitude:
            return Response({
                'error': 'Les paramètres latitude et longitude sont obligatoires'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except ValueError:
            return Response({
                'error': 'Latitude et longitude doivent être des nombres'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # TODO: Implémenter le calcul de distance avec la formule de Haversine
        # Pour l'instant, retourner toutes les concessions validées
        concessions = self.get_queryset().filter(
            statut='VALIDE',
            est_visible=True
        )
        
        serializer = ConcessionListSerializer(
            concessions,
            many=True,
            context={
                'request': request,
                'user_position': (latitude, longitude)
            }
        )
        
        return Response({
            'position': {
                'latitude': latitude,
                'longitude': longitude
            },
            'rayon_km': rayon,
            'count': concessions.count(),
            'concessions': serializer.data
        })
    
    # ========================================
    # ACTION : STATISTIQUES
    # ========================================
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated, IsAdministrateur]
    )
    def statistiques(self, request):
        """
        Retourne les statistiques globales des concessions.
        GET /api/concessions/statistiques/
        """
        from django.db.models import Sum, Avg
        
        total = Concession.objects.count()
        validees = Concession.objects.filter(statut='VALIDE').count()
        en_attente = Concession.objects.filter(statut='EN_ATTENTE').count()
        rejetees = Concession.objects.filter(statut='REJETE').count()
        suspendues = Concession.objects.filter(statut='SUSPENDU').count()
        
        stats = {
            'total': total,
            'validees': validees,
            'en_attente': en_attente,
            'rejetees': rejetees,
            'suspendues': suspendues,
            'total_vehicules': Concession.objects.aggregate(
                Sum('nombre_vehicules')
            )['nombre_vehicules__sum'] or 0,
            'note_moyenne_globale': Concession.objects.filter(
                statut='VALIDE'
            ).aggregate(
                Avg('note_moyenne')
            )['note_moyenne__avg'] or 0,
        }
        
        # Répartition par région
        repartition_regions = Region.objects.annotate(
            nb_concessions=Count('concessions')
        ).values('nom', 'nb_concessions').order_by('-nb_concessions')
        
        stats['repartition_regions'] = list(repartition_regions)
        
        return Response(stats)