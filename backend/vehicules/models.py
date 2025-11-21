from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from users.models import User


# ========================================
# MODÈLE MARQUE
# ========================================

class Marque(models.Model):
    """
    Modèle représentant une marque de véhicule.
    Ex: Toyota, Mercedes, Peugeot, etc.
    """
    
    nom = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nom de la marque",
        help_text="Ex: Toyota, Mercedes, Peugeot"
    )
    
    logo = models.ImageField(
        upload_to='marques/logos/',
        blank=True,
        null=True,
        verbose_name="Logo de la marque"
    )
    
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    
    pays_origine = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Pays d'origine"
    )
    
    site_web = models.URLField(
        blank=True,
        verbose_name="Site web officiel"
    )
    
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    est_active = models.BooleanField(default=True)
    nombre_vehicules = models.IntegerField(default=0)
    
    class Meta:
        verbose_name = "Marque"
        verbose_name_plural = "Marques"
        ordering = ['nom']
        indexes = [
            models.Index(fields=['nom']),
            models.Index(fields=['est_active']),
        ]
    
    def __str__(self):
        return self.nom
    
    def mettre_a_jour_compteur(self):
        """Mettre à jour le compteur de véhicules."""
        self.nombre_vehicules = self.vehicules.count()
        self.save(update_fields=['nombre_vehicules'])


# ========================================
# MODÈLE CATEGORIE
# ========================================

class Categorie(models.Model):
    """
    Modèle représentant une catégorie de véhicule.
    Ex: Berline, SUV, 4x4, Utilitaire, etc.
    """
    
    nom = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nom de la catégorie"
    )
    
    slug = models.SlugField(
        max_length=100,
        unique=True,
        verbose_name="Slug"
    )
    
    description = models.TextField(blank=True)
    
    icone = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Icône"
    )
    
    image = models.ImageField(
        upload_to='categories/',
        blank=True,
        null=True
    )
    
    ordre = models.IntegerField(
        default=0,
        verbose_name="Ordre d'affichage"
    )
    
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    est_active = models.BooleanField(default=True)
    nombre_vehicules = models.IntegerField(default=0)
    
    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        ordering = ['ordre', 'nom']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['est_active']),
        ]
    
    def __str__(self):
        return self.nom
    
    def save(self, *args, **kwargs):
        """Générer automatiquement le slug."""
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.nom)
        super().save(*args, **kwargs)
    
    def mettre_a_jour_compteur(self):
        """Mettre à jour le compteur de véhicules."""
        self.nombre_vehicules = self.vehicules.count()
        self.save(update_fields=['nombre_vehicules'])


# ========================================
# MODÈLE VÉHICULE
# ========================================
class Photo(models.Model):
    """
    Modèle représentant une photo d'un véhicule.
    Relation Many-to-One avec Vehicule.
    ⭐ CONFORME AU DIAGRAMME DE CLASSE
    """
    
    vehicule = models.ForeignKey(
        'Vehicule',
        on_delete=models.CASCADE,
        related_name='photos',
        verbose_name="Véhicule"
    )
    
    image = models.ImageField(
        upload_to='vehicules/photos/',
        verbose_name="Photo"
    )
    
    legende = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Légende",
        help_text="Description de la photo"
    )
    
    ordre = models.IntegerField(
        default=0,
        verbose_name="Ordre d'affichage",
        help_text="Plus le nombre est petit, plus la photo sera affichée en premier"
    )
    
    est_principale = models.BooleanField(
        default=False,
        verbose_name="Photo principale",
        help_text="Une seule photo principale par véhicule"
    )
    
    date_ajout = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date d'ajout"
    )
    
    class Meta:
        verbose_name = "Photo"
        verbose_name_plural = "Photos"
        ordering = ['-est_principale', 'ordre', '-date_ajout']
        indexes = [
            models.Index(fields=['vehicule', 'est_principale']),
            models.Index(fields=['ordre']),
        ]
    
    def __str__(self):
        principale = " (Principale)" if self.est_principale else ""
        return f"Photo {self.ordre}{principale} - {self.vehicule}"
    
    def save(self, *args, **kwargs):
        """
        Si cette photo est marquée comme principale,
        retirer le statut principal des autres photos du même véhicule.
        """
        if self.est_principale:
            # Retirer le statut principal des autres photos
            Photo.objects.filter(
                vehicule=self.vehicule,
                est_principale=True
            ).exclude(pk=self.pk).update(est_principale=False)
        
        super().save(*args, **kwargs)

 #========================================
# MODÈLE VIDEO
# ========================================

