from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from favoris.models import Historique

from vehicules.models import Marque, Categorie, Vehicule, Photo, Video
from vehicules.serializers import (
    MarqueSerializer, MarqueCreateSerializer,
    CategorieSerializer, CategorieCreateSerializer,
    VehiculeSerializer, VehiculeListSerializer, VehiculeCreateSerializer,
    PhotoSerializer, PhotoCreateSerializer,
    VideoSerializer, VideoCreateSerializer
)
from users.permissions import IsConcessionnaire, IsAdministrateur


# ========================================
# VIEWSET MARQUE
# ========================================

class MarqueViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les marques de véhicules."""
    
    queryset = Marque.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'pays_origine']
    ordering_fields = ['nom', 'nombre_vehicules', 'date_creation']
    ordering = ['nom']
    
    def get_serializer_class(self):
        """Retourner le serializer approprié selon l'action."""
        if self.action in ['create', 'update', 'partial_update']:
            return MarqueCreateSerializer
        return MarqueSerializer
    
    def get_permissions(self):
        """Permissions : Liste/détail public, CUD admin uniquement."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdministrateur()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        """Personnaliser le queryset."""
        queryset = super().get_queryset()
        
        # Filtrer par statut actif (pour les non-admins)
        if not self.request.user.is_authenticated or not self.request.user.is_administrateur():
            queryset = queryset.filter(est_active=True)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def populaires(self, request):
        """Retourner les marques les plus populaires."""
        marques = self.get_queryset().filter(
            est_active=True,
            nombre_vehicules__gt=0
        ).order_by('-nombre_vehicules')[:10]
        
        serializer = self.get_serializer(marques, many=True)
        return Response(serializer.data)


# ========================================
# VIEWSET CATÉGORIE
# ========================================

class CategorieViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les catégories de véhicules."""
    
    queryset = Categorie.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'description']
    ordering_fields = ['nom', 'ordre', 'nombre_vehicules']
    ordering = ['ordre', 'nom']
    
    def get_serializer_class(self):
        """Retourner le serializer approprié selon l'action."""
        if self.action in ['create', 'update', 'partial_update']:
            return CategorieCreateSerializer
        return CategorieSerializer
    
    def get_permissions(self):
        """Permissions : Liste/détail public, CUD admin uniquement."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdministrateur()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        """Personnaliser le queryset."""
        queryset = super().get_queryset()
        
        # Filtrer par statut actif (pour les non-admins)
        if not self.request.user.is_authenticated or not self.request.user.is_administrateur():
            queryset = queryset.filter(est_active=True)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def populaires(self, request):
        """Retourner les catégories les plus populaires."""
        categories = self.get_queryset().filter(
            est_active=True,
            nombre_vehicules__gt=0
        ).order_by('-nombre_vehicules')[:10]
        
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


# ========================================
# VIEWSET VÉHICULE
# ========================================

class VehiculeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les véhicules.
    ⭐ CONFORME AU DIAGRAMME DE CLASSE À 100%
    """
    
    queryset = Vehicule.objects.select_related(
        'marque',
        'categorie',
        'concession',
        'concessionnaire'
    ).prefetch_related('photos', 'videos')
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtres Django Filter
    filterset_fields = {
        'marque': ['exact'],
        'categorie': ['exact'],
        'concession': ['exact'],
        'type_carburant': ['exact'],
        'transmission': ['exact'],
        'statut': ['exact'],
        'est_disponible_vente': ['exact'],
        'est_disponible_location': ['exact'],
        'prix_location_jour': ['gte', 'lte'],
        'prix_vente': ['gte', 'lte'],
        'annee': ['gte', 'lte'],
        'nombre_places': ['exact', 'gte'],
        'climatisation': ['exact'],
    }
    
    # Recherche textuelle
    search_fields = [
        'nom_modele',
        'marque__nom',
        'categorie__nom',
        'description',
        'immatriculation',
        'concession__nom',
        'concession__ville'
    ]
    
    # Tri
    ordering_fields = [
        'prix_location_jour',
        'prix_vente',
        'annee',
        'kilometrage',
        'date_ajout',
        'note_moyenne',
        'nombre_vues'
    ]
    ordering = ['-date_ajout']
    
    def get_serializer_class(self):
        """Retourner le serializer approprié."""
        if self.action == 'list':
            return VehiculeListSerializer
        elif self.action == 'create':
            return VehiculeCreateSerializer
        return VehiculeSerializer
    
    def get_permissions(self):
        """Permissions."""
        if self.action in ['create']:
            return [permissions.IsAuthenticated(), IsConcessionnaire()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        """Personnaliser le queryset selon l'utilisateur."""
        queryset = super().get_queryset()
        
        # Si l'utilisateur est concessionnaire, voir tous ses véhicules
        if self.request.user.is_authenticated and self.request.user.is_concessionnaire():
            if self.action in ['update', 'partial_update', 'destroy', 'retrieve']:
                # Pour les actions d'édition, voir uniquement ses propres véhicules
                return queryset.filter(concessionnaire=self.request.user)
        
        # Pour les autres (clients, visiteurs), seulement les véhicules disponibles et visibles
        if self.action == 'list':
            queryset = queryset.filter(
                statut='DISPONIBLE',
                est_visible=True,
                concession__statut='VALIDE',
                concession__est_visible=True
            ).filter(
                Q(est_disponible_vente=True) | Q(est_disponible_location=True)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """Créer un véhicule et l'attribuer au concessionnaire connecté."""
        serializer.save(concessionnaire=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Récupérer un véhicule et incrémenter le compteur de vues."""
        instance = self.get_object()
        
        # Incrémenter les vues (sauf pour le propriétaire)
        if not request.user.is_authenticated or request.user != instance.concessionnaire:
            instance.incrementer_vues()
        
        serializer = self.get_serializer(instance)

        # Enregistrer dans l'historique
        if request.user.is_authenticated and request.user.is_client():
            Historique.enregistrer_action(
                utilisateur=request.user,
                type_action='CONSULTATION_VEHICULE',
                description=f"Consulté {instance.nom_complet}",
                vehicule=instance,
                request=request
            )
        return Response(serializer.data)
    
    # ========================================
    # ACTIONS PERSONNALISÉES
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
        queryset = self.get_queryset().filter(concessionnaire=request.user)
        queryset = self.filter_queryset(queryset)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = VehiculeListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = VehiculeListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(
        detail=False,
        methods=['get']
    )
    def par_marque(self, request):
        """Grouper les véhicules par marque."""
        from django.db.models import Count
        
        marques = Marque.objects.filter(
            est_active=True,
            vehicules__statut='DISPONIBLE',
            vehicules__est_visible=True
        ).annotate(
            nombre=Count('vehicules')
        ).order_by('-nombre')
        
        data = [{
            'marque_id': m.id,
            'marque_nom': m.nom,
            'nombre_vehicules': m.nombre
        } for m in marques]
        
        return Response(data)
    
    @action(
        detail=False,
        methods=['get']
    )
    def par_categorie(self, request):
        """Grouper les véhicules par catégorie."""
        from django.db.models import Count
        
        categories = Categorie.objects.filter(
            est_active=True,
            vehicules__statut='DISPONIBLE',
            vehicules__est_visible=True
        ).annotate(
            nombre=Count('vehicules')
        ).order_by('-nombre')
        
        data = [{
            'categorie_id': c.id,
            'categorie_nom': c.nom,
            'categorie_slug': c.slug,
            'nombre_vehicules': c.nombre
        } for c in categories]
        
        return Response(data)
    
    # ========================================
    # GESTION DES PHOTOS (NOUVEAU)
    # ========================================
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def ajouter_photos(self, request, pk=None):
        """
        Ajouter des photos à un véhicule.
        POST /api/vehicules/{id}/ajouter-photos/
        
        Body: multipart/form-data avec 'photos[]'
        """
        vehicule = self.get_object()
        
        # Vérifier que c'est le propriétaire
        if vehicule.concessionnaire != request.user:
            return Response(
                {"error": "Vous n'êtes pas le propriétaire de ce véhicule"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        photos = request.FILES.getlist('photos')
        
        if not photos:
            return Response(
                {"error": "Aucune photo fournie"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer les photos
        photos_creees = []
        dernier_ordre = vehicule.photos.count()
        
        for index, photo_file in enumerate(photos):
            photo = Photo.objects.create(
                vehicule=vehicule,
                image=photo_file,
                ordre=dernier_ordre + index + 1
            )
            photos_creees.append(PhotoSerializer(photo, context={'request': request}).data)
        
        return Response({
            "message": f"{len(photos_creees)} photo(s) ajoutée(s)",
            "photos": photos_creees
        }, status=status.HTTP_201_CREATED)
    
    @action(
        detail=True,
        methods=['delete'],
        permission_classes=[permissions.IsAuthenticated],
        url_path='supprimer-photo/(?P<photo_id>[^/.]+)'
    )
    def supprimer_photo(self, request, pk=None, photo_id=None):
        """
        Supprimer une photo d'un véhicule.
        DELETE /api/vehicules/{id}/supprimer-photo/{photo_id}/
        """
        vehicule = self.get_object()
        
        # Vérifier que c'est le propriétaire
        if vehicule.concessionnaire != request.user:
            return Response(
                {"error": "Vous n'êtes pas le propriétaire de ce véhicule"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            photo = vehicule.photos.get(id=photo_id)
            photo.delete()
            return Response(
                {"message": "Photo supprimée avec succès"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Photo.DoesNotExist:
            return Response(
                {"error": "Photo non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[permissions.IsAuthenticated],
        url_path='photo-principale/(?P<photo_id>[^/.]+)'
    )
    def definir_photo_principale(self, request, pk=None, photo_id=None):
        """
        Définir une photo comme principale.
        PATCH /api/vehicules/{id}/photo-principale/{photo_id}/
        """
        vehicule = self.get_object()
        
        # Vérifier que c'est le propriétaire
        if vehicule.concessionnaire != request.user:
            return Response(
                {"error": "Vous n'êtes pas le propriétaire de ce véhicule"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            photo = vehicule.photos.get(id=photo_id)
            photo.est_principale = True
            photo.save()  # Le save() retire automatiquement le statut principal des autres
            
            return Response(
                {"message": "Photo principale définie avec succès"},
                status=status.HTTP_200_OK
            )
        except Photo.DoesNotExist:
            return Response(
                {"error": "Photo non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    # ========================================
    # GESTION DES VIDEOS (NOUVEAU)
    # ========================================
    
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def ajouter_video(self, request, pk=None):
        """
        Ajouter une vidéo à un véhicule.
        POST /api/vehicules/{id}/ajouter-video/
        
        Body (JSON ou multipart):
        {
            "type_video": "YOUTUBE" | "UPLOAD" | "VIMEO",
            "url": "https://youtube.com/..." (si type_video != UPLOAD),
            "fichier": <file> (si type_video == UPLOAD),
            "titre": "Titre de la vidéo",
            "description": "Description...",
            "thumbnail": <file> (optionnel)
        }
        """
        vehicule = self.get_object()
        
        # Vérifier que c'est le propriétaire
        if vehicule.concessionnaire != request.user:
            return Response(
                {"error": "Vous n'êtes pas le propriétaire de ce véhicule"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = VideoCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(vehicule=vehicule)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(
        detail=True,
        methods=['delete'],
        permission_classes=[permissions.IsAuthenticated],
        url_path='supprimer-video/(?P<video_id>[^/.]+)'
    )
    def supprimer_video(self, request, pk=None, video_id=None):
        """
        Supprimer une vidéo d'un véhicule.
        DELETE /api/vehicules/{id}/supprimer-video/{video_id}/
        """
        vehicule = self.get_object()
        
        # Vérifier que c'est le propriétaire
        if vehicule.concessionnaire != request.user:
            return Response(
                {"error": "Vous n'êtes pas le propriétaire de ce véhicule"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            video = vehicule.videos.get(id=video_id)
            video.delete()
            return Response(
                {"message": "Vidéo supprimée avec succès"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Video.DoesNotExist:
            return Response(
                {"error": "Vidéo non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )