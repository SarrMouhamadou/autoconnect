from rest_framework import serializers
from .models import Marque, Categorie, Vehicule, ImageVehicule
from concessions.models import Concession
from users.models import User


# ========================================
# SERIALIZERS MINIMAUX (DÉFINIS ICI)
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
    """
    Serializer pour lire une marque.
    GET /api/marques/
    """
    
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
    """
    Serializer minimal pour marque (dans les listes).
    """
    
    class Meta:
        model = Marque
        fields = ['id', 'nom', 'logo']


class MarqueCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer une marque.
    POST /api/marques/
    """
    
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
    """
    Serializer pour lire une catégorie.
    GET /api/categories/
    """
    
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
    """
    Serializer minimal pour catégorie (dans les listes).
    """
    
    class Meta:
        model = Categorie
        fields = ['id', 'nom', 'slug', 'icone']


class CategorieCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer une catégorie.
    POST /api/categories/
    """
    
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
# SERIALIZER VÉHICULE (LECTURE)
# ========================================

class VehiculeSerializer(serializers.ModelSerializer):
    """
    Serializer complet pour lire un véhicule.
    GET /api/vehicules/{id}/
    
    ⭐ CONFORME AU DIAGRAMME - Inclut Marque, Catégorie, Concession
    """
    
    # Relations en lecture seule
    marque = MarqueMinimalSerializer(read_only=True)
    categorie = CategorieMinimalSerializer(read_only=True)
    concession = ConcessionMinimalSerializer(read_only=True)
    concessionnaire = UserMinimalSerializer(read_only=True)
    
    # Images supplémentaires
    images = serializers.SerializerMethodField()
    
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
            
            # Images
            'image_principale',
            'images',
            
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
    
    def get_images(self, obj):
        """Retourner toutes les images supplémentaires."""
        images = obj.images.all()
        request = self.context.get('request')
        return [{
            'id': img.id,
            'image': request.build_absolute_uri(img.image.url) if request and img.image else None,
            'description': img.description,
            'ordre': img.ordre
        } for img in images]


# ========================================
# SERIALIZER VÉHICULE (LISTE)
# ========================================

class VehiculeListSerializer(serializers.ModelSerializer):
    """
    Serializer pour lister les véhicules.
    GET /api/vehicules/
    
    ⭐ CONFORME AU DIAGRAMME
    """
    
    marque_nom = serializers.CharField(source='marque.nom', read_only=True)
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    concession_nom = serializers.CharField(source='concession.nom', read_only=True)
    concession_ville = serializers.CharField(source='concession.ville', read_only=True)
    
    nom_complet = serializers.ReadOnlyField()
    
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
            'image_principale',
            'statut',
            'concession_nom',
            'concession_ville',
            'note_moyenne',
            'nombre_avis',
        ]


# ========================================
# SERIALIZER VÉHICULE (CRÉATION)
# ========================================

class VehiculeCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer un véhicule.
    POST /api/vehicules/
    
    ⭐ CONFORME AU DIAGRAMME - Requiert Marque, Catégorie, Concession
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
    
    # Images supplémentaires
    images_data = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        allow_empty=True,
        max_length=10
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
            
            # Image principale
            'image_principale',
            
            # Images supplémentaires
            'images_data',
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
        """Créer un véhicule avec images supplémentaires."""
        
        # Extraire les images supplémentaires
        images_data = validated_data.pop('images_data', [])
        
        # L'utilisateur (concessionnaire) est ajouté par la vue
        validated_data['concessionnaire'] = self.context['request'].user
        
        # Créer le véhicule
        vehicule = Vehicule.objects.create(**validated_data)
        
        # Créer les images supplémentaires
        for index, image_file in enumerate(images_data):
            ImageVehicule.objects.create(
                vehicule=vehicule,
                image=image_file,
                ordre=index + 1
            )
        
        return vehicule