class Video(models.Model):
    """
    Modèle représentant une vidéo d'un véhicule.
    Relation Many-to-One avec Vehicule.
    ⭐ CONFORME AU DIAGRAMME DE CLASSE
    ⚠️ OPTIONNELLE (contrairement aux photos)
    """
    
    TYPE_VIDEO_CHOICES = [
        ('UPLOAD', 'Fichier uploadé'),
        ('YOUTUBE', 'Lien YouTube'),
        ('VIMEO', 'Lien Vimeo'),
        ('AUTRE', 'Autre URL'),
    ]
    
    vehicule = models.ForeignKey(
        'Vehicule',
        on_delete=models.CASCADE,
        related_name='videos',
        verbose_name="Véhicule"
    )
    
    type_video = models.CharField(
        max_length=20,
        choices=TYPE_VIDEO_CHOICES,
        default='UPLOAD',
        verbose_name="Type de vidéo"
    )
    
    # Fichier vidéo (si uploadé)
    fichier = models.FileField(
        upload_to='vehicules/videos/',
        blank=True,
        null=True,
        verbose_name="Fichier vidéo",
        help_text="Format accepté: MP4, WebM (max 100 MB)"
    )
    
    # URL de la vidéo (si hébergée ailleurs)
    url = models.URLField(
        blank=True,
        verbose_name="URL de la vidéo",
        help_text="Lien YouTube, Vimeo, etc."
    )
    
    # Thumbnail (miniature)
    thumbnail = models.ImageField(
        upload_to='vehicules/videos/thumbnails/',
        blank=True,
        null=True,
        verbose_name="Miniature",
        help_text="Image d'aperçu de la vidéo"
    )
    
    titre = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Titre",
        help_text="Titre de la vidéo"
    )
    
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    
    duree = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="Durée (secondes)",
        help_text="Durée de la vidéo en secondes"
    )
    
    ordre = models.IntegerField(
        default=0,
        verbose_name="Ordre d'affichage"
    )
    
    nombre_vues = models.IntegerField(
        default=0,
        verbose_name="Nombre de vues"
    )
    
    date_ajout = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date d'ajout"
    )
    
    class Meta:
        verbose_name = "Vidéo"
        verbose_name_plural = "Vidéos"
        ordering = ['ordre', '-date_ajout']
        indexes = [
            models.Index(fields=['vehicule', 'type_video']),
            models.Index(fields=['ordre']),
        ]
    
    def __str__(self):
        return f"Vidéo {self.ordre} - {self.vehicule}"
    
    def clean(self):
        """Validation : soit fichier, soit URL."""
        from django.core.exceptions import ValidationError
        
        if not self.fichier and not self.url:
            raise ValidationError(
                "Vous devez fournir soit un fichier vidéo, soit une URL."
            )
        
        if self.fichier and self.url:
            raise ValidationError(
                "Vous ne pouvez pas fournir à la fois un fichier et une URL. Choisissez l'un ou l'autre."
            )
        
        # Valider la taille du fichier (max 100 MB)
        if self.fichier and self.fichier.size > 100 * 1024 * 1024:
            raise ValidationError(
                "La taille du fichier vidéo ne doit pas dépasser 100 MB."
            )
    
    def get_video_url(self):
        """Retourner l'URL de la vidéo (fichier ou externe)."""
        if self.fichier:
            return self.fichier.url
        return self.url
    
    def incrementer_vues(self):
        """Incrémenter le compteur de vues."""
        self.nombre_vues += 1
        self.save(update_fields=['nombre_vues'])
    
    @staticmethod
    def extraire_id_youtube(url):
        """Extraire l'ID d'une vidéo YouTube."""
        import re
        
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
            r'youtube\.com\/embed\/([^&\n?#]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None
    
    def get_embed_url(self):
        """Retourner l'URL embed pour intégration."""
        if self.type_video == 'YOUTUBE' and self.url:
            video_id = self.extraire_id_youtube(self.url)
            if video_id:
                return f"https://www.youtube.com/embed/{video_id}"
        
        return self.url


