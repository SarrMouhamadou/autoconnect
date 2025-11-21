from rest_framework import serializers
from .models import Vehicule, ImageVehicule, Equipement
from users.serializers import UserSerializer


# ========================================
# SERIALIZER ÉQUIPEMENT
# ========================================

class EquipementSerializer(serializers.ModelSerializer):
    """Serializer pour les équipements."""
    
    class Meta:
        model = Equipement
        fields = ['id', 'nom', 'icone', 'description', 'est_populaire']


# ========================================
# SERIALIZER IMAGE VÉHICULE
# ========================================

class ImageVehiculeSerializer(serializers.ModelSerializer):
    """Serializer pour les images de véhicules."""
    
    class Meta:
        model = ImageVehicule
        fields = ['id', 'image', 'description', 'ordre', 'date_ajout']
        read_only_fields = ['id', 'date_ajout']


# ========================================
# SERIALIZER VÉHICULE (LECTURE)
# ========================================

class VehiculeSerializer(serializers.ModelSerializer):
    """
    Serializer pour afficher les détails d'un véhicule.
    Utilisé pour GET /api/vehicules/ et GET /api/vehicules/{id}/
    """
    
    # Relations
    concessionnaire = UserSerializer(read_only=True)
    images = ImageVehiculeSerializer(many=True, read_only=True)
    
    # Champs calculés
    nom_complet = serializers.SerializerMethodField()
    peut_etre_loue = serializers.SerializerMethodField()
    peut_etre_vendu = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicule
        fields = [
            # IDs
            'id',
            
            # Relations
            'concessionnaire',
            
            # Infos de base
            'marque', 'modele', 'annee', 'type_vehicule',
            'couleur', 'immatriculation', 'nom_complet',
            
            # Caractéristiques
            'type_carburant', 'transmission', 'nombre_places',
            'nombre_portes', 'climatisation', 'kilometrage',
            
            # Tarifs
            'est_disponible_vente',
            'est_disponible_location',
            'prix_vente',
            'prix_location_jour',
            'caution',
            
            # Description
            'description', 'equipements',
            
            # Images
            'image_principale', 'images',
            
            # Disponibilité
            'statut', 'peut_etre_loue', 'peut_etre_vendu',
            
            # Statistiques
            'nombre_locations', 'note_moyenne', 'nombre_avis',
            
            # Maintenance
            'derniere_maintenance', 'prochaine_maintenance',
            
            # Dates
            'date_ajout', 'date_modification'
        ]
        read_only_fields = [
            'id', 'concessionnaire', 'nombre_locations',
            'note_moyenne', 'nombre_avis', 'date_ajout', 'date_modification'
        ]
    
    def get_nom_complet(self, obj):
        """Retourne le nom complet du véhicule."""
        return obj.get_nom_complet()
    
    def get_peut_etre_loue(self, obj):
        """Vérifie si le véhicule peut être loué."""
        return obj.peut_etre_loue()
    
    def get_peut_etre_vendu(self, obj):
        """Vérifie si le véhicule peut être vendu."""
        return obj.peut_etre_vendu()


# ========================================
# SERIALIZER VÉHICULE (LISTE)
# ========================================

class VehiculeListSerializer(serializers.ModelSerializer):
    """
    Serializer simplifié pour la liste des véhicules.
    Utilisé pour GET /api/vehicules/ (liste paginée)
    """
    
    concessionnaire_nom = serializers.CharField(
        source='concessionnaire.nom_entreprise',
        read_only=True
    )
    nom_complet = serializers.SerializerMethodField()
    peut_etre_loue = serializers.SerializerMethodField()
    peut_etre_vendu = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicule
        fields = [
            'id', 'marque', 'modele', 'annee', 'nom_complet',
            'type_vehicule', 'type_carburant', 'transmission',
            'nombre_places', 'prix_location_jour', 'prix_vente',
            'image_principale', 'statut',
            'est_disponible_vente', 'est_disponible_location',
            'peut_etre_loue', 'peut_etre_vendu',
            'note_moyenne', 'nombre_avis', 'concessionnaire_nom',
            'date_ajout'
        ]
    
    def get_nom_complet(self, obj):
        return obj.get_nom_complet()
    
    def get_peut_etre_loue(self, obj):
        return obj.peut_etre_loue()
    
    def get_peut_etre_vendu(self, obj):
        return obj.peut_etre_vendu()


# ========================================
# SERIALIZER VÉHICULE (CRÉATION)
# ========================================

class VehiculeCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer un nouveau véhicule.
    POST /api/vehicules/
    """
    
    # Images supplémentaires (optionnel lors de la création)
    images_data = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = Vehicule
        fields = [
            # Infos de base
            'marque', 'modele', 'annee', 'type_vehicule',
            'couleur', 'immatriculation',
            
            # Caractéristiques
            'type_carburant', 'transmission', 'nombre_places',
            'nombre_portes', 'climatisation', 'kilometrage',
            
            # Tarifs
            'est_disponible_vente',
            'est_disponible_location',
            'prix_vente',
            'prix_location_jour',
            'caution',
            
            # Description
            'description', 'equipements',
            
            # Images
            'image_principale', 'images_data',
            
            # Disponibilité
            'statut',
            
            # Maintenance
            'derniere_maintenance', 'prochaine_maintenance'
        ]
    
    def validate_annee(self, value):
        """Valider l'année."""
        from datetime import datetime
        current_year = datetime.now().year
        
        if value < 1990:
            raise serializers.ValidationError("L'année doit être supérieure à 1990")
        
        if value > current_year + 1:
            raise serializers.ValidationError(
                f"L'année ne peut pas être supérieure à {current_year + 1}"
            )
        
        return value
    
    def validate_immatriculation(self, value):
        """Valider l'immatriculation (format Sénégal)."""
        import re
        
        # Format: XX-1234-XX ou XX 1234 XX
        pattern = r'^[A-Z]{2}[-\s]?\d{4}[-\s]?[A-Z]{2}$'
        
        if not re.match(pattern, value.upper()):
            raise serializers.ValidationError(
                "Format d'immatriculation invalide. Format attendu: XX-1234-XX"
            )
        
        return value.upper()
    
    def validate(self, data):
        """Validation globale"""
        # Vérifier qu'au moins un type d'offre est sélectionné
        if not data.get('est_disponible_vente') and not data.get('est_disponible_location'):
            raise serializers.ValidationError(
                "Le véhicule doit être disponible à la vente et/ou à la location"
            )
        
        # Si vente : prix obligatoire
        if data.get('est_disponible_vente') and not data.get('prix_vente'):
            raise serializers.ValidationError({
                'prix_vente': "Le prix de vente est obligatoire si le véhicule est disponible à la vente"
            })
        
        # Si location : prix obligatoire
        if data.get('est_disponible_location'):
            if not data.get('prix_location_jour'):
                raise serializers.ValidationError({
                    'prix_location_jour': "Le prix de location est obligatoire si le véhicule est disponible à la location"
                })
            
            # Valider prix location
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
        # via validated_data['concessionnaire'] = request.user
        
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


# ========================================
# SERIALIZER VÉHICULE (MODIFICATION)
# ========================================

class VehiculeUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour modifier un véhicule.
    PUT/PATCH /api/vehicules/{id}/
    """
    
    class Meta:
        model = Vehicule
        fields = [
            # Modifiable:
            'type_vehicule', 'couleur', 'type_carburant',
            'transmission', 'nombre_places', 'nombre_portes',
            'climatisation', 'kilometrage',
            'est_disponible_vente', 'est_disponible_location',
            'prix_vente', 'prix_location_jour', 'caution',
            'description', 'equipements', 'image_principale',
            'statut', 'derniere_maintenance', 'prochaine_maintenance'
        ]
    
    def validate_kilometrage(self, value):
        """Le kilométrage ne peut que augmenter."""
        instance = self.instance
        
        if instance and value < instance.kilometrage:
            raise serializers.ValidationError(
                "Le kilométrage ne peut pas diminuer"
            )
        
        return value


# ========================================
# SERIALIZER POUR AJOUTER DES IMAGES
# ========================================

class AjouterImagesSerializer(serializers.Serializer):
    """
    Serializer pour ajouter des images supplémentaires à un véhicule existant.
    POST /api/vehicules/{id}/ajouter-images/
    """
    
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=True,
        max_length=10,  # Maximum 10 images à la fois
        help_text="Liste d'images à ajouter (max 10)"
    )
    
    def validate_images(self, value):
        """Valider les images."""
        if not value:
            raise serializers.ValidationError("Aucune image fournie")
        
        # Vérifier la taille de chaque image (max 5 MB)
        for image in value:
            if image.size > 5 * 1024 * 1024:
                raise serializers.ValidationError(
                    f"L'image {image.name} dépasse 5 MB"
                )
        
        return value
    
    def create(self, validated_data):
        """Ajouter les images au véhicule."""
        vehicule = self.context['vehicule']
        images = validated_data['images']
        
        # Récupérer le dernier ordre
        last_ordre = ImageVehicule.objects.filter(
            vehicule=vehicule
        ).count()
        
        # Créer les images
        images_created = []
        for index, image_file in enumerate(images):
            image_obj = ImageVehicule.objects.create(
                vehicule=vehicule,
                image=image_file,
                ordre=last_ordre + index + 1
            )
            images_created.append(image_obj)
        
        return images_created