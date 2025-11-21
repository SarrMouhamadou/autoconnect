# backend/vehicules/serializers.py
# VERSION AVEC PHOTO ET VIDEO (conforme au diagramme)

from rest_framework import serializers
from .models import Marque, Categorie, Vehicule, Photo, Video
from concessions.models import Concession
from users.models import User


# ========================================
# SERIALIZERS MINIMAUX
# ========================================

class ConcessionMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour concession."""
    
    class Meta:
        model = Concession
        fields = ['id', 'nom', 'ville', 'telephone', 'email', 'adresse']
        read_only_fields = fields


class UserMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour utilisateur."""
    
    nom_complet = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'nom', 'prenom', 'nom_complet', 'type_utilisateur', 'photo_profil']
        read_only_fields = fields
    
    def get_nom_complet(self, obj):
        return f"{obj.prenom} {obj.nom}"


# ========================================
# SERIALIZER MARQUE
# ========================================

class MarqueSerializer(serializers.ModelSerializer):
    """Serializer pour lire une marque."""
    
    class Meta:
        model = Marque
        fields = [
            'id',
            'nom',
            'logo',
            'description',
            'pays_origine',
            'site_web',
            'nombre_vehicules',
            'est_active',
            'date_creation',
        ]
        read_only_fields = ['nombre_vehicules', 'date_creation']


class MarqueMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour marque."""
    
    class Meta:
        model = Marque
        fields = ['id', 'nom', 'logo']


class MarqueCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une marque."""
    
    class Meta:
        model = Marque
        fields = [
            'nom',
            'logo',
            'description',
            'pays_origine',
            'site_web',
        ]
    
    def validate_nom(self, value):
        """Valider que le nom est unique (insensible à la casse)."""
        if Marque.objects.filter(nom__iexact=value).exists():
            raise serializers.ValidationError(
                "Une marque avec ce nom existe déjà."
            )
        return value


# ========================================
# SERIALIZER CATÉGORIE
# ========================================

class CategorieSerializer(serializers.ModelSerializer):
    """Serializer pour lire une catégorie."""
    
    class Meta:
        model = Categorie
        fields = [
            'id',
            'nom',
            'slug',
            'description',
            'icone',
            'image',
            'ordre',
            'nombre_vehicules',
            'est_active',
            'date_creation',
        ]
        read_only_fields = ['slug', 'nombre_vehicules', 'date_creation']


class CategorieMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour catégorie."""
    
    class Meta:
        model = Categorie
        fields = ['id', 'nom', 'slug', 'icone']


class CategorieCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une catégorie."""
    
    class Meta:
        model = Categorie
        fields = [
            'nom',
            'description',
            'icone',
            'image',
            'ordre',
        ]
    
    def validate_nom(self, value):
        """Valider que le nom est unique (insensible à la casse)."""
        if Categorie.objects.filter(nom__iexact=value).exists():
            raise serializers.ValidationError(
                "Une catégorie avec ce nom existe déjà."
            )
        return value


# ========================================
# SERIALIZER PHOTO (NOUVEAU)
# ========================================

class PhotoSerializer(serializers.ModelSerializer):
    """
    Serializer pour Photo.
    ⭐ REMPLACE ImageVehiculeSerializer
    """
    
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Photo
        fields = [
            'id',
            'image',
            'image_url',
            'legende',
            'ordre',
            'est_principale',
            'date_ajout'
        ]
        read_only_fields = ['date_ajout']
    
    def get_image_url(self, obj):
        """Retourner l'URL complète de l'image."""
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return obj.image.url
        return None


class PhotoCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une photo."""
    
    class Meta:
        model = Photo
        fields = ['image', 'legende', 'ordre', 'est_principale']


# ========================================
# SERIALIZER VIDEO (NOUVEAU)
# ========================================

class VideoSerializer(serializers.ModelSerializer):
    """
    Serializer pour Video.
    ⭐ NOUVEAU - Conforme au diagramme
    """
    
    embed_url = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id',
            'type_video',
            'fichier',
            'url',
            'video_url',
            'embed_url',
            'thumbnail',
            'thumbnail_url',
            'titre',
            'description',
            'duree',
            'ordre',
            'nombre_vues',
            'date_ajout'
        ]
        read_only_fields = ['nombre_vues', 'date_ajout']
    
    def get_embed_url(self, obj):
        """URL pour embed (iframe)."""
        return obj.get_embed_url()
    
    def get_video_url(self, obj):
        """URL de la vidéo."""
        return obj.get_video_url()
    
    def get_thumbnail_url(self, obj):
        """URL du thumbnail."""
        request = self.context.get('request')
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        elif obj.thumbnail:
            return obj.thumbnail.url
        return None


class VideoCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une vidéo."""
    
    class Meta:
        model = Video
        fields = [
            'type_video',
            'fichier',
            'url',
            'thumbnail',
            'titre',
            'description',
            'duree',
            'ordre'
        ]
    
    def validate(self, data):
        """Validation : soit fichier, soit URL."""
        if not data.get('fichier') and not data.get('url'):
            raise serializers.ValidationError(
                "Vous devez fournir soit un fichier, soit une URL."
            )
        if data.get('fichier') and data.get('url'):
            raise serializers.ValidationError(
                "Vous ne pouvez pas fournir à la fois un fichier et une URL."
            )
        return data


# ========================================
# SERIALIZER VÉHICULE (LECTURE)
# ========================================

class VehiculeSerializer(serializers.ModelSerializer):
    """
    Serializer complet pour lire un véhicule.
    ⭐ CONFORME AU DIAGRAMME - Avec Photo et Video
    """
    
    # Relations en lecture seule
    marque = MarqueMinimalSerializer(read_only=True)
    categorie = CategorieMinimalSerializer(read_only=True)
    concession = ConcessionMinimalSerializer(read_only=True)
    concessionnaire = UserMinimalSerializer(read_only=True)
    
    # Photos et vidéos (NOUVEAU)
    photos = PhotoSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)
    photo_principale = serializers.SerializerMethodField()
    
    # Nom complet calculé
    nom_complet = serializers.ReadOnlyField()
    
    class Meta:
        model = Vehicule
        fields = [
            'id',
            
            # Relations
            'marque',
            'categorie',
            'concession',
            'concessionnaire',
            
            # Informations de base
            'nom_modele',
            'nom_complet',
            'annee',
            'immatriculation',
            'couleur',
            
            # Caractéristiques
            'type_carburant',
            'transmission',
            'nombre_places',
            'nombre_portes',
            'climatisation',
            'kilometrage',
            'puissance_fiscale',
            'cylindree',
            
            # Disponibilité et tarifs
            'est_disponible_vente',
            'est_disponible_location',
            'prix_vente',
            'prix_location_jour',
            'caution',
            
            # Description
            'description',
            'equipements',
            
            # Photos et vidéos (CHANGEMENT ICI)
            'photo_principale',  # Au lieu de image_principale
            'photos',            # Au lieu de images
            'videos',            # NOUVEAU
            
            # Statut
            'statut',
            'est_visible',
            
            # Maintenance
            'derniere_maintenance',
            'prochaine_maintenance',
            
            # Statistiques
            'nombre_vues',
            'nombre_locations',
            'note_moyenne',
            'nombre_avis',
            
            # Dates
            'date_ajout',
            'date_modification',
        ]
    
    def get_photo_principale(self, obj):
        """Retourner la photo principale."""
        photo = obj.photo_principale
        if photo:
            return PhotoSerializer(photo, context=self.context).data
        return None


# ========================================
# SERIALIZER VÉHICULE (LISTE)
# ========================================

class VehiculeListSerializer(serializers.ModelSerializer):
    """
    Serializer pour lister les véhicules.
    ⭐ CONFORME AU DIAGRAMME
    """
    
    marque_nom = serializers.CharField(source='marque.nom', read_only=True)
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    concession_nom = serializers.CharField(source='concession.nom', read_only=True)
    concession_ville = serializers.CharField(source='concession.ville', read_only=True)
    
    nom_complet = serializers.ReadOnlyField()
    photo_principale = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicule
        fields = [
            'id',
            'marque_nom',
            'categorie_nom',
            'nom_modele',
            'nom_complet',
            'annee',
            'couleur',
            'type_carburant',
            'transmission',
            'nombre_places',
            'kilometrage',
            'est_disponible_vente',
            'est_disponible_location',
            'prix_vente',
            'prix_location_jour',
            'photo_principale',  # Au lieu de image_principale
            'statut',
            'concession_nom',
            'concession_ville',
            'note_moyenne',
            'nombre_avis',
        ]
    
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
# SERIALIZER VÉHICULE (CRÉATION)
# ========================================

class VehiculeCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer un véhicule.
    ⭐ CONFORME AU DIAGRAMME - Avec photos multiples
    """
    
    # Relations en écriture (ID seulement)
    marque_id = serializers.PrimaryKeyRelatedField(
        queryset=Marque.objects.filter(est_active=True),
        source='marque',
        write_only=True,
        required=True
    )
    
    categorie_id = serializers.PrimaryKeyRelatedField(
        queryset=Categorie.objects.filter(est_active=True),
        source='categorie',
        write_only=True,
        required=True
    )
    
    concession_id = serializers.PrimaryKeyRelatedField(
        queryset=Concession.objects.all(),
        source='concession',
        write_only=True,
        required=True
    )
    
    # Photos (CHANGEMENT ICI)
    photos_data = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        allow_empty=True,
        max_length=10,
        help_text="Liste des photos du véhicule (max 10). La première sera marquée comme principale."
    )
    
    class Meta:
        model = Vehicule
        fields = [
            # Relations
            'marque_id',
            'categorie_id',
            'concession_id',
            
            # Informations de base
            'nom_modele',
            'annee',
            'immatriculation',
            'couleur',
            
            # Caractéristiques
            'type_carburant',
            'transmission',
            'nombre_places',
            'nombre_portes',
            'climatisation',
            'kilometrage',
            'puissance_fiscale',
            'cylindree',
            
            # Disponibilité et tarifs
            'est_disponible_vente',
            'est_disponible_location',
            'prix_vente',
            'prix_location_jour',
            'caution',
            
            # Description
            'description',
            'equipements',
            
            # Photos (CHANGEMENT ICI)
            'photos_data',  # Au lieu de image_principale et images_data
        ]
    
    def validate_concession_id(self, value):
        """Valider que la concession appartient au concessionnaire."""
        request = self.context.get('request')
        if request and request.user:
            if value.concessionnaire != request.user:
                raise serializers.ValidationError(
                    "Cette concession ne vous appartient pas."
                )
            
            if value.statut != 'VALIDE':
                raise serializers.ValidationError(
                    "La concession doit être validée pour ajouter des véhicules."
                )
        
        return value
    
    def validate_immatriculation(self, value):
        """Valider le format de l'immatriculation."""
        import re
        
        # Format: XX-1234-XX ou XX 1234 XX
        pattern = r'^[A-Z]{2}[-\s]?\d{4}[-\s]?[A-Z]{2}$'
        
        if not re.match(pattern, value.upper()):
            raise serializers.ValidationError(
                "Format d'immatriculation invalide. Format attendu: XX-1234-XX"
            )
        
        return value.upper()
    
    def validate_photos_data(self, value):
        """Valider qu'au moins une photo est fournie."""
        if not value or len(value) == 0:
            raise serializers.ValidationError(
                "Vous devez fournir au moins une photo du véhicule."
            )
        return value
    
    def validate(self, data):
        """Validation globale."""
        
        # Vérifier qu'au moins un type d'offre est sélectionné
        if not data.get('est_disponible_vente') and not data.get('est_disponible_location'):
            raise serializers.ValidationError(
                "Le véhicule doit être disponible à la vente et/ou à la location"
            )
        
        # Si vente : prix obligatoire
        if data.get('est_disponible_vente') and not data.get('prix_vente'):
            raise serializers.ValidationError({
                'prix_vente': "Le prix de vente est obligatoire"
            })
        
        # Si location : prix obligatoire
        if data.get('est_disponible_location'):
            if not data.get('prix_location_jour'):
                raise serializers.ValidationError({
                    'prix_location_jour': "Le prix de location est obligatoire"
                })
            
            if data['prix_location_jour'] < 5000:
                raise serializers.ValidationError({
                    'prix_location_jour': "Le prix journalier doit être d'au moins 5000 FCFA"
                })
        
        return data
    
    def create(self, validated_data):
        """Créer un véhicule avec photos."""
        
        # Extraire les photos
        photos_data = validated_data.pop('photos_data', [])
        
        # L'utilisateur (concessionnaire) est ajouté par la vue
        validated_data['concessionnaire'] = self.context['request'].user
        
        # Créer le véhicule
        vehicule = Vehicule.objects.create(**validated_data)
        
        # Créer les photos
        for index, image_file in enumerate(photos_data):
            Photo.objects.create(
                vehicule=vehicule,
                image=image_file,
                ordre=index + 1,
                est_principale=(index == 0)  # La première photo est principale
            )
        
        return vehicule