class Vehicule(models.Model):
    """
    Modèle représentant un véhicule.
    ⭐ CONFORME AU DIAGRAMME DE CLASSE À 100%
    """
    
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
    
    STATUT_CHOICES = [
        ('DISPONIBLE', 'Disponible'),
        ('LOUE', 'Loué'),
        ('MAINTENANCE', 'En maintenance'),
        ('INDISPONIBLE', 'Indisponible'),
    ]
    
    # Relations (CONFORMES AU DIAGRAMME)
    concessionnaire = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='vehicules',
        limit_choices_to={'type_utilisateur': 'CONCESSIONNAIRE'}
    )
    
    concession = models.ForeignKey(
        'concessions.Concession',
        on_delete=models.CASCADE,
        related_name='vehicules'
    )
    
    marque = models.ForeignKey(
        'Marque',
        on_delete=models.PROTECT,
        related_name='vehicules'
    )
    
    categorie = models.ForeignKey(
        'Categorie',
        on_delete=models.PROTECT,
        related_name='vehicules'
    )
    
    # Informations de base
    nom_modele = models.CharField(max_length=100)
    annee = models.IntegerField(validators=[MinValueValidator(1990), MaxValueValidator(2030)])
    immatriculation = models.CharField(max_length=20, unique=True)
    couleur = models.CharField(max_length=50)
    
    # Caractéristiques
    type_carburant = models.CharField(max_length=20, choices=TYPE_CARBURANT_CHOICES, default='ESSENCE')
    transmission = models.CharField(max_length=20, choices=TYPE_TRANSMISSION_CHOICES, default='MANUELLE')
    nombre_places = models.IntegerField(default=5, validators=[MinValueValidator(2), MaxValueValidator(50)])
    nombre_portes = models.IntegerField(default=4, validators=[MinValueValidator(2), MaxValueValidator(6)])
    climatisation = models.BooleanField(default=True)
    kilometrage = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    puissance_fiscale = models.IntegerField(null=True, blank=True)
    cylindree = models.IntegerField(null=True, blank=True)
    
    # Disponibilité et tarifs
    est_disponible_vente = models.BooleanField(default=False)
    est_disponible_location = models.BooleanField(default=True)
    prix_vente = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    prix_location_jour = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(5000)])
    caution = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    
    # Description
    description = models.TextField(blank=True)
    equipements = models.JSONField(default=list, blank=True)
    
    # Images
   
    
    # Statut
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='DISPONIBLE')
    est_visible = models.BooleanField(default=True)
    
    # Maintenance
    derniere_maintenance = models.DateField(null=True, blank=True)
    prochaine_maintenance = models.DateField(null=True, blank=True)
    
    # Statistiques
    nombre_vues = models.IntegerField(default=0)
    nombre_locations = models.IntegerField(default=0)
    note_moyenne = models.DecimalField(max_digits=3, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    nombre_avis = models.IntegerField(default=0)
    
    # Métadonnées
    date_ajout = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Véhicule"
        verbose_name_plural = "Véhicules"
        ordering = ['-date_ajout']
        indexes = [
            models.Index(fields=['marque', 'nom_modele']),
            models.Index(fields=['categorie', 'statut']),
            models.Index(fields=['concession', 'statut']),
            models.Index(fields=['statut', 'est_visible']),
            models.Index(fields=['prix_location_jour']),
            models.Index(fields=['immatriculation']),
        ]
        unique_together = [['concessionnaire', 'immatriculation']]
    
    def __str__(self):
        return f"{self.marque.nom} {self.nom_modele} ({self.annee})"
    
    @property
    def nom_complet(self):
        return f"{self.marque.nom} {self.nom_modele} {self.annee}"
    
    def clean(self):
        """Validation personnalisée."""
        if self.concession and self.concessionnaire:
            if self.concession.concessionnaire != self.concessionnaire:
                raise ValidationError({
                    'concession': 'La concession doit appartenir au concessionnaire'
                })
        
        if not self.est_disponible_vente and not self.est_disponible_location:
            raise ValidationError("Le véhicule doit être disponible à la vente et/ou à la location")
        
        if self.est_disponible_vente and not self.prix_vente:
            raise ValidationError({'prix_vente': 'Prix obligatoire'})
        
        if self.est_disponible_location and not self.prix_location_jour:
            raise ValidationError({'prix_location_jour': 'Prix obligatoire'})
    
    def save(self, *args, **kwargs):
        """Override save."""
        self.clean()
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            self.concession.nombre_vehicules += 1
            self.concession.save(update_fields=['nombre_vehicules'])
            self.marque.mettre_a_jour_compteur()
            self.categorie.mettre_a_jour_compteur()
    
    def delete(self, *args, **kwargs):
        """Override delete."""
        concession = self.concession
        marque = self.marque
        categorie = self.categorie
        
        super().delete(*args, **kwargs)
        
        if concession:
            concession.nombre_vehicules = max(0, concession.nombre_vehicules - 1)
            concession.save(update_fields=['nombre_vehicules'])
        if marque:
            marque.mettre_a_jour_compteur()
        if categorie:
            categorie.mettre_a_jour_compteur()


    def mettre_a_jour_note(self):
        """
        Met à jour la note moyenne du véhicule à partir des avis validés.
        """
        from django.db.models import Avg, Count
        
        # Calculer la moyenne des notes des avis validés
        avis_valides = self.avis.filter(est_valide=True)
        
        stats = avis_valides.aggregate(
            moyenne=Avg('note'),
            total=Count('id')
        )
        
        self.note_moyenne = stats['moyenne'] or 0
        self.nombre_avis = stats['total'] or 0
        
        self.save(update_fields=['note_moyenne', 'nombre_avis'])

    @property
    def photo_principale(self):
        """Retourner la photo principale du véhicule."""
        return self.photos.filter(est_principale=True).first()
    
    @property
    def autres_photos(self):
        """Retourner les autres photos (non principales)."""
        return self.photos.filter(est_principale=False)
    
    @property
    def toutes_photos(self):
        """Retourner toutes les photos triées."""
        return self.photos.all()
    
    @property
    def a_video(self):
        """Vérifier si le véhicule a au moins une vidéo."""
        return self.videos.exists()
    
    @property
    def premiere_video(self):
        """Retourner la première vidéo du véhicule."""
        return self.videos.first()

