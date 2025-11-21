from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import DemandeContact
from .serializers import (
    DemandeContactSerializer,
    DemandeContactListSerializer,
    DemandeContactCreateSerializer,
    DemandeContactRepondreSerializer,
    DemandeContactNotesSerializer
)
from users.permissions import IsClient, IsConcessionnaire


# ========================================
# VIEWSET DEMANDE CONTACT
# ========================================

class DemandeContactViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les demandes de contact.
    
    ⭐ CONFORME AU DIAGRAMME DE CLASSE
    
    Endpoints:
    - GET    /api/demands/                  - Liste demandes
    - POST   /api/demands/                  - Créer demande (Client)
    - GET    /api/demands/{id}/             - Détail demande
    - PATCH  /api/demands/{id}/repondre/    - Répondre (Concessionnaire)
    - PATCH  /api/demands/{id}/notes/       - Ajouter notes (Concessionnaire)
    - DELETE /api/demands/{id}/             - Annuler (Client)
    - GET    /api/demands/mes-demandes/     - Mes demandes (Client)
    - GET    /api/demands/demandes-recues/  - Demandes reçues (Concessionnaire)
    """
    
    queryset = DemandeContact.objects.select_related(
        'client',
        'vehicule',
        'vehicule__marque',
        'vehicule__categorie',
        'concessionnaire',
        'repondu_par'
    )
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtres
    filterset_fields = {
        'type_demande': ['exact'],
        'statut': ['exact'],
        'date_creation': ['gte', 'lte'],
        'vehicule': ['exact'],
    }
    
    # Recherche
    search_fields = [
        'objet',
        'message',
        'client__nom',
        'client__prenom',
        'vehicule__nom_modele',
        'vehicule__marque__nom',
    ]
    
    # Tri
    ordering_fields = [
        'date_creation',
        'date_reponse',
        'statut',
        'type_demande',
    ]
    ordering = ['-date_creation']
    
    def get_serializer_class(self):
        """Retourner le serializer approprié selon l'action."""
        if self.action == 'list':
            return DemandeContactListSerializer
        elif self.action == 'create':
            return DemandeContactCreateSerializer
        elif self.action == 'repondre':
            return DemandeContactRepondreSerializer
        elif self.action == 'ajouter_notes':
            return DemandeContactNotesSerializer
        return DemandeContactSerializer
    
    def get_permissions(self):
        """
        Permissions :
        - Création : Client uniquement
        - Liste/Détail : Client ou Concessionnaire concerné
        - Réponse/Notes : Concessionnaire uniquement
        - Suppression : Client (annulation) uniquement
        """
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsClient()]
        elif self.action in ['repondre', 'ajouter_notes', 'marquer_en_cours']:
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
        
        # Client : voit uniquement ses demandes
        if user.is_client():
            return queryset.filter(client=user)
        
        # Concessionnaire : voit uniquement les demandes pour ses véhicules
        elif user.is_concessionnaire():
            return queryset.filter(concessionnaire=user)
        
        # Admin : voit tout
        elif user.is_administrateur():
            return queryset
        
        return queryset.none()
    
    def perform_create(self, serializer):
        """Créer une demande et l'attribuer au client connecté."""
        demande = serializer.save(client=self.request.user)
        
        # TODO: Créer une notification pour le concessionnaire
        # from notifications.models import Notification
        # Notification.objects.create(...)
        
        return demande
    
    def destroy(self, request, *args, **kwargs):
        """
        Annuler une demande (uniquement par le client).
        Seulement si statut = EN_ATTENTE ou EN_COURS
        """
        instance = self.get_object()
        
        # Vérifier que c'est le client qui a fait la demande
        if instance.client != request.user:
            return Response(
                {"error": "Vous ne pouvez annuler que vos propres demandes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier le statut
        if not instance.peut_etre_annulee:
            return Response(
                {"error": "Cette demande ne peut plus être annulée"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Annuler
        instance.annuler()
        
        return Response(
            {"message": "Demande annulée avec succès"},
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
    def mes_demandes(self, request):
        """
        Récupérer toutes les demandes du client connecté.
        GET /api/demands/mes-demandes/
        """
        queryset = self.filter_queryset(
            self.get_queryset().filter(client=request.user)
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = DemandeContactListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = DemandeContactListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def demandes_recues(self, request):
        """
        Récupérer toutes les demandes reçues par le concessionnaire.
        GET /api/demands/demandes-recues/
        """
        queryset = self.filter_queryset(
            self.get_queryset().filter(concessionnaire=request.user)
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = DemandeContactListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = DemandeContactListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def repondre(self, request, pk=None):
        """
        Répondre à une demande.
        PATCH /api/demands/{id}/repondre/
        
        Body:
        {
            "reponse": "Texte de la réponse",
            "notes_internes": "Notes internes (optionnel)"
        }
        """
        demande = self.get_object()
        
        # Vérifier que c'est bien le concessionnaire concerné
        if demande.concessionnaire != request.user:
            return Response(
                {"error": "Vous ne pouvez répondre qu'aux demandes qui vous sont destinées"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier le statut
        if demande.statut == 'TRAITEE':
            return Response(
                {"error": "Cette demande a déjà été traitée"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if demande.statut == 'ANNULEE':
            return Response(
                {"error": "Cette demande a été annulée"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Valider les données
        serializer = DemandeContactRepondreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Marquer comme traitée
        demande.marquer_traitee(
            reponse=serializer.validated_data['reponse'],
            repondu_par=request.user
        )
        
        # Ajouter les notes internes si fournies
        if 'notes_internes' in serializer.validated_data:
            demande.notes_internes = serializer.validated_data['notes_internes']
            demande.save(update_fields=['notes_internes'])
        
        # TODO: Créer une notification pour le client
        # Notification.objects.create(...)
        
        return Response(
            DemandeContactSerializer(demande, context={'request': request}).data,
            status=status.HTTP_200_OK
        )
    
    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def marquer_en_cours(self, request, pk=None):
        """
        Marquer une demande comme en cours de traitement.
        PATCH /api/demands/{id}/marquer-en-cours/
        """
        demande = self.get_object()
        
        # Vérifier que c'est bien le concessionnaire concerné
        if demande.concessionnaire != request.user:
            return Response(
                {"error": "Vous ne pouvez modifier que vos demandes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier le statut
        if demande.statut != 'EN_ATTENTE':
            return Response(
                {"error": "Seules les demandes en attente peuvent être marquées en cours"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        demande.marquer_en_cours()
        
        return Response(
            {"message": "Demande marquée comme en cours"},
            status=status.HTTP_200_OK
        )
    
    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[permissions.IsAuthenticated, IsConcessionnaire]
    )
    def ajouter_notes(self, request, pk=None):
        """
        Ajouter ou modifier les notes internes.
        PATCH /api/demands/{id}/notes/
        
        Body:
        {
            "notes_internes": "Mes notes..."
        }
        """
        demande = self.get_object()
        
        # Vérifier que c'est bien le concessionnaire concerné
        if demande.concessionnaire != request.user:
            return Response(
                {"error": "Vous ne pouvez modifier que vos demandes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Valider les données
        serializer = DemandeContactNotesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Ajouter les notes
        demande.notes_internes = serializer.validated_data['notes_internes']
        demande.save(update_fields=['notes_internes'])
        
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
        Statistiques sur les demandes.
        GET /api/demands/statistiques/
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
            'en_attente': queryset.filter(statut='EN_ATTENTE').count(),
            'en_cours': queryset.filter(statut='EN_COURS').count(),
            'traitees': queryset.filter(statut='TRAITEE').count(),
            'annulees': queryset.filter(statut='ANNULEE').count(),
            'par_type': {
                'contact': queryset.filter(type_demande='CONTACT').count(),
                'essai': queryset.filter(type_demande='ESSAI').count(),
                'devis': queryset.filter(type_demande='DEVIS').count(),
                'information': queryset.filter(type_demande='INFORMATION').count(),
            }
        }
        
        # Délai moyen de réponse (pour concessionnaire)
        if user.is_concessionnaire():
            demandes_traitees = queryset.filter(statut='TRAITEE', date_reponse__isnull=False)
            if demandes_traitees.exists():
                delais = [d.delai_reponse for d in demandes_traitees if d.delai_reponse]
                if delais:
                    stats['delai_moyen_reponse_heures'] = round(sum(delais) / len(delais), 1)
        
        return Response(stats)