# backend/locations/serializers.py
# Serializers pour les locations

from rest_framework import serializers
from .models import Location, ContratLocation
from users.models import User
from vehicules.models import Vehicule
from concessions.models import Concession
from decimal import Decimal


# ========================================
# SERIALIZERS MINIMAUX (pour relations)
# ========================================

class ClientMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour afficher les infos du client."""
    
    nom_complet = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'nom', 'prenom', 'nom_complet', 'telephone']
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
            'immatriculation',
            'photo_principale',
            'prix_location_jour',
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


class ConcessionMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour concession."""
    
    class Meta:
        model = Concession
        fields = ['id', 'nom', 'ville', 'telephone', 'email']
        read_only_fields = fields


# ========================================
# SERIALIZER CONTRAT (Lecture)
# ========================================

class ContratLocationSerializer(serializers.ModelSerializer):
    """Serializer pour lire un contrat de location."""
    
    fichier_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ContratLocation
        fields = [
            'id',
            'numero_contrat',
            'fichier_pdf',
            'fichier_url',
            'date_generation',
            'hash_contrat',
        ]
        read_only_fields = fields
    
    def get_fichier_url(self, obj):
        """Retourner l'URL complète du fichier PDF."""
        if obj.fichier_pdf:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.fichier_pdf.url)
            return obj.fichier_pdf.url
        return None


# ========================================
# SERIALIZER LOCATION (Lecture complète)
# ========================================

class LocationSerializer(serializers.ModelSerializer):
    """
    Serializer complet pour lire une location.
    GET /api/locations/{id}/
    """
    
    # Relations en lecture seule
    client = ClientMinimalSerializer(read_only=True)
    vehicule = VehiculeMinimalSerializer(read_only=True)
    concessionnaire = ClientMinimalSerializer(read_only=True)
    concession = ConcessionMinimalSerializer(read_only=True)
    
    # Contrat (si existe)
    contrat = ContratLocationSerializer(read_only=True)
    
    # Champs calculés
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    duree_reelle = serializers.ReadOnlyField()
    kilometres_parcourus = serializers.ReadOnlyField()
    est_en_retard = serializers.ReadOnlyField()
    montant_total_final = serializers.ReadOnlyField()
    
    class Meta:
        model = Location
        fields = [
            'id',
            
            # Relations
            'client',
            'vehicule',
            'concessionnaire',
            'concession',
            
            # Dates
            'date_debut',
            'date_fin',
            'date_depart_reel',
            'date_retour_reel',
            
            # Tarification
            'prix_jour',
            'nombre_jours',
            'prix_total',
            'caution',
            
            # Kilométrage
            'kilometrage_depart',
            'kilometrage_retour',
            
            # Statut
            'statut',
            'statut_display',
            
            # Pénalités
            'jours_retard',
            'montant_penalite',
            'taux_penalite_jour',
            
            # Informations complémentaires
            'notes_client',
            'notes_concessionnaire',
            'etat_depart',
            'etat_retour',
            
            # Contrat
            'contrat',
            
            # Propriétés calculées
            'duree_reelle',
            'kilometres_parcourus',
            'est_en_retard',
            'montant_total_final',
            
            # Dates
            'date_creation',
            'date_modification',
        ]
        read_only_fields = [
            'client',
            'concessionnaire',
            'concession',
            'prix_total',
            'statut',
            'jours_retard',
            'montant_penalite',
            'date_creation',
            'date_modification',
        ]
    
    def to_representation(self, instance):
        """Masquer notes_concessionnaire pour les clients."""
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # Si l'utilisateur est un client
        if request and request.user.is_authenticated:
            if request.user.type_utilisateur == 'CLIENT':
                data.pop('notes_concessionnaire', None)
        
        return data


# ========================================
# SERIALIZER LOCATION (Liste)
# ========================================

