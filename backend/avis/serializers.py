# backend/avis/serializers.py
# Serializers pour les avis

from rest_framework import serializers
from .models import Avis
from users.models import User
from vehicules.models import Vehicule
from locations.models import Location


# ========================================
# SERIALIZERS MINIMAUX (pour relations)
# ========================================

class ClientMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour afficher les infos du client."""
    
    nom_complet = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'nom', 'prenom', 'nom_complet', 'photo_profil']
        read_only_fields = fields
    
    def get_nom_complet(self, obj):
        return f"{obj.prenom} {obj.nom}"


class VehiculeMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour afficher les infos du véhicule."""
    
    marque_nom = serializers.CharField(source='marque.nom', read_only=True)
    nom_complet = serializers.ReadOnlyField()
    
    class Meta:
        model = Vehicule
        fields = ['id', 'marque_nom', 'nom_modele', 'nom_complet', 'annee']
        read_only_fields = fields


# ========================================
# SERIALIZER AVIS (Lecture complète)
# ========================================

class AvisSerializer(serializers.ModelSerializer):
    """
    Serializer complet pour lire un avis.
    GET /api/avis/{id}/
    """
    
    # Relations en lecture seule
    client = ClientMinimalSerializer(read_only=True)
    vehicule = VehiculeMinimalSerializer(read_only=True)
    repondu_par = ClientMinimalSerializer(read_only=True)
    modere_par = ClientMinimalSerializer(read_only=True)
    
    # Propriétés calculées
    score_utilite = serializers.ReadOnlyField()
    note_moyenne_detaillee = serializers.ReadOnlyField()
    a_reponse = serializers.ReadOnlyField()
    
    class Meta:
        model = Avis
        fields = [
            'id',
            
            # Relations
            'client',
            'vehicule',
            'location',
            
            # Notation
            'note',
            'note_confort',
            'note_performance',
            'note_consommation',
            'note_proprete',
            'note_moyenne_detaillee',
            
            # Commentaire
            'titre',
            'commentaire',
            'points_positifs',
            'points_negatifs',
            'recommande',
            
            # Réponse
            'reponse',
            'date_reponse',
            'repondu_par',
            'a_reponse',
            
            # Modération
            'est_valide',
            'est_signale',
            'raison_signalement',
            'modere_par',
            'date_moderation',
            
            # Utilité
            'nb_personnes_utile',
            'nb_personnes_inutile',
            'score_utilite',
            
            # Dates
            'date_creation',
            'date_modification',
        ]
        read_only_fields = [
            'client',
            'location',
            'reponse',
            'date_reponse',
            'repondu_par',
            'est_valide',
            'est_signale',
            'raison_signalement',
            'modere_par',
            'date_moderation',
            'nb_personnes_utile',
            'nb_personnes_inutile',
            'date_creation',
            'date_modification',
        ]


# ========================================
# SERIALIZER AVIS (Liste)
# ========================================

class AvisListSerializer(serializers.ModelSerializer):
    """
    Serializer pour lister les avis (version allégée).
    GET /api/avis/
    """
    
    client_nom = serializers.CharField(source='client.nom_complet', read_only=True)
    vehicule_nom = serializers.CharField(source='vehicule.nom_complet', read_only=True)
    a_reponse = serializers.ReadOnlyField()
    
    class Meta:
        model = Avis
        fields = [
            'id',
            'client_nom',
            'vehicule_nom',
            'note',
            'titre',
            'recommande',
            'a_reponse',
            'est_valide',
            'date_creation',
        ]


# ========================================
# SERIALIZER AVIS (Création)
# ========================================

class AvisCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer un avis.
    POST /api/avis/
    """
    
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.filter(statut='TERMINEE'),
        source='location',
        write_only=True,
        required=True
    )
    
    class Meta:
        model = Avis
        fields = [
            'location_id',
            'note',
            'note_confort',
            'note_performance',
            'note_consommation',
            'note_proprete',
            'titre',
            'commentaire',
            'points_positifs',
            'points_negatifs',
            'recommande',
        ]
    
    def validate_location_id(self, value):
        """Valider que la location peut recevoir un avis."""
        request = self.context.get('request')
        
        # Vérifier que c'est bien le client de la location
        if value.client != request.user:
            raise serializers.ValidationError(
                "Vous ne pouvez donner un avis que sur vos propres locations"
            )
        
        # Vérifier qu'il n'y a pas déjà un avis pour cette location
        if hasattr(value, 'avis'):
            raise serializers.ValidationError(
                "Vous avez déjà donné un avis pour cette location"
            )
        
        return value
    
    def validate(self, data):
        """Validation globale."""
        
        # La note doit être entre 1 et 5
        if data['note'] < 1 or data['note'] > 5:
            raise serializers.ValidationError({
                'note': 'La note doit être entre 1 et 5'
            })
        
        # Valider les notes détaillées si présentes
        notes_detaillees = ['note_confort', 'note_performance', 'note_consommation', 'note_proprete']
        for note_field in notes_detaillees:
            if note_field in data and data[note_field] is not None:
                if data[note_field] < 1 or data[note_field] > 5:
                    raise serializers.ValidationError({
                        note_field: 'La note doit être entre 1 et 5'
                    })
        
        return data
    
    def create(self, validated_data):
        """Créer l'avis."""
        
        # Ajouter le client et le véhicule
        validated_data['client'] = self.context['request'].user
        validated_data['vehicule'] = validated_data['location'].vehicule
        
        avis = Avis.objects.create(**validated_data)
        
        return avis


# ========================================
# SERIALIZER RÉPONSE (PATCH)
# ========================================

class AvisRepondreSerializer(serializers.Serializer):
    """
    Serializer pour répondre à un avis.
    PATCH /api/avis/{id}/repondre/
    """
    
    reponse = serializers.CharField(
        required=True,
        min_length=10,
        error_messages={
            'required': 'La réponse est obligatoire',
            'min_length': 'La réponse doit contenir au moins 10 caractères'
        }
    )
    
    def validate_reponse(self, value):
        """Valider la réponse."""
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "La réponse doit contenir au moins 10 caractères"
            )
        return value.strip()


# ========================================
# SERIALIZER SIGNALEMENT (PATCH)
# ========================================

class AvisSignalerSerializer(serializers.Serializer):
    """
    Serializer pour signaler un avis.
    PATCH /api/avis/{id}/signaler/
    """
    
    raison = serializers.CharField(
        required=True,
        min_length=10,
        error_messages={
            'required': 'La raison du signalement est obligatoire',
            'min_length': 'La raison doit contenir au moins 10 caractères'
        }
    )


# ========================================
# SERIALIZER MODÉRATION (PATCH)
# ========================================

class AvisModererSerializer(serializers.Serializer):
    """
    Serializer pour modérer un avis (admin).
    PATCH /api/avis/{id}/moderer/
    """
    
    valide = serializers.BooleanField(
        required=True
    )
    
    raison = serializers.CharField(
        required=False,
        allow_blank=True
    )