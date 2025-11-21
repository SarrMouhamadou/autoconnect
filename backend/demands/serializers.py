# backend/demands/serializers.py
# Serializers pour les demandes de contact

from rest_framework import serializers
from .models import DemandeContact
from users.models import User
from vehicules.models import Vehicule


# ========================================
# SERIALIZERS MINIMAUX (pour relations)
# ========================================

class ClientMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour afficher les infos du client."""
    
    nom_complet = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'nom', 'prenom', 'nom_complet', 'telephone', 'photo_profil']
        read_only_fields = fields
    
    def get_nom_complet(self, obj):
        return f"{obj.prenom} {obj.nom}"


class VehiculeMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour afficher les infos du véhicule."""
    
    marque_nom = serializers.CharField(source='marque.nom', read_only=True)
    nom_complet = serializers.ReadOnlyField()
    photo_principale = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicule
        fields = [
            'id',
            'marque_nom',
            'nom_modele',
            'nom_complet',
            'annee',
            'photo_principale',
            'prix_location_jour',
            'prix_vente',
        ]
        read_only_fields = fields
    
    def get_photo_principale(self, obj):
        """Retourner l'URL de la photo principale."""
        photo = obj.photo_principale
        if photo and photo.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(photo.image.url)
            return photo.image.url
        return None


# ========================================
# SERIALIZER LECTURE (GET)
# ========================================

class DemandeContactSerializer(serializers.ModelSerializer):
    """
    Serializer complet pour lire une demande.
    GET /api/demands/{id}/
    """
    
    # Relations en lecture seule
    client = ClientMinimalSerializer(read_only=True)
    vehicule = VehiculeMinimalSerializer(read_only=True)
    concessionnaire = ClientMinimalSerializer(read_only=True)
    repondu_par = ClientMinimalSerializer(read_only=True)
    
    # Champs calculés
    type_demande_display = serializers.CharField(source='get_type_demande_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    delai_reponse = serializers.ReadOnlyField()
    est_en_attente = serializers.ReadOnlyField()
    est_traitee = serializers.ReadOnlyField()
    peut_etre_annulee = serializers.ReadOnlyField()
    
    class Meta:
        model = DemandeContact
        fields = [
            'id',
            
            # Relations
            'client',
            'vehicule',
            'concessionnaire',
            
            # Informations demande
            'type_demande',
            'type_demande_display',
            'objet',
            'message',
            'date_souhaitee_essai',
            'heure_souhaitee_essai',
            
            # Coordonnées
            'telephone_contact',
            'email_contact',
            
            # Statut
            'statut',
            'statut_display',
            
            # Réponse
            'reponse',
            'date_reponse',
            'repondu_par',
            
            # Notes (visible uniquement pour concessionnaire)
            'notes_internes',
            
            # Propriétés calculées
            'delai_reponse',
            'est_en_attente',
            'est_traitee',
            'peut_etre_annulee',
            
            # Dates
            'date_creation',
            'date_modification',
        ]
        read_only_fields = [
            'client',
            'concessionnaire',
            'statut',
            'reponse',
            'date_reponse',
            'repondu_par',
            'date_creation',
            'date_modification',
        ]
    
    def to_representation(self, instance):
        """Masquer notes_internes pour les clients."""
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # Si l'utilisateur est un client et pas le concessionnaire
        if request and request.user.is_authenticated:
            if request.user.type_utilisateur == 'CLIENT':
                data.pop('notes_internes', None)
        
        return data


# ========================================
# SERIALIZER LISTE (GET)
# ========================================

class DemandeContactListSerializer(serializers.ModelSerializer):
    """
    Serializer pour lister les demandes (version allégée).
    GET /api/demands/
    """
    
    client_nom = serializers.CharField(source='client.nom_complet', read_only=True)
    vehicule_nom = serializers.CharField(source='vehicule.nom_complet', read_only=True)
    type_demande_display = serializers.CharField(source='get_type_demande_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = DemandeContact
        fields = [
            'id',
            'client_nom',
            'vehicule_nom',
            'type_demande',
            'type_demande_display',
            'objet',
            'statut',
            'statut_display',
            'date_creation',
            'date_reponse',
        ]


# ========================================
# SERIALIZER CRÉATION (POST)
# ========================================

class DemandeContactCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer une demande.
    POST /api/demands/
    """
    
    vehicule_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicule.objects.filter(
            statut='DISPONIBLE',
            est_visible=True
        ),
        source='vehicule',
        write_only=True,
        required=True
    )
    
    class Meta:
        model = DemandeContact
        fields = [
            'vehicule_id',
            'type_demande',
            'objet',
            'message',
            'date_souhaitee_essai',
            'heure_souhaitee_essai',
            'telephone_contact',
            'email_contact',
        ]
    
    def validate(self, data):
        """Validation globale."""
        
        # Si type ESSAI, la date est obligatoire
        if data.get('type_demande') == 'ESSAI':
            if not data.get('date_souhaitee_essai'):
                raise serializers.ValidationError({
                    'date_souhaitee_essai': "La date souhaitée est obligatoire pour une demande d'essai"
                })
        
        return data
    
    def validate_vehicule_id(self, value):
        """Valider que le véhicule accepte ce type de demande."""
        
        # Vérifier que le véhicule appartient à une concession validée
        if value.concession.statut != 'VALIDE':
            raise serializers.ValidationError(
                "Ce véhicule n'est pas disponible pour les demandes."
            )
        
        return value
    
    def create(self, validated_data):
        """Créer la demande."""
        
        # L'utilisateur (client) est ajouté par la vue
        validated_data['client'] = self.context['request'].user
        
        # Le concessionnaire est automatiquement défini dans le save() du modèle
        
        demande = DemandeContact.objects.create(**validated_data)
        
        return demande


# ========================================
# SERIALIZER RÉPONSE (PATCH)
# ========================================

class DemandeContactRepondreSerializer(serializers.Serializer):
    """
    Serializer pour répondre à une demande.
    PATCH /api/demands/{id}/repondre/
    """
    
    reponse = serializers.CharField(
        required=True,
        min_length=10,
        error_messages={
            'required': 'La réponse est obligatoire',
            'min_length': 'La réponse doit contenir au moins 10 caractères'
        }
    )
    
    notes_internes = serializers.CharField(
        required=False,
        allow_blank=True
    )
    
    def validate_reponse(self, value):
        """Valider la réponse."""
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "La réponse doit contenir au moins 10 caractères"
            )
        return value.strip()


# ========================================
# SERIALIZER NOTES INTERNES (PATCH)
# ========================================

class DemandeContactNotesSerializer(serializers.Serializer):
    """
    Serializer pour ajouter des notes internes.
    PATCH /api/demands/{id}/notes/
    """
    
    notes_internes = serializers.CharField(
        required=True,
        allow_blank=False
    )