from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User
from django.core.exceptions import ValidationError


# ========================================
# MODÈLE VÉHICULE
# ========================================

class Vehicule(models.Model):
    """
    Modèle représentant un véhicule disponible à la location.
    Géré par un concessionnaire.
    """
    
    # ========================================
    # CHOIX (CHOICES)
    # ========================================
    
    TYPE_CARBURANT_CHOICES = [
        ('ESSENCE', 'Essence'),
        ('DIESEL', 'Diesel'),
        ('HYBRIDE', 'Hybride'),
        ('ELECTRIQUE', 'Électrique'),
        ('GAZ', 'Gaz (GPL/GNV)'),
    ]
    
    TYPE_TRANSMISSION_CHOICES = [
        ('MANUELLE', 'Manuelle'),
        ('AUTOMATIQUE', 'Automatique'),
        ('SEMI_AUTO', 'Semi-automatique'),
    ]
    
    TYPE_VEHICULE_CHOICES = [
        ('BERLINE', 'Berline'),
        ('SUV', 'SUV'),
        ('4X4', '4x4'),
        ('CITADINE', 'Citadine'),
        ('BREAK', 'Break'),
        ('COUPE', 'Coupé'),
        ('MONOSPACE', 'Monospace'),
        ('UTILITAIRE', 'Utilitaire'),
        ('PICK_UP', 'Pick-up'),
        ('SPORTIVE', 'Sportive'),
    ]
    
    STATUT_CHOICES = [
        ('DISPONIBLE', 'Disponible'),
        ('LOUE', 'Loué'),
        ('MAINTENANCE', 'En maintenance'),
        ('INDISPONIBLE', 'Indisponible'),
    ]
    
    # ========================================
    # RELATIONS
    # ========================================
    
    concessionnaire = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='vehicules',
        limit_choices_to={'type_utilisateur': 'CONCESSIONNAIRE'},
        verbose_name="Concessionnaire propriétaire"
    )
    
    # ========================================
    # INFORMATIONS DE BASE
    # ========================================
    
    marque = models.CharField(
        max_length=100,
        verbose_name="Marque",
        help_text="Ex: Toyota, Mercedes, Peugeot"
    )
    
    modele = models.CharField(
        max_length=100,
        verbose_name="Modèle",
        help_text="Ex: Corolla, Classe C, 308"
    )
    
    annee = models.IntegerField(
        validators=[
            MinValueValidator(1990),
            MaxValueValidator(2030)
        ],
        verbose_name="Année",
        help_text="Année de fabrication"
    )
    
    type_vehicule = models.CharField(
        max_length=50,
        choices=TYPE_VEHICULE_CHOICES,
        verbose_name="Type de véhicule"
    )
    
    # ========================================
    # CARACTÉRISTIQUES TECHNIQUES
    # ========================================
    
    type_carburant = models.CharField(
        max_length=20,
        choices=TYPE_CARBURANT_CHOICES,
        verbose_name="Type de carburant"
    )
    
    transmission = models.CharField(
        max_length=20,
        choices=TYPE_TRANSMISSION_CHOICES,
        verbose_name="Type de transmission"
    )
    
    nombre_places = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(20)],
        default=5,
        verbose_name="Nombre de places"
    )
    
    nombre_portes = models.IntegerField(
        validators=[MinValueValidator(2), MaxValueValidator(6)],
        default=4,
        verbose_name="Nombre de portes"
    )
    
    climatisation = models.BooleanField(
        default=True,
        verbose_name="Climatisation"
    )
    
    # ========================================
    # KILOMÉTRAGE ET ÉTAT
    # ========================================
    
    kilometrage = models.IntegerField(
        validators=[MinValueValidator(0)],
        verbose_name="Kilométrage",
        help_text="En kilomètres"
    )
    
    couleur = models.CharField(
        max_length=50,
        verbose_name="Couleur"
    )
    
    immatriculation = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Numéro d'immatriculation"
    )
    
    # ========================================
    # TARIFICATION
    # ========================================
    
    prix_location_jour = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Prix par jour (FCFA)",
        help_text="Tarif de location journalier",
        null=True,
        blank=True
    )
    
    caution = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
        verbose_name="Montant de la caution (FCFA)",
        null=True,
        blank=True
    )
    
    prix_vente = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Prix de vente (FCFA)',
        null=True,
        blank=True,
        help_text="Laisser vide si véhicule non disponible à la vente"
    )

    # ========================================
    # DESCRIPTION ET ÉQUIPEMENTS
    # ========================================
    
    description = models.TextField(
        blank=True,
        verbose_name="Description détaillée"
    )
    
    equipements = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Équipements",
        help_text="Liste des équipements du véhicule (GPS, Bluetooth, etc.)"
    )
    
    # ========================================
    # DISPONIBILITÉ ET STATUT
    # ========================================
    
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='DISPONIBLE',
        verbose_name="Statut"
    )
    
    est_disponible_vente = models.BooleanField(
        default=False,
        verbose_name="Disponible à la vente"
    )
    est_disponible_location = models.BooleanField(
        default=False,
        verbose_name="Disponible à la location"
    )
    # ========================================
    # IMAGES
    # ========================================
    
    image_principale = models.ImageField(
        upload_to='vehicules/',
        verbose_name="Image principale",
        help_text="Photo principale du véhicule"
    )
    
    # Note: Les images supplémentaires seront gérées via un modèle séparé
    # ImageVehicule pour permettre plusieurs photos par véhicule
    
    # ========================================
    # STATISTIQUES ET INFORMATIONS
    # ========================================
    
    nombre_locations = models.IntegerField(
        default=0,
        verbose_name="Nombre de locations",
        help_text="Nombre total de fois où le véhicule a été loué"
    )
    
    note_moyenne = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Note moyenne"
    )
    
    nombre_avis = models.IntegerField(
        default=0,
        verbose_name="Nombre d'avis"
    )
    
    # ========================================
    # DATES
    # ========================================
    
    date_ajout = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date d'ajout"
    )
    
    date_modification = models.DateTimeField(
        auto_now=True,
        verbose_name="Dernière modification"
    )
    
    derniere_maintenance = models.DateField(
        null=True,
        blank=True,
        verbose_name="Date de dernière maintenance"
    )
    
    prochaine_maintenance = models.DateField(
        null=True,
        blank=True,
        verbose_name="Date de prochaine maintenance"
    )
    
    # ========================================
    # META ET MÉTHODES
    # ========================================
    
    class Meta:
        verbose_name = "Véhicule"
        verbose_name_plural = "Véhicules"
        ordering = ['-date_ajout']
        indexes = [
            models.Index(fields=['marque', 'modele']),
            models.Index(fields=['statut', 'est_disponible_vente']),
            models.Index(fields=['statut', 'est_disponible_location']),
            models.Index(fields=['prix_location_jour']),
            models.Index(fields=['prix_vente']),
        ]
    
    def __str__(self):
        return f"{self.marque} {self.modele} ({self.annee})"
    
    def get_nom_complet(self):
        """Retourne le nom complet du véhicule."""
        return f"{self.marque} {self.modele} {self.annee}"
    
    def peut_etre_loue(self):
        """Vérifie si le véhicule est disponible à la location."""
        return self.est_disponible_location and self.statut == 'DISPONIBLE'
    
    def peut_etre_vendu(self):
        """Vérifie si le véhicule peut être vendu"""
        return self.est_disponible_vente and self.statut == 'DISPONIBLE'

    def calculer_prix_total(self, nombre_jours):
        """Calcule le prix total pour un nombre de jours donné."""
        return self.prix_location_jour * nombre_jours
    
    def mettre_a_jour_note(self):
        """
        Met à jour la note moyenne du véhicule.
        À implémenter après création du modèle Avis.
        """
        # TODO: Calculer depuis les avis
        pass

