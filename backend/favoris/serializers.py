# backend/favoris/serializers.py
# Serializers pour les favoris et l'historique

from rest_framework import serializers
from .models import Favori, Historique
from vehicules.models import Vehicule


# ========================================
# SERIALIZERS FAVORI
# ========================================

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
            'est_disponible_location',
            'est_disponible_vente',
            'statut',
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


class FavoriSerializer(serializers.ModelSerializer):
    """
    Serializer pour lire un favori.
    GET /api/favoris/{id}/
    """
    
    vehicule = VehiculeMinimalSerializer(read_only=True)
    difference_prix = serializers.ReadOnlyField()
    a_baisse = serializers.SerializerMethodField()
    
    class Meta:
        model = Favori
        fields = [
            'id',
            'vehicule',
            'date_ajout',
            'alerte_prix_active',
            'prix_initial',
            'difference_prix',
            'a_baisse',
            'notes',
        ]
        read_only_fields = ['date_ajout', 'prix_initial']
    
    def get_a_baisse(self, obj):
        """Vérifier si le prix a baissé."""
        return obj.verifier_baisse_prix()


class FavoriCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour ajouter un favori.
    POST /api/favoris/
    """
    
    vehicule_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicule.objects.filter(est_visible=True),
        source='vehicule',
        write_only=True,
        required=True
    )
    
    class Meta:
        model = Favori
        fields = [
            'vehicule_id',
            'alerte_prix_active',
            'notes',
        ]
    
    def validate(self, data):
        """Validation."""
        request = self.context.get('request')
        vehicule = data.get('vehicule')
        
        # Vérifier que le favori n'existe pas déjà
        if Favori.objects.filter(client=request.user, vehicule=vehicule).exists():
            raise serializers.ValidationError(
                "Ce véhicule est déjà dans vos favoris"
            )
        
        return data
    
    def create(self, validated_data):
        """Créer le favori."""
        validated_data['client'] = self.context['request'].user
        return Favori.objects.create(**validated_data)


# ========================================
# SERIALIZERS HISTORIQUE
# ========================================

class HistoriqueSerializer(serializers.ModelSerializer):
    """
    Serializer pour lire l'historique.
    GET /api/historique/
    """
    
    type_action_display = serializers.CharField(source='get_type_action_display', read_only=True)
    action_display = serializers.ReadOnlyField()
    vehicule_nom = serializers.CharField(source='vehicule.nom_complet', read_only=True, allow_null=True)
    
    class Meta:
        model = Historique
        fields = [
            'id',
            'type_action',
            'type_action_display',
            'action_display',
            'description',
            'vehicule_nom',
            'date_action',
        ]
        read_only_fields = fields