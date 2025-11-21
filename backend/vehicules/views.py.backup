from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Vehicule, ImageVehicule, Equipement
from .serializers import (
    VehiculeSerializer,
    VehiculeListSerializer,
    VehiculeCreateSerializer,
    VehiculeUpdateSerializer,
    ImageVehiculeSerializer,
    EquipementSerializer,
    AjouterImagesSerializer
)


# ========================================
# PERMISSION PERSONNALISÉE
# ========================================

class IsConcessionnaire(permissions.BasePermission):
    """
    Permission : Seulement les concessionnaires peuvent créer/modifier/supprimer.
    """
    
    def has_permission(self, request, view):
        # Lecture : tout le monde (même non authentifié)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Écriture : seulement les concessionnaires authentifiés
        return (
            request.user and
            request.user.is_authenticated and
            request.user.type_utilisateur == 'CONCESSIONNAIRE'
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission : Seulement le propriétaire peut modifier/supprimer son véhicule.
    """
    
    def has_object_permission(self, request, view, obj):
        # Lecture : tout le monde
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Écriture : seulement le propriétaire ou admin
        return (
            obj.concessionnaire == request.user or
            request.user.is_staff
        )


# ========================================
# VIEWSET VÉHICULES
# ========================================

class VehiculeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les véhicules.
    
    Endpoints:
    - GET    /api/vehicules/              -> Liste des véhicules (avec filtres)
    - POST   /api/vehicules/              -> Créer un véhicule (concessionnaire)
    - GET    /api/vehicules/{id}/         -> Détails d'un véhicule
    - PUT    /api/vehicules/{id}/         -> Modifier un véhicule (propriétaire)
    - PATCH  /api/vehicules/{id}/         -> Modifier partiellement
    - DELETE /api/vehicules/{id}/         -> Supprimer un véhicule (propriétaire)
    
    Actions supplémentaires:
    - GET    /api/vehicules/mes-vehicules/        -> Mes véhicules (concessionnaire)
    - POST   /api/vehicules/{id}/ajouter-images/  -> Ajouter des images
    - DELETE /api/vehicules/{id}/supprimer-image/{image_id}/ -> Supprimer une image
    - POST   /api/vehicules/{id}/changer-statut/  -> Changer le statut
    """
    
    queryset = Vehicule.objects.select_related('concessionnaire').prefetch_related('images').all()
    permission_classes = [IsConcessionnaire, IsOwnerOrReadOnly]
    
    # Filtres et recherche
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    
    # Champs filtrables
    filterset_fields = {
        'marque': ['exact', 'icontains'],
        'modele': ['exact', 'icontains'],
        'annee': ['exact', 'gte', 'lte'],
        'type_vehicule': ['exact'],
        'type_carburant': ['exact'],
        'transmission': ['exact'],
        'nombre_places': ['exact', 'gte', 'lte'],
        'prix_location_jour': ['exact', 'gte', 'lte'],
        'statut': ['exact'],
        'est_disponible_vente': ['exact'],
        'est_disponible_location': ['exact'],
    }
    
    # Champs de recherche
    search_fields = ['marque', 'modele', 'description']
    
    # Tri
    ordering_fields = [
        'prix_location_jour', 'annee', 'kilometrage',
        'note_moyenne', 'nombre_locations', 'date_ajout'
    ]
    ordering = ['-date_ajout']  # Par défaut : plus récents d'abord
    
    def get_serializer_class(self):
        """Choisir le serializer selon l'action."""
        
        if self.action == 'list':
            return VehiculeListSerializer
        elif self.action == 'create':
            return VehiculeCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return VehiculeUpdateSerializer
        elif self.action == 'ajouter_images':
            return AjouterImagesSerializer
        
        return VehiculeSerializer
    
    def get_queryset(self):
        """Personnaliser le queryset selon le contexte."""
        queryset = super().get_queryset()
        
        # Si l'utilisateur est authentifié et concessionnaire,
        # on peut inclure ses propres véhicules non disponibles
        if self.request.user.is_authenticated:
            if self.request.user.type_utilisateur == 'CONCESSIONNAIRE':
                # Le concessionnaire voit tous ses véhicules
                return queryset
        
        # Pour les autres (clients, visiteurs), seulement les véhicules disponibles
        if self.action == 'list':
            queryset = queryset.filter(
                statut='DISPONIBLE'
            ).filter(
                Q(est_disponible_vente=True) | Q(est_disponible_location=True)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """Créer un véhicule et l'attribuer au concessionnaire connecté."""
        serializer.save(concessionnaire=self.request.user)
    
    # ========================================
    # ACTION : MES VÉHICULES
    # ========================================
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def mes_vehicules(self, request):
        """
        Récupérer tous les véhicules du concessionnaire connecté.
        GET /api/vehicules/mes-vehicules/
        """
        
        queryset = self.get_queryset().filter(
            concessionnaire=request.user
        )
        
        # Appliquer les filtres
        queryset = self.filter_queryset(queryset)
        
        # Pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = VehiculeListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = VehiculeListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    # ========================================
    # ACTION : AJOUTER DES IMAGES
    # ========================================
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated, IsOwnerOrReadOnly]
    )
    def ajouter_images(self, request, pk=None):
        """
        Ajouter des images supplémentaires à un véhicule.
        POST /api/vehicules/{id}/ajouter-images/
        
        Body (multipart/form-data):
        - images: Liste de fichiers images
        """
        
        vehicule = self.get_object()
        
        serializer = AjouterImagesSerializer(
            data=request.data,
            context={'vehicule': vehicule}
        )
        
        if serializer.is_valid():
            images_created = serializer.save()
            
            return Response({
                'message': f'{len(images_created)} image(s) ajoutée(s) avec succès',
                'images': ImageVehiculeSerializer(images_created, many=True).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # ========================================
    # ACTION : SUPPRIMER UNE IMAGE
    # ========================================
    
    @action(
        detail=True,
        methods=['delete'],
        url_path='supprimer-image/(?P<image_id>[^/.]+)',
        permission_classes=[permissions.IsAuthenticated, IsOwnerOrReadOnly]
    )
    def supprimer_image(self, request, pk=None, image_id=None):
        """
        Supprimer une image d'un véhicule.
        DELETE /api/vehicules/{id}/supprimer-image/{image_id}/
        """
        
        vehicule = self.get_object()
        
        try:
            image = ImageVehicule.objects.get(
                id=image_id,
                vehicule=vehicule
            )
            image.delete()
            
            return Response({
                'message': 'Image supprimée avec succès'
            }, status=status.HTTP_200_OK)
        
        except ImageVehicule.DoesNotExist:
            return Response({
                'error': 'Image non trouvée'
            }, status=status.HTTP_404_NOT_FOUND)
    
    # ========================================
    # ACTION : CHANGER LE STATUT
    # ========================================
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated, IsOwnerOrReadOnly]
    )
    @action(
    detail=True,
    methods=['post'],
    permission_classes=[permissions.IsAuthenticated, IsOwnerOrReadOnly]
)
    def changer_statut(self, request, pk=None):
        """
        Changer le statut d'un véhicule.
        POST /api/vehicules/{id}/changer-statut/
        
        Body:
        {
            "statut": "DISPONIBLE" | "LOUE" | "MAINTENANCE" | "INDISPONIBLE"
        }
        """
        
        vehicule = self.get_object()
        
        nouveau_statut = request.data.get('statut')
        
        # Validation du statut
        statuts_valides = [choice[0] for choice in Vehicule.STATUT_CHOICES]
        
        if not nouveau_statut or nouveau_statut not in statuts_valides:
            return Response({
                'error': f'Statut invalide. Valeurs possibles: {", ".join(statuts_valides)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mise à jour
        vehicule.statut = nouveau_statut
        vehicule.save()
        
        serializer = VehiculeSerializer(vehicule)
        return Response({
            'message': 'Statut mis à jour avec succès',
            'vehicule': serializer.data
        })
        
        # ========================================
        # ACTION : STATISTIQUES DU VÉHICULE
        # ========================================
        
        @action(
            detail=True,
            methods=['get'],
            permission_classes=[permissions.IsAuthenticated, IsOwnerOrReadOnly]
        )
        def statistiques(self, request, pk=None):
            """
            Récupérer les statistiques d'un véhicule.
            GET /api/vehicules/{id}/statistiques/
            """
            
            vehicule = self.get_object()
            
            # TODO: Calculer les vraies statistiques depuis les locations
            stats = {
                'nombre_locations': vehicule.nombre_locations,
                'note_moyenne': float(vehicule.note_moyenne),
                'nombre_avis': vehicule.nombre_avis,
                'revenu_total': 0,  # À calculer depuis les locations
                'revenu_ce_mois': 0,
                'taux_occupation': 0,  # À calculer
                'jours_loues': 0,
            }
            
            return Response(stats)


# ========================================
# VIEWSET ÉQUIPEMENTS
# ========================================

class EquipementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour lister les équipements disponibles.
    Lecture seule (gestion via l'admin Django).
    
    Endpoints:
    - GET /api/equipements/           -> Liste des équipements
    - GET /api/equipements/{id}/      -> Détails d'un équipement
    """
    
    queryset = Equipement.objects.all()
    serializer_class = EquipementSerializer
    permission_classes = [permissions.AllowAny]
    
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'description']
    ordering_fields = ['nom', 'est_populaire']
    ordering = ['-est_populaire', 'nom']
    
    @action(detail=False, methods=['get'])
    def populaires(self, request):
        """
        Liste des équipements populaires.
        GET /api/equipements/populaires/
        """
        
        equipements = self.queryset.filter(est_populaire=True)
        serializer = self.get_serializer(equipements, many=True)
        
        return Response(serializer.data)