def clean(self):
    """Validation personnalisée du modèle"""

    
    # Au moins un type d'offre doit être sélectionné
    if not self.est_disponible_vente and not self.est_disponible_location:
        raise ValidationError(
            "Le véhicule doit être disponible à la vente et/ou à la location"
        )
    
    # Si vente activée, prix vente obligatoire
    if self.est_disponible_vente and not self.prix_vente:
        raise ValidationError({
            'prix_vente': "Le prix de vente est obligatoire si le véhicule est disponible à la vente"
        })
    
    # Si location activée, prix location obligatoire
    if self.est_disponible_location and not self.prix_location_jour:
        raise ValidationError({
            'prix_location_jour': "Le prix de location est obligatoire si le véhicule est disponible à la location"
        })
    
    if errors:
        raise ValidationError(errors)

def save(self, *args, **kwargs):
    """Override save pour appeler clean()"""
    self.clean()
    super().save(*args, **kwargs)

    
# ========================================
# MODÈLE IMAGES SUPPLÉMENTAIRES
# ========================================

class ImageVehicule(models.Model):
    """
    Modèle pour stocker plusieurs images par véhicule.
    """
    
    vehicule = models.ForeignKey(
        Vehicule,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name="Véhicule"
    )
    
    image = models.ImageField(
        upload_to='vehicules/galerie/',
        verbose_name="Image"
    )
    
    description = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Description de l'image"
    )
    
    ordre = models.IntegerField(
        default=0,
        verbose_name="Ordre d'affichage"
    )
    
    date_ajout = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date d'ajout"
    )
    
    class Meta:
        verbose_name = "Image de véhicule"
        verbose_name_plural = "Images de véhicules"
        ordering = ['ordre', '-date_ajout']
    
    def __str__(self):
        return f"Image de {self.vehicule} - {self.ordre}"


# ========================================
# MODÈLE ÉQUIPEMENTS (OPTIONNEL)
# ========================================

class Equipement(models.Model):
    """
    Modèle pour stocker les équipements disponibles.
    Permet une gestion plus structurée des équipements.
    """
    
    nom = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nom de l'équipement"
    )
    
    icone = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Icône (classe CSS ou emoji)",
        help_text="Ex: 🎵 ou fa-music"
    )
    
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    
    est_populaire = models.BooleanField(
        default=False,
        verbose_name="Équipement populaire",
        help_text="Afficher en priorité dans les filtres"
    )
    
    class Meta:
        verbose_name = "Équipement"
        verbose_name_plural = "Équipements"
        ordering = ['-est_populaire', 'nom']
    
    def __str__(self):
        return self.nom