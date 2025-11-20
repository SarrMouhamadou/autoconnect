from rest_framework import serializers
from .models import Region, Concession
from users.serializers import UserSimpleSerializer


# ========================================
# SERIALIZER RÉGION
# ========================================

class RegionSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle Region.
    Utilisé pour l'affichage et la création des régions.
    """
    
    class Meta:
        model = Region
        fields = [
            'id',
            'nom',
            'code',
            'description',
            'latitude',
            'longitude',
            'nombre_concessions',
            'date_creation',
            'date_modification'
        ]
        read_only_fields = ['id', 'nombre_concessions', 'date_creation', 'date_modification']


class RegionSimpleSerializer(serializers.ModelSerializer):
    """
    Serializer simplifié pour la région (pour les relations).
    """
    
    class Meta:
        model = Region
        fields = ['id', 'nom', 'code']


# ========================================
# SERIALIZER CONCESSION
# ========================================

class ConcessionListSerializer(serializers.ModelSerializer):
    """
    Serializer pour la liste des concessions (vue simplifiée).
    """
    
    region = RegionSimpleSerializer(read_only=True)
    concessionnaire_nom = serializers.CharField(
        source='concessionnaire.get_full_name',
        read_only=True
    )
    
    distance = serializers.SerializerMethodField()
    
    class Meta:
        model = Concession
        fields = [
            'id',
            'nom',
            'description',
            'adresse',
            'ville',
            'region',
            'telephone',
            'email',
            'latitude',
            'longitude',
            'logo',
            'photo_facade',
            'statut',
            'nombre_vehicules',
            'note_moyenne',
            'nombre_avis',
            'concessionnaire_nom',
            'services',
            'ouvert_weekend',
            'distance',
            'est_visible'
        ]
    
    def get_distance(self, obj):
        """
        Calcule la distance entre la concession et l'utilisateur.
        La position de l'utilisateur doit être passée dans le contexte.
        """
        user_position = self.context.get('user_position')
        if not user_position:
            return None
        
        # TODO: Implémenter le calcul de distance
        # Utiliser la formule de Haversine
        return None


class ConcessionDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour une concession.
    """
    
    region = RegionSimpleSerializer(read_only=True)
    region_id = serializers.PrimaryKeyRelatedField(
        queryset=Region.objects.all(),
        source='region',
        write_only=True
    )
    
    concessionnaire = UserSimpleSerializer(read_only=True)
    validee_par_nom = serializers.CharField(
        source='validee_par.get_full_name',
        read_only=True,
        allow_null=True
    )
    
    adresse_complete = serializers.CharField(
        source='get_adresse_complete',
        read_only=True
    )
    
    coordonnees_gps = serializers.SerializerMethodField()
    est_ouverte = serializers.SerializerMethodField()
    peut_ajouter_vehicules = serializers.SerializerMethodField()
    
    class Meta:
        model = Concession
        fields = [
            'id',
            'nom',
            'description',
            'adresse',
            'ville',
            'code_postal',
            'region',
            'region_id',
            'telephone',
            'telephone_secondaire',
            'email',
            'site_web',
            'latitude',
            'longitude',
            'coordonnees_gps',
            'adresse_complete',
            'horaires',
            'ouvert_weekend',
            'services',
            'numero_registre_commerce',
            'logo',
            'photo_facade',
            'statut',
            'date_validation',
            'validee_par_nom',
            'raison_rejet',
            'nombre_vehicules',
            'note_moyenne',
            'nombre_avis',
            'nombre_vues',
            'concessionnaire',
            'date_creation',
            'date_modification',
            'est_visible',
            'est_ouverte',
            'peut_ajouter_vehicules'
        ]
        read_only_fields = [
            'id',
            'statut',
            'date_validation',
            'validee_par_nom',
            'raison_rejet',
            'nombre_vehicules',
            'note_moyenne',
            'nombre_avis',
            'nombre_vues',
            'concessionnaire',
            'date_creation',
            'date_modification'
        ]
    
    def get_coordonnees_gps(self, obj):
        """Retourne les coordonnées GPS formatées."""
        return {
            'latitude': float(obj.latitude),
            'longitude': float(obj.longitude)
        }
    
    def get_est_ouverte(self, obj):
        """Retourne si la concession est ouverte aujourd'hui."""
        return obj.est_ouverte_aujourdhui()
    
    def get_peut_ajouter_vehicules(self, obj):
        """Retourne si la concession peut ajouter des véhicules."""
        return obj.peut_ajouter_vehicules()


class ConcessionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour la création d'une concession.
    """
    
    region_id = serializers.PrimaryKeyRelatedField(
        queryset=Region.objects.all(),
        source='region'
    )
    
    class Meta:
        model = Concession
        fields = [
            'nom',
            'description',
            'adresse',
            'ville',
            'code_postal',
            'region_id',
            'telephone',
            'telephone_secondaire',
            'email',
            'site_web',
            'latitude',
            'longitude',
            'horaires',
            'ouvert_weekend',
            'services',
            'numero_registre_commerce',
            'logo',
            'photo_facade'
        ]
    
    def validate(self, data):
        """Validation des données."""
        
        # Vérifier que les coordonnées GPS sont dans les limites du Sénégal
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if latitude:
            # Sénégal: latitude entre 12.3° et 16.7°
            if not (12.0 <= float(latitude) <= 17.0):
                raise serializers.ValidationError({
                    'latitude': 'La latitude doit être comprise entre 12.0 et 17.0 (territoire sénégalais)'
                })
        
        if longitude:
            # Sénégal: longitude entre -17.5° et -11.4°
            if not (-18.0 <= float(longitude) <= -11.0):
                raise serializers.ValidationError({
                    'longitude': 'La longitude doit être comprise entre -18.0 et -11.0 (territoire sénégalais)'
                })
        
        return data
    
    def create(self, validated_data):
        """Création d'une concession avec attribution au concessionnaire connecté."""
        
        request = self.context.get('request')
        if request and request.user:
            validated_data['concessionnaire'] = request.user
        
        return super().create(validated_data)


class ConcessionUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour la mise à jour d'une concession.
    """
    
    region_id = serializers.PrimaryKeyRelatedField(
        queryset=Region.objects.all(),
        source='region',
        required=False
    )
    
    class Meta:
        model = Concession
        fields = [
            'nom',
            'description',
            'adresse',
            'ville',
            'code_postal',
            'region_id',
            'telephone',
            'telephone_secondaire',
            'email',
            'site_web',
            'latitude',
            'longitude',
            'horaires',
            'ouvert_weekend',
            'services',
            'logo',
            'photo_facade',
            'est_visible'
        ]
    
    def validate(self, data):
        """Validation des données."""
        
        # Vérifier que les coordonnées GPS sont dans les limites du Sénégal
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if latitude:
            if not (12.0 <= float(latitude) <= 17.0):
                raise serializers.ValidationError({
                    'latitude': 'La latitude doit être comprise entre 12.0 et 17.0 (territoire sénégalais)'
                })
        
        if longitude:
            if not (-18.0 <= float(longitude) <= -11.0):
                raise serializers.ValidationError({
                    'longitude': 'La longitude doit être comprise entre -18.0 et -11.0 (territoire sénégalais)'
                })
        
        return data


# ========================================
# SERIALIZER POUR VALIDATION ADMIN
# ========================================

class ConcessionValidationSerializer(serializers.ModelSerializer):
    """
    Serializer pour la validation/rejet d'une concession par l'admin.
    """
    
    class Meta:
        model = Concession
        fields = ['statut', 'raison_rejet']
    
    def validate_statut(self, value):
        """Validation du statut."""
        if value not in ['VALIDE', 'REJETE', 'SUSPENDU']:
            raise serializers.ValidationError(
                "Le statut doit être VALIDE, REJETE ou SUSPENDU"
            )
        return value
    
    def validate(self, data):
        """Validation croisée."""
        if data.get('statut') == 'REJETE' and not data.get('raison_rejet'):
            raise serializers.ValidationError({
                'raison_rejet': 'Une raison de rejet est obligatoire'
            })
        return data
    
    def update(self, instance, validated_data):
        """Mise à jour avec enregistrement de la date et de l'admin."""
        from django.utils import timezone
        
        request = self.context.get('request')
        
        if validated_data.get('statut') == 'VALIDE':
            instance.date_validation = timezone.now()
            if request and request.user:
                instance.validee_par = request.user
        
        return super().update(instance, validated_data)


# ========================================
# SERIALIZER POUR STATISTIQUES
# ========================================

class ConcessionStatsSerializer(serializers.ModelSerializer):
    """
    Serializer pour les statistiques d'une concession.
    """
    
    region_nom = serializers.CharField(source='region.nom', read_only=True)
    
    class Meta:
        model = Concession
        fields = [
            'id',
            'nom',
            'region_nom',
            'nombre_vehicules',
            'note_moyenne',
            'nombre_avis',
            'nombre_vues',
            'statut'
        ]