class LocationListSerializer(serializers.ModelSerializer):
    """
    Serializer pour lister les locations (version allégée).
    GET /api/locations/
    """
    
    client_nom = serializers.CharField(source='client.nom_complet', read_only=True)
    vehicule_nom = serializers.CharField(source='vehicule.nom_complet', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Location
        fields = [
            'id',
            'client_nom',
            'vehicule_nom',
            'date_debut',
            'date_fin',
            'prix_total',
            'statut',
            'statut_display',
            'date_creation',
        ]


# ========================================
# SERIALIZER LOCATION (Création)
# ========================================

class LocationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer une demande de location.
    POST /api/locations/
    """
    
    vehicule_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicule.objects.filter(
            est_disponible_location=True,
            statut='DISPONIBLE'
        ),
        source='vehicule',
        write_only=True,
        required=True
    )
    
    class Meta:
        model = Location
        fields = [
            'vehicule_id',
            'date_debut',
            'date_fin',
            'notes_client',
        ]
    
    def validate(self, data):
        """Validation globale."""
        from datetime import date
        
        # Date de début ne peut pas être dans le passé
        if data['date_debut'] < date.today():
            raise serializers.ValidationError({
                'date_debut': "La date de début ne peut pas être dans le passé"
            })
        
        # Date de fin doit être après date de début
        if data['date_fin'] <= data['date_debut']:
            raise serializers.ValidationError({
                'date_fin': "La date de fin doit être après la date de début"
            })
        
        # Durée minimale : 1 jour
        delta = data['date_fin'] - data['date_debut']
        if delta.days < 0:
            raise serializers.ValidationError(
                "La durée de location doit être d'au moins 1 jour"
            )
        
        return data
    
    def validate_vehicule_id(self, value):
        """Valider la disponibilité du véhicule."""
        
        # Vérifier que le véhicule appartient à une concession validée
        if value.concession.statut != 'VALIDE':
            raise serializers.ValidationError(
                "Ce véhicule n'est pas disponible pour la location"
            )
        
        # Vérifier qu'il a un prix de location
        if not value.prix_location_jour:
            raise serializers.ValidationError(
                "Ce véhicule n'a pas de prix de location défini"
            )
        
        return value
    
    def create(self, validated_data):
        """Créer la demande de location."""
        vehicule = validated_data['vehicule']
        
        # Copier les informations du véhicule
        validated_data['client'] = self.context['request'].user
        validated_data['concessionnaire'] = vehicule.concessionnaire
        validated_data['concession'] = vehicule.concession
        validated_data['prix_jour'] = vehicule.prix_location_jour
        validated_data['caution'] = vehicule.caution or Decimal('0.00')
        
        # Le reste (nombre_jours, prix_total) est calculé dans le save() du modèle
        
        location = Location.objects.create(**validated_data)
        
        return location


# ========================================
# SERIALIZER DÉPART
# ========================================

class LocationDepartSerializer(serializers.Serializer):
    """
    Serializer pour enregistrer le départ.
    PATCH /api/locations/{id}/depart/
    """
    
    kilometrage_depart = serializers.IntegerField(
        required=True,
        min_value=0
    )
    
    etat_depart = serializers.CharField(
        required=False,
        allow_blank=True
    )


# ========================================
# SERIALIZER RETOUR
# ========================================

class LocationRetourSerializer(serializers.Serializer):
    """
    Serializer pour enregistrer le retour.
    PATCH /api/locations/{id}/retour/
    """
    
    kilometrage_retour = serializers.IntegerField(
        required=True,
        min_value=0
    )
    
    etat_retour = serializers.CharField(
        required=False,
        allow_blank=True
    )
    
    def validate_kilometrage_retour(self, value):
        """Valider que le kilométrage retour est cohérent."""
        location = self.context.get('location')
        
        if location and location.kilometrage_depart:
            if value < location.kilometrage_depart:
                raise serializers.ValidationError(
                    f"Le kilométrage au retour ({value} km) ne peut pas être "
                    f"inférieur au kilométrage au départ ({location.kilometrage_depart} km)"
                )
        
        return value


# ========================================
# SERIALIZER NOTES CONCESSIONNAIRE
# ========================================

class LocationNotesSerializer(serializers.Serializer):
    """
    Serializer pour ajouter des notes concessionnaire.
    PATCH /api/locations/{id}/notes/
    """
    
    notes_concessionnaire = serializers.CharField(
        required=True,
        allow_blank=False
    )