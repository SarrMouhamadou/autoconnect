from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from vehicules.models import Marque, Categorie, Vehicule, ImageVehicule
from vehicules.serializers import (
    MarqueSerializer, MarqueCreateSerializer,
    CategorieSerializer, CategorieCreateSerializer,
    VehiculeSerializer, VehiculeListSerializer, VehiculeCreateSerializer
)
from users.permissions import IsConcessionnaire, IsAdministrateur


# ========================================
# VIEWSET MARQUE
# ========================================

class MarqueViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les marques de véhicules.
    
    GET /api/marques/ - Liste des marques
    POST /api/marques/ - Créer une marque (Admin uniquement)
    GET /api/marques/{id}/ - Détail d'une marque
    PUT/PATCH /api/marques/{id}/ - Modifier une marque (Admin uniquement)
    DELETE /api/marques/{id}/ - Supprimer une marque (Admin uniquement)
    """
    
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
        
        """
        Permissions :
        - Liste et détail : tout le monde
        - Création, modification, suppression : Admin uniquement
        """

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
        """
        Retourner les marques les plus populaires (avec le plus de véhicules).
        GET /api/marques/populaires/
        """
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
    """
    ViewSet pour gérer les catégories de véhicules.
    
    GET /api/categories/ - Liste des catégories
    POST /api/categories/ - Créer une catégorie (Admin uniquement)
    GET /api/categories/{id}/ - Détail d'une catégorie
    PUT/PATCH /api/categories/{id}/ - Modifier une catégorie (Admin uniquement)
    DELETE /api/categories/{id}/ - Supprimer une catégorie (Admin uniquement)
    """
    
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
        """
        Permissions :
        - Liste et détail : tout le monde
        - Création, modification, suppression : Admin uniquement
        """
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
        """
        Retourner les catégories les plus populaires.
        GET /api/categories/populaires/
        """
        categories = self.get_queryset().filter(
            est_active=True,
            nombre_vehicules__gt=0
        ).order_by('-nombre_vehicules')[:10]
        
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


# ========================================
# VIEWSET VÉHICULE (MISE À JOUR)
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
    ).prefetch_related('images')
    
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
        """
        Permissions :
        - Liste et détail : tout le monde
        - Création : concessionnaire uniquement
        - Modification/Suppression : propriétaire uniquement
        """
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
        """
        Récupérer un véhicule et incrémenter le compteur de vues.
        """
        instance = self.get_object()
        
        # Incrémenter les vues (sauf pour le propriétaire)
        if not request.user.is_authenticated or request.user != instance.concessionnaire:
            instance.incrementer_vues()
        
        serializer = self.get_serializer(instance)
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
            serializer = VehiculeListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = VehiculeListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(
        detail=False,
        methods=['get']
    )
    def par_marque(self, request):
        """
        Grouper les véhicules par marque.
        GET /api/vehicules/par-marque/
        """
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
        """
        Grouper les véhicules par catégorie.
        GET /api/vehicules/par-categorie/
        """
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