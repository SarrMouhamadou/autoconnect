# backend/locations/views.py
# Views pour les locations

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Location, ContratLocation
from .serializers import (
    LocationSerializer,
    LocationListSerializer,
    LocationCreateSerializer,
    LocationDepartSerializer,
    LocationRetourSerializer,
    LocationNotesSerializer,
    ContratLocationSerializer
)
from users.permissions import IsClient, IsConcessionnaire


# ========================================
# VIEWSET LOCATION
# ========================================

class LocationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les locations.
    
    ⭐ CONFORME AU DIAGRAMME DE CLASSE
    
    Endpoints:
    - GET    /api/locations/                   - Liste locations
    - POST   /api/locations/                   - Créer demande (Client)
    - GET    /api/locations/{id}/              - Détail location
    - PATCH  /api/locations/{id}/confirmer/    - Confirmer (Concessionnaire)
    - PATCH  /api/locations/{id}/refuser/      - Refuser (Concessionnaire)
    - PATCH  /api/locations/{id}/depart/       - Enregistrer départ (Concessionnaire)
    - PATCH  /api/locations/{id}/retour/       - Enregistrer retour (Concessionnaire)
    - DELETE /api/locations/{id}/              - Annuler (Client)
    - GET    /api/locations/mes-locations/     - Mes locations (Client)
    - GET    /api/locations/locations-gerees/  - Locations gérées (Concessionnaire)
    - GET    /api/locations/statistiques/      - Statistiques
    """
    
    queryset = Location.objects.select_related(
        'client',
        'vehicule',
        'vehicule__marque',
        'vehicule__categorie',
        'concessionnaire',
        'concession'
    ).prefetch_related(
        'vehicule__photos'
    )
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtres
    filterset_fields = {
        'statut': ['exact'],
        'date_debut': ['gte', 'lte'],
        'date_fin': ['gte', 'lte'],
        'vehicule': ['exact'],
        'client': ['exact'],
    }
    
    # Recherche
    search_fields = [
        'client__nom',
        'client__prenom',
        'vehicule__nom_modele',
        'vehicule__marque__nom',
        'vehicule__immatriculation',
    ]
    
    # Tri
    ordering_fields = [
        'date_creation',
        'date_debut',
        'date_fin',
        'prix_total',
        'statut',
    ]
    ordering = ['-date_creation']
    
    def get_serializer_class(self):
        """Retourner le serializer approprié selon l'action."""
        if self.action == 'list':
            return LocationListSerializer
        elif self.action == 'create':
            return LocationCreateSerializer
        elif self.action == 'enregistrer_depart':
            return LocationDepartSerializer
        elif self.action == 'enregistrer_retour':
            return LocationRetourSerializer
        elif self.action == 'ajouter_notes':
            return LocationNotesSerializer
        return LocationSerializer
    
    def get_permissions(self):
        """
        Permissions :
        - Création : Client uniquement
        - Liste/Détail : Client ou Concessionnaire concerné
        - Confirmer/Refuser/Départ/Retour : Concessionnaire uniquement
        - Suppression : Client (annulation) uniquement
        """
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsClient()]
        elif self.action in ['confirmer', 'refuser', 'enregistrer_depart', 'enregistrer_retour', 'ajouter_notes']:
            return [permissions.IsAuthenticated(), IsConcessionnaire()]
        elif self.action == 'destroy':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Filtrer selon le type d'utilisateur."""
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_authenticated:
            return queryset.none()
        
        # Client : voit uniquement ses locations
        if user.is_client():
            return queryset.filter(client=user)
        
        # Concessionnaire : voit uniquement les locations de ses véhicules
        elif user.is_concessionnaire():
            return queryset.filter(concessionnaire=user)
        
        # Admin : voit tout
        elif user.is_administrateur():
            return queryset
        
        return queryset.none()
    
    def perform_create(self, serializer):
        """Créer une demande de location."""
        location = serializer.save(client=self.request.user)
        
        # TODO: Créer une notification pour le concessionnaire
        # from notifications.models import Notification
        # Notification.objects.create(...)
        
        return location
    
    def destroy(self, request, *args, **kwargs):
        """
        Annuler une location (uniquement par le client).
        Seulement si statut = DEMANDE
        """
        instance = self.get_object()
        
        # Vérifier que c'est le client qui a fait la demande
        if instance.client != request.user:
            return Response(
                {"error": "Vous ne pouvez annuler que vos propres demandes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier le statut
        if instance.statut != 'DEMANDE':
            return Response(
                {"error": "Seules les demandes en attente peuvent être annulées"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Annuler
        instance.statut = 'ANNULEE'
        instance.save(update_fields=['statut'])
        
        return Response(
            {"message": "Demande de location annulée avec succès"},
            status=status.HTTP_200_OK
        )
    
    # ========================================
    # ACTIONS PERSONNALISÉES
    # ========================================
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated, IsClient]
    )
    def mes_locations(self, request):
        """
        Récupérer toutes les locations du client connecté.
        GET /api/locations/mes-locations/
        """
        queryset = self.filter_queryset(
            self.get_queryset().filter(client=request.user)
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = LocationListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = LocationListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def locations_gerees(self, request):
        """
        Récupérer toutes les locations gérées par le concessionnaire.
        GET /api/locations/locations-gerees/
        """
        queryset = self.filter_queryset(
            self.get_queryset().filter(concessionnaire=request.user)
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = LocationListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = LocationListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def confirmer(self, request, pk=None):
        """
        Confirmer une demande de location.
        PATCH /api/locations/{id}/confirmer/
        """
        location = self.get_object()
        
        # Vérifier que c'est bien le concessionnaire concerné
        if location.concessionnaire != request.user:
            return Response(
                {"error": "Vous ne pouvez gérer que vos propres locations"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Confirmer
        if location.confirmer():
            # TODO: Notification au client
            return Response(
                LocationSerializer(location, context={'request': request}).data,
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Cette location ne peut pas être confirmée"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def refuser(self, request, pk=None):
        """
        Refuser une demande de location.
        PATCH /api/locations/{id}/refuser/
        """
        location = self.get_object()
        
        # Vérifier que c'est bien le concessionnaire concerné
        if location.concessionnaire != request.user:
            return Response(
                {"error": "Vous ne pouvez gérer que vos propres locations"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Refuser
        if location.refuser():
            # TODO: Notification au client
            return Response(
                {"message": "Location refusée avec succès"},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Cette location ne peut pas être refusée"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def enregistrer_depart(self, request, pk=None):
        """
        Enregistrer le départ du véhicule.
        PATCH /api/locations/{id}/depart/
        
        Body:
        {
            "kilometrage_depart": 12345,
            "etat_depart": "Véhicule en bon état..."
        }
        """
        location = self.get_object()
        
        # Vérifier que c'est bien le concessionnaire concerné
        if location.concessionnaire != request.user:
            return Response(
                {"error": "Vous ne pouvez gérer que vos propres locations"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Valider les données
        serializer = LocationDepartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Enregistrer le départ
        if location.enregistrer_depart(
            kilometrage=serializer.validated_data['kilometrage_depart'],
            etat=serializer.validated_data.get('etat_depart', '')
        ):
            return Response(
                LocationSerializer(location, context={'request': request}).data,
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Le départ ne peut pas être enregistré pour cette location"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def enregistrer_retour(self, request, pk=None):
        """
        Enregistrer le retour du véhicule.
        PATCH /api/locations/{id}/retour/
        
        Body:
        {
            "kilometrage_retour": 12500,
            "etat_retour": "Véhicule rendu en bon état..."
        }
        """
        location = self.get_object()
        
        # Vérifier que c'est bien le concessionnaire concerné
        if location.concessionnaire != request.user:
            return Response(
                {"error": "Vous ne pouvez gérer que vos propres locations"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Valider les données
        serializer = LocationRetourSerializer(
            data=request.data,
            context={'location': location}
        )
        serializer.is_valid(raise_exception=True)
        
        # Enregistrer le retour
        if location.enregistrer_retour(
            kilometrage=serializer.validated_data['kilometrage_retour'],
            etat=serializer.validated_data.get('etat_retour', '')
        ):
            # TODO: Notification au client
            return Response(
                LocationSerializer(location, context={'request': request}).data,
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Le retour ne peut pas être enregistré pour cette location"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def ajouter_notes(self, request, pk=None):
        """
        Ajouter ou modifier les notes internes.
        PATCH /api/locations/{id}/notes/
        
        Body:
        {
            "notes_concessionnaire": "Client sérieux, bon payeur..."
        }
        """
        location = self.get_object()
        
        # Vérifier que c'est bien le concessionnaire concerné
        if location.concessionnaire != request.user:
            return Response(
                {"error": "Vous ne pouvez gérer que vos propres locations"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Valider les données
        serializer = LocationNotesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Ajouter les notes
        location.notes_concessionnaire = serializer.validated_data['notes_concessionnaire']
        location.save(update_fields=['notes_concessionnaire'])
        
        return Response(
            {"message": "Notes ajoutées avec succès"},
            status=status.HTTP_200_OK
        )
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def statistiques(self, request):
        """
        Statistiques sur les locations.
        GET /api/locations/statistiques/
        """
        user = request.user
        
        if user.is_client():
            queryset = self.get_queryset().filter(client=user)
        elif user.is_concessionnaire():
            queryset = self.get_queryset().filter(concessionnaire=user)
        else:
            queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'demandes': queryset.filter(statut='DEMANDE').count(),
            'confirmees': queryset.filter(statut='CONFIRMEE').count(),
            'en_cours': queryset.filter(statut='EN_COURS').count(),
            'terminees': queryset.filter(statut='TERMINEE').count(),
            'annulees': queryset.filter(statut='ANNULEE').count(),
        }
        
        # Statistiques financières pour concessionnaire
        if user.is_concessionnaire():
            from django.db.models import Sum
            
            locations_terminees = queryset.filter(statut='TERMINEE')
            
            stats['chiffre_affaires'] = locations_terminees.aggregate(
                total=Sum('prix_total')
            )['total'] or 0
            
            stats['penalites_totales'] = locations_terminees.aggregate(
                total=Sum('montant_penalite')
            )['total'] or 0
            
            # Locations en retard
            stats['locations_en_retard'] = locations_terminees.filter(
                jours_retard__gt=0
            ).count()
        
        return Response(stats)


# À AJOUTER dans backend/locations/views.py
# Ajouter cette action dans LocationViewSet

@action(
    detail=True,
    methods=['post'],
    permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
)
def generer_contrat(self, request, pk=None):
    """
    Générer le contrat PDF pour une location confirmée.
    POST /api/locations/{id}/generer-contrat/
    """
    location = self.get_object()
    
    # Vérifier que c'est bien le concessionnaire concerné
    if location.concessionnaire != request.user:
        return Response(
            {"error": "Vous ne pouvez générer que les contrats de vos locations"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Vérifier que la location est confirmée
    if location.statut not in ['CONFIRMEE', 'EN_COURS', 'TERMINEE']:
        return Response(
            {"error": "Le contrat ne peut être généré que pour une location confirmée"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Générer le contrat
    try:
        from .services import generer_contrat_location
        contrat = generer_contrat_location(location)
        
        return Response(
            {
                "message": "Contrat généré avec succès",
                "contrat": ContratLocationSerializer(contrat, context={'request': request}).data
            },
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {"error": f"Erreur lors de la génération du contrat: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ========================================
# VIEWSET CONTRAT LOCATION
# ========================================

class ContratLocationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour consulter les contrats de location (lecture seule).
    
    Endpoints:
    - GET /api/contrats/           - Liste contrats
    - GET /api/contrats/{id}/      - Détail contrat
    """
    
    queryset = ContratLocation.objects.select_related('location')
    serializer_class = ContratLocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrer selon le type d'utilisateur."""
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_authenticated:
            return queryset.none()
        
        # Client : voit uniquement ses contrats
        if user.is_client():
            return queryset.filter(location__client=user)
        
        # Concessionnaire : voit uniquement les contrats de ses locations
        elif user.is_concessionnaire():
            return queryset.filter(location__concessionnaire=user)
        
        # Admin : voit tout
        elif user.is_administrateur():
            return queryset
        
        return queryset.none()