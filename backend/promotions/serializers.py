# backend/promotions/serializers.py
# Serializers pour les promotions

from rest_framework import serializers
from .models import Promotion, UtilisationPromotion
from vehicules.models import Vehicule, Categorie
from concessions.models import Concession


# ========================================
# SERIALIZERS LECTURE
# ========================================

class PromotionListSerializer(serializers.ModelSerializer):
    """
    Serializer pour la liste des promotions (public).
    GET /api/promotions/
    """
    
    type_reduction_display = serializers.CharField(
        source='get_type_reduction_display',
        read_only=True
    )
    
    statut_display = serializers.CharField(
        source='get_statut_display',
        read_only=True
    )
    
    est_valide = serializers.ReadOnlyField()
    jours_restants = serializers.ReadOnlyField()
    
    class Meta:
        model = Promotion
        fields = [
            'id',
            'nom',
            'description',
            'code',
            'type_reduction',
            'type_reduction_display',
            'valeur_reduction',
            'date_debut',
            'date_fin',
            'statut',
            'statut_display',
            'montant_minimum',
            'reduction_maximum',
            'est_valide',
            'jours_restants',
            'est_cumulable',
        ]
        read_only_fields = fields


class PromotionDetailSerializer(serializers.ModelSerializer):
    """
    Serializer pour le détail d'une promotion.
    GET /api/promotions/{id}/
    """
    
    type_reduction_display = serializers.CharField(
        source='get_type_reduction_display',
        read_only=True
    )
    
    statut_display = serializers.CharField(
        source='get_statut_display',
        read_only=True
    )
    
    est_valide = serializers.ReadOnlyField()
    jours_restants = serializers.ReadOnlyField()
    reste_utilisations = serializers.ReadOnlyField()
    
    # Infos concessionnaire
    concessionnaire_nom = serializers.CharField(
        source='concessionnaire.nom_complet',
        read_only=True
    )
    
    concession_nom = serializers.CharField(
        source='concession.nom',
        read_only=True,
        allow_null=True
    )
    
    # Nombre de véhicules/catégories ciblés
    nb_vehicules_cibles = serializers.SerializerMethodField()
    nb_categories_cibles = serializers.SerializerMethodField()
    
    class Meta:
        model = Promotion
        fields = [
            'id',
            'nom',
            'description',
            'code',
            'type_reduction',
            'type_reduction_display',
            'valeur_reduction',
            'date_debut',
            'date_fin',
            'statut',
            'statut_display',
            'nombre_utilisations_max',
            'utilisations_par_client',
            'nombre_utilisations',
            'reste_utilisations',
            'montant_minimum',
            'reduction_maximum',
            'est_valide',
            'jours_restants',
            'est_cumulable',
            'est_visible',
            'concessionnaire_nom',
            'concession_nom',
            'nb_vehicules_cibles',
            'nb_categories_cibles',
            'date_creation',
        ]
        read_only_fields = fields
    
    def get_nb_vehicules_cibles(self, obj):
        return obj.vehicules.count()
    
    def get_nb_categories_cibles(self, obj):
        return obj.categories.count()


# ========================================
# SERIALIZERS CRÉATION/MODIFICATION
# ========================================

class PromotionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer une promotion.
    POST /api/promotions/
    """
    
    vehicules_ids = serializers.PrimaryKeyRelatedField(
        queryset=Vehicule.objects.all(),
        many=True,
        required=False,
        write_only=True
    )
    
    categories_ids = serializers.PrimaryKeyRelatedField(
        queryset=Categorie.objects.all(),
        many=True,
        required=False,
        write_only=True
    )
    
    concession_id = serializers.PrimaryKeyRelatedField(
        queryset=Concession.objects.all(),
        required=False,
        write_only=True,
        source='concession'
    )
    
    class Meta:
        model = Promotion
        fields = [
            'nom',
            'description',
            'code',
            'type_reduction',
            'valeur_reduction',
            'date_debut',
            'date_fin',
            'nombre_utilisations_max',
            'utilisations_par_client',
            'montant_minimum',
            'reduction_maximum',
            'concession_id',
            'vehicules_ids',
            'categories_ids',
            'est_cumulable',
            'est_visible',
        ]
    
    def validate_code(self, value):
        """Valider le code promo."""
        # Mettre en majuscules
        value = value.upper().strip()
        
        # Vérifier le format (alphanumeric uniquement)
        if not value.replace('_', '').replace('-', '').isalnum():
            raise serializers.ValidationError(
                "Le code ne peut contenir que des lettres, chiffres, tirets et underscores"
            )
        
        return value
    
    def validate_valeur_reduction(self, value):
        """Valider la valeur de réduction."""
        if value <= 0:
            raise serializers.ValidationError(
                "La valeur de réduction doit être supérieure à 0"
            )
        return value
    
    def validate(self, data):
        """Validation globale."""
        request = self.context.get('request')
        
        # Vérifier les dates
        date_debut = data.get('date_debut')
        date_fin = data.get('date_fin')
        
        if date_debut and date_fin and date_debut > date_fin:
            raise serializers.ValidationError({
                'date_fin': "La date de fin doit être après la date de début"
            })
        
        # Vérifier le pourcentage
        if data.get('type_reduction') == 'POURCENTAGE':
            if data.get('valeur_reduction', 0) > 100:
                raise serializers.ValidationError({
                    'valeur_reduction': "Le pourcentage ne peut pas dépasser 100%"
                })
        
        # Vérifier la concession appartient au concessionnaire
        concession = data.get('concession')
        if concession and concession.concessionnaire != request.user:
            raise serializers.ValidationError({
                'concession_id': "Cette concession ne vous appartient pas"
            })
        
        return data
    
    def create(self, validated_data):
        """Créer la promotion."""
        vehicules_ids = validated_data.pop('vehicules_ids', [])
        categories_ids = validated_data.pop('categories_ids', [])
        
        # Ajouter le concessionnaire
        validated_data['concessionnaire'] = self.context['request'].user
        
        # Créer la promotion
        promotion = Promotion.objects.create(**validated_data)
        
        # Ajouter les véhicules ciblés
        if vehicules_ids:
            promotion.vehicules.set(vehicules_ids)
        
        # Ajouter les catégories ciblées
        if categories_ids:
            promotion.categories.set(categories_ids)
        
        return promotion
    
    def update(self, instance, validated_data):
        """Mettre à jour la promotion."""
        vehicules_ids = validated_data.pop('vehicules_ids', None)
        categories_ids = validated_data.pop('categories_ids', None)
        
        # Mettre à jour les champs
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Mettre à jour les relations
        if vehicules_ids is not None:
            instance.vehicules.set(vehicules_ids)
        
        if categories_ids is not None:
            instance.categories.set(categories_ids)
        
        return instance


# ========================================
# SERIALIZER VÉRIFICATION CODE
# ========================================

class VerifierCodeSerializer(serializers.Serializer):
    """
    Serializer pour vérifier un code promo.
    POST /api/promotions/verifier-code/
    """
    
    code = serializers.CharField(required=True)
    vehicule_id = serializers.IntegerField(required=False)
    montant = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False
    )


class VerifierCodeResponseSerializer(serializers.Serializer):
    """
    Serializer pour la réponse de vérification de code.
    """
    
    valide = serializers.BooleanField()
    message = serializers.CharField()
    promotion = PromotionListSerializer(required=False)
    reduction_estimee = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False
    )


# ========================================
# SERIALIZER UTILISATION
# ========================================

class UtilisationPromotionSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'historique d'utilisation.
    """
    
    promotion_nom = serializers.CharField(
        source='promotion.nom',
        read_only=True
    )
    
    promotion_code = serializers.CharField(
        source='promotion.code',
        read_only=True
    )
    
    client_nom = serializers.CharField(
        source='client.nom_complet',
        read_only=True
    )
    
    class Meta:
        model = UtilisationPromotion
        fields = [
            'id',
            'promotion_nom',
            'promotion_code',
            'client_nom',
            'montant_reduction',
            'date_utilisation',
        ]
        read_only_fields = fields